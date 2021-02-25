/**
 * Convert image with gray colors only.
 * @param { number[] } data
 */
function grayscale (data) {
  const gray = []
  let i = 0
  for (; i<= data.length; i += 4) {
    const r = data[i]
    const g = data[i+1]
    const b = data[i+2]
    const a = 255
    if (
      typeof r === 'number' &&
      typeof g === 'number' &&
      typeof b === 'number'
    ) {
      const avg = ( r + g + b ) / 3
      if (typeof avg === 'number') {
        gray.push(...[ avg, avg, avg, a ])
      }
    }
  }
  return gray
}
/**
 * Convert image with gray colors only.
 * @param { number[] } data
 */
function blackwhite (data) {
  const bw = []
  let i = 0
  for (; i<= data.length; i += 4) {
    const r = data[i]
    const a = 255
    if (typeof r === 'number') {
      bw.push(...[ r, r, r, a ])
    }
  }
  return bw
}

/**
 * Invert Image.
 * @param {number[]} data
 */
function invert (data) {
  return data.map(px => Math.abs(px - 255))
}

/**
 *
 * @param {number[]} data
 */
function reduce (data) {
  return data.map(px => Math.round(px / 255) === 1 ? 255 : 0)
}

const processing = {
  blackwhite,
  grayscale,
  invert,
  reduce,
}

module.exports = processing
