Template.visHeatMap.onRendered(function() {
  var context = Template.currentData();
  var settings = context.settings;

  var chart = this.find('.heatmap');
  const width = 800,
        gridSize = Math.floor(width / 25),
        height = gridSize * 8;

  var data = _.map(context.data, (d) => {
    var date = d[settings.dateField];

    return {
      day  : date && date.getDay(),
      hour : date && date.getHours(),
      val  : Number(d[settings.valueField])
    };
  });

  const min = d3.min(data, (d) => d.val),
        max = d3.max(data, (d) => d.val);

  var svg = d3.select(chart).append('svg')
    .attr('width', width)
    .attr('height', height);

  var dayLabels = svg.selectAll('.dayLabel')
    .data(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    .enter().append('text')
      .text((d) => d)
      .attr('x', 0)
      .attr('y', (d, i) => ((i+1) * gridSize) + (gridSize / 1.5));

  var timeLabels = svg.selectAll('.timeLabel')
    .data(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'])
    .enter().append('text')
      .text((d) => d)
      .attr('x', (d, i) => (i+1.5) * gridSize)
      .attr('y', gridSize / 2)
      .style('text-anchor', 'middle');

  var colorScale = d3.scale.quantile()
    .domain([min, max])
    .range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

  var cards = svg.selectAll('.card')
    .data(data);

  cards.enter().append('rect')
    .attr('x', (d) => (d.hour+1) * gridSize)
    .attr('y', (d) => (d.day+1) * gridSize)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('width', gridSize)
    .attr('height', gridSize)
    .attr('title', (d) => d.val)
    .style('fill', (d) => colorScale(d.val));

  cards.exit().remove();
});