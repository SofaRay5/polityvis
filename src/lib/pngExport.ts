export const safeExportFilename = (countryName: string, kind: 'overview' | 'parliament', date: string): string => {
  const country = countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'country'
  return `${country}-${kind}-${date}.png`
}

export const downloadSvgPng = async (svg: SVGSVGElement, filename: string): Promise<void> => {
  const source = new XMLSerializer().serializeToString(svg)
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Unable to render SVG export.'))
      image.src = url
    })
    const scale = window.devicePixelRatio * 2
    const canvas = document.createElement('canvas')
    canvas.width = image.width * scale
    canvas.height = image.height * scale
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to create PNG export.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
