export type SensorReading = {
  air_temperature: number
  process_temperature: number
  rotational_speed: number
  torque: number
  tool_wear: number
  timestamp?: string
}

export type PredictRequest = {
  machine_id?: string
  reading: SensorReading
}

export type PredictResponse = {
  prob_failure: number
  risk_level: 'healthy' | 'warning' | 'critical'
  feature_importances: Record<string, number>
  model_version: string
  timestamp: string
}

export type HealthResponse = {
  status: string
  model_loaded: boolean
  model_version?: string
}

export type ModelMetadata = {
  model_version: string
  trained_at: string
  metrics: Record<string, number>
}

export type SimulationProfileType = 'stable' | 'degradation_slow' | 'degradation_moderate' | 'degradation_fast'

export type MachineRiskLevel = 'healthy' | 'warning' | 'critical' | 'offline' | 'waiting'

export type MachineTrend = 'increasing' | 'decreasing' | 'stable'

export type ProbabilityPoint = {
  timestamp: string
  probability: number
  label: string
}

export type MachineProfile = {
  id: string
  label: string
  profileType: SimulationProfileType
  baseReading: SensorReading
  variation: number
  drift: number
  temperatureBias: number
  rotationalBias: number
  torqueBias: number
}

export type MachineState = {
  machineId: string
  profileType: SimulationProfileType
  profileLabel: string
  currentReading: SensorReading
  probability: number | null
  probabilityHistory: ProbabilityPoint[]
  riskLevel: MachineRiskLevel
  featureImportances: Record<string, number>
  timestamp: string | null
  lastUpdated: string | null
  history: SensorReading[]
  trend: MachineTrend
  backendStatus: 'online' | 'offline' | 'waiting'
}
