import { fireEvent, render, screen } from '@testing-library/react'
import React, { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import Dashboard from '../pages/Dashboard'
import MachineDetail from '../pages/MachineDetail'
import type { MachineState } from '../types'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  Bar: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Responsive: () => null,
}))

const makeMachine = (): MachineState => ({
  machineId: 'M-007',
  profileType: 'degradation_fast',
  profileLabel: 'degradation fast',
  currentReading: {
    air_temperature: 310,
    process_temperature: 320,
    rotational_speed: 1500,
    torque: 72,
    tool_wear: 270,
    timestamp: '2026-01-01T00:00:00.000Z',
  },
  probability: 0.87,
  probabilityHistory: [
    { timestamp: '2026-01-01T00:00:00.000Z', probability: 0.58, label: '00:00:00' },
    { timestamp: '2026-01-01T00:00:05.000Z', probability: 0.69, label: '00:00:05' },
    { timestamp: '2026-01-01T00:00:10.000Z', probability: 0.87, label: '00:00:10' },
  ],
  riskLevel: 'critical',
  featureImportances: {
    air_temperature: 0.12,
    process_temperature: 0.18,
    rotational_speed: 0.14,
    torque: 0.21,
    tool_wear: 0.35,
  },
  timestamp: '2026-01-01T00:00:10.000Z',
  lastUpdated: '2026-01-01T00:00:10.000Z',
  history: [
    {
      air_temperature: 300,
      process_temperature: 305,
      rotational_speed: 1300,
      torque: 60,
      tool_wear: 220,
      timestamp: '2026-01-01T00:00:00.000Z',
    },
    {
      air_temperature: 305,
      process_temperature: 310,
      rotational_speed: 1380,
      torque: 66,
      tool_wear: 245,
      timestamp: '2026-01-01T00:00:05.000Z',
    },
    {
      air_temperature: 310,
      process_temperature: 320,
      rotational_speed: 1500,
      torque: 72,
      tool_wear: 270,
      timestamp: '2026-01-01T00:00:10.000Z',
    },
  ],
  trend: 'increasing',
  backendStatus: 'online',
})

describe('MachineDetail', () => {
  test('renders machine id and probability', () => {
    render(<MachineDetail machine={makeMachine()} onBack={() => {}} />)

    expect(screen.getByText('M-007')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
  })

  test('shows all five sensor cards', () => {
    render(<MachineDetail machine={makeMachine()} onBack={() => {}} />)

    expect(screen.getAllByText(/Air Temperature/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Process Temperature/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Rotational Speed/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Torque/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Tool Wear/i).length).toBeGreaterThan(0)
  })

  test('renders feature importance section', () => {
    render(<MachineDetail machine={makeMachine()} onBack={() => {}} />)

    expect(screen.getByText(/Model Feature Importance/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Air Temperature/i).length).toBeGreaterThan(0)
  })

  test('uses probability history data for the chart', () => {
    render(<MachineDetail machine={makeMachine()} onBack={() => {}} />)

    expect(screen.getAllByText(/Failure Probability/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Sensor Evolution/i)).toBeInTheDocument()
  })

  test('dashboard allows opening machine detail', () => {
    const onSelect = vi.fn()
    render(<Dashboard machines={[makeMachine()]} backendStatus="online" onSelectMachine={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: /M-007/i }))
    expect(onSelect).toHaveBeenCalledWith('M-007')
  })

  test('back button returns to dashboard', () => {
    const machine = makeMachine()

    const Wrapper = () => {
      const [selected, setSelected] = useState<string | null>('M-007')
      return selected ? (
        <MachineDetail machine={machine} onBack={() => setSelected(null)} />
      ) : (
        <Dashboard machines={[machine]} backendStatus="online" onSelectMachine={setSelected} />
      )
    }

    render(<Wrapper />)

    fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }))
    expect(screen.getByText(/Machines Overview/i)).toBeInTheDocument()
  })
})
