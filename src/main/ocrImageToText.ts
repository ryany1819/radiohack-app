import fs from 'fs'
import path from 'path'

export function ocrImageToText(inputPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputPath, (err, data) => {
      const formData = new FormData()
      const blob = new Blob([data], { type: 'image/png' }) // Convert Buffer to Blob
      formData.append('file', blob, path.basename(inputPath))
      fetch('http://localhost:8080/extract-text', {
        method: 'POST',
        body: formData
      })
        .then(async (response) => {
          const result = await response.json()
          return resolve(result)
        })
        .catch((err) => {
          return reject(`Failed in ocrImageToText(): ${err}`)
        })
    })
  })
}

export function healthcheck() {
  return fetch('http://localhost:8080/healthcheck')
}
