import { useCallback, useMemo, useState } from 'react'
import type { DayRoute, TripStats } from '../types'
import { summarizeTrip } from '../utils/geo'
import { isGpxFile, parseGpxFile, sortDayRoutes } from '../utils/gpx'

export function useGpxTrip() {
  const [days, setDays] = useState<DayRoute[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const stats: TripStats = useMemo(() => summarizeTrip(days), [days])

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = [...fileList].filter(isGpxFile)
    if (files.length === 0) {
      setErrors(['Drop .gpx files exported from Strava (or similar).'])
      return
    }

    setBusy(true)
    setErrors([])

    const nextErrors: string[] = []
    const parsed: DayRoute[] = []
    let orderBase = Date.now()

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]!
      try {
        const route = await parseGpxFile(file, orderBase + i, i)
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
