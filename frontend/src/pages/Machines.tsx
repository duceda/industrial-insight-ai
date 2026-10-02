import React from 'react'
import MachineCard from '../components/MachineCard'
import type { MachineState } from '../types'

type MachinesPageProps = {
  machines?: MachineState[]
  onSelectMachine?: (machineId: string) => void
}

export default function MachinesPage({ machines = [], onSelectMachine }: MachinesPageProps) {
  const healthy = machines.filter(machine => machine.riskLevel === 'healthy').length
  const warning = machines.filter(machine => machine.riskLevel === 'warning').length
  const critical = machines.filter(machine => machine.riskLevel === 'critical').length

  return (
    <div className="space-y-6">
      <section className="panel-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">Fleet Inventory</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Machine Fleet</h2>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300">
            {machines.length} machines monitored
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Healthy</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-300">{healthy}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Warning</div>
            <div className="mt-2 text-2xl font-semibold text-amber-300">{warning}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Critical</div>
            <div className="mt-2 text-2xl font-semibold text-rose-300">{critical}</div>
          </div>
        </div>
      </section>

      <section className="panel-surface p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Fleet overview</h3>
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
