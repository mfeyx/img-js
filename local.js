const Image = require('.')

const img = new Image()

img.fromFile('data/80s.jpg')
  .invert()
  .grayscale()
  .mask(false)
  .rotate()
  .toFile('data/80s-mod.jpg')
