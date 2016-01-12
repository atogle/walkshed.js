# walkshed.js

walkshed.js is a prototype that demonstrates how raster analysis can be used to measure pedestrian access in a city. It relies on HTML5 canvas, utilizes [costdistance.js](https://github.com/atogle/costdistance.js), [tile-stitcher.js](https://github.com/atogle/tile-stitcher.js), and [Leaflet.js](https://github.com/CloudMade/Leaflet), and uses [TileMill](http://mapbox.com/tilemill/) to generate the data tiles.

How to run the app locally:

1. Install node.js and dependencies:

  `npm install`
  `npm install grunt`
  `npm install bower`

2. Install bower client-side dependencies (modernizr, Leaflet, etc.):

  `bower install`

3. Launch the App:

  `grunt build`
  `grunt serve`
