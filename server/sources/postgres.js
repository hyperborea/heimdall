import pg from 'pg';


SOURCE_TYPES.postgres.query = function(source, sql, parameters, endCallback, startCallback) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  if (source && sql) {
    const connectionConfig = {
      user     : source.username,
      password : decryptString(source.password),
      host     : source.host,
      port     : source.port,
      database : source.database,
      ssl      : source.ssl
    };
  
    pg.connect(connectionConfig, Meteor.bindEnvironment((err, client, done) => {      
      if (err) return sendResults('error', `${err}`);

      const pid = client.processID;
      startCallback(pid);

      client.query(`SET statement_timeout TO ${SOURCE_SETTINGS.timeoutMs}`);

      let index = 1;
      query = {
        text: replaceQueryParameters(sql, () => '$' + (index++)),
        values: getQueryParameters(sql).map((key) => parameters[key])
      };

      client.query(query, Meteor.bindEnvironment((err, result) => {
        if (err) {
          sendResults('error', err.toString());
        }
        else {
          sendResults('ok', result.rows, _.pluck(result.fields, 'name'));
        }
        done(true);
        client.end();
      }));

      client.on('error', Meteor.bindEnvironment((err, client) => {
        return sendResults('error', `pg client error: ${err.message}`);
        client.end();
      }));
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}