import ProgressBar from "progressbar.js";
import isEqual from "lodash/isEqual";

Template.visProgress.onRendered(function() {
  const template = this;
  const container = template.find(".container");
  let activeSettings = {};

  this.autorun(() => {
    const { settings, data } = Template.currentData();
    const hasChangedSettings = !isEqual(settings, activeSettings);
    activeSettings = settings;

    if (!this.progress || hasChangedSettings) {
      this.progress && this.progress.destroy();

      const Component = ProgressBar[settings.compType || "SemiCircle"];
      this.progress = new Component(container, {
        strokeWidth: settings.strokeWidth || 4,
        easing: "easeInOut",
        duration: 1400,
        trailColor: "#eee",
        trailWidth: 1,
        text: {
          value: "",
          style: {
            color: "black",
            position: "absolute",
            left: "50%",
            top: "50%",
            padding: 0,
            margin: 0,
            transform: {
              prefix: true,
              value: "translate(-50%, -50%)"
            }
          }
        },
        from: { color: settings.minColor || "#dae289" },
        to: { color: settings.maxColor || "#3b6427" },
        step: (state, progress) => {
          progress.path.setAttribute("stroke", state.color);
        }
      });

      const maxWidth = settings.maxWidth || "300px";
      container.style = `position: relative; max-width: ${maxWidth}`;
    }

    const progress = this.progress;
    if (data.length && settings.valueField && settings.goalField) {
      const value = data[0][settings.valueField];
      const goal = data[0][settings.goalField];

      progress.animate(Math.min(value / goal, 1.0));
      progress.text.innerHTML = `
      <center>
        ${settings.label ? `<h3>${settings.label.toUpperCase()}</h3>` : ""}
        <h1>${value} of ${goal}</h1>
      </center>`;
    }
  });
});
