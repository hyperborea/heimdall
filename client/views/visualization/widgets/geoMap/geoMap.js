import mapbox from "mapbox-gl";
// import bbox from "@turf/bbox";
import _ from "lodash";

import "mapbox-gl/dist/mapbox-gl.css";

mapbox.accessToken = Meteor.settings.public.mapboxAccessToken;

Template.visGeoMap.onRendered(function() {
  const template = this;
  const container = template.find(".mapbox");
  let activeSettings = {};

  this.autorun(() => {
    const { settings, data } = Template.currentData();
    const hasChangedSettings = !_.isEqual(settings, activeSettings);
    activeSettings = settings;

    const { longField = "longitude", latField = "latitude" } = settings;

    const sources = _.chain(data)
      .groupBy(x => x[settings.catField] || "_default")
      .mapValues(arr => ({
        type: "FeatureCollection",
        features: arr.map(x => ({
          type: "Feature",
          properties: x,
          geometry: {
            type: "Point",
            coordinates: [x[longField], x[latField]]
          }
        }))
      }))
      .value();

    if (!this.map || hasChangedSettings) {
      // Map is new or settings have changed.
      if (this.map) {
        this.map.remove();
      }

      const map = new mapbox.Map({
        container,
        style: `mapbox://styles/mapbox/${settings.mapStyle || "streets"}-v9`,
        interactive: !!settings.interactive,
        bounds: settings.bounds // || bbox(geojson)
      });
      this.map = map;

      map.on("load", () => {
        _.forEach(sources, (data, key) => {
          map.addSource(key, { type: "geojson", data });
        });

        const layers = JSON.parse(settings.layersJson || "[]");
        if (layers.length) {
          layers.forEach(x => map.addLayer(x));
        }
      });
    } else {
      // Only data has changed, update sources.
      const map = this.map;
      _.forEach(sources, (data, key) => {
        const source = map.getSource(key);
        if (source) {
          source.setData(data);
        } else {
          map.addSource(key, { type: "geojson", data });
        }
      });
    }
  });
});
