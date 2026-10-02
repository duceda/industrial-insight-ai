import React from 'react'

export default function KPI({ title, value, tone = 'blue' }: { title: string; value: number | string; tone?: string }) {
  const toneClass = {
    blue: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    red: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  }[tone as keyof typeof Object.prototype] || 'border-slate-600 bg-slate-800/80 text-slate-200'

  const dotClass = {
    blue: 'bg-blue-400',
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-rose-400',
  }[tone as keyof typeof Object.prototype] || 'bg-slate-400'

  return (
    <div className={`panel-surface p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">{title}</div>
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  )
}
