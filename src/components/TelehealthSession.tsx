import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Shield, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface TelehealthSessionProps {
  onClose: () => void;
  condition: string;
}

export const TelehealthSession: React.FC<TelehealthSessionProps> = ({ onClose, condition }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsInIframe(window.self !== window.top);
  }, []);

  const startCall = async () => {
    setHasStarted(true);
    setIsConnecting(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera or microphone access.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Simulate connection delay
      setTimeout(() => {
        setIsConnecting(false);
      }, 2000);
    } catch (err: any) {
      console.error("Failed to access media devices:", err);
      let errorMessage = "Could not access camera or microphone.";
      
      const errStr = String(err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('Permission dismissed') || err.message?.includes('Permission denied') || errStr.includes('Permission denied')) {
        errorMessage = "Permission was denied. Browsers often block camera access inside preview windows. Please open the app in a new tab to grant permissions.";
      } else if (err.name === 'NotFoundError' || errStr.includes('NotFoundError')) {
        errorMessage = "No camera or microphone found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera or microphone is already in use by another application.";
      }
      
      setError(errorMessage);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            MD
          </div>
          <div>
            <h3 className="text-white font-bold">Dr. Sarah Johnson</h3>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure Telehealth Session • {condition}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 px-3 py-1 rounded-full text-white text-xs font-mono">
            00:04:12
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            title="End Session"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
        {!hasStarted ? (
          <div className="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Video className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold text-2xl">Ready to join?</h4>
              <p className="text-slate-400">You are about to enter a secure video consultation for <span className="text-emerald-400 font-bold">{condition}</span>.</p>
              
              {isInIframe && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 text-left">
                  <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    <span className="font-bold text-blue-200">Note:</span> You are currently in a preview window. For the best experience and to ensure camera/mic permissions work correctly, please use the <span className="text-white font-bold">Open in New Tab</span> button.
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={startCall}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Join Secure Session
              </button>

              {isInIframe && (
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Open in New Tab
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4">
              HIPAA Compliant • End-to-End Encrypted
            </p>
          </div>
        ) : isConnecting ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-slate-400 font-medium animate-pulse">Connecting to a secure server...</p>
              <p className="text-slate-500 text-xs">Establishing encrypted peer-to-peer connection</p>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-800 text-slate-400 rounded-2xl font-bold hover:bg-slate-700 hover:text-white transition-all border border-white/5"
            >
              Cancel
            </button>
          </div>
        ) : error ? (
          <div className="max-w-md p-8 bg-slate-900 border border-red-500/30 rounded-3xl text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xl">Connection Failed</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
            </div>
            
            {error.includes("Permission") && (
              <div className="bg-slate-800/50 rounded-2xl p-4 text-left space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">How to fix:</p>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">1.</span>
                    Click the <span className="text-white font-bold">lock icon</span> in your browser's address bar.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">2.</span>
                    Ensure <span className="text-white font-bold">Camera</span> and <span className="text-white font-bold">Microphone</span> are set to "Allow".
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 font-bold">3.</span>
                    If you're in a preview window, try opening in a new tab.
                  </li>
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={startCall}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                Retry Connection
              </button>
              
              {error.includes("Permission") && (
                <button 
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </button>
              )}

              <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-all"
              >
                Return to Results
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Remote Video (Doctor Placeholder) */}
            <div className="w-full h-full relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/doctor/1920/1080" 
                alt="Doctor" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white font-bold text-2xl">Dr. Sarah Johnson</p>
                <p className="text-slate-300 text-sm">General Practitioner • On Call</p>
              </div>
            </div>

            {/* Local Video (User Preview) */}
            <div className="absolute top-8 right-8 w-48 h-64 bg-slate-900 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              {isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <User className="h-12 w-12 text-slate-600" />
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[10px] text-white font-bold uppercase tracking-widest">
                You
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {hasStarted && !isConnecting && !error && (
        <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex justify-center items-center gap-6 animate-in slide-in-from-bottom duration-500">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 transform hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <PhoneOff className="h-6 w-6" />
            <span className="font-bold uppercase tracking-wider text-sm">End Call</span>
          </button>
  
          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </button>
        </div>
      )}
    </div>
  );
};
