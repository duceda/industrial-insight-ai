import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import Dashboard from '../pages/Dashboard'

const machines = [
  {
    machineId: 'M-001',
    profileType: 'stable',
    profileLabel: 'stable',
    probability: 0.12,
    probabilityHistory: [{ timestamp: new Date().toISOString(), probability: 0.12, label: 'now' }],
    riskLevel: 'healthy',
    trend: 'stable',
    currentReading: {
      air_temperature: 298,
      process_temperature: 305,
      rotational_speed: 1200,
      torque: 40,
      tool_wear: 130,
      timestamp: new Date().toISOString(),
    },
    featureImportances: { tool_wear: 0.5 },
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    history: [],
    backendStatus: 'online',
  },
  {
    machineId: 'M-002',
    profileType: 'stable',
    profileLabel: 'stable',
    probability: 0.47,
    probabilityHistory: [{ timestamp: new Date().toISOString(), probability: 0.47, label: 'now' }],
    riskLevel: 'warning',
    trend: 'increasing',
    currentReading: {
      air_temperature: 310,
      process_temperature: 330,
      rotational_speed: 1450,
      torque: 55,
      tool_wear: 210,
      timestamp: new Date().toISOString(),
    },
    featureImportances: { tool_wear: 0.5 },
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    history: [],
    backendStatus: 'online',
  },
  {
    machineId: 'M-003',
    profileType: 'degradation_fast',
    profileLabel: 'degradation fast',
    probability: 0.87,
    probabilityHistory: [{ timestamp: new Date().toISOString(), probability: 0.87, label: 'now' }],
    riskLevel: 'critical',
    trend: 'increasing',
    currentReading: {
      air_temperature: 325,
      process_temperature: 350,
      rotational_speed: 1700,
      torque: 80,
      tool_wear: 320,
      timestamp: new Date().toISOString(),
    },
    featureImportances: { tool_wear: 0.7 },
    timestamp: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    history: [],
    backendStatus: 'online',
  },
] as any

describe('dashboard state rendering', () => {
  test('dashboard represents healthy, warning and critical machine states', () => {
    render(<Dashboard machines={machines} backendStatus="online" onSelectMachine={() => {}} />)

    expect(screen.getAllByText(/Healthy/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Warning/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Critical/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/M-001/i)).toBeInTheDocument()
  })
})
