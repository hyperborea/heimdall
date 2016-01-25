Template.visWorldMap.onRendered(function() {
  let template = this;

  this.autorun(function() {
    let context = Template.currentData();
    const settings = context.settings;

    check(settings.countryField, String);
    check(settings.valueField, String);

    const targetColor = settings.targetColor || '#0000FF';
    const exponent = settings.exponent || 1;

    let values = _.pluck(context.data, settings.valueField).map(Number);
    let colors = d3.scale.pow().exponent(exponent)
      .domain([0, _.max(values)])
      .range(['#F5F5F5', targetColor]);

    let dataset = {};
    context.data.forEach(function(item) {
      let country = item[settings.countryField];
      let value = item[settings.valueField];

      if (settings.mapType === 'world') country = countryISO3(country);

      dataset[country] = { value: value, fillColor: colors(value) };
    });

    template.$('.map svg').remove();

    new Datamap({
      element: template.find('.map'),
      fills: { defaultFill: '#F5F5F5' },
      data: dataset,
      responsive: true,
      scope: settings.mapType,
      geographyConfig: {
        popupTemplate: function(geography, data) {
          var value = data ? data.value : '-';
          return `<div class="hoverinfo"><strong>${geography.properties.name}</strong>: ${value}</div>`;
        }
      }
    });
  });
});


Template.visWorldMapForm.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});