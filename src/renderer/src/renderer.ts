const selectionBox = document.getElementById('selection-box') as HTMLDivElement;
const overlay = document.getElementById('overlay') as HTMLDivElement;
let isDrawing = false;
let startX: number, startY: number, endX: number, endY: number;

document.addEventListener('mousedown', (e: MouseEvent) => {
  isDrawing = true;
  startX = e.clientX;
  startY = e.clientY;
  selectionBox.style.left = `${startX}px`;
  selectionBox.style.top = `${startY}px`;
  selectionBox.style.width = '0';
  selectionBox.style.height = '0';
  selectionBox.style.display = 'block';
  selectionBox.style.background = 'transparent';
})

document.addEventListener('mousemove', (e: MouseEvent) => {
  if (!isDrawing) return;
  endX = e.clientX;
  endY = e.clientY;
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
  selectionBox.style.left = `${Math.min(startX, endX)}px`;
  selectionBox.style.top = `${Math.min(startY, endY)}px`;
})

document.addEventListener('mouseup', async () => {
  isDrawing = false;
  const rect = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  }
  console.log('about to send crop-screen')
  overlay.style.background = 'transparent';
  // @ts-ignore
  await window.api.cropScreen(rect);
})

// @ts-ignore
window.api.onCropScreenSuccess(() => {
  selectionBox.style.display = 'none';
});
