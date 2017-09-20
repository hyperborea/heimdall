import sqlite3 from "sqlite3";
// import sqlite3 from "better-sqlite3";

SOURCE_TYPES.sqlite.query = function(
  source,
  sql,
  parameters,
  endCallback,
  startCallback
) {
  function sendResults(status, data, fields) {
    endCallback({ status: status, data: data, fields: fields });
  }

  // try {
  //   const db = new sqlite3(source.path);
  //   const stmt = db.prepare(replaceQueryParameters(sql, "?"));
  //   const rows = stmt.all(getQueryParameters(sql).map(key => parameters[key]));
  //   sendResults("ok", rows, _.keys(rows[0]));
  // } catch (e) {
  //   sendResults("error", err.toString());
  // }

  const db = new sqlite3.Database(source.path);

  db.all(
    replaceQueryParameters(sql, "?"),
    getQueryParameters(sql).map(key => parameters[key]),
    Meteor.bindEnvironment((err, rows) => {
      if (err) {
        sendResults("error", err.toString());
      } else {
        sendResults("ok", rows, _.keys(rows[0]));
      }
    })
  );
};
