export type LatLng = {
  lat: number
  lng: number
  ele?: number
  time?: string
}

export type DayRoute = {
  id: string
  filename: string
  name: string
  color: string
  points: LatLng[]
  startTime: number | null
  /** Elapsed ride time from first to last timestamped point, when available. */
  durationMs: number | null
  distanceKm: number
  elevationGainM: number | null
  orderIndex: number
}

export type TripStats = {
  dayCount: number
  totalKm: number
  totalDurationMs: number | null
  elevationGainM: number | null
}

export type PlaceLabel = {
  key: string
  lat: number
  lng: number
  name: string
}
