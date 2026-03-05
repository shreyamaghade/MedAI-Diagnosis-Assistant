import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  ChevronRight, 
  Loader2, 
  RefreshCcw,
  RefreshCw,
  Info,
  HeartPulse,
  Users,
  Building2,
  ArrowRight,
  User as UserIcon,
  Clock,
  AlertTriangle,
  Volume2
} from 'lucide-react';
import { SymptomSelector } from './components/SymptomSelector';
import { FileUpload } from './components/FileUpload';
import { VisualSymptomUpload } from './components/VisualSymptomUpload';
import { VitalsInput } from './components/VitalsInput';
import { DiagnosisCard } from './components/DiagnosisCard';
import { DeepDiveModal } from './components/DeepDiveModal';
import { AuthView } from './components/AuthView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { HealthSync } from './components/HealthSync';
import { TriageDashboard } from './components/TriageDashboard';
import { SpecialistFinder } from './components/SpecialistFinder';
import { TelehealthSession } from './components/TelehealthSession';
import { ProfileView } from './components/ProfileView';
import { getFollowUpQuestions, getFinalDiagnosis, getConditionDeepDive, generateSpeech, findSpecialists, DiagnosisResponse, FileData, Vitals, ChatMessage, ConditionDeepDive } from './services/geminiService';
import { login, saveDiagnosis, User } from './services/apiService';
import { HealthData } from './services/healthService';
import { generateFHIRDiagnosticReport, downloadJSON } from './lib/fhirExport';
import { SUPPORTED_LANGUAGES, UI_STRINGS, LanguageCode } from './services/translationService';
import { Globe } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';

type AppStep = 'input' | 'chat' | 'result';
type Tab = 'diagnosis' | 'history' | 'dashboard' | 'triage' | 'profile';

