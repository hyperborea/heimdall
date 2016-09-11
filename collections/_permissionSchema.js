permissionSchema = new SimpleSchema({
  owner: String,
  ownerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  ownerGroups: [String],
  accessGroups: [String],
});