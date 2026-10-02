import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MachineState } from '../types'

type Props = {
  machine?: MachineState | null
  machineId?: string
  onBack?: () => void
  backLabel?: string
}

const SENSOR_META = [
  { key: 'air_temperature', label: 'Air Temperature', unit: 'K' },
  { key: 'process_temperature', label: 'Process Temperature', unit: 'K' },
  { key: 'rotational_speed', label: 'Rotational Speed', unit: 'rpm' },
  { key: 'torque', label: 'Torque', unit: 'Nm' },
  { key: 'tool_wear', label: 'Tool Wear', unit: 'min' },
] as const

const FEATURE_LABELS: Record<string, string> = {
  air_temperature: 'Air Temperature',
  process_temperature: 'Process Temperature',
  rotational_speed: 'Rotational Speed',
  torque: 'Torque',
  tool_wear: 'Tool Wear',
}

export default function MachineDetail({ machine, machineId, onBack, backLabel = 'Back to Dashboard' }: Props) {
  const [selectedSensor, setSelectedSensor] = useState<(typeof SENSOR_META)[number]['key']>('tool_wear')

  const resolvedMachine = machine ?? null
  const probabilitySeries = useMemo(() => {
    if (!resolvedMachine) return []
    if (resolvedMachine.probabilityHistory.length > 0) {
      return resolvedMachine.probabilityHistory.map(point => ({
        ...point,
        probability: Number(point.probability),
      }))
    }

    return [
      {
        timestamp: resolvedMachine.lastUpdated ?? resolvedMachine.timestamp ?? new Date().toISOString(),
        probability: resolvedMachine.probability ?? 0,
        label: new Date(resolvedMachine.lastUpdated ?? resolvedMachine.timestamp ?? Date.now()).toLocaleTimeString(),
      },
    ]
  }, [resolvedMachine])

  const sensorSeries = useMemo(() => {
    if (!resolvedMachine) return []

    return resolvedMachine.history.map(entry => ({
      timestamp: entry.timestamp ?? new Date().toISOString(),
      label: new Date(entry.timestamp ?? Date.now()).toLocaleTimeString(),
      value: entry[selectedSensor],
    }))
  }, [resolvedMachine, selectedSensor])

  const featureSeries = useMemo(() => {
    if (!resolvedMachine) return []

    return Object.entries(resolvedMachine.featureImportances).map(([key, value]) => ({
      name: FEATURE_LABELS[key] ?? key,
      value: Number(value),
    }))
  }, [resolvedMachine])

  if (!resolvedMachine) {
    return (
      <div className="panel-surface p-6">
        <h3 className="text-lg font-semibold text-white">Machine not found</h3>
        <p className="mt-2 text-sm text-slate-400">No simulation data is available for {machineId ?? 'this machine'}.</p>
      </div>
    )
  }

  const currentRisk = resolvedMachine.riskLevel === 'waiting' ? 'Waiting' : resolvedMachine.riskLevel
  const riskTone =
    currentRisk === 'healthy'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
      : currentRisk === 'warning'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
        : currentRisk === 'critical'
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
          : 'border-slate-500/40 bg-slate-500/10 text-slate-200'

  const coverage = resolvedMachine.probability === null ? 'Waiting for prediction...' : `${Math.round(resolvedMachine.probability * 100)}%`

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            ← {backLabel}
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Machine Detail</div>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">{resolvedMachine.machineId}</h2>
          </div>
        </div>

        <div className={`chip ${riskTone}`}>
          {currentRisk.toUpperCase()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Failure Probability</div>
          <div className="mt-3 text-3xl font-bold text-white">{coverage}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Last Update</div>
          <div className="mt-3 text-lg font-semibold text-slate-100">
            {resolvedMachine.lastUpdated ? new Date(resolvedMachine.lastUpdated).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Trend</div>
          <div className="mt-3 text-lg font-semibold capitalize text-slate-100">{resolvedMachine.trend}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Backend</div>
          <div className="mt-3 text-lg font-semibold capitalize text-slate-100">{resolvedMachine.backendStatus}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {SENSOR_META.map(sensor => {
          const value = resolvedMachine.currentReading[sensor.key]
          return (
            <div key={sensor.key} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{sensor.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{value.toFixed(1)}</div>
              <div className="mt-1 text-xs text-slate-500">{sensor.unit}</div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Failure Probability</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={probabilitySeries} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
                <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={value => `${Math.round(Number(value) * 100)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }}
                  formatter={(value: number) => [`${Math.round(Number(value) * 100)}%`, 'Probability']}
                  labelFormatter={label => `Time: ${label}`}
                />
                <Line type="monotone" dataKey="probability" stroke="#38bdf8" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <h3 className="text-lg font-semibold text-white">Sensor Evolution</h3>
            <div className="flex flex-wrap gap-2">
              {SENSOR_META.map(sensor => (
                <button
                  key={sensor.key}
                  type="button"
                  onClick={() => setSelectedSensor(sensor.key)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                    selectedSensor === sensor.key
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  {sensor.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorSeries} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }}
                  formatter={(value: number) => [`${Number(value).toFixed(1)}`, SENSOR_META.find(item => item.key === selectedSensor)?.label ?? 'Value']}
                  labelFormatter={label => `Time: ${label}`}
                />
                <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h3 className="mb-4 text-lg font-semibold text-white">Model Feature Importance</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureSeries} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={value => `${Number(value) * 100}%`} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12 }}
                formatter={(value: number) => [`${Number(value).toFixed(2)}`, 'Importance']}
              />
              <Bar dataKey="value" fill="#34d399" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
