getUser = function(userOrId) {
  var user = _.isString(userOrId) ? Meteor.users.findOne(userOrId) : userOrId;
  return user || {};
};