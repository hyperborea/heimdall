$.serializeJSON.defaultOptions.useIntKeysAsArrayIndex = true;

_.extend($.serializeJSON.defaultOptions.defaultTypes, {
  number: function(str) {
    return str ? Number(str) : undefined;
  },
  list: function(str) {
    return _.without( (str || '').split(','), '');
  }
});