import mssql from 'mssql';


SOURCE_TYPES.mssql.query = function(source, sql, parameters, endCallback, startCallback) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  if (source && sql) {
    const connectionConfig = {
      user     : source.username,
      password : decryptString(source.password),
      server   : source.host,
      port     : source.port,
      database : source.database,
      requestTimeout: SOURCE_SETTINGS.timeoutMs,
      options: {
        tdsVersion : '7_1',
        encrypt    : source.ssl
      }
    };

    if (source.domain) connectionConfig.domain = source.domain;

    var connection = new mssql.Connection(connectionConfig, Meteor.bindEnvironment((err) => {
      if (err) return sendResults('error', `${err} - could not connect with data source.`);

      var request = connection.request();
      getQueryParameters(sql).forEach((key) => {
        request.input(key, parameters[key]);
      });
      sql = replaceQueryParameters(sql, (m, key) => '@' + key);

      request.query(sql, Meteor.bindEnvironment((err, data) => {
        if (err) {
          sendResults('error', err.toString());
        }
        else {
          var fields = (data && data.length) ? _.keys(data[0]) : [];
          sendResults('ok', data, fields);
        }
      }));
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}