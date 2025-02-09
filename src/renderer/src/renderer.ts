const selectionBox = document.getElementById('selection-box') as HTMLDivElement
const overlay = document.getElementById('overlay') as HTMLDivElement
const dimensionText = document.getElementById('dimension-text') as HTMLSpanElement
const textOverlay = document.getElementById('text-overlay') as HTMLDivElement
const wallpaper = document.getElementById('wallpaper') as HTMLDivElement
let isDrawing = false
let startX: number, startY: number, endX: number, endY: number

const handleMouseDown = (e: MouseEvent) => {
  isDrawing = true
  startX = e.clientX
  startY = e.clientY
  selectionBox.style.left = `${startX}px`
  selectionBox.style.top = `${startY}px`
  selectionBox.style.width = '0'
  selectionBox.style.height = '0'
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing) return
  endX = e.clientX
  endY = e.clientY
  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)
  const [px1, px2, py1, py2] = [left + 2, left + width - 2, top + 2, top + height - 2]
  overlay.style.maskImage = `
  linear-gradient(to right, black ${px1}px, transparent ${px1}px ${px2}px, black ${px2}px),
  linear-gradient(to bottom, black ${py1}px, transparent ${py1}px ${py2}px, black ${py2}px)`
  selectionBox.style.display = 'block'
  selectionBox.style.width = `${width}px`
  selectionBox.style.height = `${height}px`
  selectionBox.style.left = `${left}px`
  selectionBox.style.top = `${top}px`
  const dimensionTextHeight = dimensionText.offsetHeight // Get the height of the dimension-text element
  textOverlay.style.display = 'block'
  textOverlay.style.left = `${left}px`
  textOverlay.style.top = `${top - dimensionTextHeight}px` // Position above the selection box
  dimensionText.textContent = `${left},${top} ${width}x${height}`
}

const handleMouseUp = (cb: (rect: any) => void) => {
  isDrawing = false
  const rect = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  }
  overlay.style.opacity = '0'
  overlay.style.maskImage = 'none'
  selectionBox.style.display = 'none'
  textOverlay.style.display = 'none'
  dimensionText.textContent = ''
  console.log('about to send crop-screen', rect)
  cb(rect)
}

let mouseUpHandler

// Function to toggle between wallpaper and overlay
const toggleOverlay = (showOverlay: boolean) => {
  if (showOverlay) {
    wallpaper.style.display = 'none'
    overlay.style.display = 'block'
    overlay.style.opacity = '1'
  } else {
    wallpaper.style.display = 'flex'
    overlay.style.display = 'none'
  }
}

// @ts-ignore
window.api.onScreenCropStartV2(
  (cb: (rect: { x: number; y: number; width: number; height: number }) => void) => {
    toggleOverlay(true) // Show overlay when cropping starts
    overlay.addEventListener('mousedown', handleMouseDown)
    overlay.addEventListener('mousemove', handleMouseMove)
    mouseUpHandler = () => handleMouseUp(cb)
    overlay.addEventListener('mouseup', mouseUpHandler)
    overlay.style.cursor = 'crosshair'
  },
  () => {
    overlay.removeEventListener('mousedown', handleMouseDown)
    overlay.removeEventListener('mousemove', handleMouseMove)
    mouseUpHandler && overlay.removeEventListener('mouseup', mouseUpHandler)
    overlay.style.display = 'block'
    overlay.style.cursor = 'default'
    toggleOverlay(false) // Show wallpaper when cropping ends
    alert('Success! Copied to clipboard.')
  },
  (err: string) => {
    console.error(err)
    toggleOverlay(false) // Show wallpaper when cropping ends
    alert(err)
  }
)
