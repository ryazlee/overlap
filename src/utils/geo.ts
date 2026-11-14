import type { LatLng, TripStats } from '../types'
import type { DayRoute } from '../types'

const EARTH_RADIUS_M = 6371000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Haversine distance in meters between two points. */
export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function pathDistanceKm(points: LatLng[]): number {
  if (points.length < 2) return 0
  let meters = 0
  for (let i = 1; i < points.length; i += 1) {
    meters += haversineM(points[i - 1]!, points[i]!)
  }
  return meters / 1000
}

/**
 * Cumulative elevation gain in meters.
 * Ignores tiny noise (< 1.5 m) between samples; returns null if no elevations.
 */
export function elevationGainM(points: LatLng[]): number | null {
  const elevs = points.map((p) => p.ele).filter((e): e is number => e != null && Number.isFinite(e))
  if (elevs.length < 2) return null

  let gain = 0
  let last = elevs[0]!
  for (let i = 1; i < elevs.length; i += 1) {
    const next = elevs[i]!
    const delta = next - last
    if (delta > 1.5) {
      gain += delta
    }
    last = next
  }
  return Math.round(gain)
}

export function summarizeTrip(days: DayRoute[]): TripStats {
  const dayCount = days.length
  const totalKm = days.reduce((sum, day) => sum + day.distanceKm, 0)
  const gains = days.map((d) => d.elevationGainM)
  const elevationGainM =
    gains.every((g) => g != null) && gains.length > 0
      ? gains.reduce<number>((sum, g) => sum + (g ?? 0), 0)
      : gains.some((g) => g != null)
        ? gains.reduce<number>((sum, g) => sum + (g ?? 0), 0)
        : null

  return {
    dayCount,
    totalKm,
    elevationGainM,
  }
}

export function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function formatElevation(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km elev`
  return `${Math.round(meters)} m elev`
}
