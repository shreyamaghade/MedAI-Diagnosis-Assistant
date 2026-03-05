import { GoogleGenAI, Type, Modality } from "@google/genai";

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("GEMINI_API_KEY is missing or invalid on the frontend.");
    throw new Error("Gemini API key is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export interface DiagnosisResult {
  condition: string;
  probability: "High" | "Medium" | "Low";
  description: string;
  commonSymptoms: string[];
  recommendedSpecialist: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  professionalInsights: string;
  sources: { title: string; url: string }[];
}

export interface DiagnosisResponse {
  possibleConditions: DiagnosisResult[];
  disclaimer: string;
  summary: string;
  overallUrgency: "Routine" | "Urgent" | "Emergency";
}

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface Vitals {
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  spO2?: string;
  temperature?: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ConditionDeepDive {
  treatments: string[];
  lifestyleAdjustments: string[];
  questionsForDoctor: string[];
}

export interface SpecialistLocation {
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  url: string;
}

async function handleGeminiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    
    // Check for 429 Quota Exceeded
    if (err.message?.includes("429") || err.status === 429 || err.message?.includes("quota")) {
      throw new Error("API Quota Exceeded: The AI is currently at its limit. Please wait a minute or check your Google AI Studio billing settings.");
    }
    
    throw err;
  }
}

export async function getFollowUpQuestions(
  symptoms: string[], 
  files?: FileData[], 
  vitals?: Vitals,
  healthData?: any,
  language: string = 'en'
): Promise<string[]> {
  return handleGeminiCall(async () => {
    const vitalsString = vitals ? `
    Vitals:
    - Blood Pressure: ${vitals.systolic || "N/A"}/${vitals.diastolic || "N/A"} mmHg
    - Heart Rate: ${vitals.heartRate || "N/A"} bpm
    - SpO2: ${vitals.spO2 || "N/A"}%
    - Body Temperature: ${vitals.temperature || "N/A"} °C
    ` : "";

    const healthString = healthData ? `
    Lifestyle Data (Last 7 Days):
    - Average Heart Rate: ${healthData.avgHeartRate} bpm
    - Average Sleep: ${healthData.avgSleepHours} hours/night
    - Average Daily Steps: ${healthData.avgSteps}
    ` : "";

    const prompt = `As a medical diagnostic assistant, I have received the following initial information:
    Symptoms: ${symptoms.join(", ")}
    ${vitalsString}
    ${healthString}
    ${files && files.length > 0 ? "Additional attachments (medical documents or visual symptoms) have been provided." : ""}
    
    Before providing a diagnosis, I need to clarify some details. Please generate 2-3 targeted, professional follow-up questions to better understand the duration, severity, and nature of these symptoms.
    
    IMPORTANT: Return the questions in ${language} language. Ensure medical terminology is accurate for this language.
    
    Return the response in JSON format with a "questions" array of strings.`;

    const parts: any[] = [{ text: prompt }];
    if (files && files.length > 0) {
      parts.push(...files);
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["questions"],
        },
      },
    });

    const data = JSON.parse(response.text || '{"questions": []}');
    return data.questions || [];
  });
}

export async function getConditionDeepDive(condition: string): Promise<ConditionDeepDive> {
  return handleGeminiCall(async () => {
    const prompt = `Provide a detailed deep-dive for the medical condition: "${condition}".
    Include:
    1. Standard medical treatments (over-the-counter and professional).
    2. Lifestyle and home care adjustments.
    3. A list of specific, important questions the patient should ask their doctor about this condition.
    
    Return the response in JSON format.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            treatments: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyleAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionsForDoctor: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["treatments", "lifestyleAdjustments", "questionsForDoctor"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  });
}

export async function getFinalDiagnosis(
  symptoms: string[], 
  chatHistory: ChatMessage[], 
  files?: FileData[], 
  vitals?: Vitals,
  healthData?: any,
  language: string = 'en'
): Promise<DiagnosisResponse> {
  return handleGeminiCall(async () => {
    const vitalsString = vitals ? `
    Vitals:
    - Blood Pressure: ${vitals.systolic || "N/A"}/${vitals.diastolic || "N/A"} mmHg
    - Heart Rate: ${vitals.heartRate || "N/A"} bpm
    - SpO2: ${vitals.spO2 || "N/A"}%
    - Body Temperature: ${vitals.temperature || "N/A"} °C
    ` : "";

    const healthString = healthData ? `
    Lifestyle Data (Last 7 Days):
    - Average Heart Rate: ${healthData.avgHeartRate} bpm
    - Average Sleep: ${healthData.avgSleepHours} hours/night
    - Average Daily Steps: ${healthData.avgSteps}
    ` : "";

    const chatTranscript = chatHistory.map((m: any) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.text}`).join("\n");

    const prompt = `As a medical diagnostic assistant, analyze the following comprehensive information to provide a list of possible conditions.
    
    Initial Symptoms: ${symptoms.join(", ")}
    ${vitalsString}
    ${healthString}
    
    Follow-up Conversation:
    ${chatTranscript}
    
    ${files && files.length > 0 ? "Additional attachments (medical documents or visual symptoms) have been provided. Please analyze them carefully." : ""}
    
    Provide a structured response including:
    1. A list of possible conditions with descriptions, common symptoms, recommended specialists, and urgency levels.
    2. A professional insight for each condition (technical details for a doctor).
    3. A clear medical disclaimer stating this is not a replacement for professional advice.
    4. A brief summary of the findings, integrating the information from the follow-up conversation.
    5. For each condition, include 2-3 clickable links to authoritative sources like the Mayo Clinic, NIH, or WebMD that support the findings.
    
    IMPORTANT: Return all text fields (condition names, descriptions, summary, disclaimer, insights, etc.) in ${language} language. Ensure medical terminology is accurate for this language.`;

    const parts: any[] = [{ text: prompt }];
    if (files && files.length > 0) {
      parts.push(...files);
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            possibleConditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING },
                  probability: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  description: { type: Type.STRING },
                  commonSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedSpecialist: { type: Type.STRING },
                  urgency: { type: Type.STRING, enum: ["Routine", "Urgent", "Emergency"] },
                  professionalInsights: { type: Type.STRING },
                  sources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                      },
                      required: ["title", "url"],
                    },
                  },
                },
                required: ["condition", "probability", "description", "commonSymptoms", "recommendedSpecialist", "urgency", "professionalInsights", "sources"],
              },
            },
            disclaimer: { type: Type.STRING },
            summary: { type: Type.STRING },
            overallUrgency: { type: Type.STRING, enum: ["Routine", "Urgent", "Emergency"] },
          },
          required: ["possibleConditions", "disclaimer", "summary", "overallUrgency"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  });
}

export async function generateSpeech(text: string): Promise<string | undefined> {
  return handleGeminiCall(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this medical summary clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
}

export async function findSpecialists(
  specialistType: string,
  latitude?: number,
  longitude?: number
): Promise<{ text: string; locations: SpecialistLocation[] }> {
  return handleGeminiCall(async () => {
    const prompt = `Find highly-rated ${specialistType} clinics or doctors near me. Provide their names, addresses, and contact details if available.`;
    
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (latitude && longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude,
            longitude
          }
        }
      };
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config
    });

    const locations: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          locations.push({
            name: chunk.maps.title || "Specialist",
            url: chunk.maps.uri,
          });
        }
      });
    }

    return {
      text: response.text || "",
      locations
    };
  });
}