const StepProgress = ({ step }: { step: AppStep }) => {
  const steps: AppStep[] = ['input', 'chat', 'result'];
  const currentIndex = steps.indexOf(step);
  
  return (
    <div className="max-w-md mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "circOut" }}
        />
        
        {steps.map((s, i) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-2">
            <motion.div 
              animate={{ 
                scale: i <= currentIndex ? 1 : 0.8,
                backgroundColor: i < currentIndex ? '#10b981' : i === currentIndex ? '#ffffff' : '#f1f5f9',
                borderColor: i <= currentIndex ? '#10b981' : '#e2e8f0'
              }}
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
                i === currentIndex ? "text-emerald-600 shadow-lg shadow-emerald-100" : i < currentIndex ? "text-white" : "text-slate-400"
              )}
            >
              {i < currentIndex ? "✓" : i + 1}
            </motion.div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              i <= currentIndex ? "text-emerald-600" : "text-slate-400"
            )}>
              {s === 'input' ? 'Symptoms' : s === 'chat' ? 'Analysis' : 'Results'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('diagnosis');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [step, setStep] = useState<AppStep>('input');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [visualFileData, setVisualFileData] = useState<FileData | null>(null);
  const [vitals, setVitals] = useState<Vitals>({});
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [isDoctorView, setIsDoctorView] = useState(false);
  const [currentDiagnosisId, setCurrentDiagnosisId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [userAnswer, setUserAnswer] = useState('');

  // Deep Dive State
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [deepDiveData, setDeepDiveData] = useState<ConditionDeepDive | null>(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isSpecialistFinderOpen, setIsSpecialistFinderOpen] = useState(false);
  const [targetSpecialist, setTargetSpecialist] = useState('');
  const [isTelehealthOpen, setIsTelehealthOpen] = useState(false);
  const [telehealthCondition, setTelehealthCondition] = useState('');

  const handleFindSpecialist = (specialistType: string) => {
    setTargetSpecialist(specialistType);
    setIsSpecialistFinderOpen(true);
  };

  const handleTelehealth = (condition: string) => {
    setTelehealthCondition(condition);
    setIsTelehealthOpen(true);
  };

  const handleReadReport = async () => {
    if (!result || isReading) return;
    
    setIsReading(true);
    try {
      const audioData = await generateSpeech(result.summary);
      if (audioData) {
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audio.onended = () => setIsReading(false);
        audio.play();
      } else {
        setIsReading(false);
      }
    } catch (err) {
      console.error("TTS failed", err);
      setIsReading(false);
    }
  };

  const handleStartChat = async () => {
    if (symptoms.length === 0 && !fileData && !visualFileData && Object.keys(vitals).length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const files: FileData[] = [];
      if (fileData) files.push(fileData);
      if (visualFileData) files.push(visualFileData);
      
      const followUpQuestions = await getFollowUpQuestions(symptoms, files.length > 0 ? files : undefined, vitals, healthData || undefined, language);
      setQuestions(followUpQuestions);
      setChatHistory([{ role: 'model', text: followUpQuestions[0] }]);
      setStep('chat');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestion = async () => {
    if (!userAnswer.trim()) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', text: userAnswer }
    ];
    setChatHistory(newHistory);
    setUserAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setChatHistory([...newHistory, { role: 'model', text: questions[nextIndex] }]);
    } else {
      // All questions answered, get final diagnosis
      setLoading(true);
      try {
        const files: FileData[] = [];
        if (fileData) files.push(fileData);
        if (visualFileData) files.push(visualFileData);
        
        const data = await getFinalDiagnosis(symptoms, newHistory, files.length > 0 ? files : undefined, vitals, healthData || undefined, language);
        setResult(data);
        setStep('result');

        // Save to history if user is logged in
        if (user) {
          saveDiagnosis(user.id, symptoms, data.summary, data.possibleConditions, data.overallUrgency)
            .then(res => setCurrentDiagnosisId(res.id))
            .catch(console.error);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to generate final diagnosis. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeepDive = async (condition: string) => {
    setSelectedCondition(condition);
    setIsDeepDiveOpen(true);
    setDeepDiveLoading(true);
    setDeepDiveData(null);
    try {
      const data = await getConditionDeepDive(condition);
      setDeepDiveData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch condition details.");
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const handleExportEHR = () => {
    if (!user || !result) return;
    const fhirData = generateFHIRDiagnosticReport(user, symptoms, vitals, result);
    downloadJSON(fhirData, `fhir-report-${user.id}-${Date.now()}.json`);
  };

  const reset = () => {
    setStep('input');
    setSymptoms([]);
    setFileData(null);
    setVisualFileData(null);
    setVitals({});
    setHealthData(null);
    setResult(null);
    setError(null);
    setChatHistory([]);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setUserAnswer('');
    setCurrentDiagnosisId(null);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('diagnosis');
    setStep('input');
    setSymptoms([]);
    setResult(null);
  };

  const t = UI_STRINGS[language];
  const isRtl = SUPPORTED_LANGUAGES.find(l => l.code === language)?.dir === 'rtl';

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
        <AuthView onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => { setActiveTab('diagnosis'); reset(); }}
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <HeartPulse className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">MedAI</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 relative">
            {[
              { id: 'diagnosis', label: t.diagnosis, icon: Stethoscope },
              { id: 'history', label: t.history, icon: Clock },
              { id: 'dashboard', label: t.dashboard, icon: Activity },
              { id: 'triage', label: t.triage, icon: AlertTriangle },
              { id: 'profile', label: 'Profile', icon: UserIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all z-10",
                  activeTab === tab.id 
                    ? "text-emerald-600" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <Globe className="h-4 w-4 text-slate-400" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{user.name || user.email}</span>
              <button onClick={handleLogout} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">{t.signOut}</button>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <UserIcon className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'diagnosis' && (
            <motion.div
              key="diagnosis-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AnimatePresence mode="wait">
                {step === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-12"
                  >
                    <StepProgress step={step} />
                    
                    {/* Hero Section */}
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Intelligent Preliminary <span className="text-emerald-600">{t.diagnosis}</span>
                      </h1>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        MedAI uses advanced machine learning to help you understand your symptoms and provide clinical decision support for healthcare providers.
                      </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Users className="text-blue-600 h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">For Patients</h3>
                        <p className="text-sm text-slate-500">Understand potential conditions and know when to seek professional care.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Stethoscope className="text-emerald-600 h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">For Doctors</h3>
                        <p className="text-sm text-slate-500">Access technical insights and differential diagnosis support in seconds.</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Building2 className="text-purple-600 h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">For Hospitals</h3>
                        <p className="text-sm text-slate-500">Streamline triage processes and reduce initial diagnostic time.</p>
                      </div>
                    </div>

                    {/* Input Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                      <div className="p-8 md:p-12 space-y-8">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold text-slate-900">{t.describeSymptoms}</h2>
                          <p className="text-slate-500">Select common symptoms or type your own for a detailed analysis.</p>
                        </div>

                        <SymptomSelector 
                          selectedSymptoms={symptoms} 
                          onSymptomsChange={setSymptoms} 
                        />

                        <div className="pt-4 border-t border-slate-100">
                          <HealthSync syncedData={healthData} onDataSynced={setHealthData} />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <VitalsInput vitals={vitals} onVitalsChange={setVitals} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                          <FileUpload onFileSelect={(data) => setFileData(data ? { inlineData: data } : null)} />
                          <VisualSymptomUpload onFileSelect={(data) => setVisualFileData(data ? { inlineData: data } : null)} />
                        </div>

                        <div className="pt-4">
                          <motion.button
                            whileHover={(symptoms.length > 0 || fileData || visualFileData || Object.keys(vitals).length > 0) ? { scale: 1.01 } : {}}
                            whileTap={(symptoms.length > 0 || fileData || visualFileData || Object.keys(vitals).length > 0) ? { scale: 0.99 } : {}}
                            onClick={handleStartChat}
                            disabled={loading || (symptoms.length === 0 && !fileData && !visualFileData && Object.keys(vitals).length === 0)}
                            className={cn(
                              "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                              (symptoms.length > 0 || fileData || visualFileData || Object.keys(vitals).length > 0)
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200" 
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                {t.analyzingAnswers}
                              </>
                            ) : (
                              <>
                                {t.startDiagnosticChat}
                                <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center gap-3">
                        <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-500 font-medium">
                          MedAI is a support tool. Always consult a qualified healthcare professional for medical advice.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-2xl mx-auto space-y-8"
                  >
                    <StepProgress step={step} />
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">{t.followUpQuestions}</h2>
                      <p className="text-slate-500">Please answer these questions to help refine your diagnosis.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
                      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {chatHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex",
                              msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                msg.role === 'user'
                                  ? "bg-emerald-600 text-white rounded-tr-none"
                                  : "bg-slate-100 text-slate-700 rounded-tl-none"
                              )}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              <span className="text-xs text-slate-400 font-medium">{t.analyzingAnswers}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-slate-100 bg-slate-50">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                            placeholder={t.typeAnswer}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnswerQuestion()}
                            disabled={loading}
                          />
                          <motion.button
                            whileHover={!loading && userAnswer.trim() ? { scale: 1.02 } : {}}
                            whileTap={!loading && userAnswer.trim() ? { scale: 0.98 } : {}}
                            onClick={handleAnswerQuestion}
                            disabled={loading || !userAnswer.trim()}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md shadow-emerald-100"
                          >
                            {t.send}
                          </motion.button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-3 font-medium uppercase tracking-wider">
                          {t.question} {currentQuestionIndex + 1} {t.of} {questions.length}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'result' && result && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <StepProgress step={step} />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.diagnosticAnalysis}</h2>
                        <p className="text-slate-500 font-medium">Based on your symptoms, vitals, and conversation history.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleReadReport}
                          disabled={isReading}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                            isReading 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <Volume2 className={cn("h-4 w-4", isReading && "animate-bounce")} />
                          {isReading ? "Reading..." : "Read Report"}
                        </motion.button>
                        {isDoctorView && (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExportEHR}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm"
                          >
                            <Activity className="h-4 w-4" />
                            {t.exportEHR}
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsDoctorView(!isDoctorView)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                            isDoctorView 
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {isDoctorView ? t.switchPatient : t.switchDoctor}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9, rotate: -15 }}
                          onClick={reset}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                          title={t.newAnalysis}
                        >
                          <RefreshCw className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Activity className="h-5 w-5" />
                        {t.clinicalSummary}
                      </div>
                      <div className="text-emerald-900/80 leading-relaxed text-sm font-medium">
                        <Markdown>{result.summary}</Markdown>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        {t.possibleConditions}
                        <span className="text-sm font-normal text-slate-400">({result.possibleConditions.length})</span>
                      </h3>
                      {result.possibleConditions.map((condition, idx) => (
                        <DiagnosisCard 
                          key={idx} 
                          result={condition} 
                          isDoctorView={isDoctorView} 
                          onDeepDive={handleDeepDive}
                          onFindSpecialist={handleFindSpecialist}
                          onTelehealth={handleTelehealth}
                          diagnosisId={currentDiagnosisId}
                          doctorId={user.id}
                        />
                      ))}
                    </div>

                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                      <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-amber-900">{t.medicalDisclaimer}</p>
                        <p className="text-xs text-amber-800/70 leading-relaxed">{result.disclaimer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <HistoryView user={user} onStartCheckup={() => setActiveTab('diagnosis')} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DashboardView user={user} />
            </motion.div>
          )}

          {activeTab === 'triage' && (
            <motion.div
              key="triage-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <TriageDashboard />
            </motion.div>
          )}

          {activeTab === 'profile' && user && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <ProfileView user={user} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>

        <DeepDiveModal
          isOpen={isDeepDiveOpen}
          onClose={() => setIsDeepDiveOpen(false)}
          condition={selectedCondition}
          data={deepDiveData}
          loading={deepDiveLoading}
        />

        {isSpecialistFinderOpen && (
          <SpecialistFinder 
            specialistType={targetSpecialist} 
            onClose={() => setIsSpecialistFinderOpen(false)} 
          />
        )}

        {isTelehealthOpen && (
          <TelehealthSession 
            condition={telehealthCondition} 
            onClose={() => setIsTelehealthOpen(false)} 
          />
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
            {error}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 grayscale opacity-50">
            <HeartPulse className="h-5 w-5" />
            <span className="font-bold text-lg tracking-tight">MedAI</span>
          </div>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Empowering healthcare through artificial intelligence. Built for preliminary support and clinical decision assistance.
          </p>
          <div className="pt-4 text-xs text-slate-300">
            © 2026 MedAI Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
