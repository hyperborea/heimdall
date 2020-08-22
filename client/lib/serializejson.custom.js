$.serializeJSON.defaultOptions.useIntKeysAsArrayIndex = true;
$.serializeJSON.defaultOptions.checkboxUncheckedValue = "false";

_.extend($.serializeJSON.defaultOptions.defaultTypes, {
  number: function (str) {
    return str ? Number(str) : undefined;
  },
  list: function (str) {
    var items = (str || "").split(",");
    return _.chain(items)
      .map((s) => s.trim())
      .without("")
      .value();
  },
});
