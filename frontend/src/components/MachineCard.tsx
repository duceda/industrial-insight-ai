import React from 'react'

type MachineCardProps = {
  id: string
  prob: number | null
  status: string
  updated: string | null
  trend?: 'increasing' | 'decreasing' | 'stable'
  onClick?: () => void
}

export default function MachineCard({ id, prob, status, updated, trend = 'stable', onClick }: MachineCardProps) {
  const pct = prob === null ? null : Math.round(prob * 100)
  const normalizedStatus = status === 'waiting' ? 'WAITING' : status.toUpperCase()
  const statusMeta =
    status === 'healthy'
      ? { label: 'Healthy', tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200', dot: 'bg-emerald-400' }
      : status === 'warning'
        ? { label: 'Warning', tone: 'border-amber-500/40 bg-amber-500/10 text-amber-200', dot: 'bg-amber-400' }
        : status === 'critical'
          ? { label: 'Critical', tone: 'border-rose-500/40 bg-rose-500/10 text-rose-200', dot: 'bg-rose-400' }
          : { label: 'Waiting', tone: 'border-slate-500/40 bg-slate-500/10 text-slate-200', dot: 'bg-slate-400' }

  const trendLabel =
    prob === null
      ? 'Waiting for prediction...'
      : trend === 'increasing'
        ? '↑ Increasing'
        : trend === 'decreasing'
          ? '↓ Decreasing'
          : '→ Stable'

  const barWidth = pct === null ? 0 : Math.max(6, pct)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 text-left shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Machine</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-white">{id}</div>
        </div>

        <span className={`chip ${statusMeta.tone}`}>
          <span className={`mr-2 h-2 w-2 rounded-full ${statusMeta.dot}`} />
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/80 p-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Failure probability</span>
          <span>{pct === null ? '—' : `${pct}%`}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${status === 'healthy' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : status === 'critical' ? 'bg-rose-400' : 'bg-slate-400'}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-300">
        <span className="text-slate-400">{normalizedStatus}</span>
        <span className="text-slate-500">{updated ? new Date(updated).toLocaleTimeString() : 'No update'}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
        <span>Trend</span>
        <span className="text-slate-200">{trendLabel}</span>
      </div>
    </button>
  )
}
