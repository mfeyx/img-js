const Image = require('.')

const img = new Image()

img.fromFile('data/80s.jpg')
  .invert()
  // .grayscale()
  .mask(false)
  .rotate()
  .rotate()
  .restore()
  .toFile('data/80s-gray.jpg')
