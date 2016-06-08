import mysql from 'mysql';


SOURCE_TYPES.mysql.query = function(source, sql, endCallback, startCallback) {
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

    connection.query({sql: sql, timeout: SOURCE_TYPES._timeoutMs}, Meteor.bindEnvironment((err, rows, fields) => {
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