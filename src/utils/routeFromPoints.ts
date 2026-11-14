import type { DayRoute, LatLng } from '../types'
import { dayColor } from './colors'
import { elevationGainM, pathDistanceKm } from './geo'

function parseTimeMs(value: string): number | null {
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

export function startTimeMs(points: LatLng[]): number | null {
  for (const point of points) {
    if (!point.time) continue
    const ms = parseTimeMs(point.time)
    if (ms != null) return ms
  }
  return null
}

export function routeFromPoints(options: {
  filename: string
  name: string
  points: LatLng[]
  orderIndex: number
  colorIndex: number
}): DayRoute {
  const { filename, name, points, orderIndex, colorIndex } = options
  if (points.length < 2) {
    throw new Error(`${filename} has no usable track points`)
  }

  return {
    id: `${filename}-${orderIndex}-${points.length}`,
    filename,
    name,
    color: dayColor(colorIndex),
    points,
    startTime: startTimeMs(points),
    distanceKm: pathDistanceKm(points),
    elevationGainM: elevationGainM(points),
    orderIndex,
  }
}

export function stripTrackExtension(filename: string): string {
  return filename.replace(/\.(gpx|tcx|fit)$/i, '')
}
