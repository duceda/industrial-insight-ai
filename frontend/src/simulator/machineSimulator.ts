import type { MachineProfile, MachineState, SensorReading } from '../types'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function generateSensorReading({
  profile,
  previousReading,
  tick,
}: {
  profile: MachineProfile
  previousReading: SensorReading | null
  tick: number
}): SensorReading {
  const step = tick + 1
  const noise = (Math.random() - 0.5) * profile.variation
  const degradationFactor = profile.profileType === 'stable' ? 0 : step * profile.drift * 0.18

  const wearRise = profile.drift + Math.max(noise * 1.5, 0) + degradationFactor
  const toolWear = clamp(
    (previousReading?.tool_wear ?? profile.baseReading.tool_wear) + wearRise,
    40,
    500,
  )

  const torque = clamp(
    profile.baseReading.torque + noise * 1.5 + (profile.profileType === 'stable' ? 0 : step * profile.torqueBias),
    15,
    120,
  )

  const rotationalSpeed = clamp(
    profile.baseReading.rotational_speed + noise * 4.5 + (profile.profileType === 'stable' ? 0 : step * profile.rotationalBias),
    500,
    2200,
  )

  const processTemperature = clamp(
    profile.baseReading.process_temperature + noise * 2.2 + (profile.profileType === 'stable' ? 0 : step * profile.temperatureBias * 7.5),
    280,
    420,
  )

  const airTemperature = clamp(
    profile.baseReading.air_temperature + noise * 1.3 + (profile.profileType === 'stable' ? 0 : step * profile.temperatureBias * 4.2),
    250,
    350,
  )

  return {
    air_temperature: Number(airTemperature.toFixed(1)),
    process_temperature: Number(processTemperature.toFixed(1)),
    rotational_speed: Number(rotationalSpeed.toFixed(1)),
    torque: Number(torque.toFixed(1)),
    tool_wear: Number(toolWear.toFixed(1)),
    timestamp: new Date().toISOString(),
  }
}

export function createMachineState(profile: MachineProfile): MachineState {
  const currentReading = generateSensorReading({
    profile,
    previousReading: null,
    tick: 0,
  })

  return {
    machineId: profile.id,
    profileType: profile.profileType,
    profileLabel: profile.label,
    currentReading,
    probability: null,
    probabilityHistory: [],
    riskLevel: 'waiting',
    featureImportances: {},
    timestamp: currentReading.timestamp ?? null,
    lastUpdated: currentReading.timestamp ?? null,
    history: [currentReading],
    trend: 'stable',
    backendStatus: 'waiting',
  }
}

export function advanceMachineState(machine: MachineState, profile: MachineProfile): MachineState {
  const previousReading = machine.history[machine.history.length - 1] ?? machine.currentReading
  const nextReading = generateSensorReading({
    profile,
    previousReading,
    tick: machine.history.length,
  })

  const previousWear = machine.history[machine.history.length - 2]?.tool_wear ?? machine.currentReading.tool_wear
  const trend: MachineState['trend'] =
    nextReading.tool_wear > previousWear
      ? 'increasing'
      : nextReading.tool_wear < previousWear
        ? 'decreasing'
        : 'stable'

  return {
    ...machine,
    currentReading: nextReading,
    history: [...machine.history.slice(-49), nextReading],
    timestamp: nextReading.timestamp ?? null,
    lastUpdated: nextReading.timestamp ?? null,
    trend,
    backendStatus: machine.backendStatus,
  }
}
