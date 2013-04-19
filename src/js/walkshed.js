(function(){
  var zoom = 14,
      buffer = 1600,
      tileSize = 256,
      maxCost = 1600,
      gm = new GlobalMercator(),
      ts = tileStitcher('tiles/{z}/{x}/{y}.png', {scheme:'tms'}),
      map = L.map('map'),
      layerUrl = 'http://{s}.tiles.mapbox.com/v3/atogle.map-vo4oycva/{z}/{x}/{y}.png',
      attribution = 'Map data &copy; OpenStreetMap contributors, CC-BY-SA <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
      layer = new L.TileLayer(layerUrl, {maxZoom: 17, attribution: attribution, subdomains: 'abcd'}),
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
    if (percentage <= 0.25) {
      return [26,150,65,200];
    } else if (percentage <= 0.5) {
      return [166,217,106,200];
    } else if (percentage <= 0.75) {
      return [255,255,191,200];
    } else if (percentage <= 0.95) {
      return [253,174,97,200];
    } else if (percentage <= 0.999) {
      return [215,25,28,200];
    } else {
      return [0,0,0,0];
    }
  }

  function draw(frictionCanvas, mapCanvas, sourcePixel) {
    var cd = costDistance(),
        mapCtx = mapCanvas.getContext('2d'),
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
    costDistanceRaster = cd.calculate(frictionRaster, sourceRaster, maxCost);

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
    // NOTE! this is TMS specific logic
    var originMeters = gm.LatLonToMeters(evt.latlng.lat, evt.latlng.lng),
        // Southwest, MinX/MinY Tile
        swTile = gm.MetersToTile(originMeters[0]-buffer, originMeters[1]-buffer, zoom),
        swTileBoundsMeters = gm.TileBounds(swTile[0], swTile[1], zoom),
        swTileBoundsLatLng = gm.TileLatLonBounds(swTile[0], swTile[1], zoom),
        // Northeast, MaxX/MaxY Tile
        neTile = gm.MetersToTile(originMeters[0]+buffer, originMeters[1]+buffer, zoom),
        neTileBoundsMeters = gm.TileBounds(neTile[0], neTile[1], zoom),
        neTileBoundsLatLng = gm.TileLatLonBounds(neTile[0], neTile[1], zoom),

        costImageData = [],
        pixel = {};

    var xMetersDiff = neTileBoundsMeters[2] - swTileBoundsMeters[0],
        yMetersDiff = neTileBoundsMeters[3] - swTileBoundsMeters[1],
        mergedSizeX = (neTile[0] - swTile[0] + 1) * tileSize,
        mergedSizeY = (neTile[1] - swTile[1] + 1) * tileSize;

    pixel.x = Math.round(mergedSizeX * (originMeters[0] - swTileBoundsMeters[0]) / xMetersDiff);
    pixel.y = mergedSizeY - Math.round(mergedSizeY * (originMeters[1] - swTileBoundsMeters[1]) / yMetersDiff);

    // TODO: add setBounds() to canvas layer?
    if (canvasLayer) {
      map.removeLayer(canvasLayer);
    }
    canvasLayer = L.imageOverlay.canvas(L.latLngBounds([swTileBoundsLatLng[0], swTileBoundsLatLng[1]],[neTileBoundsLatLng[2], neTileBoundsLatLng[3]]));
    canvasLayer.addTo(map);

    ts.stitch(swTile[0], swTile[1], neTile[0], neTile[1], zoom, function(stitchedCanvas){
      draw(stitchedCanvas, canvasLayer.canvas, pixel);

      // For debugging:
      // canvasLayer.canvas.width = stitchedCanvas.width;
      // canvasLayer.canvas.height = stitchedCanvas.height;
      // canvasLayer.canvas.getContext('2d').drawImage(stitchedCanvas, 0, 0);
    });
  });
})();