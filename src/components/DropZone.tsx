import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Smartphone, Upload } from 'lucide-react'
import Button from './Button'
import { trackFileAccept } from '../utils/trackFile'

type DropZoneProps = {
  onFiles: (files: FileList | File[]) => void
  busy?: boolean
  compact?: boolean
}

export default function DropZone({ onFiles, busy = false, compact = false }: DropZoneProps) {
  const dropInputRef = useRef<HTMLInputElement>(null)
  const deviceInputRef = useRef<HTMLInputElement>(null)
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

  if (compact) {
    return (
      <div
        className={['drop-zone', 'drop-zone--compact', dragging ? 'drop-zone--active' : null, busy ? 'drop-zone--busy' : null]
          .filter(Boolean)
          .join(' ')}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={dropInputRef}
          type="file"
          accept={trackFileAccept()}
          multiple
          className="drop-zone__input"
          onChange={onChange}
          disabled={busy}
          aria-label="Add track files from device"
        />
        <Upload size={18} aria-hidden="true" className="drop-zone__icon" />
        <div className="drop-zone__copy">
          <p className="drop-zone__title">{busy ? 'Reading files…' : 'Add more rides'}</p>
          <p className="drop-zone__hint">GPX, TCX, or FIT from your device.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-panel">
      <div
        className={['drop-zone', dragging ? 'drop-zone--active' : null, busy ? 'drop-zone--busy' : null]
          .filter(Boolean)
          .join(' ')}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={dropInputRef}
          type="file"
          accept={trackFileAccept()}
          multiple
          className="drop-zone__input"
          onChange={onChange}
          disabled={busy}
          aria-label="Choose GPX files"
        />
        <Upload size={22} aria-hidden="true" className="drop-zone__icon" />
        <div className="drop-zone__copy">
          <p className="drop-zone__title">{busy ? 'Reading files…' : 'Drop GPX files here'}</p>
          <p className="drop-zone__hint">Classic Strava / Garmin GPX exports work here too.</p>
        </div>
      </div>

      <p className="upload-panel__or" aria-hidden="true">
        or
      </p>

      <input
        ref={deviceInputRef}
        type="file"
        accept={trackFileAccept()}
        multiple
        className="upload-panel__hidden-input"
        onChange={onChange}
        disabled={busy}
        aria-hidden="true"
        tabIndex={-1}
      />
      <Button
        label="Choose from device"
        variant="secondary"
        icon={<Smartphone size={16} aria-hidden="true" />}
        onClick={() => deviceInputRef.current?.click()}
        disabled={busy}
        block
      />
      <p className="meta meta--sm meta--muted upload-panel__note">
        Opens your phone or computer file picker — pick GPX, TCX, or FIT exports from Strava, Apple
        Fitness, Garmin, and similar. Parsed only in your browser.
      </p>
    </div>
  )
}
