import type { DayRoute, LatLng } from '../types'
import { routeFromPoints, stripTrackExtension } from './routeFromPoints'

function textContent(el: Element | null): string {
  return el?.textContent?.trim() ?? ''
}

function parseNumber(value: string | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function collectTrackPoints(doc: Document): LatLng[] {
  const preferred =
    doc.querySelectorAll('trkpt').length > 0
      ? [...doc.querySelectorAll('trkpt')]
      : [...doc.querySelectorAll('rtept')]

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
  return stripTrackExtension(filename)
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

  return routeFromPoints({
    filename,
    name: trackName(doc, filename),
    points: collectTrackPoints(doc),
    orderIndex,
    colorIndex,
  })
}

export async function parseGpxFile(
  file: File,
  orderIndex: number,
  colorIndex: number,
): Promise<DayRoute> {
  return parseGpxXml(await file.text(), file.name, orderIndex, colorIndex)
}
