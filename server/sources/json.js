SOURCE_TYPES.json.query = function(source, query, parameters, endCallback, startCallback) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  try {    
    var data = JSON.parse(query);

    new SimpleSchema({
      data: Array,
      'data.$': {
        label: 'Data items',
        type: Object,
        blackbox: true
      }
    }).validate({data: data});

    sendResults('ok', data, _.keys(data[0]));
  }
  catch(err) {
    sendResults('error', err.toString());
  }
}