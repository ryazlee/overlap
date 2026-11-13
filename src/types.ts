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
  distanceKm: number
  elevationGainM: number | null
  orderIndex: number
}

export type TripStats = {
  dayCount: number
  totalKm: number
  elevationGainM: number | null
}
