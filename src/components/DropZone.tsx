import { useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

type DropZoneProps = {
  onFiles: (files: FileList | File[]) => void
  busy?: boolean
  compact?: boolean
}

export default function DropZone({ onFiles, busy = false, compact = false }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    onFiles(files)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(true)
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    setDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div
      className={[
        'drop-zone',
        compact ? 'drop-zone--compact' : null,
        dragging ? 'drop-zone--active' : null,
        busy ? 'drop-zone--busy' : null,
      ]
        .filter(Boolean)
        .join(' ')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        multiple
        className="drop-zone__input"
        onChange={onChange}
        disabled={busy}
        aria-label={compact ? 'Add GPX files' : 'Choose GPX files'}
      />
      <Upload size={compact ? 18 : 22} aria-hidden="true" className="drop-zone__icon" />
      <div className="drop-zone__copy">
        <p className="drop-zone__title">
          {busy ? 'Reading GPX…' : compact ? 'Add more GPX' : 'Drop Strava GPX files here'}
        </p>
        <p className="drop-zone__hint">
          {compact
            ? 'Click or drop to add days.'
            : 'Click or drop .gpx files. Parsed only in your browser.'}
        </p>
      </div>
    </div>
  )
}
