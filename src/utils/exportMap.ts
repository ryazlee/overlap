function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

async function waitUntil(predicate: () => boolean, timeoutMs: number): Promise<boolean> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return true
    await delay(80)
  }
  return predicate()
}

function tilesReady(root: HTMLElement): boolean {
  const tiles = [...root.querySelectorAll('img.leaflet-tile')]
  if (tiles.length === 0) return false
  return tiles.every((node) => {
    const image = node as HTMLImageElement
    return image.complete && image.naturalWidth > 0 && image.classList.contains('leaflet-tile-loaded')
  })
}

export async function waitForMapTiles(root: HTMLElement): Promise<void> {
  await nextFrame()
  await nextFrame()
  await delay(400)
  await waitUntil(() => tilesReady(root), 6000)
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready
    } catch {
      // ignore
    }
  }
  await delay(120)
  await nextFrame()
}

function pageBackground(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  return value || '#fafafa'
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportFilename(dayCount: number): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `overlap-${dayCount}-day-${stamp}.png`
}

/**
 * High-res PNG of the map capture root.
 * Requires tile images loaded with crossOrigin=anonymous (CARTO basemaps).
 */
export async function captureMapPng(root: HTMLElement): Promise<Blob> {
  await waitForMapTiles(root)

  const { domToBlob } = await import('modern-screenshot')
  const width = Math.max(root.scrollWidth, root.offsetWidth, 1)
  const height = Math.max(root.scrollHeight, root.offsetHeight, 1)
  const maxEdge = 4096
  const scale = Math.max(2, Math.min(3, maxEdge / width, maxEdge / height))

  const blob = await domToBlob(root, {
    width,
    height,
    scale,
    backgroundColor: pageBackground(),
    maximumCanvasSize: maxEdge,
    timeout: 15_000,
    style: {
      margin: '0',
      position: 'static',
      left: 'auto',
      right: 'auto',
      top: 'auto',
      transform: 'none',
    },
    fetch: {
      requestInit: { mode: 'cors', credentials: 'omit' },
    },
    filter: (node) => {
      if (!(node instanceof Element)) return true
      return !node.classList.contains('leaflet-control-container')
    },
  })

  if (!blob) {
    throw new Error('empty-image')
  }
  return blob
}

export async function downloadMapPng(root: HTMLElement, filename: string): Promise<void> {
  const blob = await captureMapPng(root)
  downloadBlob(blob, filename)
}
