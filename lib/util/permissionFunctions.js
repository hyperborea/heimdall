isUser = function(userId) {
  return userId;
};

isAdmin = function(userId) {
  return Roles.userIsInRole(userId, 'admin');
};

isOwner = function(userId, doc) {
  if (!doc) return false;
  var user = getUser(userId);

  return (
    isAdmin(user) ||
    user._id === doc.ownerId ||
    _.intersection(user.groups, doc.ownerGroups || []).length > 0
  );
};

hasAccess = function(userId, doc) {
  if (!doc) return false;
  var user = getUser(userId);

  return (
    isOwner(userId, doc) ||
    _.intersection(user.groups, doc.accessGroups || []).length > 0
  );
};


filterByOwnership = function(userId) {
  var user = getUser(userId);

  return isAdmin(user._id) ? {} : {
    $or: [
      { ownerId: user._id },
      { ownerGroups: { $elemMatch: { $in: user.groups || [] } } }
    ]
  };
};

filterByAccess = function(userId) {
  var user = getUser(userId);
  var filter = filterByOwnership(userId);

  if (filter.hasOwnProperty('$or')) {
    filter['$or'].push({
      accessGroups: { $elemMatch: { $in: user.groups || [] } }
    });
  }

  return filter;
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

requireAccess = function(userId, doc) {
  if (!hasAccess(userId, doc)) {
    throw new Meteor.Error('access-denied', "You don't have access permissions for this entity");
  }
};