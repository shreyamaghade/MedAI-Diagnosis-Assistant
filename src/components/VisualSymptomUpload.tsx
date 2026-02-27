import React, { useRef, useState } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface VisualSymptomUploadProps {
  onFileSelect: (file: { data: string; mimeType: string } | null) => void;
}

export const VisualSymptomUpload: React.FC<VisualSymptomUploadProps> = ({ onFileSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size too large. Please select a file under 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        const base64String = result.split(',')[1];
        onFileSelect({
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Camera className="h-4 w-4 text-slate-400" />
          Visual Symptoms (Photos of rashes, eyes, etc.)
        </label>
        {previewUrl && (
          <button
            onClick={removeFile}
            className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <ImageIcon className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">Upload a photo of the symptom</p>
            <p className="text-xs text-slate-400">JPG, PNG, WebP (Max 5MB)</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group">
          <img 
            src={previewUrl} 
            alt="Symptom preview" 
            className="w-full h-48 object-cover rounded-2xl border border-slate-200"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-900 shadow-lg"
            >
              Change Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
