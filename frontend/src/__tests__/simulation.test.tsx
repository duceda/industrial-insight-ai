import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import useMachineSimulation from '../hooks/useMachineSimulation'
import { getHealth, predict } from '../services/api'
import { createMachineState, generateSensorReading } from '../simulator/machineSimulator'
import { MACHINE_PROFILES } from '../simulator/profiles'

vi.mock('../services/api', async () => {
  const actual = await vi.importActual<typeof import('../services/api')>('../services/api')
  return {
    ...actual,
    getHealth: vi.fn(),
    predict: vi.fn(),
  }
})

describe('machine simulation and predictions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getHealth).mockResolvedValue({ status: 'ok', model_loaded: true, model_version: 'v1' })
    vi.mocked(predict).mockResolvedValue({
      prob_failure: 0.12,
      risk_level: 'healthy',
      feature_importances: { tool_wear: 0.6, torque: 0.2 },
      model_version: 'v1',
      timestamp: new Date().toISOString(),
    })
  })

  test('simulator generates a valid reading', () => {
    const reading = generateSensorReading({
      profile: MACHINE_PROFILES[2],
      previousReading: null,
      tick: 0,
    })

    expect(reading).toEqual(
      expect.objectContaining({
        air_temperature: expect.any(Number),
        process_temperature: expect.any(Number),
        rotational_speed: expect.any(Number),
        torque: expect.any(Number),
        tool_wear: expect.any(Number),
      }),
    )
  })

  test('machine contains the five sensors', () => {
    const machine = createMachineState(MACHINE_PROFILES[0])
    const keys = Object.keys(machine.currentReading).sort()

    expect(keys).toEqual(
      ['air_temperature', 'process_temperature', 'rotational_speed', 'timestamp', 'tool_wear', 'torque'].sort(),
    )
  })

  test('simulator increases tool_wear progressively for a degrading machine', () => {
    const profile = MACHINE_PROFILES.find(item => item.id === 'M-007')!
    let previous = generateSensorReading({ profile, previousReading: null, tick: 0 })
    const values: number[] = [previous.tool_wear]

    for (let tick = 1; tick <= 5; tick += 1) {
      previous = generateSensorReading({ profile, previousReading: previous, tick })
      values.push(previous.tool_wear)
    }

    expect(values.slice(1).every((value, index) => value > values[index])).toBe(true)
  })

  test('predict() is called with the expected payload', async () => {
    renderHook(() => useMachineSimulation(20))

    await waitFor(
      () => {
        expect(predict).toHaveBeenCalledWith(
          expect.objectContaining({
            machine_id: expect.any(String),
            reading: expect.objectContaining({
              air_temperature: expect.any(Number),
              process_temperature: expect.any(Number),
              rotational_speed: expect.any(Number),
              torque: expect.any(Number),
              tool_wear: expect.any(Number),
            }),
          }),
        )
      },
      { timeout: 5000 },
    )
  })

  test('interval is cleaned up on unmount', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = renderHook(() => useMachineSimulation(2000))

    expect(setIntervalSpy).toHaveBeenCalledTimes(1)

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
  })
})
