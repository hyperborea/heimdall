var pg = require('pg');

const TIMEOUT = 300000;


queryPostgres = function(source, query, endCallback, startCallback) {
  function results(status, data, extras) {
    extras = extras || {};

    var result = {
      status: status,
      data: data
    };

    endCallback && endCallback(_.extend(result, extras));
  }

  if (source && query) {
    const connectionConfig = {
      user     : source.username,
      password : decryptString(source.password),
      host     : source.host,
      port     : source.port,
      database : source.database,
      ssl      : source.ssl
    };
    // query = `SET statement_timeout TO ${TIMEOUT};` + query;
  
    pg.connect(connectionConfig, Meteor.bindEnvironment((err, client, done) => {      
      if (err) return results('error', `${err} - could not connect with data source.`);

      const pid = client.processID;
      startCallback && startCallback(pid);

      client.query(query, Meteor.bindEnvironment((err, result) => {
        if (err) {
          results('error', err.toString());
        }
        else {
          results('ok', result.rows, {
            fields: _.pluck(result.fields, 'name')
          });
        }
        done(true);
        client.end();
      }));
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}