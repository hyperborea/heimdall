import { createClient } from 'node-impala';


SOURCE_TYPES.impala.query = function(source, sql, parameters, endCallback, startCallback) {
  function done(status, data, extras={}) {
    var result = {
      status: status,
      data: data
    };

    endCallback(_.extend(result, extras));
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
      done('error', err.toString());
    }
    else {
      done('ok', rows, {
        fields: _.keys(rows[0])
      });
    }
  }));
}