import { format as d3Format } from "d3";

Template.visBigNumber.helpers({
  value: function() {
    var settings = this.settings;
    settings.valueFormat = settings.valueFormat || ",";

    if (settings.valueField && settings.valueAggregation) {
      var aggregationFunction = AGGREGATIONS[settings.valueAggregation].fn;
      var values = _.pluck(this.data, settings.valueField);
      var result = aggregationFunction(values);

      var parsedResult = parseFloat(result);
      if (!isNaN(parsedResult) && result.match(/^[\d\.]+$/)) {
        result = parsedResult;
      }

      return _.isNumber(result)
        ? d3Format(settings.valueFormat)(result)
        : result;
    } else return "-";
  }
});

Template.visBigNumberForm.helpers({
  aggregationMethods: _.keys(AGGREGATIONS)
});
