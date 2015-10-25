var pg = Meteor.npmRequire('pg');

queryPostgres = function(source, query, callback) {
  function done(status, data) {
    callback({
      status: status,
      data: data
    });
  }

  if (source && query) {
    const conString = `postgres://${source.username}:${source.password}@${source.host}:${source.port}/${source.database}`
    console.log(conString);
  
    pg.connect(conString, Meteor.bindEnvironment((err, client) => {
      if (err) return done('error', err.code);

      client.query(query, Meteor.bindEnvironment((err, result) => {
        if (err) {
          done('error', err.toString());
        }
        else {
          done('ok', result.rows);
        }
      }));
    }));
  }
  else throw new Meteor.Error("Can't query job, something is missing.");
}