Sources = new Mongo.Collection('sources');


Sources.helpers({
  query(sql, endCallback, startCallback) {
    startCallback = startCallback || function(){};
    endCallback = endCallback || function(){};

    try {
      SOURCE_TYPES[this.type].query(this, sql, endCallback, startCallback);
    }
    catch(err) {
      endCallback({
        status: 'error',
        data: err.toString(),
      });
    }
  },

  status() {
    return this.test && this.test.status;
  }
});


Meteor.methods({
  saveSource: function(data) {
    const user = Meteor.users.findOne(this.userId);

    var sourceId = data._id;
    var doc = _.omit(data, '_id', 'owner', 'ownerId', 'createdAt');
    if (!doc.name) doc.name = doc.host;

    if (Meteor.isServer) {
      if (doc.password) doc.password = encryptString(doc.password);  
    }

    if (!sourceId) {
      requireUser(this.userId);
      
      doc.createdAt = new Date();
      doc.ownerId = this.userId;
      doc.owner = user.username;

      sourceId = Sources.insert(doc);
    }
    else {
      requireOwnership(user, Sources.findOne(sourceId));
      Sources.update(sourceId, {$set: doc});
    }

    return sourceId;
  },

  removeSource: function(sourceId) {
    check(sourceId, String);
    requireOwnership(this.userId, Sources.findOne(sourceId));

    Sources.remove(sourceId);
  },

  testSource: function(sourceId) {
    if (!Meteor.isServer) return;

    var source = Sources.findOne(sourceId);
    requireOwnership(this.userId, source);

    function updateTest(result) {
      result.updatedAt = new Date();
      Sources.update(sourceId, {$set: {test: result}});
    }

    updateTest({status: 'running'});
    source.query('select 1 as test', updateTest);
  }
});