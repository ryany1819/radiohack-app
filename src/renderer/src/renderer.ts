const selectionBox = document.getElementById('selection-box') as HTMLDivElement
const overlay = document.getElementById('overlay') as HTMLDivElement
const dimensionText = document.getElementById('dimension-text') as HTMLSpanElement
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
  dimensionText.textContent = ''
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDrawing) return
  endX = e.clientX
  endY = e.clientY
  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)
  selectionBox.style.display = 'block'
  selectionBox.style.width = `${width}px`
  selectionBox.style.height = `${height}px`
  selectionBox.style.left = `${left}px`
  selectionBox.style.top = `${top}px`
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
  selectionBox.style.display = 'none'
  console.log('about to send crop-screen', rect)
  cb(rect)
}

let mouseUpHandler

// @ts-ignore
window.api.onScreenCropStartV2(
  (cb: (rect: { x: number; y: number; width: number; height: number }) => void) => {
    overlay.addEventListener('mousedown', handleMouseDown)
    overlay.addEventListener('mousemove', handleMouseMove)
    mouseUpHandler = () => handleMouseUp(cb)
    overlay.addEventListener('mouseup', mouseUpHandler)
    overlay.style.opacity = '1'
    overlay.style.pointerEvents = 'auto'
  },
  () => {
    overlay.removeEventListener('mousedown', handleMouseDown)
    overlay.removeEventListener('mousemove', handleMouseMove)
    mouseUpHandler && overlay.removeEventListener('mouseup', mouseUpHandler)
    overlay.style.opacity = '0'
    overlay.style.pointerEvents = 'none'
  },
  (err: string) => {
    console.error(err)
    alert(err)
  }
)
