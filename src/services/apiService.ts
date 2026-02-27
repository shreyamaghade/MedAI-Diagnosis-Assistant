export interface User {
  id: number;
  email: string;
  name: string;
}

export interface DiagnosisRecord {
  id: number;
  user_id: number;
  date: string;
  symptoms: string; // JSON string
  summary: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  results_json: string; // JSON string
  patient_name?: string;
  patient_email?: string;
}

export async function login(email: string, name?: string): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function getDiagnoses(userId: number): Promise<DiagnosisRecord[]> {
  const response = await fetch(`/api/diagnoses?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch diagnoses");
  return response.json();
}

export async function getTriageDashboard(): Promise<DiagnosisRecord[]> {
  const response = await fetch("/api/triage");
  if (!response.ok) throw new Error("Failed to fetch triage data");
  return response.json();
}

export async function saveDiagnosis(
  userId: number, 
  symptoms: string[], 
  summary: string, 
  results: any,
  urgency: string
): Promise<{ id: number }> {
  const response = await fetch("/api/diagnoses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, symptoms, summary, results, urgency }),
  });
  if (!response.ok) throw new Error("Failed to save diagnosis");
  return response.json();
}

export async function verifyDiagnosis(
  diagnosisId: number,
  conditionName: string,
  doctorId: number,
  feedback: 'Agree' | 'Correct',
  correction?: string
): Promise<{ success: boolean }> {
  const response = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diagnosisId, conditionName, doctorId, feedback, correction }),
  });
  if (!response.ok) throw new Error("Failed to submit verification");
  return response.json();
}

export async function getConfidenceStats(): Promise<{ condition_name: string; total_reviews: number; agreements: number }[]> {
  const response = await fetch("/api/confidence");
  if (!response.ok) throw new Error("Failed to fetch confidence stats");
  return response.json();
}
