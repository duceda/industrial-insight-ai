import React, { useEffect, useMemo, useState } from 'react'
import { getModel } from '../services/api'
import type { MachineState, ModelMetadata } from '../types'

type ModelsPageProps = {
  machines?: MachineState[]
}

const FEATURE_LABELS: Record<string, string> = {
  air_temperature: 'Air Temperature',
  process_temperature: 'Process Temperature',
  rotational_speed: 'Rotational Speed',
  torque: 'Torque',
  tool_wear: 'Tool Wear',
}

export default function ModelsPage({ machines = [] }: ModelsPageProps) {
  const [model, setModel] = useState<ModelMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true

    const loadModel = async () => {
      setLoading(true)
      setError(false)

      try {
        const data = await getModel()
        if (alive) {
          setModel(data)
          setLoading(false)
        }
      } catch {
        if (alive) {
          setModel(null)
          setLoading(false)
          setError(true)
        }
      }
    }

    void loadModel()

    return () => {
      alive = false
    }
  }, [])

  const featureSeries = useMemo(() => {
    const reference = machines.find(machine => Object.keys(machine.featureImportances ?? {}).length > 0)?.featureImportances
    const importances = reference ?? {
      air_temperature: 0.12,
      process_temperature: 0.18,
      rotational_speed: 0.22,
      torque: 0.24,
      tool_wear: 0.24,
    }

    return Object.entries(importances).map(([key, value]) => ({
      name: FEATURE_LABELS[key] ?? key,
      value: Number(value),
    }))
  }, [machines])

  if (loading) {
    return (
      <div className="panel-surface p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Model status</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Loading model...</h2>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="panel-surface p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-amber-400">Backend Offline</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">ML Model</h2>
        <p className="mt-3 text-slate-300">Model metadata is unavailable right now because the FastAPI backend is offline.</p>
      </div>
    )
  }

  const metricCards = [
    { label: 'ROC-AUC', value: Number(model.metrics?.roc_auc ?? 0).toFixed(4) },
    { label: 'Precision', value: Number(model.metrics?.precision ?? 0).toFixed(4) },
    { label: 'Recall', value: Number(model.metrics?.recall ?? 0).toFixed(4) },
    { label: 'F1 Score', value: Number(model.metrics?.f1 ?? 0).toFixed(4) },
  ]

  return (
    <div className="space-y-6">
      <section className="panel-surface p-4 sm:p-5">
        <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">Model Intelligence</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">ML Model</h2>
        <p className="mt-1 text-slate-400">Model metadata and feature sensitivity from the active predictive configuration.</p>
      </section>

      <section className="panel-surface p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Current Model</div>
            <div className="mt-3 space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                <span>Model version</span>
                <span className="font-semibold text-white">{model.model_version}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                <span>Training date</span>
                <span className="font-semibold text-white">{model.trained_at}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                <span>Algorithm</span>
                <span className="font-semibold text-white">Random Forest Classifier</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Performance</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {metricCards.map(metric => (
                <div key={metric.label} className="rounded-xl border border-slate-700 bg-slate-950/80 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{metric.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel-surface p-4 sm:p-5">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Model Features</div>
          <h3 className="mt-1 text-xl font-semibold text-white">Feature Importance</h3>
        </div>

        <div className="space-y-4">
          {featureSeries.map((feature) => (
            <div key={feature.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm text-slate-300">
                <span>{feature.name}</span>
                <span>{Number(feature.value).toFixed(2)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(8, Number(feature.value) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
