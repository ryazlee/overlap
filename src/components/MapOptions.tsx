type MapOptionsProps = {
  transparentExport: boolean
  onTransparentExportChange: (value: boolean) => void
  showElevation: boolean
  onShowElevationChange: (value: boolean) => void
  endpointsOnly: boolean
  onEndpointsOnlyChange: (value: boolean) => void
}

function OptionRow({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  hint: string
}) {
  return (
    <label className="map-option" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="map-option__input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="map-option__copy">
        <span className="map-option__label">{label}</span>
        <span className="map-option__hint">{hint}</span>
      </span>
    </label>
  )
}

export default function MapOptions({
  transparentExport,
  onTransparentExportChange,
  showElevation,
  onShowElevationChange,
  endpointsOnly,
  onEndpointsOnlyChange,
}: MapOptionsProps) {
  return (
    <div className="map-options" role="group" aria-label="Map and export options">
      <OptionRow
        id="opt-transparent-export"
        checked={transparentExport}
        onChange={onTransparentExportChange}
        label="Transparent PNG background"
        hint="Export without the page fill behind the map."
      />
      <OptionRow
        id="opt-elevation"
        checked={showElevation}
        onChange={onShowElevationChange}
        label="Elevation / hillshade"
        hint="Overlay terrain shading on the basemap."
      />
      <OptionRow
        id="opt-endpoints"
        checked={endpointsOnly}
        onChange={onEndpointsOnlyChange}
        label="Only start & end cities"
        hint="Hide smaller place labels; keep day endpoints."
      />
    </div>
  )
}
