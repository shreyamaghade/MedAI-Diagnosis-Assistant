import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_SYMPTOMS = [
  "Fever", "Cough", "Fatigue", "Headache", "Nausea", "Dizziness", 
  "Shortness of breath", "Chest pain", "Abdominal pain", "Sore throat",
  "Muscle aches", "Joint pain", "Rash", "Chills", "Loss of appetite"
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({ selectedSymptoms, onSymptomsChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addSymptom(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const addSymptom = (symptom: string) => {
    const trimmed = symptom.trim();
    if (trimmed && !selectedSymptoms.includes(trimmed)) {
      onSymptomsChange([...selectedSymptoms, trimmed]);
    }
    setInputValue('');
  };

  const removeSymptom = (symptom: string) => {
    onSymptomsChange(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSymptom(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          placeholder="Type a symptom (e.g. Dry cough) and press Enter..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={startListening}
          disabled={isListening}
          className={cn(
            "absolute inset-y-2 right-2 px-3 rounded-lg transition-all flex items-center justify-center",
            isListening ? "bg-red-50 text-red-600 animate-pulse" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          )}
          title="Voice Input"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedSymptoms.map((symptom) => (
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              key={symptom}
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-sm font-medium"
            >
              {symptom}
              <button
                onClick={() => removeSymptom(symptom)}
                className="hover:text-emerald-900 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Common Symptoms</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SYMPTOMS.filter(s => !selectedSymptoms.includes(s)).map((symptom) => (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#ecfdf5', borderColor: '#10b981', color: '#059669' }}
              whileTap={{ scale: 0.95 }}
              key={symptom}
              onClick={() => addSymptom(symptom)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 transition-all flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              {symptom}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
