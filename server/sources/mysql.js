import mysql from 'mysql';


SOURCE_TYPES.mysql.query = function(source, sql, parameters, endCallback, startCallback) {
  function results(status, data, extras) {
    extras = extras || {};

    var result = {
      status: status,
      data: data
    };

    endCallback(_.extend(result, extras));
  }

  if (source && sql) {
    var connection = mysql.createConnection({
      user     : source.username,
      password : decryptString(source.password),
      host     : source.host,
      port     : source.port,
      database : source.database,
    });

    connection.connect();

    query = {
      sql: replaceQueryParameters(sql, '?'),
      values: getQueryParameters(sql).map((key) => parameters[key]),
      timeout: SOURCE_SETTINGS.timeoutMs
    };

    connection.query(query, Meteor.bindEnvironment((err, rows, fields) => {
      if (err) {
        results('error', err.toString());
      }
      else {
        results('ok', rows, {
          fields: _.pluck(fields, 'name')
        });
      }
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}