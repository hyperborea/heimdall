var pg = Meteor.npmRequire('pg');

const TIMEOUT = 30000;


queryPostgres = function(source, query, endCallback, startCallback) {
  function results(status, data) {
    endCallback && endCallback({
      status: status,
      data: data
    });
  }

  if (source && query) {
    const conString = `postgres://${source.username}:${source.password}@${source.host}:${source.port}/${source.database}`
    query = `SET statement_timeout TO ${TIMEOUT};` + query;
  
    pg.connect(conString, Meteor.bindEnvironment((err, client, done) => {      
      if (err) return results('error', `${err} - could not connect with data source.`);

      const pid = client.processID;
      startCallback && startCallback(pid);

      client.query(query, Meteor.bindEnvironment((err, result) => {
        if (err) {
          results('error', err.toString());
        }
        else {
          results('ok', result.rows);
        }
        done();
      }));
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}