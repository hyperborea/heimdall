Template.visWorldMap.onRendered(function() {
  let template = this;

  this.autorun(function() {
    let context = Template.currentData();

    check(context.settings.countryField, String);
    check(context.settings.valueField, String);

    let values = _.pluck(context.data, context.settings.valueField);
    let colors = d3.scale.linear()
      .domain([0, _.max(values)])
      .range(['#F5F5F5', '#0000FF']);

    let dataset = {};
    context.data.forEach(function(item) {
      let country = item[context.settings.countryField];
      let value = item[context.settings.valueField];

      dataset[country] = { value: value, fillColor: colors(value) };
    });

    template.$('.map svg').remove();

    new Datamap({
      element: template.find('.map'),
      fills: { defaultFill: '#F5F5F5' },
      data: dataset,
      height: 450
    });
  });
});


Template.visWorldMapForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});