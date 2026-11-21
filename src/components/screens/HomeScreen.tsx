import { useRef, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import AppHeader from '../AppHeader'
import Button from '../Button'
import DayLegend from '../DayLegend'
import DropZone from '../DropZone'
import MakerCredit from '../MakerCredit'
import MapOptions from '../MapOptions'
import SectionCard from '../SectionCard'
import TripMap from '../TripMap'
import TripStats from '../TripStats'
import { useDayPlaces } from '../../hooks/useDayPlaces'
import { useGpxTrip } from '../../hooks/useGpxTrip'
import { downloadMapPng, exportFilename } from '../../utils/exportMap'
import { formatDuration, formatMiles } from '../../utils/geo'

export default function HomeScreen() {
  const { days, stats, errors, busy, addFiles, removeDay, clearAll } = useGpxTrip()
  const { placesByDay, labels, busy: placesBusy } = useDayPlaces(days)
  const captureRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)
  const [transparentExport, setTransparentExport] = useState(false)
  const [showElevation, setShowElevation] = useState(false)
  const [endpointsOnly, setEndpointsOnly] = useState(false)
  const hasTrip = days.length > 0

  async function onExport() {
    const root = captureRef.current
    if (!root || days.length === 0) return

    setExporting(true)
    setExportNotice(null)
    const prevTransparent = root.classList.contains('map-capture--transparent')
    if (transparentExport) root.classList.add('map-capture--transparent')
    try {
      await downloadMapPng(root, exportFilename(days.length, transparentExport), {
        transparent: transparentExport,
      })
      setExportNotice('PNG downloaded.')
    } catch {
      setExportNotice(
        'Could not export the map. Tile images need to load (check network / CORS). Try again in a moment.',
      )
    } finally {
      if (!prevTransparent) root.classList.remove('map-capture--transparent')
      setExporting(false)
    }
  }

  return (
    <div className={['app-shell', hasTrip ? null : 'app-shell--home'].filter(Boolean).join(' ')}>
      <AppHeader
        title="Overlap"
        subtitle={hasTrip ? undefined : 'simple multi-day cycling map generator'}
        quiet={!hasTrip}
      />
      <main className="app-main">
        <div className="shell-inner">
          {!hasTrip ? (
            <div className="home">
              <div className="home__copy">
                <p className="home__lede">
                  Overlay multi-day rides on one map, then export a clean PNG.
                </p>
                <p className="home__note">
                  Drop GPX, or choose exports from Strava / Apple Fitness on your device. Track files
                  stay in your browser; map tiles load from CARTO / OpenStreetMap.
                </p>
              </div>
              <MakerCredit />
              <div className="home__actions">
                <DropZone onFiles={addFiles} busy={busy} />
              </div>
              {errors.length > 0 ? (
                <ul className="notice-list">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <div className="tool-layout">
              <aside className="tool-sidebar">
                <SectionCard title="Trip">
                  <TripStats stats={stats} />
                  <DayLegend days={days} placesByDay={placesByDay} onRemove={removeDay} />
                  {placesBusy ? (
                    <p className="meta meta--sm meta--muted">Looking up start & end places…</p>
                  ) : null}
                  <MapOptions
                    transparentExport={transparentExport}
                    onTransparentExportChange={setTransparentExport}
                    showElevation={showElevation}
                    onShowElevationChange={setShowElevation}
                    endpointsOnly={endpointsOnly}
                    onEndpointsOnlyChange={setEndpointsOnly}
                  />
                  <div className="tool-actions">
                    <Button
                      label={exporting ? 'Exporting…' : 'Export PNG'}
                      icon={<Download size={16} aria-hidden="true" />}
                      onClick={onExport}
                      disabled={exporting || busy}
                      block
                    />
                    <Button
                      label="Clear all"
                      variant="ghost"
                      icon={<Trash2 size={16} aria-hidden="true" />}
                      onClick={clearAll}
                      disabled={busy || exporting}
                    />
                  </div>
                  {exportNotice ? <p className="meta meta--sm">{exportNotice}</p> : null}
                  {errors.length > 0 ? (
                    <ul className="notice-list">
                      {errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  ) : null}
                </SectionCard>
                <SectionCard title="Add days" plain>
                  <DropZone onFiles={addFiles} busy={busy} compact />
                  <p className="meta meta--sm meta--muted privacy-note">
                    Track files stay on this device. Map tiles load from CARTO / Esri. Start & end
                    place names use OpenStreetMap Nominatim (coordinates only).
                  </p>
                </SectionCard>
              </aside>

              <section className="tool-map-panel" aria-label="Trip map">
                <div
                  className={[
                    'map-capture',
                    transparentExport ? 'map-capture--transparent' : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  ref={captureRef}
                >
                  <div className="map-capture__map">
                    <TripMap
                      days={days}
                      showElevation={showElevation}
                      endpointsOnly={endpointsOnly}
                      placeLabels={labels}
                    />
                  </div>
                  <div className="map-capture__legend" aria-hidden="true">
                    {days.map((day, index) => {
                      const places = placesByDay.get(day.id)
                      const route =
                        places?.startName && places?.endName
                          ? places.startName === places.endName
                            ? places.startName
                            : `${places.startName} → ${places.endName}`
                          : null
                      return (
                        <span key={day.id} className="map-capture__chip">
                          <span
                            className="map-capture__dot"
                            style={{ background: day.color }}
                          />
                          <span className="map-capture__chip-text">
                            Day {index + 1} · {formatMiles(day.distanceKm)}
                            {day.durationMs != null
                              ? ` · ${formatDuration(day.durationMs)}`
                              : ''}
                            {route ? ` · ${route}` : ''}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                  <p className="map-capture__credit">
                    Map data © OpenStreetMap, CARTO
                    {showElevation ? ', Esri' : ''}
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
