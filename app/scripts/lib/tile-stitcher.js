var tileStitcher = function(url, options){
  var self = {};

  self.url = url;

  self.options = {
    // 'tms' is also valid
    scheme: 'xyz',
    tileSize: 256
  };

  // Extend options
  var i;
  for(i in options) {
    if (options.hasOwnProperty(i)) {
      self.options[i] = options[i];
    }
  }

  // http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
  function t(s,d){
    for(var p in d) {
        s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
    }
    return s;
  }

  // http://underscorejs.org/docs/underscore.html
  function after(times, func) {
    if (times <= 0) {
      return func();
    }
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  }

  // tokenize the url template
  function getUrl(data) {
    return t(self.url, data);
  }

  // get an image for a given url
  self._getImage = function(url, callback) {
    var imageObj = new Image();
    imageObj.onload = function() {
      callback(this);
    };
    imageObj.src = url;
  };

  // draw an image in the right place on the new stitched canvas
  function drawImage(url, xIndex, yIndex, stitched, callback) {
    self._getImage(url, function(img) {
      var w = img.width,
          h = img.height,
          ctx = stitched.getContext('2d');

      ctx.drawImage(img, xIndex*w, yIndex*h);

      callback(stitched);
    });
  }

  // stitch a set of xyz tiles
  function stitchXyz(west, south, east, north, zoom, stitched, callback) {
    var x, y, url;

    for(x=west; x<=east; x++) {
      for(y=south; y<=north; y++) {
        url = getUrl({x: x, y: y, z: zoom});

        drawImage(url, x-west, y-south, stitched, callback);
      }
    }
  }

  // stitch a set of tms tiles
  function stitchTms(west, south, east, north, zoom, stitched, callback) {
    var x, y, url;

    for(x=west; x<=east; x++) {
      for(y=north; y>=south; y--) {
        url = getUrl({x: x, y: y, z: zoom});

        drawImage(url, x-west, north-y, stitched, callback);
      }
    }
  }

  // public function for stitching tiles
  self.stitch = function(west, south, east, north, zoom, callback) {
    var w = east - west + 1,
        h = north - south + 1,
        tileCnt = w*h,
        afterCallback = after(tileCnt, callback),
        stitched = document.createElement('canvas');

    // Set the stitched canvas size
    stitched.width = w * self.options.tileSize;
    stitched.height = h * self.options.tileSize;

    if (self.options.scheme === 'tms') {
      stitchTms(west, south, east, north, zoom, stitched, afterCallback);
    } else {
      stitchXyz(west, south, east, north, zoom, stitched, afterCallback);
    }
  };

  return self;
};
