import { GoogleGenAI } from "@google/genai";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("GEMINI_API_KEY is missing or invalid on the frontend.");
    throw new Error("Gemini API key is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

export type LanguageCode = 'en' | 'es' | 'hi' | 'ar';

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text;

  const prompt = `Translate the following medical application text to ${targetLang}. 
  Ensure medical terminology is accurate and localized for healthcare contexts.
  Maintain the tone and formatting (e.g., Markdown if present).
  
  Text: ${text}`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || text;
  } catch (err) {
    console.error("Translation failed:", err);
    return text;
  }
}

export const UI_STRINGS = {
  en: {
    diagnosis: "Diagnosis",
    history: "History",
    dashboard: "Dashboard",
    triage: "Triage",
    signOut: "Sign Out",
    describeSymptoms: "Describe your symptoms",
    startDiagnosticChat: "Start Diagnostic Chat",
    diagnosticAnalysis: "Diagnostic Analysis",
    clinicalSummary: "Clinical Summary",
    possibleConditions: "Possible Conditions",
    medicalDisclaimer: "Medical Disclaimer",
    newAnalysis: "New Analysis",
    exportEHR: "Export to EHR (FHIR)",
    switchDoctor: "Switch to Doctor View",
    switchPatient: "Switch to Patient View",
    followUpQuestions: "Follow-up Questions",
    analyzingAnswers: "Analyzing answers...",
    typeAnswer: "Type your answer here...",
    send: "Send",
    question: "Question",
    of: "of",
  },
  es: {
    diagnosis: "Diagnóstico",
    history: "Historial",
    dashboard: "Panel",
    triage: "Triaje",
    signOut: "Cerrar sesión",
    describeSymptoms: "Describa sus síntomas",
    startDiagnosticChat: "Iniciar chat de diagnóstico",
    diagnosticAnalysis: "Análisis diagnóstico",
    clinicalSummary: "Resumen clínico",
    possibleConditions: "Condiciones posibles",
    medicalDisclaimer: "Aviso médico",
    newAnalysis: "Nuevo análisis",
    exportEHR: "Exportar a EHR (FHIR)",
    switchDoctor: "Cambiar a vista de médico",
    switchPatient: "Cambiar a vista de paciente",
    followUpQuestions: "Preguntas de seguimiento",
    analyzingAnswers: "Analizando respuestas...",
    typeAnswer: "Escriba su respuesta aquí...",
    send: "Enviar",
    question: "Pregunta",
    of: "de",
  },
  hi: {
    diagnosis: "निदान",
    history: "इतिहास",
    dashboard: "डैशबोर्ड",
    triage: "ट्राइएज",
    signOut: "साइन आउट",
    describeSymptoms: "अपने लक्षणों का वर्णन करें",
    startDiagnosticChat: "नैदानिक चैट शुरू करें",
    diagnosticAnalysis: "नैदानिक विश्लेषण",
    clinicalSummary: "नैदानिक सारांश",
    possibleConditions: "संभावित स्थितियां",
    medicalDisclaimer: "चिकित्सा अस्वीकरण",
    newAnalysis: "नया विश्लेषण",
    exportEHR: "EHR (FHIR) में निर्यात करें",
    switchDoctor: "डॉक्टर दृश्य पर स्विच करें",
    switchPatient: "रोगी दृश्य पर स्विच करें",
    followUpQuestions: "अनुवर्ती प्रश्न",
    analyzingAnswers: "उत्तरों का विश्लेषण किया जा रहा है...",
    typeAnswer: "अपना उत्तर यहाँ टाइप करें...",
    send: "भेजें",
    question: "प्रश्न",
    of: "का",
  },
  ar: {
    diagnosis: "التشخيص",
    history: "السجل",
    dashboard: "لوحة القيادة",
    triage: "الفرز",
    signOut: "تسجيل الخروج",
    describeSymptoms: "صف أعراضك",
    startDiagnosticChat: "بدء دردشة التشخيص",
    diagnosticAnalysis: "التحليل التشخيصي",
    clinicalSummary: "الملخص السريري",
    possibleConditions: "الحالات المحتملة",
    medicalDisclaimer: "إخلاء مسؤولية طبي",
    newAnalysis: "تحليل جديد",
    exportEHR: "تصدير إلى EHR (FHIR)",
    switchDoctor: "التبديل إلى عرض الطبيب",
    switchPatient: "التبديل إلى عرض المريض",
    followUpQuestions: "أسئلة المتابعة",
    analyzingAnswers: "تحليل الإجابات...",
    typeAnswer: "اكتب إجابتك هنا...",
    send: "إرسال",
    question: "سؤال",
    of: "من",
  }
};
