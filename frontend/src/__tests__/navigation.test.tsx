import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import App from '../App'
import { getModel } from '../services/api'

const { mockUseMachineSimulation } = vi.hoisted(() => ({
  mockUseMachineSimulation: vi.fn(),
}))

const mockMachines = Array.from({ length: 8 }, (_, index) => ({
  machineId: `M-${String(index + 1).padStart(3, '0')}`,
  profileType: 'degradation_slow',
  profileLabel: 'degradation slow',
  currentReading: {
    air_temperature: 300 + index,
    process_temperature: 310 + index,
    rotational_speed: 1200 + index * 30,
    torque: 45 + index,
    tool_wear: 60 + index * 10,
  },
  probability: 0.1 + index * 0.08,
  probabilityHistory: [
    { timestamp: '2026-01-01T00:00:00.000Z', probability: 0.08, label: '00:00:00' },
    { timestamp: '2026-01-01T00:00:05.000Z', probability: 0.12 + index * 0.03, label: '00:00:05' },
  ],
  riskLevel: index < 5 ? 'healthy' : index < 7 ? 'warning' : 'critical',
  featureImportances: {
    air_temperature: 0.18,
    process_temperature: 0.22,
    rotational_speed: 0.24,
    torque: 0.16,
    tool_wear: 0.2,
  },
  timestamp: '2026-01-01T00:00:05.000Z',
  lastUpdated: '2026-01-01T00:00:05.000Z',
  history: [
    {
      air_temperature: 300 + index,
      process_temperature: 310 + index,
      rotational_speed: 1200 + index * 30,
      torque: 45 + index,
      tool_wear: 60 + index * 10,
      timestamp: '2026-01-01T00:00:05.000Z',
    },
  ],
  trend: 'stable',
  backendStatus: 'online',
}))

vi.mock('../hooks/useMachineSimulation', () => ({
  default: mockUseMachineSimulation,
}))

vi.mock('../hooks/useHealth', () => ({
  default: vi.fn(() => ({ online: true, modelVersion: 'v20261001T140345Z' })),
}))

vi.mock('../services/api', () => ({
  getHealth: vi.fn(),
  getModel: vi.fn(),
  predict: vi.fn(),
}))

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
}))

describe('sidebar navigation', () => {
  beforeEach(() => {
    vi.mocked(getModel).mockResolvedValue({
      model_version: 'v20261001T140345Z',
      trained_at: '20261001T140345Z',
      metrics: {
        roc_auc: 0.9688,
        precision: 0.8431,
        recall: 0.6324,
        f1: 0.7227,
      },
    })
    mockUseMachineSimulation.mockReturnValue({
      machines: mockMachines,
      backendStatus: 'online',
      loading: false,
    })
    mockUseMachineSimulation.mockClear()
  })

  test('dashboard is shown by default and dashboard nav is active', () => {
    render(<App />)

    expect(screen.getByText(/Predictive Maintenance Console/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /dashboard/i })).toHaveAttribute('aria-pressed', 'true')
  })

  test('clicking machines shows the fleet and the machine count', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /machines/i }))

    expect(screen.getByText(/Machine Fleet/i)).toBeInTheDocument()
    expect(screen.getByText(/8 machines monitored/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /M-/i })).toHaveLength(8)
  })

  test('clicking models shows real model metrics', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /models/i }))

    expect(await screen.findByText(/ML Model/i)).toBeInTheDocument()
    expect(screen.getByText(/Random Forest Classifier/i)).toBeInTheDocument()
    expect(screen.getByText(/ROC-AUC/i)).toBeInTheDocument()
    expect(screen.getByText(/0.9688/i)).toBeInTheDocument()
  })

  test('machines sidebar is active when selected and models sidebar is active when selected', () => {
    render(<App />)

    const dashboardButton = screen.getByRole('button', { name: /dashboard/i })
    const machinesButton = screen.getByRole('button', { name: /machines/i })
    const modelsButton = screen.getByRole('button', { name: /models/i })

    expect(dashboardButton).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(machinesButton)
    expect(machinesButton).toHaveAttribute('aria-pressed', 'true')
    expect(dashboardButton).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(modelsButton)
    expect(modelsButton).toHaveAttribute('aria-pressed', 'true')
    expect(machinesButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('machine detail still works and the detail open/back flow remains coherent', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /machines/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /M-007/i })[0])

    expect(screen.getByText(/M-007/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back to Machines/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Back to Machines/i }))
    expect(screen.getByText(/Machine Fleet/i)).toBeInTheDocument()
  })

  test('switching sections keeps a single fleet state and no duplicate machine cards', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /machines/i }))
    expect(screen.getAllByRole('button', { name: /M-/i })).toHaveLength(8)

    fireEvent.click(screen.getByRole('button', { name: /models/i }))
    fireEvent.click(screen.getByRole('button', { name: /dashboard/i }))
    expect(screen.getAllByRole('button', { name: /M-/i })).toHaveLength(8)
  })
})
