import map from "lodash/map";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";

import boundingBoxes from "./boundingBoxes";

const LAYERS_DEFAULT = `[
  {
    "id": "points",
    "source": "_default",
    "type": "circle",
    "paint": {
      "circle-radius": 3,
      "circle-color": "#007cbf"
    }
  }
]`;

// const EXAMPLE_LABELS = `{
//   "id": "labels",
//   "source": "_default",
//   "type": "symbol",
//   "layout": {
//     "text-field": ["format", ["get", "place_name"], {}],
//     "text-size": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20]
//   }
// }`;

// const EXAMPLE_HEATMAP = `{
//   "id": "heatmap",
//   "source": "_default",
//   "type": "heatmap",
//   "paint": {
//     "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20]
//   }
// }`;

Template.visGeoMapForm.onRendered(function() {
  const { settings } = this.data;
  const textarea = this.find("textarea");

  const editor = CodeMirror.fromTextArea(textarea, {
    lineNumbers: true,
    lineWrapping: true,
    mode: "application/json",
    theme: "monokai",
    autoCloseBrackets: true
  });
  editor.on("change", doc => (textarea.value = doc.getValue()));
  editor.setValue(settings.layersJson || LAYERS_DEFAULT);
});

Template.visGeoMapForm.helpers({
  mapStyles: ["basic", "streets", "bright", "light", "dark", "satellite"],
  countries: map(boundingBoxes, (item, key) => ({
    text: item[0],
    value: key
  }))
});

Template.visGeoMapForm.events({
  "change [name=country]": (event, template) => {
    if (event.target.value) {
      template.find("[name='bounds:list']").value =
        boundingBoxes[event.target.value][1];
    }
  }
});
