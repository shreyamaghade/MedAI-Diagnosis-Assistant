export interface User {
  id: number;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  token?: string;
}

export interface DiagnosisRecord {
  id: number;
  user_id: number;
  date: string;
  symptoms: string; // JSON string
  summary: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  results_json: string; // JSON string
  files?: string; // JSON string
  patient_name?: string;
  patient_email?: string;
}

function getHeaders(token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Fallback if response is not JSON
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function register(email: string, password: string, name: string, role: 'patient' | 'doctor' = 'patient'): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name, role }),
  });
  return handleResponse(response);
}

export async function guestLogin(): Promise<User> {
  const response = await fetch("/api/auth/guest", {
    method: "POST",
    headers: getHeaders(),
  });
  return handleResponse(response);
}

export async function getDiagnoses(token: string, filters?: { search?: string; urgency?: string; startDate?: string; endDate?: string }): Promise<DiagnosisRecord[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const response = await fetch(`/api/diagnoses?${params.toString()}`, {
    headers: getHeaders(token)
  });
  return handleResponse(response);
}

export async function getTriageDashboard(token: string, filters?: { patientName?: string; urgency?: string; condition?: string; startDate?: string; endDate?: string }): Promise<DiagnosisRecord[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }
  const response = await fetch(`/api/triage?${params.toString()}`, {
    headers: getHeaders(token)
  });
  return handleResponse(response);
}

export async function saveDiagnosis(
  token: string,
  symptoms: string[], 
  summary: string, 
  results: any,
  urgency: string,
  files: any[] = []
): Promise<{ id: number }> {
  const response = await fetch("/api/diagnoses", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ symptoms, summary, results, urgency, files }),
  });
  return handleResponse(response);
}

export async function updateDiagnosis(
  token: string,
  id: number,
  data: {
    symptoms: string[];
    summary: string;
    results: any;
    urgency: string;
    files: any[];
  }
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/diagnoses/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteDiagnosis(token: string, id: number): Promise<{ success: boolean }> {
  const response = await fetch(`/api/diagnoses/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  return handleResponse(response);
}

export async function uploadFiles(token: string, files: File[]): Promise<{ files: any[] }> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  return handleResponse(response);
}

export async function verifyDiagnosis(
  token: string,
  diagnosisId: number,
  conditionName: string,
  feedback: 'Agree' | 'Correct',
  correction?: string
): Promise<{ success: boolean }> {
  const response = await fetch("/api/verify", {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ diagnosisId, conditionName, feedback, correction }),
  });
  return handleResponse(response);
}

export async function getConfidenceStats(token: string): Promise<{ condition_name: string; total_reviews: number; agreements: number }[]> {
  const response = await fetch("/api/confidence", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
}

export async function getNotifications(token: string): Promise<any[]> {
  const response = await fetch("/api/notifications", {
    headers: getHeaders(token)
  });
  return handleResponse(response);
}

export async function markNotificationAsRead(token: string, id: number): Promise<{ success: boolean }> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "POST",
    headers: getHeaders(token)
  });
  return handleResponse(response);
}

export async function markAllNotificationsAsRead(token: string): Promise<{ success: boolean }> {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
    headers: getHeaders(token)
  });
  return handleResponse(response);
}
