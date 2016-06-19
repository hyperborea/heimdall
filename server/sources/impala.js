import { createClient } from 'node-impala';


SOURCE_TYPES.impala.query = function(source, sql, endCallback, startCallback) {
  function results(status, data, extras) {
    extras = extras || {};

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

  client.query(sql, Meteor.bindEnvironment((err, rows, foo) => {
    if (err) {
      results('error', err.toString());
    }
    else {
      results('ok', rows, {
        fields: _.keys(rows[0])
      });
    }
  }));
}