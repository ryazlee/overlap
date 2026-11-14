import type { DayRoute } from '../types'
import { dayColor } from './colors'
import { parseFitFile } from './fit'
import { parseGpxFile } from './gpx'
import { parseTcxFile } from './tcx'

export type TrackFormat = 'gpx' | 'tcx' | 'fit'

const TRACK_ACCEPT =
  '.gpx,.tcx,.fit,application/gpx+xml,application/vnd.garmin.tcx+xml,application/xml,text/xml'

export function trackFileAccept(): string {
  return TRACK_ACCEPT
}

export function detectTrackFormat(file: File): TrackFormat | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.gpx')) return 'gpx'
  if (name.endsWith('.tcx')) return 'tcx'
  if (name.endsWith('.fit')) return 'fit'

  const type = file.type.toLowerCase()
  if (type.includes('gpx') || type === 'application/gpx+xml') return 'gpx'
  if (type.includes('tcx') || type === 'application/vnd.garmin.tcx+xml') return 'tcx'
  if (type.includes('fit')) return 'fit'
  return null
}

export function isTrackFile(file: File): boolean {
  return detectTrackFormat(file) != null
}

export async function parseTrackFile(
  file: File,
  orderIndex: number,
  colorIndex: number,
): Promise<DayRoute> {
  const format = detectTrackFormat(file)
  if (format === 'gpx') return parseGpxFile(file, orderIndex, colorIndex)
  if (format === 'tcx') return parseTcxFile(file, orderIndex, colorIndex)
  if (format === 'fit') return parseFitFile(file, orderIndex, colorIndex)
  throw new Error(`${file.name} is not a supported track file (use GPX, TCX, or FIT)`)
}

/** Sort by activity start time when available; otherwise keep filename / drop order. */
export function sortDayRoutes(days: DayRoute[]): DayRoute[] {
  const withTime = days.filter((d) => d.startTime != null)
  const withoutTime = days.filter((d) => d.startTime == null)

  withTime.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
  withoutTime.sort((a, b) => {
    const byName = a.filename.localeCompare(b.filename, undefined, { numeric: true })
    if (byName !== 0) return byName
    return a.orderIndex - b.orderIndex
  })

  const ordered = withTime.length > 0 ? [...withTime, ...withoutTime] : withoutTime

  return ordered.map((day, index) => ({
    ...day,
    color: dayColor(index),
  }))
}
