Template.visWorldMap.onRendered(function() {
  let template = this;

  this.autorun(function() {
    let context = Template.currentData();

    check(context.settings.countryField, String);
    check(context.settings.valueField, String);

    const targetColor = context.settings.targetColor || '#0000FF';

    let values = _.pluck(context.data, context.settings.valueField);
    let colors = d3.scale.linear()
      .domain([0, _.max(values)])
      .range(['#F5F5F5', targetColor]);

    let dataset = {};
    context.data.forEach(function(item) {
      let country = item[context.settings.countryField];
      let value = item[context.settings.valueField];

      if (context.settings.mapType === 'world') country = countryISO3(country);

      dataset[country] = { value: value, fillColor: colors(value) };
    });

    template.$('.map svg').remove();

    new Datamap({
      element: template.find('.map'),
      fills: { defaultFill: '#F5F5F5' },
      data: dataset,
      responsive: true,
      scope: context.settings.mapType,
      geographyConfig: {
        popupTemplate: function(geography, data) {
          return `<div class="hoverinfo"><strong>${geography.properties.name}</strong>: ${data.value}</div>`;
        }
      }
    });
  });
});


Template.visWorldMapForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});