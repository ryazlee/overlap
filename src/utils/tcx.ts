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

function localName(el: Element): string {
  return el.localName || el.nodeName.replace(/^.*:/, '')
}

function findChildren(parent: Element, name: string): Element[] {
  return [...parent.children].filter((child) => localName(child) === name)
}

function findDescendants(root: ParentNode, name: string): Element[] {
  return [...root.querySelectorAll('*')].filter((el) => localName(el) === name)
}

function firstChild(parent: Element, name: string): Element | null {
  return findChildren(parent, name)[0] ?? null
}

function collectTcxPoints(doc: Document): LatLng[] {
  const trackpoints = findDescendants(doc, 'Trackpoint')
  const points: LatLng[] = []

  for (const node of trackpoints) {
    const position = firstChild(node, 'Position')
    if (!position) continue
    const lat = parseNumber(textContent(firstChild(position, 'LatitudeDegrees')))
    const lng = parseNumber(textContent(firstChild(position, 'LongitudeDegrees')))
    if (lat == null || lng == null) continue

    const ele = parseNumber(textContent(firstChild(node, 'AltitudeMeters')))
    const timeRaw = textContent(firstChild(node, 'Time'))
    const point: LatLng = { lat, lng }
    if (ele != null) point.ele = ele
    if (timeRaw) point.time = timeRaw
    points.push(point)
  }

  return points
}

function activityName(doc: Document, filename: string): string {
  const notes = findDescendants(doc, 'Notes')
  for (const note of notes) {
    const value = textContent(note)
    if (value) return value
  }
  const ids = findDescendants(doc, 'Id')
  for (const id of ids) {
    const value = textContent(id)
    if (value) return value
  }
  return stripTrackExtension(filename)
}

export function parseTcxXml(
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
    name: activityName(doc, filename),
    points: collectTcxPoints(doc),
    orderIndex,
    colorIndex,
  })
}

export async function parseTcxFile(
  file: File,
  orderIndex: number,
  colorIndex: number,
): Promise<DayRoute> {
  return parseTcxXml(await file.text(), file.name, orderIndex, colorIndex)
}
