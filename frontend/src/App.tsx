import React, { useMemo, useState } from 'react'
import useHealth from './hooks/useHealth'
import useMachineSimulation from './hooks/useMachineSimulation'
import DashboardPage from './pages/Dashboard'
import MachineDetail from './pages/MachineDetail'
import MachinesPage from './pages/Machines'
import ModelsPage from './pages/Models'

type SectionKey = 'dashboard' | 'machines' | 'models'

export default function App() {
  const { online, modelVersion } = useHealth()
  const { machines, backendStatus } = useMachineSimulation()
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard')
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
  const [detailOrigin, setDetailOrigin] = useState<SectionKey>('dashboard')

  const selectedMachine = useMemo(
    () => machines.find(machine => machine.machineId === selectedMachineId) ?? null,
    [machines, selectedMachineId],
  )

  const backendLabel = online === null ? 'Checking' : online ? 'Online' : 'Offline'

  const handleSelectSection = (section: SectionKey) => {
    setActiveSection(section)
    setSelectedMachineId(null)
  }

  const handleOpenMachineDetail = (machineId: string, section: SectionKey = activeSection) => {
    setSelectedMachineId(machineId)
    setDetailOrigin(section)
  }

  const handleDetailBack = () => {
    setSelectedMachineId(null)
    setActiveSection(detailOrigin)
  }

  const navItems: Array<{ id: SectionKey; label: string; index: string }> = [
    { id: 'dashboard', label: 'Dashboard', index: '01' },
    { id: 'machines', label: 'Machines', index: '02' },
    { id: 'models', label: 'Models', index: '03' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 p-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-slate-950">
              I
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight text-white">InduSight AI</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Predictive Ops</div>
            </div>
          </div>

          <nav className="mt-10 space-y-2" aria-label="Sidebar navigation">
            {navItems.map(item => {
              const active = activeSection === item.id && !selectedMachineId
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleSelectSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100'
                      : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.index}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="panel-surface mb-6 flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-400">Industrial Intelligence</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Predictive Maintenance Console
                </h1>
              </div>

              <div className="flex items-center gap-3 self-start rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_12px_rgba(16,185,129,0.8)]`} />
                <span>Backend: {backendLabel}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{modelVersion ?? '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              <span>Industrial Intelligence & Predictive Maintenance</span>
            </div>
          </header>

          {selectedMachine ? (
            <MachineDetail
              machine={selectedMachine}
              onBack={handleDetailBack}
              backLabel={detailOrigin === 'dashboard' ? 'Back to Dashboard' : 'Back to Machines'}
            />
          ) : activeSection === 'dashboard' ? (
            <DashboardPage
              machines={machines}
              backendStatus={backendStatus}
              onSelectMachine={(machineId: string) => handleOpenMachineDetail(machineId, 'dashboard')}
            />
          ) : activeSection === 'machines' ? (
            <MachinesPage machines={machines} onSelectMachine={(machineId: string) => handleOpenMachineDetail(machineId, 'machines')} />
          ) : (
            <ModelsPage machines={machines} />
          )}
        </main>
      </div>
    </div>
  )
}
