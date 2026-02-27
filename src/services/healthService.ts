export interface HealthData {
  avgHeartRate: number;
  avgSleepHours: number;
  avgSteps: number;
  period: string;
}

export async function fetchHealthData(): Promise<HealthData> {
  // Simulating an API call to Apple Health / Google Fit
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        avgHeartRate: 72,
        avgSleepHours: 6.5,
        avgSteps: 4200,
        period: "Last 7 Days"
      });
    }, 1500);
  });
}
