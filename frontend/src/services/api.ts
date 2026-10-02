import type { HealthResponse, ModelMetadata, PredictRequest, PredictResponse } from '../types'

const BASE = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error('Failed to fetch health')
  return res.json()
}

export async function getModel(): Promise<ModelMetadata> {
  const res = await fetch(`${BASE}/model`)
  if (!res.ok) throw new Error('Failed to fetch model')
  return res.json()
}

export async function predict(payload: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Predict failed')
  return res.json()
}
