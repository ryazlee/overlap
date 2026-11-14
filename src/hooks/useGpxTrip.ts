import { useCallback, useMemo, useState } from 'react'
import type { DayRoute, TripStats } from '../types'
import { summarizeTrip } from '../utils/geo'
import { isTrackFile, parseTrackFile, sortDayRoutes } from '../utils/trackFile'

export function useGpxTrip() {
  const [days, setDays] = useState<DayRoute[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const stats: TripStats = useMemo(() => summarizeTrip(days), [days])

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = [...fileList].filter(isTrackFile)
    if (files.length === 0) {
      setErrors([
        'Choose GPX, TCX, or FIT exports from Strava, Apple Fitness, Garmin, or similar.',
      ])
      return
    }

    setBusy(true)
    setErrors([])

    const nextErrors: string[] = []
    const parsed: DayRoute[] = []
    const orderBase = Date.now()

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]!
      try {
        const route = await parseTrackFile(file, orderBase + i, i)
        parsed.push(route)
      } catch (error) {
        nextErrors.push(error instanceof Error ? error.message : `Failed to read ${file.name}`)
      }
    }

    setDays((current) => sortDayRoutes([...current, ...parsed]))
    setErrors(nextErrors)
    setBusy(false)
  }, [])

  const removeDay = useCallback((id: string) => {
    setDays((current) => sortDayRoutes(current.filter((day) => day.id !== id)))
  }, [])

  const clearAll = useCallback(() => {
    setDays([])
    setErrors([])
  }, [])

  return {
    days,
    stats,
    errors,
    busy,
    addFiles,
    removeDay,
    clearAll,
  }
}
