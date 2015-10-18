pg = Meteor.npmRequire('pg');

Meteor.methods({
  query: function(sql) {
    console.log('query: ' + sql);
  }
});