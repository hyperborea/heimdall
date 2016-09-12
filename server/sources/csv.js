import Papa from 'papaparse';


SOURCE_TYPES.csv.query = function(source, query, parameters, endCallback, startCallback) {
  function sendResults(status, data, extras={}) {
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

    sendResults('ok', results.data);
  }
  catch(err) {
    sendResults('error', err.toString());
  }
}