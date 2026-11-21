import { X } from 'lucide-react'
import type { DayRoute } from '../types'
import type { DayPlaces } from '../utils/places'
import { formatDuration, formatElevation, formatMiles } from '../utils/geo'

type DayLegendProps = {
  days: DayRoute[]
  placesByDay: Map<string, DayPlaces>
  onRemove: (id: string) => void
}

function placeLine(startName: string | null | undefined, endName: string | null | undefined): string | null {
  if (startName && endName) {
    if (startName === endName) return startName
    return `${startName} → ${endName}`
  }
  if (startName) return `From ${startName}`
  if (endName) return `To ${endName}`
  return null
}

export default function DayLegend({ days, placesByDay, onRemove }: DayLegendProps) {
  if (days.length === 0) return null

  return (
    <ul className="day-legend">
      {days.map((day, index) => {
        const places = placesByDay.get(day.id)
        const route = placeLine(places?.startName, places?.endName)
        const bits = [
          formatMiles(day.distanceKm),
          day.durationMs != null ? formatDuration(day.durationMs) : null,
          day.elevationGainM != null ? formatElevation(day.elevationGainM) : null,
        ].filter(Boolean)

        return (
          <li key={day.id} className="day-legend__item">
            <span
              className="day-legend__swatch"
              style={{ background: day.color }}
              aria-hidden="true"
            />
            <div className="day-legend__body">
              <p className="day-legend__title">
                Day {index + 1}
                <span className="day-legend__name">{day.name}</span>
              </p>
              <p className="day-legend__meta">{bits.join(' · ')}</p>
              {route ? <p className="day-legend__places">{route}</p> : null}
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Remove ${day.name}`}
              title="Remove"
              onClick={() => onRemove(day.id)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
