function getUser(userOrId) {
  return _.isString(userOrId) ? Meteor.users.findOne(userOrId) : userOrId;
}


isUser = function(userId) {
  return userId;
};

isAdmin = function(userId) {
  return Roles.userIsInRole(userId, 'admin');
};

isOwner = function(userId, doc) {
  var user = getUser(userId);

  return (
    isAdmin(user) ||
    user._id === doc.ownerId ||
    _.intersection(user.groups, doc.ownerGroups || []).length > 0
  );
};


filterByOwnership = function(userId) {
  var user = getUser(userId);

  return isAdmin(user._id) ? {} : {
    $or: [
      { ownerId: user._id },
      { ownerGroups: { $elemMatch: { $in: user.groups } } }
    ]
  };
};


requireUser = function(userId) {
  if (!isUser(userId)) {
    throw new Meteor.Error('access-denied', "You must be logged in for that action");
  }
};

requireOwnership = function(userId, doc) {
  if (!isOwner(userId, doc)) {
    throw new Meteor.Error('access-denied', "You don't have ownership for this entity");
  }
};