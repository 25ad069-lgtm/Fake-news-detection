export type PredictionResult = {
  status: string;
  prediction: 'real' | 'fake' | 'inconclusive';
  confidence: number | null;
  class_probabilities?: Record<string, number>;
  explanation: string;
  limitations: string[];
  model_version: string | null;
  source?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function analyzeText(headline: string, text: string): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headline, text }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const msg = payload?.detail?.message || payload?.detail || 'Request failed';
    throw new Error(msg);
  }

  return payload as PredictionResult;
}

export async function analyzeFile(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze-file`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    const msg = payload?.detail?.message || payload?.detail || 'File upload failed';
    throw new Error(msg);
  }

  return payload as PredictionResult;
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/api/v1/model-info`);
  if (!response.ok) {
    throw new Error('Unable to load model metadata.');
  }
  return response.json();
}
