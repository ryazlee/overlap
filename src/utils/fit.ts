import type { DayRoute, LatLng } from '../types'
import { routeFromPoints, stripTrackExtension } from './routeFromPoints'

/** FIT stores lat/lng as semicircles; some parsers already convert to degrees. */
function toDegrees(value: number): number {
  if (Math.abs(value) <= 180) return value
  return (value * 180) / 2 ** 31
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? date : null
  }
  return null
}

export async function parseFitFile(
  file: File,
  orderIndex: number,
  colorIndex: number,
): Promise<DayRoute> {
  const [{ default: FitParser }, buffer] = await Promise.all([
    import('fit-file-parser'),
    file.arrayBuffer(),
  ])
  const parser = new FitParser({
    force: true,
    lengthUnit: 'm',
    mode: 'list',
  })

  let data: Awaited<ReturnType<InstanceType<typeof FitParser>['parseAsync']>>
  try {
    data = await parser.parseAsync(buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not parse ${file.name}: ${message}`)
  }

  const records = data.records ?? []
  const points: LatLng[] = []

  for (const record of records) {
    const rawLat = record.position_lat
    const rawLng = record.position_long
    if (rawLat == null || rawLng == null) continue
    if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) continue

    const lat = toDegrees(rawLat)
    const lng = toDegrees(rawLng)
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue

    const point: LatLng = { lat, lng }
    if (record.altitude != null && Number.isFinite(record.altitude)) {
      point.ele = record.altitude
    }
    const stamp = asDate(record.timestamp)
    if (stamp) point.time = stamp.toISOString()
    points.push(point)
  }

  const sessionName = data.sessions?.[0]?.sport
  const name =
    (typeof sessionName === 'string' && sessionName ? sessionName : null) ||
    stripTrackExtension(file.name)

  return routeFromPoints({
    filename: file.name,
    name,
    points,
    orderIndex,
    colorIndex,
  })
}
