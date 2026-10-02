import { useEffect, useRef, useState } from 'react'
import { getHealth, predict } from '../services/api'
import { advanceMachineState, createMachineState } from '../simulator/machineSimulator'
import { MACHINE_PROFILES } from '../simulator/profiles'
import type { MachineState } from '../types'

const profileMap = new Map(MACHINE_PROFILES.map(profile => [profile.id, profile]))

export default function useMachineSimulation(intervalMs = 2000) {
  const [machines, setMachines] = useState<MachineState[]>(() => MACHINE_PROFILES.map(createMachineState))
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline')
  const [loading, setLoading] = useState(false)
  const backendStatusRef = useRef<'online' | 'offline'>('offline')

  useEffect(() => {
    backendStatusRef.current = backendStatus
  }, [backendStatus])

  const refreshHealth = async () => {
    try {
      const health = await getHealth()
      const online = health.model_loaded === true
      setBackendStatus(online ? 'online' : 'offline')
      backendStatusRef.current = online ? 'online' : 'offline'
    } catch {
      setBackendStatus('offline')
      backendStatusRef.current = 'offline'
    }
  }

  useEffect(() => {
    void refreshHealth()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMachines((currentMachines) => {
        const nextMachines = currentMachines.map((machine) => {
          const profile = profileMap.get(machine.machineId)
          if (!profile) return machine
          return advanceMachineState(machine, profile)
        })

        void Promise.all(
          nextMachines.map(async (machine) => {
            const profile = profileMap.get(machine.machineId)
            if (!profile) return

            if (backendStatusRef.current !== 'online') {
              setMachines((state) =>
                state.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...machine,
                        probability: null,
                        riskLevel: 'offline',
                        backendStatus: 'offline',
                      }
                    : item,
                ),
              )
              return
            }

            setLoading(true)
            try {
              const prediction = await predict({
                machine_id: machine.machineId,
                reading: machine.currentReading,
              })

              setMachines((state) =>
                state.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...machine,
                        probability: prediction.prob_failure,
                        probabilityHistory: [
                          ...machine.probabilityHistory,
                          {
                            timestamp: prediction.timestamp,
                            probability: prediction.prob_failure,
                            label: new Date(prediction.timestamp).toLocaleTimeString(),
                          },
                        ].slice(-50),
                        riskLevel: prediction.risk_level,
                        featureImportances: prediction.feature_importances,
                        timestamp: prediction.timestamp,
                        lastUpdated: prediction.timestamp,
                        backendStatus: 'online',
                      }
                    : item,
                ),
              )
            } catch {
              setBackendStatus('offline')
              backendStatusRef.current = 'offline'
              setMachines((state) =>
                state.map((item) =>
                  item.machineId === machine.machineId
                    ? {
                        ...machine,
                        probability: null,
                        riskLevel: 'offline',
                        backendStatus: 'offline',
                      }
                    : item,
                ),
              )
            } finally {
              setLoading(false)
            }
          }),
        )

        return nextMachines
      })
    }, intervalMs)

    return () => {
      window.clearInterval(interval)
    }
  }, [intervalMs])

  return { machines, backendStatus, loading }
}
