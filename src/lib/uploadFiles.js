export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_IMAGE_UPLOAD_LABEL = '10 MB'
export const MAX_PDF_UPLOAD_BYTES = 20 * 1024 * 1024
export const MAX_PDF_UPLOAD_LABEL = '20 MB'
export const MAX_EXCEL_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_EXCEL_UPLOAD_LABEL = '5 MB'

const supportedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function detectedImageType(bytes) {
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png'
  }

  const header = new TextDecoder().decode(bytes)
  if (header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP') {
    return 'image/webp'
  }

  return ''
}

export async function validateImageFile(file) {
  if (!file || !supportedImageTypes.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.')
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `Each original image must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller.`
    )
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (detectedImageType(bytes) !== file.type) {
    throw new Error(
      `${file.name} does not appear to be a valid ${file.type.replace(
        'image/',
        ''
      )} image.`
    )
  }
}

export async function validatePdfFile(file) {
  if (
    !file ||
    (file.type && file.type !== 'application/pdf') ||
    !file.name.toLowerCase().endsWith('.pdf')
  ) {
    throw new Error('Choose a valid PDF file.')
  }

  if (file.size > MAX_PDF_UPLOAD_BYTES) {
    throw new Error(
      `The Gazette PDF must be ${MAX_PDF_UPLOAD_LABEL} or smaller.`
    )
  }

  const signature = new TextDecoder().decode(
    new Uint8Array(await file.slice(0, 5).arrayBuffer())
  )

  if (signature !== '%PDF-') {
    throw new Error('The selected file does not appear to be a valid PDF.')
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('The optimized image could not be created.'))
      },
      type,
      quality
    )
  })
}

async function decodeImage(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through to the broadly supported image element decoder.
    }
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.src = objectUrl
    await image.decode()

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      source: image,
      close() {
        URL.revokeObjectURL(objectUrl)
      },
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

export async function optimizeImageFile(file) {
  await validateImageFile(file)

  let image

  try {
    image = await decodeImage(file)
  } catch {
    throw new Error(
      `${file.name} could not be decoded as a supported image.`
    )
  }

  const maxDimension = 2400
  const scale = Math.min(
    1,
    maxDimension / Math.max(image.width, image.height)
  )
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  if (file.type === 'image/png' && scale === 1) {
    image.close()
    return file
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    image.close()
    throw new Error('This browser cannot optimize the selected image.')
  }

  context.drawImage(image.source || image, 0, 0, width, height)
  image.close()

  const outputType = file.type
  const blob = await canvasToBlob(
    canvas,
    outputType,
    outputType === 'image/png' ? undefined : 0.85
  )

  return new File([blob], file.name, {
    type: outputType,
    lastModified: file.lastModified,
  })
}
