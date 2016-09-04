Requests = new Mongo.Collection('requests');

Meteor.methods({
  logRequest: function(req) {
    this.unblock();

    if (!this.userId) return;

    check(req, {
      path      : String,
      routeName : String,
      params    : Object
    });

    var user = Meteor.users.findOne(this.userId);

    Requests.insert(_.extend(req, {
      userId      : this.userId,
      username    : user.username,
      requestedAt : new Date()
    }));
  }
});