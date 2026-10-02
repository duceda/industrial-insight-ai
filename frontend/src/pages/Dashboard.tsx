import React from 'react'
import KPI from '../components/KPI'
import MachineCard from '../components/MachineCard'
import type { MachineState } from '../types'

type DashboardProps = {
  machines?: MachineState[]
  backendStatus?: 'online' | 'offline'
  onSelectMachine?: (machineId: string) => void
}

export default function Dashboard({
  machines = [],
  backendStatus = 'online',
  onSelectMachine,
}: DashboardProps) {
  const total = machines.length
  const healthy = machines.filter(machine => machine.riskLevel === 'healthy').length
  const warning = machines.filter(machine => machine.riskLevel === 'warning').length
  const critical = machines.filter(machine => machine.riskLevel === 'critical').length

  return (
    <div className="space-y-6">
      {backendStatus === 'offline' && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Backend Offline: predictions are paused until the FastAPI service is available again.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPI title="Total Machines" value={total} />
        <KPI title="Healthy" value={healthy} tone="green" />
        <KPI title="Warning" value={warning} tone="amber" />
        <KPI title="Critical" value={critical} tone="red" />
      </div>

      <section className="panel-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Fleet Overview</div>
            <h3 className="mt-1 text-xl font-semibold text-white">Machines Overview</h3>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
            {machines.length} Active
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {machines.map(machine => (
            <MachineCard
              key={machine.machineId}
              id={machine.machineId}
              prob={machine.probability}
              status={machine.riskLevel}
              updated={machine.lastUpdated}
              trend={machine.trend}
              onClick={() => onSelectMachine?.(machine.machineId)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
