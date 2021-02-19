const fs = require('fs')
const jpeg = require('jpeg-js')

/** @typedef {number[]} Array1D  */
/** @typedef {number[][]} Array2D  */
/** @typedef {number[][][]} Array3D  */

/**
 * IMG Object
 * @param { Array1D|Array3D}  data
 * @param { number[] }  [channels=4]
 * @param { number[] }  shape
 * @param { number }    width
 * @param { number }    height
 * @param { boolean }   [isFlat=true]
 * @param { boolean }   [hasPixels=false]
 */
const img = {

  data: [NaN],
  channels: 4,
  width: 0,
  height: 0,
  hasPixels: false,
  isFlat: true,
  shape: [0, 0, 0],

  /**
   * @private
   * @param {import('jpeg-js').RawImageData<Uint8Array>} obj
   */
  _fromData (obj) {
    const { data, width, height } = obj
    this.data = Array.from(data)
    this.width = width
    this.height = height
    this.shape = [this.width, this.height, this.channels]
    return this
  },

  /**
   * Read the Data from File
   * @private
   * @param {string} fname File Name
   */
  _read (fname) {
    return fs.readFileSync(fname)
  },

  /**
   * Decode the Image Data from an Image File
   * @param {string} fname File Name
   */
  decode (fname) {
    return this._fromData(
      jpeg.decode(this._read(fname), { useTArray: true }
  ))},

  /**
   * Write Image Data to file
   * @param {string} fpath File Path
   * @param {number} [quality=100] Output Quality 0-100
   */
  encode (fpath, quality = 100) {
    if (!this.isFlat) { this.flatten() }
    quality = (0 < quality) && (quality < 101) ? quality : 100
    const [width, height, channels] = this.shape
    const buffer = Buffer
      .alloc(width * height * channels)
      // @ts-ignore
      .map((el, i) => this.data[i])

    const img = jpeg.encode({
      data: buffer,
      width: width,
      height: height,
    }, quality)

    fs.writeFileSync(fpath, img.data)
    return this
  },

  /**
   * Return the Image values
   * @param { boolean } [flat=true] Return data as Array1D or Array3D
   * @returns {Array1D|Array3D}
   */
  values (flat = true) {
    if (this.hasPixels && flat ) { this.flatten() }
    if (!flat) { this.pixels() }
    return this.data
  },

  print (flatten = false) {
    if (this.hasPixels && flatten) { this.flatten() }
    console.log(this.data)
  },

  /**
   * @description Convert Image to Black & White only
   */
  monochrome () {
    this.data = Array.from(this.data.map(e => Math.round(e / 255) === 1 ? 255 : 0))
    return this
  },

  /**
   * @description Invert Colors
   */
  invert () {
    this.data = this.data.map(e => Math.abs(e - 255))
    return this
  },

  /**
   * @description Replace high values with `1` and low with `0`
   */
  normalize () {
    this.data = Array.from(this.data.map(e => Math.round(e / 255) === 1 ? 1 : 0))
    return this
  },

  /**
   * @description Array3D to Array1D
   */
  flatten () {
    if (this.hasPixels) {

      /** @type { number[] } */
      const flattend = []

      /** @type { number[][] } */
      // @ts-ignore
      this.data.forEach(row => row.forEach(px => flattend.push(...px)))
      this.data = flattend.filter(px => Number.isInteger(px))
    }
    this.isFlat = true
    this.hasPixels = false
    return this
  },

  /**
   * @description Array1D to Array3D
   */
  pixels () {
    if(!this.isFlat) { this.flatten() }

    const [width, height, slice] = [this.width, this.height, this.channels]
    const n = this.data.length

    let i = 0
    let j = 0
    let start = 0
    let end = slice

    /** @type { Array2D } */
    const pixels = []
    for (; i <= n; i++ ) {
      if (j === slice) {

        /** @type {Array1D} */
        const arr2d = this.data.slice(start, end)
        pixels.push(arr2d)
        start = end
        end += slice
        j = 0
      }
      j++
    }

    i = 0
    start = 0
    end = width

    /** @type { Array3D }  */
    const chunked = []
    for (; i < height; i++) {
      chunked.push(pixels.slice(start, end))
      start = end
      end += width
    }

    // @ts-ignore
    this.data = chunked
    this.hasPixels = true
    this.isFlat = false

    return this
  },

  /**
   * @description Rotate the image by 90°
   */
  rotate () {
    if (this.isFlat) { this.pixels() }
    const pixels = this.data
    // @ts-ignore
    const n = pixels[0].length
    let i = 0

    const rotated = []
    while (i < n) {
      let intermediate = []
      for (const arr of pixels) {
        // @ts-ignore
        const px = arr.pop()
        intermediate.push(px)
      }
      rotated.push(intermediate.reverse())
      i++
    }


    // @ts-ignore
    this.data = rotated.reverse()
    // @ts-ignore
    this.width = this.data[0].length
    this.height = this.data.length
    this.shape = [this.width, this.height, this.channels]
    return this
  }
}

module.exports = img
