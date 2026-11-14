import type { TripStats as Stats } from '../types'
import { formatElevation, formatKm } from '../utils/geo'

type TripStatsProps = {
  stats: Stats
}

export default function TripStats({ stats }: TripStatsProps) {
  if (stats.dayCount === 0) return null

  return (
    <dl className="trip-stats">
      <div className="trip-stats__item">
        <dt>Days</dt>
        <dd>{stats.dayCount}</dd>
      </div>
      <div className="trip-stats__item">
        <dt>Distance</dt>
        <dd>{formatKm(stats.totalKm)}</dd>
      </div>
      <div className="trip-stats__item">
        <dt>Elevation</dt>
        <dd>
          {stats.elevationGainM != null ? formatElevation(stats.elevationGainM) : '—'}
        </dd>
      </div>
    </dl>
  )
}
