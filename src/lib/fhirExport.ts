import { DiagnosisResponse, Vitals } from "../services/geminiService";
import { User } from "../services/apiService";

export function generateFHIRDiagnosticReport(
  user: User,
  symptoms: string[],
  vitals: Vitals,
  diagnosis: DiagnosisResponse
) {
  const timestamp = new Date().toISOString();
  
  const fhirReport = {
    resourceType: "Bundle",
    type: "document",
    timestamp: timestamp,
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: `patient-${user.id}`,
          name: [{ text: user.name || "Unknown" }],
          telecom: [{ system: "email", value: user.email }]
        }
      },
      {
        resource: {
          resourceType: "DiagnosticReport",
          id: `report-${Date.now()}`,
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                  code: "GE",
                  display: "General"
                }
              ]
            }
          ],
          code: {
            text: "AI-Generated Preliminary Diagnostic Report"
          },
          subject: { reference: `Patient/patient-${user.id}` },
          effectiveDateTime: timestamp,
          issued: timestamp,
          conclusion: diagnosis.summary,
          presentedForm: [
            {
              contentType: "text/markdown",
              data: btoa(diagnosis.summary)
            }
          ]
        }
      },
      // Symptoms as Observations
      ...symptoms.map((symptom, index) => ({
        resource: {
          resourceType: "Observation",
          id: `symptom-${index}-${Date.now()}`,
          status: "final",
          code: { text: symptom },
          subject: { reference: `Patient/patient-${user.id}` },
          category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "exam" }] }]
        }
      })),
      // Possible Conditions
      ...diagnosis.possibleConditions.map((cond, index) => ({
        resource: {
          resourceType: "Condition",
          id: `condition-${index}-${Date.now()}`,
          clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "provisional" }] },
          verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "provisional" }] },
          category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-category", code: "encounter-diagnosis" }] }],
          code: { text: cond.condition },
          subject: { reference: `Patient/patient-${user.id}` },
          note: [{ text: `Probability: ${cond.probability}. Insights: ${cond.professionalInsights}` }]
        }
      }))
    ]
  };

  return fhirReport;
}

export function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
