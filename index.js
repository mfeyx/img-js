const fs = require('fs')
const jpeg = require('jpeg-js')

const img = {

  _fromData ({ data, width, height } = obj) {
    this.data = Array.from(data)
    this.width = width
    this.height = height
    this.channels = 4
    this.shape = [this.width, this.height, this.channels]
    this.isFlat = true
    this.hasPixels = false
    return this
  },

  _load (fname) {
    return fs.readFileSync(fname)
  },

  decode (fname) {
    return this._fromData(
      jpeg.decode(this._load(fname), { useTArray: true }
  ))},

  encode (fpath, quality = 100) {
    if (!this.isFlat) { this.flatten() }
    quality = (0 < quality) && (quality < 101) ? quality : 100
    const [width, height, _] = this.shape
    const buffer = new Buffer.alloc(this.data.length)
      .map((_, i) => this.data[i])

    const img = jpeg.encode({
      data: buffer,
      width: width,
      height: height,
    }, quality)

    fs.writeFileSync(fpath, img.data)
    return this
  },

  values (flat = true) {
    if (this.hasPixels && flat ) { this.flatten() }
    if (!flat) { this.pixels() }
    return this.data
  },

  print (flatten = false) {
    if (this.hasPixels && flatten) { this.flatten() }
    console.log(this.data)
  },

  monochrome () {
    this.data = Array.from(this.data.map(e => Math.round(e / 255) === 1 ? 255 : 0))
    return this
  },

  invert () {
    this.data = this.data.map(e => Math.abs(e - 255))
    return this
  },

  normalize () {
    this.data = Array.from(this.data.map(e => Math.round(e / 255) === 1 ? 1 : 0))
    return this
  },

  flatten () {
    if (this.hasPixels) {
      const flattend = []
      this.data.forEach(row => row.forEach(px => flattend.push(...px)))
      this.data = flattend.filter(px => Number.isInteger(px))
    }
    this.isFlat = true
    this.hasPixels = false
    return this
  },

  pixels () {
    if(!this.isFlat) { this.flatten() }

    const [width, height, slice] = [this.width, this.height, this.channels]
    const n = this.data.length

    let i = 0
    let j = 0
    let start = 0
    let end = slice

    const pixels = []
    for (; i <= n; i++ ) {
      if (j === slice) {
        pixels.push(this.data.slice(start, end))
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

    this.data = chunked
    this.hasPixels = true
    this.isFlat = false

    return this
  },

  rotate () {
    if (this.isFlat) { this.pixels() }
    const pixels = this.data
    const n = pixels[0].length
    let i = 0

    const rotated = []
    while (i < n) {
      let intermediate = []
      for (const arr of pixels) {
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
}

module.exports = img
