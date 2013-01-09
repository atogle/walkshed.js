/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

L.ImageOverlay.Canvas = L.ImageOverlay.extend({
  includes: L.Mixin.Events,

  options: {
    opacity: 1
  },

  initialize: function (bounds, options) { // (LatLngBounds, Object)
    this._bounds = L.latLngBounds(bounds);

    L.Util.setOptions(this, options);
  },

  _initImage: function () {
    var topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
        size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

    this._image = this.canvas = L.DomUtil.create('canvas', 'leaflet-image-layer');
    this._image.width  = size.x;
    this._image.height = size.y;

    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      L.DomUtil.addClass(this._image, 'leaflet-zoom-animated');
    } else {
      L.DomUtil.addClass(this._image, 'leaflet-zoom-hide');
    }

    this._updateOpacity();

    //TODO createImage util method to remove duplication
    L.Util.extend(this._image, {
      galleryimg: 'no',
      onselectstart: L.Util.falseFn,
      onmousemove: L.Util.falseFn,
      onload: L.Util.bind(this._onImageLoad, this)
    });
  },

  _reset: function () {
    var image   = this._image,
        topLeft = this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
        size = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(topLeft);

    L.DomUtil.setPosition(image, topLeft);

    image.style.width  = size.x + 'px';
    image.style.height = size.y + 'px';
  },

  _onImageLoad: function () {
    this.fire('load');
  }
});

L.imageOverlay.canvas = function (bounds, options) {
  return new L.ImageOverlay.Canvas(bounds, options);
};
