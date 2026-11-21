import { useEffect, useMemo, useState } from 'react'
import type { DayRoute, PlaceLabel } from '../types'
import {
  resolveDayPlaces,
  uniquePlaceLabels,
  type DayPlaces,
} from '../utils/places'

function emptyPlaces(days: DayRoute[]): DayPlaces[] {
  return days.map((day) => ({
    dayId: day.id,
    startName: null,
    endName: null,
  }))
}

export function useDayPlaces(days: DayRoute[]) {
  const dayKey = days.map((d) => d.id).join('|')
  const [resolvedKey, setResolvedKey] = useState('')
  const [places, setPlaces] = useState<DayPlaces[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (dayKey === '') {
      setResolvedKey('')
      setPlaces([])
      setBusy(false)
      return
    }

    let cancelled = false
    const snapshot = days
    setBusy(true)

    void resolveDayPlaces(snapshot, (next) => {
      if (!cancelled) {
        setPlaces(next)
        setResolvedKey(dayKey)
      }
    }).then((final) => {
      if (!cancelled) {
        setPlaces(final)
        setResolvedKey(dayKey)
        setBusy(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [dayKey, days])

  const displayPlaces =
    dayKey === '' ? [] : resolvedKey === dayKey ? places : emptyPlaces(days)

  const labels: PlaceLabel[] = useMemo(
    () => uniquePlaceLabels(days, displayPlaces),
    [days, displayPlaces],
  )

  const byDayId = useMemo(() => {
    const map = new Map<string, DayPlaces>()
    for (const row of displayPlaces) map.set(row.dayId, row)
    return map
  }, [displayPlaces])

  return { placesByDay: byDayId, labels, busy: busy && dayKey !== '' }
}
