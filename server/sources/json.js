SOURCE_TYPES.json.query = function(source, query, parameters, endCallback, startCallback) {
  function done(status, data, extras={}) {
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

    done('ok', data);
  }
  catch(err) {
    done('error', err.toString());
  }
}