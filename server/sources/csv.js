import Papa from 'papaparse';


SOURCE_TYPES.csv.query = function(source, query, parameters, endCallback, startCallback) {
  function done(status, data, extras={}) {
    let result = {
      status: status,
      data: data
    };

    endCallback(_.extend(result, extras));
  }

  try {
    var results = Papa.parse(query, {
      header: true,
      dynamicTyping: true
    });

    done('ok', results.data);
  }
  catch(err) {
    done('error', err.toString());
  }
}