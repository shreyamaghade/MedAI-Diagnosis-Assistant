import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface TelehealthSessionProps {
  onClose: () => void;
  condition: string;
}

export const TelehealthSession: React.FC<TelehealthSessionProps> = ({ onClose, condition }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCall = async () => {
      try {
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
        }, 3000);
      } catch (err) {
        console.error("Failed to access media devices:", err);
        setError("Could not access camera or microphone. Please check your permissions.");
        setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
        <div className="bg-slate-800 px-3 py-1 rounded-full text-white text-xs font-mono">
          00:04:12
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
        {isConnecting ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Connecting to a secure server...</p>
          </div>
        ) : error ? (
          <div className="max-w-md p-8 bg-slate-900 border border-red-500/30 rounded-3xl text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h4 className="text-white font-bold text-xl">Connection Failed</h4>
            <p className="text-slate-400">{error}</p>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold"
            >
              Return to Results
            </button>
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
      <div className="p-8 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex justify-center items-center gap-6">
        <button 
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        
        <button 
          onClick={onClose}
          className="p-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 transform hover:scale-110 active:scale-95"
        >
          <PhoneOff className="h-8 w-8" />
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
};
