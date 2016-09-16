permissionSchema = new SimpleSchema({
  owner: String,
  ownerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  ownerGroups: [String],
  accessGroups: [String],
});


export function requiredIf(field, value) {
  return function() {
    let shouldBeRequired = this.field(field).value === value;

    if (shouldBeRequired) {
      if (this.isInsert) {
        if (!this.isSet || this.value === null || this.value === "") return SimpleSchema.ErrorTypes.REQUIRED;
      }

      else if (this.isUpdate) {
        if (this.operator === "$set" && !this.isSet || this.value === null || this.value === "") return SimpleSchema.ErrorTypes.REQUIRED;
        if (this.operator === "$unset") return SimpleSchema.ErrorTypes.REQUIRED;
        if (this.operator === "$rename") return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  }
}