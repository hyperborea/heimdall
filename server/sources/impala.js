import { createClient } from 'node-impala';


SOURCE_TYPES.impala.query = function(source, sql, parameters, endCallback, startCallback) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  const client = createClient();

  client.connect({
    host: source.host,
    port: source.port,
    resultType: 'json-array'
  });

  // poor mans version of query parameterization
  sql = replaceQueryParameters(sql, function(m, key) {
    var value = parameters[key] || '';
    return "'" + value.replace(/[^\w\s-\.]/g, '?') + "'";
  });

  client.query(sql, Meteor.bindEnvironment((err, rows, foo) => {
    if (err) {
      sendResults('error', err.toString());
    }
    else {
      sendResults('ok', rows, _.keys(rows[0]));
    }
  }));
}