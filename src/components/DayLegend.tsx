import { X } from 'lucide-react'
import type { DayRoute } from '../types'
import { formatElevation, formatKm } from '../utils/geo'

type DayLegendProps = {
  days: DayRoute[]
  onRemove: (id: string) => void
}

export default function DayLegend({ days, onRemove }: DayLegendProps) {
  if (days.length === 0) return null

  return (
    <ul className="day-legend">
      {days.map((day, index) => (
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
            <p className="day-legend__meta">
              {formatKm(day.distanceKm)}
              {day.elevationGainM != null ? ` · ${formatElevation(day.elevationGainM)}` : ''}
            </p>
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
      ))}
    </ul>
  )
}
