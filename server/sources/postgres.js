import { Pool } from "pg";

POOLS = {};

SOURCE_TYPES.postgres.query = async function(
  source,
  sql,
  parameters,
  endCallback,
  startCallback
) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  if (source && sql) {
    let pool = POOLS[source._id];
    if (!pool) {
      pool = new Pool({
        user: source.username,
        password: decryptString(source.password),
        host: source.host,
        port: source.port,
        database: source.database,
        ssl: source.ssl
      });
      POOLS[source._id] = pool;
    }

    pool.connect(
      Meteor.bindEnvironment((err, client, done) => {
        if (err) return sendResults("error", `${err}`);

        const pid = client.processID;
        startCallback(pid);

        client.query(`SET statement_timeout TO ${SOURCE_SETTINGS.timeoutMs}`);

        let index = 1;
        query = {
          text: replaceQueryParameters(sql, () => "$" + index++),
          values: getQueryParameters(sql).map(key => parameters[key])
        };

        client.query(
          query,
          Meteor.bindEnvironment((err, result) => {
            done();

            if (err) {
              sendResults("error", err.toString());
            } else {
              sendResults("ok", result.rows, _.pluck(result.fields, "name"));
            }
          })
        );
      })
    );
  } else throw new Meteor.Error("Can't query job, something is missing.");
};

SOURCE_TYPES.postgres.cancel = function(source, pid) {
  source.query(`select pg_cancel_backend(${pid})`);
};
