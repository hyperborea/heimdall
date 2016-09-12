import Papa from 'papaparse';


SOURCE_TYPES.csv.query = function(source, query, parameters, endCallback, startCallback) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  try {
    var results = Papa.parse(query, {
      header: true,
      dynamicTyping: true
    });

    sendResults('ok', results.data, results.meta.fields);
  }
  catch(err) {
    sendResults('error', err.toString());
  }
}