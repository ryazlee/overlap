import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import { divIcon, latLngBounds, type LatLngExpression } from 'leaflet'
import type { DayRoute, PlaceLabel } from '../types'
import { useTheme } from '../theme'

const FALLBACK_CENTER: [number, number] = [37.7749, -122.4194]

/** CARTO basemaps allow CORS / canvas export (unlike raw OSM tile CDN). Requires a free basemap API key. */
const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const LIGHT_NOLABELS =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png'
const DARK_NOLABELS = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
/** Esri World Hillshade — terrain relief overlay (CORS-friendly for PNG export). */
const HILLSHADE =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
const HILLSHADE_ATTR =
  'Hillshade &copy; <a href="https://www.esri.com/">Esri</a>'

function cartoTileUrl(base: string): string {
  const key = import.meta.env.VITE_CARTO_API_KEY?.trim()
  if (!key) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}key=${encodeURIComponent(key)}`
}

function placeIcon(name: string) {
  return divIcon({
    className: 'place-label',
    html: `<span class="place-label__text">${escapeHtml(name)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

type TripMapProps = {
  days: DayRoute[]
  showElevation?: boolean
  endpointsOnly?: boolean
  placeLabels?: PlaceLabel[]
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
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
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

export default function TripMap({
  days,
  showElevation = false,
  endpointsOnly = false,
  placeLabels = [],
}: TripMapProps) {
  const { theme } = useTheme()

  const startCenter: [number, number] = useMemo(() => {
    const first = days[0]?.points[0]
    return first ? [first.lat, first.lng] : FALLBACK_CENTER
  }, [days])

  const baseUrl = useMemo(() => {
    if (theme === 'dark') {
      return cartoTileUrl(endpointsOnly ? DARK_NOLABELS : DARK_TILES)
    }
    return cartoTileUrl(endpointsOnly ? LIGHT_NOLABELS : LIGHT_TILES)
  }, [theme, endpointsOnly])

  const attribution = showElevation ? `${TILE_ATTR} | ${HILLSHADE_ATTR}` : TILE_ATTR

  return (
    <MapContainer
      center={startCenter}
      zoom={12}
      zoomSnap={0.25}
      zoomDelta={0.25}
      wheelPxPerZoomLevel={100}
      scrollWheelZoom
      className="trip-map__leaflet"
    >
      <TileLayer url={baseUrl} attribution={attribution} crossOrigin="anonymous" />
      {showElevation ? (
        <TileLayer
          url={HILLSHADE}
          opacity={theme === 'dark' ? 0.35 : 0.45}
          zIndex={2}
          crossOrigin="anonymous"
          attribution={HILLSHADE_ATTR}
        />
      ) : null}
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
      {endpointsOnly
        ? placeLabels.map((place) => (
            <Marker
              key={place.key}
              position={[place.lat, place.lng]}
              icon={placeIcon(place.name)}
              interactive={false}
            />
          ))
        : null}
    </MapContainer>
  )
}
