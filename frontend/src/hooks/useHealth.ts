import { useEffect, useState } from 'react'
import { getHealth, getModel } from '../services/api'

export default function useHealth() {
  const [online, setOnline] = useState<boolean | null>(null)
  const [modelVersion, setModelVersion] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    getHealth()
      .then((h) => mounted && setOnline(h.model_loaded === true))
      .catch(() => mounted && setOnline(false))

    getModel()
      .then((m) => mounted && setModelVersion(m.model_version))
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [])

  return { online, modelVersion }
}
