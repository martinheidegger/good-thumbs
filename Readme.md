# good-thumbs

Good thumbs is a thumbnail generator tool for Node.js that attempts to do a better job than previous solutions.

# Get started

Install the `good-thumbs` library.

```
$ npm install good-thumbs --save
```

Install either [libvips](http://www.vips.ecs.soton.ac.uk/index.php?title=Supported#Installing) or [graphicsmagick](http://www.graphicsmagick.org/README.html#installation)

Instantiate `good-thumbs` like this:

```JavaScript
var thumbs = require('good-thumbs')({
      cwd: 'images' // Root for all thumbs to look up
    , cacheDir: '.cache' // Storage for generated thumbs
})
```

And then you are free to create a thumb like

```JavaScript
thumbs.create('myimage.jpg', {width: 200}, function (err, thumbFilePath) {
    // Process the thumbnail in thumbFilePath
})
```

# Features

## Flexible implementation

good-thumbs works with either ImageMagick, GraphicsMagick, Libvips or your own implementation which allows you to choose whatever suits you best.

```JavaScript
var thumbs = require('good-thumbs')({
      cwd: 'images'
    , cacheDir: '.cache'
    , system: require('good-thumbs/graphicsMagic')
    // , system: require('good-thumbs/vips')
    // , system: require('good-thumbs/imageMagic')
    // , system: function(source, target, format, callback) { ... }
})
```


## High-quality thumbs

Libvips has an incredible quality of antialiasing for thumbnails.

## Secure lookup

good-thumbs has a `cwd` property as setting to makes sure that no image request is applied outside of your working directory:

```JavaScript
thumbs.create('../../any-image.jpg', 'small', function (err) {
   // This will result in an error because any-image is
   // outside of the working directory
})
```

## Caching

Once generated it will store the cache files in the designated folder and updated them when the source file changed. To prevent excessive file access it also allows to set a `checkInterval` that makes sure files are checked only once every `X` milliseconds.

```JavaScript
var thumbs = require('good-thumbs')({
      cwd: 'images'
    , cacheDir: '.cache'
    , checkInterval: 1000 // every minute
});
```

## (relatively) flexible formats

The formats for thumbnails are flexible in a sense that you can do this:

```JavaScript
// will fit the width to 200 px
thumbs.create('my-image.jpg', { width: 200 }) 

// will fit the height to 200 px
thumbs.create('my-image.jpg', { height: 200 })

// will fit either width or height to 200px
thumbs.create('my-image.jpg', { width: 200, height: 200 })

// will fill the image into the width, height
thumbs.create('my-image.jpg', { width: 200, height: 200, fill: true })

// will make sure that it will crop from the top (default: center)
thumbs.create('my-image.jpg', { width: 200, height: 200, fill: true, gravity: require('good-thumbs/gravity/north') })

// will make sure that smaller image are not blown up
thumbs.create('my-image.jpg', { width: 200, withoutEnlargement: true })

// to get a 'png' thumbnail (with jpg input, defaults to same extension)
thumbs.create('my-image.jpg', { width: 200, type: 'png'})
```

## Presets

You can either pass in a format as object or alternative create presets. Presets are useful if you want to make sure that only thumbnails of certain sizes are created:

```JavaScript
var thumbs = require('good-thumbs')({
      cwd: 'images'
    , cacheDir: '.cache'
    , presets: {
          s: {width: 256}
        , m: {width: 512}
        , l: {width: 1024}
    }
});
thumbs.createByPreset('my-image.jpg', 's', function (error, thumbFilePath) {
    // ...
})
```

## Predefined formats for your convenience

In case you need to create certain file formats there are quite a few formats already available with this library:

```JavaScript
var thumbs = require('good-thumbs')({
      cwd: 'images'
    , cacheDir: '.cache'
    , presets: {
          s: require('good-thumbs/format/twitter/banners/mobile')
    }
});
```

# Thoughts on improvement

At the current stage this is just little more than a proof-of-concept. With a little love from you I think it can be really great. Here are some thoughts of me on how to improve this baby:

- Easy integration into [hapi](https://www.npmjs.com/package/hapi), [express](https://www.npmjs.com/package/express), [koa](https://www.npmjs.com/package/koa), [sails](https://www.npmjs.com/package/sails), ...
- Optional support for [png and jpg optimisation](https://www.npmjs.com/package/image-optim)
- [Watermarks](https://www.npmjs.com/package/watermarker)
- ICC profile [support](https://github.com/lovell/sharp#withmetadata) (to make sure that the colors are maintained)
- Support for background-colors to make sure that transparent png's work well
- Make thumbnails that are fixed to the required size (smaller images get a background color)
- Interesting area cropping support
- [Content aware streching](https://www.npmjs.com/package/smartcrop) for thumbnails
- [node-canvas](https://www.npmjs.com/package/canvas) support

If you think you can provide any of those awesome features, please, please, please send a PR :)


# Tests

This has been not much more than a proof-of-concept and a work of my idea for me, thus tests are missing - sorry for that. A PR would be nice!

# License & Attribution

[ISC](http://en.wikipedia.org/wiki/ISC_license)

```
Copyright (c) Year 2015, Martin Heidegger <martin.heidegger@gmail.com>
Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```