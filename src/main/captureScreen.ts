import { exec } from 'child_process'
import { nativeImage } from 'electron'
import fs from 'fs'
import screenshot from 'screenshot-desktop'

export function captureScreen(
  rect: { x: number; y: number; width: number; height: number },
  scaleFactor: number,
  outputPath: string
) {
  return new Promise<{msg: string; imgPath: string}>((resolve, reject) => {
    const isWayland = process.platform === 'linux' && process.env.XDG_SESSION_TYPE === 'wayland'
    const full_png = 'full.png'
    if (isWayland) {
      exec(`gnome-screenshot -f ${full_png}`, (error) => {
        if (error) {
          return reject(`Screenshot error: ${error}`)
        }
        console.debug(`Intermittent full screenshot file: ${full_png} created.`)
        exec(
          `convert ${full_png} -crop ${rect.width}x${rect.height}+${rect.x}+${rect.y} ${outputPath}`,
          (error2) => {
            if (error2) {
              return reject(`Crop error: ${error2}`)
            }
            fs.rm(full_png, () => {
              console.debug(`Intermittent full screenshot file: ${full_png} removed.`)
            })
            resolve({
              msg: `Cropped image saved to: ${outputPath}`,
              imgPath: outputPath
            })
          }
        )
      })
    } else {
      screenshot()
        .then((imgBuffer) => {
          const img = nativeImage.createFromBuffer(imgBuffer, { scaleFactor })
          const croppedImg = img.crop(rect)
          console.log('Screenshot captured.')
          fs.writeFile(outputPath, croppedImg.toPNG(), (err) => {
            if (err) {
              return reject(`Failed to save the image: ${err}`)
            }
            console.log(`Cropped image save to ${outputPath}`)
            resolve({
              msg: `Cropped image saved to: ${outputPath}`,
              imgPath: outputPath
            })
          })
        })
        .catch((err) => {
          return reject(`Failed to capture the screen: ${err}`)
        })
    }
  })
}
