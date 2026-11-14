import { useRef, useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import AppHeader from '../AppHeader'
import Button from '../Button'
import DayLegend from '../DayLegend'
import DropZone from '../DropZone'
import MakerCredit from '../MakerCredit'
import SectionCard from '../SectionCard'
import TripMap from '../TripMap'
import TripStats from '../TripStats'
import { useGpxTrip } from '../../hooks/useGpxTrip'
import { downloadMapPng, exportFilename } from '../../utils/exportMap'

export default function HomeScreen() {
  const { days, stats, errors, busy, addFiles, removeDay, clearAll } = useGpxTrip()
  const captureRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)
  const hasTrip = days.length > 0

  async function onExport() {
    const root = captureRef.current
    if (!root || days.length === 0) return

    setExporting(true)
    setExportNotice(null)
    try {
      await downloadMapPng(root, exportFilename(days.length))
      setExportNotice('PNG downloaded.')
    } catch {
      setExportNotice(
        'Could not export the map. Tile images need to load (check network / CORS). Try again in a moment.',
      )
    } finally {
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
                  Drop Strava GPX files to overlay each day on one map, then export a clean PNG.
                </p>
                <p className="home__note">
                  GPX stays in your browser. Map tiles load from CARTO / OpenStreetMap when you view or
                  export.
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
                  <DayLegend days={days} onRemove={removeDay} />
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
                    GPX never leaves this device. Viewing and exporting the map loads tiles from a public
                    tile provider (CARTO / OpenStreetMap).
                  </p>
                </SectionCard>
              </aside>

              <section className="tool-map-panel" aria-label="Trip map">
                <div className="map-capture" ref={captureRef}>
                  <div className="map-capture__map">
                    <TripMap days={days} />
                  </div>
                  <div className="map-capture__legend" aria-hidden="true">
                    {days.map((day, index) => (
                      <span key={day.id} className="map-capture__chip">
                        <span
                          className="map-capture__dot"
                          style={{ background: day.color }}
                        />
                        Day {index + 1}
                      </span>
                    ))}
                  </div>
                  <p className="map-capture__credit">Map data © OpenStreetMap, CARTO</p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
