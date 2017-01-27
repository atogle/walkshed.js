/*globals L GlobalMercator tileStitcher MA */

(function(){
  var zoom = 14,
      buffer = 1600,
      tileSize = 256,
      maxCost = 1600,
      map = L.map('map'),
      layerUrl = 'http://{s}.tiles.mapbox.com/v3/atogle.map-vo4oycva/{z}/{x}/{y}.png',
      attribution = 'Map data &copy; OpenStreetMap contributors, CC-BY-SA <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
      layer = L.tileLayer(layerUrl, {maxZoom: 17, attribution: attribution, subdomains: 'abcd'}),
      canvasLayer;

  map
    .setView([39.9524, -75.1636], 14)
    .addLayer(layer);

  function to2D(array1D, width) {
    var array2D = [],
        i;

    for(i=0; i<width; i++) {
      array2D[i] = Array.prototype.slice.call(array1D, i*width, i*width+width);
    }

    return array2D;
  }

  function getColor(percentage) {
    if (percentage <= 0.2) {
      return [26,150,65,200];
    } else if (percentage <= 0.4) {
      return [166,217,106,200];
    } else if (percentage <= 0.6) {
      return [255,255,191,200];
    } else if (percentage <= 0.8) {
      return [253,174,97,200];
    } else if (percentage <= 0.999) {
      return [244,109,67,200];
    } else {
      return [0,0,0,0];
    }
  }

  function draw(frictionCanvas, mapCanvas, sourcePixel) {
    var mapCtx = mapCanvas.getContext('2d'),
        frictionCtx = frictionCanvas.getContext('2d'),
        w = frictionCanvas.width,
        h = frictionCanvas.height,
        frictionImageData = frictionCtx.getImageData(0, 0, w, h),
        data = frictionImageData.data,
        frictionRaster = [],
        cdData = [],
        sourceRaster = to2D([], w),
        row, col, i, n,
        red, green, blue, alpha, pixel, color,
        costDistanceRaster, cdImageData;

    mapCanvas.width = w;
    mapCanvas.height = h;

    // Init the source raster
    sourceRaster[sourcePixel.y][sourcePixel.x] = 1;

    // Init the friction raster
    row = -1;
    for(i = 0, n = data.length; i < n; i += 4) {
      red = data[i],
      green = data[i + 1],
      blue = data[i + 2],
      alpha = data[i + 3],
      pixel = i / 4;

      if (pixel % w === 0) {
        row++;
        frictionRaster[row] = [];
      }

      frictionRaster[row][pixel - (row * w)] = blue;
    }

    // Calculate the costdistance raster
    costDistanceRaster = MA.costDistance(frictionRaster, sourceRaster, maxCost);

    // Turn cost into pixels to display
    n=0;
    for(row=0; row<h; row++){
      for(col=0; col<w; col++){
        color = getColor((costDistanceRaster[row][col] || maxCost) / maxCost);
        if (costDistanceRaster[row][col] === maxCost) {
          data[4*n] = 0;
          data[4*n + 1] = 0;
          data[4*n + 2] = 0;
          data[4*n + 3] = 255;
        } else {
          data[4*n] = color[0];
          data[4*n + 1] = color[1];
          data[4*n + 2] = color[2];
          data[4*n + 3] = color[3];
        }
        n++;
      }
    }
    frictionImageData.data = data;

    // Draw it on the map layer
    mapCtx.putImageData(frictionImageData, 0, 0);
  }

  map.on('click', function(evt) {
    var side = 800,
        half = side/2,
        zoom = 14,
        latLngPt = map.latLngToContainerPoint(evt.latlng),
        swLatLng = map.containerPointToLatLng(latLngPt.add(L.point(-half, half))),
        neLatLng = map.containerPointToLatLng(latLngPt.add(L.point(half, -half)))
        frictionUrl = 'https://api.mapbox.com/styles/v1/atogle/cirjkl8m80000gengl4sxeicn/static/'+evt.latlng.lng+','+evt.latlng.lat+','+zoom+',0.00,0.00/'+side+'x'+side+'?access_token=pk.eyJ1IjoiYXRvZ2xlIiwiYSI6InBDWEFUY3cifQ.0XD7J9ZuFNLrmuNpuKlcnQ&logo=false&attribution=false',
        imageObj = new Image(),
        frictionCanvas = document.createElement('canvas'),
        pixel = {
          x: half,
          y: half
        };

    frictionCanvas.width = side;
    frictionCanvas.height = side;

    // TODO: add setBounds() to canvas layer?
    if (canvasLayer) {
      map.removeLayer(canvasLayer);
    }
    canvasLayer = L.imageOverlay.canvas(L.latLngBounds(swLatLng, neLatLng));
    canvasLayer.addTo(map);

    imageObj.crossOrigin = 'anonymous';
    imageObj.onload = function() {
      var w = this.width,
          h = this.height,
          ctx = frictionCanvas.getContext('2d');

      ctx.drawImage(this, 0, 0);

      draw(frictionCanvas, canvasLayer.canvas, pixel);
    };
    imageObj.src = frictionUrl;

    // For debugging:
    // canvasLayer.canvas.width = stitchedCanvas.width;
    // canvasLayer.canvas.height = stitchedCanvas.height;
    // canvasLayer.canvas.getContext('2d').drawImage(stitchedCanvas, 0, 0);
  });
})();