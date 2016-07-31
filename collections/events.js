Events = new Mongo.Collection('events');

if (Meteor.isServer) {
  Events._ensureIndex({ date: -1 });
}


Meteor.methods({
  saveEvent: function(data) {
    const user = Meteor.users.findOne(this.userId);

    var eventId = data._id;
    var doc = _.omit(data, '_id', 'owner', 'ownerId', 'createdAt');

    if (!eventId) {
      requireUser(this.userId);
      
      doc.createdAt = new Date();
      doc.ownerId = this.userId;
      doc.owner = user.username;

      eventId = Events.insert(doc);
    }
    else {
      requireOwnership(user, Events.findOne(eventId));
      Events.update(eventId, {$set: doc});
    }

    _.each(doc.tags, (tag) => {
      var tagObj = { type: 'event', name: tag };
      Tags.upsert(tagObj, tagObj);
    });

    return eventId;
  },

  removeEvent: function(eventId) {
    check(eventId, String);
    requireOwnership(this.userId, Events.findOne(eventId));

    Events.remove(eventId);
  }
});