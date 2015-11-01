dotNotationToObject = function(o) {
  var oo = {}, t, parts, part;
  for (var k in o) {
    t = oo;
    parts = k.split('.');
    var key = parts.pop();
    while (parts.length) {
      part = parts.shift();
      t = t[part] = t[part] || {};
    }
    t[key] = o[k];
  }
  return oo;
};


objectToDotNotation = function(obj) {
  var res = {};

  function isPlainObject(value) { return value.constructor === {}.constructor; };
  
  function recurse(obj, current) {
    for(var key in obj){
      var value = obj[key];
      var newKey = current ? current + "." + key : key; // joined key with dot
      if (value && isPlainObject(value))
        recurse(value, newKey); // it's a nested object, so do it again
      else
        res[newKey] = value; // it's not an object, so set the property
    }
  }

  recurse(obj);
  return res;
};