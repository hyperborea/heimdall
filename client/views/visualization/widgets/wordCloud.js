import d3 from 'd3';
import cloud from 'd3.layout.cloud';

Template.visWordCloud.onRendered(function() {
  const container = this.find('.container');

  this.autorun(() => {
    $(container).find('svg').remove();

    const context = Template.currentData();
    const settings = context.settings;

    if (settings.textField && settings.valueField) {
      const data = context.data;
      const values = _.pluck(data, settings.valueField);

      const fill = d3.scale.category20();
      const scale = d3.scale.pow()
        .exponent(settings.exponent)
        .domain([d3.min(values), d3.max(values)])
        .range([settings.minSize, settings.maxSize]);

      const layout = cloud()
        .size([settings.width, settings.height])
        .words(data.map(d => {
          return { text: d[settings.textField], size: scale(d[settings.valueField]) };
        }))
        // .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw);

      layout.start();

      function draw(words) {
        d3.select(container).append('svg')
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
        .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
      }
    }
  });
});


Template.visWordCloudForm.helpers({
  settings: function() {
    return _.defaults(this.settings, {
      minSize: 10,
      maxSize: 100,
      exponent: 1,
    });
  }
});