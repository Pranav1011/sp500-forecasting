const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://sp500-forecasting-production.up.railway.app";

export async function fetchMetrics() {
  const res = await fetch(`${API_URL}/api/metrics`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchPredictions() {
  const res = await fetch(`${API_URL}/api/predictions`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch predictions');
  return res.json();
}

export async function fetchEquityCurve(horizon: number) {
  const res = await fetch(`${API_URL}/api/data/equity-curve/${horizon}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch equity curve');
  return res.json();
}

export async function fetchFeatureImportance(horizon: number) {
  const res = await fetch(`${API_URL}/api/metrics/feature-importance/${horizon}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch feature importance');
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${API_URL}/api/data/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}
