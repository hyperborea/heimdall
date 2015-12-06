$.serializeJSON.defaultOptions.useIntKeysAsArrayIndex = true;

_.extend($.serializeJSON.defaultOptions.defaultTypes, {
  list: function(str) {
    return _.without( (str || '').split(','), '');
  }
});