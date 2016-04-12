Template.visBigNumber.helpers({
  value: function() {
    const context = Template.currentData();
    const settings = context.settings;

    if (settings.valueField && settings.valueAggregation) {
      var aggregationFunction = AGGREGATIONS[settings.valueAggregation].fn;
      var values = _.pluck(context.data, settings.valueField);
      var result = aggregationFunction(values);

      return _.isNumber(result) ? d3.format(',')(result) : result;
    }
    else return '-';
  },
});


Template.visBigNumberForm.helpers({
  aggregationMethods: _.keys(AGGREGATIONS),
});