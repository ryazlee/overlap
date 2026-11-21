import type { DayRoute, LatLng, PlaceLabel } from '../types'

type NominatimAddress = {
  city?: string
  town?: string
  village?: string
  municipality?: string
  suburb?: string
  county?: string
  state?: string
  country?: string
}

type NominatimResult = {
  display_name?: string
  address?: NominatimAddress
}

const cache = new Map<string, string | null>()
const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

/** ~110 m grid — enough to reuse labels for nearby start/end points. */
export function placeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`
}

function pickPlaceName(result: NominatimResult): string | null {
  const a = result.address
  if (!a) {
    const first = result.display_name?.split(',')[0]?.trim()
    return first || null
  }

  const local =
    a.city || a.town || a.village || a.municipality || a.suburb || a.county || null
  if (!local) {
    const first = result.display_name?.split(',')[0]?.trim()
    return first || null
  }
  return local
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const key = placeCacheKey(lat, lng)
  if (cache.has(key)) return cache.get(key) ?? null

  const url = new URL(NOMINATIM)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'json')
  url.searchParams.set('zoom', '10')
  url.searchParams.set('addressdetails', '1')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        // Browsers forbid setting User-Agent; Nominatim still gets Referer from the page.
      },
    })
    if (!response.ok) {
      cache.set(key, null)
      return null
    }
    const data = (await response.json()) as NominatimResult
    const name = pickPlaceName(data)
    cache.set(key, name)
    return name
  } catch {
    cache.set(key, null)
    return null
  }
}

function endpoint(points: LatLng[], which: 'start' | 'end'): LatLng | null {
  if (points.length === 0) return null
  return which === 'start' ? points[0]! : points[points.length - 1]!
}

export type DayPlaces = {
  dayId: string
  startName: string | null
  endName: string | null
}

/**
 * Resolve start/end place names for each day (Nominatim, 1 req/s, cached).
 * Coordinates leave the device for this lookup only.
 */
export async function resolveDayPlaces(
  days: DayRoute[],
  onProgress?: (places: DayPlaces[]) => void,
): Promise<DayPlaces[]> {
  const results: DayPlaces[] = days.map((day) => ({
    dayId: day.id,
    startName: null,
    endName: null,
  }))

  const jobs: Array<{ dayIndex: number; which: 'start' | 'end'; point: LatLng }> = []
  days.forEach((day, dayIndex) => {
    const start = endpoint(day.points, 'start')
    const end = endpoint(day.points, 'end')
    if (start) jobs.push({ dayIndex, which: 'start', point: start })
    if (end) jobs.push({ dayIndex, which: 'end', point: end })
  })

  for (let i = 0; i < jobs.length; i += 1) {
    const job = jobs[i]!
    const name = await reverseGeocode(job.point.lat, job.point.lng)
    const row = results[job.dayIndex]!
    if (job.which === 'start') row.startName = name
    else row.endName = name
    onProgress?.(results.map((r) => ({ ...r })))
    if (i < jobs.length - 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 1100)
      })
    }
  }

  return results
}

/** Unique start/end city markers for the decluttered map. */
export function uniquePlaceLabels(days: DayRoute[], places: DayPlaces[]): PlaceLabel[] {
  const byKey = new Map<string, PlaceLabel>()

  days.forEach((day) => {
    const info = places.find((p) => p.dayId === day.id)
    const start = endpoint(day.points, 'start')
    const end = endpoint(day.points, 'end')
    if (start && info?.startName) {
      const key = placeCacheKey(start.lat, start.lng)
      if (!byKey.has(key)) {
        byKey.set(key, { key, lat: start.lat, lng: start.lng, name: info.startName })
      }
    }
    if (end && info?.endName) {
      const key = placeCacheKey(end.lat, end.lng)
      if (!byKey.has(key)) {
        byKey.set(key, { key, lat: end.lat, lng: end.lng, name: info.endName })
      }
    }
  })

  return [...byKey.values()]
}
