const fs = require('fs')
const jpeg = require('jpeg-js')

/** @typedef { number[] }     Array1D  One Dimensional Array */
/** @typedef { number[][] }   Array2D  Two Dimensional Array */
/** @typedef { number[][][] } Array3D  Three Dimensional Array */

/**
 * @typedef { object } InitValues  Three Dimensional Array
 * @property { Array1D } data
 * @property { number } width
 * @property { number } height
 * @property { number } channels
 * @property { number[] } shape
*/

/**
 * @typedef {object} Options
 * @property {string} [fname]
 * @property {Buffer} [buffer]
 */

/**
 * @class
 * @classdesc The Image Class
 */
class Image {

  /** @param {Options} [options]  */
  constructor (options) {
    this.encode = jpeg.encode
    this.decode = jpeg.decode
    this.readFileSync = fs.readFileSync
    this.writeFileSync = fs.writeFileSync

    this.options = options

    /**
     * The Imaga Data
     * @member
     * @type {Array1D|Array3D}
     */
    this.data = []

    /**
      * Width of the Image
      * @member
      * @type {number}
      */
    this.width = 0

    /**
     * Height of the Image
     * @member
     * @type {number}
     */
    this.height = 0

    /**
     * Channels of the Image (rgba)
     * @member
     * @type {number}
     */
    this.channels = 4

    /**
     * Shape of the Image ([])
     * @member
     * @type {number[]}
     */
    this.shape = [this.width, this.height, this.channels]

    /**
     * Current Data is Flat (Array1D) or is Pixels (Array3D)
     * @member
     * @type {boolean}
     */
    this.isFlat = true

    if (this.options) {
      if (this.options.fname) {
        this.fromFile(this.options.fname)
      }

      if (this.options.buffer) {
        this.fromBuffer(this.options.buffer)
      }
    }
  }

  /**
   * Decode the Image Data from an Image File
   * @param {string} fname File Name
   */
  fromFile (fname) {
    const buffer = this.readFileSync(fname)
    return this.fromBuffer(buffer)
  }

  /**
   *
   * @param {Buffer} buffer
   */
  fromBuffer (buffer) {
    const { data, width, height } = this.decode(buffer, { useTArray: true })
    this.data = Array.from(data)
    this.width = width
    this.height = height
    this.shape = [this.width, this.height, this.channels]

    /** @type { InitValues } */
    this._initValues = {
      data: this.data,
      width: this.width,
      height: this.height,
      channels: this.channels,
      shape: this.shape
    }
    return this
  }

  /**
   * Load Imaga data from Pixels (3D-Array)
   * @param { Array3D } pixels
   * @param { boolean } flatten
   */
  fromPixels (pixels, flatten=true) {
    /** @type {boolean} */
    const is3DArray = Array.isArray(pixels[0]) && Array.isArray(pixels[0][0])

    /** @type {boolean} */
    let hasPixelsOnly = false

    if (is3DArray) {
      hasPixelsOnly = new Set(pixels.map(
        row => row
          .map(px => px.length))
          .map(arr => arr.join(''))
          .join('')
          .split('')
      ).size === 1
    }

    if (!is3DArray) {
      throw new TypeError('Pixels must be of Type `Array3D`')
    }

    if (!hasPixelsOnly) {
      throw new RangeError('A Pixel must be like `[r, g, b, a]`')
    }

    this.data = pixels
    this.height   = this.data.length
    this.width    = this.data[0].length
    this.channels = this.data[0][0].length
    this.shape = [this.width, this.height, this.channels]

    this.hasPixels = true

    if (flatten) {
      this.flatten()
    }

    return this
  }

  /**
   * Write Image Data to file
   * @param {string} fpath File Path
   * @param {number} [quality=100] Output Quality 0-100
   */
  toFile (fpath, quality = 100) {
    if (!this.isFlat) {
      this.flatten()
    }

    quality = 0 < quality && quality < 101 ? quality : 100

    const [width, height, channels] = this.shape

    const data = Buffer
      .alloc(width * height * channels)
      //@ts-ignore
      .map((_, i) => this.data[i] )

    const Image = this.encode({ data, width, height }, quality)

    this.writeFileSync(fpath, Image.data)
    return this
  }

  /**
   * Return the Image Data as an Array
   * @param {boolean} flatten Flatten the values if `Pixels` or not.
   * @returns {Array1D|Array3D}
   */
  values (flatten = true) {
    if (!this.isFlat && flatten ) {
      this.flatten()
    }
    if (!flatten) {
      this.pixels()
    }
    return this.data
  }

  /**
   * Log values to console
   * @param {boolean} flatten Flatten the output if `Pixels` or not.
   */
  print (flatten = false) {
    if (!this.isFlat && flatten) { this.flatten() }
    console.log(this.data)
  }

  blackwhite () {
    /** @param {Array1D} data */
    const fn = data => data.map(px => Math.round(px / 255) === 1 ? 255 : 0)
    this._processImage(fn)
    return this
  }

  invert () {
    /** @param {Array1D} data */
    const fn = data => data.map(px => Math.abs(px - 255))
    this._processImage(fn)
    return this
  }

  flatten () {
    if (!this.isFlat) {

      /** @type { Array1D } */
      const flattend = []

      /** @type { number[][] } */
      // @ts-ignore
      this.data.forEach(row => row.forEach(px => flattend.push(...px)))
      this.data = flattend.filter(px => Number.isInteger(px))
    }
    this.isFlat = true
    return this
  }

  pixels () {
    if (!this.isFlat) {
      return this
    }

    const [width, height, slice] = this.shape
    const n = this.data.length

    let i = 0
    let j = 0
    let start = 0
    let end = slice

    const pixels = []
    for (; i <= n; i++ ) {
      if (j === slice) {
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

    const chunked = []
    for (; i < height; i++) {
      chunked.push(pixels.slice(start, end))
      start = end
      end += width
    }

    // @ts-ignore
    this.data = chunked
    this.isFlat = false

    return this
  }

  /**
   * Rotate the Image clockwise by 90°
   * @returns { Image }
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

    this.data = rotated.reverse()
    this.width = this.data[0].length
    this.height = this.data.length
    this.shape = [this.width, this.height, this.channels]
    return this
  }

  /**
   * Restore the Inital Image Values
   * @returns { Image }
   */
  restore () {
    const initValues = this._initValues
    if (initValues) {
      this.data = initValues.data
      this.width = initValues.width
      this.height = initValues.height
      this.channels = initValues.channels
      this.shape = initValues.shape
    }
    return this
  }

  /**
   * Helper Method for the Image Processing Methods
   * @private
   * @param {Function} fn
   */
  _processImage(fn) {
    if (!this.isFlat) {
      return this._handlePixels(fn)
    }
    this.data = this._handleFlat(fn)
    return this
  }

  /**
   * Helper for Processing Flat Data
   * @private
   * @param {Function} fn
   */
  _handleFlat(fn) {
    return fn(this.data)
  }

    /**
   * Helper for Processing Pixel Data
   * @private
   * @param {Function} fn
   */
  _handlePixels(fn) {
    this.flatten()
    this.data = fn(this.data)
    this.pixels()
    return this.data
  }
}

module.exports = Image
