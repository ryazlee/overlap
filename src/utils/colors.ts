/** Product route colors only — chrome stays gray. Purple / blue / orange / green, then extend. */
const DAY_COLORS = [
  '#7c3aed', // purple
  '#2563eb', // blue
  '#ea580c', // orange
  '#16a34a', // green
  '#db2777', // pink
  '#0891b2', // cyan
  '#ca8a04', // gold
  '#4f46e5', // indigo
  '#dc2626', // red
  '#0d9488', // teal
  '#9333ea', // violet
  '#65a30d', // lime
]

export function dayColor(index: number): string {
  return DAY_COLORS[index % DAY_COLORS.length]!
}
