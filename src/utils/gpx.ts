import type { DayRoute, LatLng } from '../types'
import { dayColor } from './colors'
import { elevationGainM, pathDistanceKm } from './geo'

function textContent(el: Element | null): string {
  return el?.textContent?.trim() ?? ''
}

function parseNumber(value: string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function parseTimeMs(value: string): number | null {
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function collectTrackPoints(doc: Document): LatLng[] {
  const nodes = [
    ...doc.querySelectorAll('trkpt'),
    ...doc.querySelectorAll('rtept'),
  ]
  // Prefer track points; fall back to route points if no track.
  const preferred =
    doc.querySelectorAll('trkpt').length > 0
      ? [...doc.querySelectorAll('trkpt')]
      : nodes

  const points: LatLng[] = []
  for (const node of preferred) {
    const lat = parseNumber(node.getAttribute('lat'))
    const lng = parseNumber(node.getAttribute('lon'))
    if (lat == null || lng == null) continue

    const ele = parseNumber(textContent(node.querySelector('ele')))
    const timeRaw = textContent(node.querySelector('time'))
    const point: LatLng = { lat, lng }
    if (ele != null) point.ele = ele
    if (timeRaw) point.time = timeRaw
    points.push(point)
  }
  return points
}

function trackName(doc: Document, filename: string): string {
  const name =
    textContent(doc.querySelector('trk > name')) ||
    textContent(doc.querySelector('metadata > name')) ||
    textContent(doc.querySelector('name'))
  if (name) return name
  return filename.replace(/\.gpx$/i, '')
}

function startTimeMs(points: LatLng[]): number | null {
  for (const point of points) {
    if (!point.time) continue
    const ms = parseTimeMs(point.time)
    if (ms != null) return ms
  }
  return null
}

export function parseGpxXml(
  xml: string,
  filename: string,
  orderIndex: number,
  colorIndex: number,
): DayRoute {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) {
    throw new Error(`Could not parse ${filename}`)
  }

  const points = collectTrackPoints(doc)
  if (points.length < 2) {
    throw new Error(`${filename} has no usable track points`)
  }

  return {
    id: `${filename}-${orderIndex}-${points.length}`,
    filename,
    name: trackName(doc, filename),
    color: dayColor(colorIndex),
    points,
    startTime: startTimeMs(points),
    distanceKm: pathDistanceKm(points),
    elevationGainM: elevationGainM(points),
    orderIndex,
  }
}

export async function parseGpxFile(file: File, orderIndex: number, colorIndex: number): Promise<DayRoute> {
  const xml = await file.text()
  return parseGpxXml(xml, file.name, orderIndex, colorIndex)
}

/** Sort by GPX start time when available; otherwise keep filename / drop order. */
export function sortDayRoutes(days: DayRoute[]): DayRoute[] {
  const withTime = days.filter((d) => d.startTime != null)
  const withoutTime = days.filter((d) => d.startTime == null)

  withTime.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
  withoutTime.sort((a, b) => {
    const byName = a.filename.localeCompare(b.filename, undefined, { numeric: true })
    if (byName !== 0) return byName
    return a.orderIndex - b.orderIndex
  })

  // If most files have times, put timed first then untimed; if none have times, filename order.
  const ordered = withTime.length > 0 ? [...withTime, ...withoutTime] : withoutTime

  return ordered.map((day, index) => ({
    ...day,
    color: dayColor(index),
  }))
}

export function isGpxFile(file: File): boolean {
  const name = file.name.toLowerCase()
  if (name.endsWith('.gpx')) return true
  const type = file.type.toLowerCase()
  return (
    type.includes('gpx') ||
    type === 'application/xml' ||
    type === 'text/xml' ||
    type === 'application/gpx+xml'
  )
}
