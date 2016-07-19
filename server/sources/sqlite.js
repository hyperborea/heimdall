import sqlite3 from 'sqlite3';


SOURCE_TYPES.sqlite.query = function(source, sql, endCallback, startCallback) {
  function results(status, data, extras) {
    extras = extras || {};

    var result = {
      status: status,
      data: data
    };

    endCallback(_.extend(result, extras));
  }

  if (source && sql) {
    var db = new sqlite3.Database(source.host);

    db.all(sql, Meteor.bindEnvironment((err, rows) => {
      if (err) {
        results('error', err.toString());
      }
      else {
        results('ok', rows, {
          fields: rows[0] ? _.keys(rows[0]) : []
        });
      }
    }));

    db.close();
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}