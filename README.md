# Image
Manipulate Images in Node.js


## Installation
``` bash
npm i node-js-image
```

## How to Use

### Read the Image Data

```js
const Image = require("node-js-image")

// read image from a file
const img = new Image().fromFile('my-image-file.jpg')

// or as a shortcut
const img = new Image({fname: 'my-image-file.jpg'})
```

### Process the Image Data

**Currently available methods:**

- blackwhite
- grayscale
- invert
- mask
- reduce
- rotate

### Examples

#### rotate
Clockwise rotation by 90°

```js
// 90° clock-wise
img.rotate()

// chain the rotate() method
// 270 °clock-wise
img.rotate().rotate().rotate()
```

#### invert
Invert the colors

```js
img.invert()
```

#### blackwhite
Reduce the colors to Black and White only

```js
img.blackwhite()
```


### Save the Image to File
```js
// filepath, quality (0-100)
img.toFile('output.jpg', 100)
```

## Method Chaining
You can chain the methods

```js
img.invert()
  .blackwhite()
  .rotate()
  .toFile('output.jpg')
```
