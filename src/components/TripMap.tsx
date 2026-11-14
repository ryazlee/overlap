import { useEffect, useMemo } from 'react'
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import { latLngBounds, type LatLngExpression } from 'leaflet'
import type { DayRoute } from '../types'
import { useTheme } from '../theme'

const FALLBACK_CENTER: [number, number] = [37.7749, -122.4194]

/** CARTO basemaps allow CORS / canvas export (unlike raw OSM tile CDN). */
const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

type TripMapProps = {
  days: DayRoute[]
}

function FitBounds({ days }: { days: DayRoute[] }) {
  const map = useMap()
  const key = days.map((d) => d.id).join('|')

  useEffect(() => {
    const points = days.flatMap((day) => day.points)
    if (points.length === 0) return

    if (points.length === 1) {
      const only = points[0]!
      map.setView([only.lat, only.lng], 13)
      return
    }

    const bounds = latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [map, key, days])

  return null
}

function InvalidateOnResize() {
  const map = useMap()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize()
    })
    const later = window.setTimeout(() => {
      map.invalidateSize()
    }, 180)

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(map.getContainer())

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(later)
      observer.disconnect()
    }
  }, [map])

  return null
}

export default function TripMap({ days }: TripMapProps) {
  const { theme } = useTheme()

  const startCenter: [number, number] = useMemo(() => {
    const first = days[0]?.points[0]
    return first ? [first.lat, first.lng] : FALLBACK_CENTER
  }, [days])

  return (
    <MapContainer
      center={startCenter}
      zoom={12}
      scrollWheelZoom
      className="trip-map__leaflet"
    >
      <TileLayer
        url={theme === 'dark' ? DARK_TILES : LIGHT_TILES}
        attribution={TILE_ATTR}
        crossOrigin="anonymous"
      />
      <FitBounds days={days} />
      <InvalidateOnResize />
      {days.map((day) => {
        const positions: LatLngExpression[] = day.points.map((p) => [p.lat, p.lng])
        return (
          <Polyline
            key={day.id}
            positions={positions}
            pathOptions={{
              color: day.color,
              weight: 4,
              opacity: 0.92,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )
      })}
    </MapContainer>
  )
}
