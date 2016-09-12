SOURCE_TYPES.json.query = function(source, query, parameters, endCallback, startCallback) {
  function sendResults(status, data, extras={}) {
    let result = {
      status: status,
      data: data
    };

    endCallback(_.extend(result, extras));
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

    sendResults('ok', data);
  }
  catch(err) {
    sendResults('error', err.toString());
  }
}