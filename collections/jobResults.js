JobResults = new Mongo.Collection("jobResults");

JobResults.schema = new SimpleSchema({
  jobId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: true,
  },
  parameters: {
    type: Object,
    blackbox: true,
  },
  runId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  status: {
    type: String,
    allowedValues: ["ok", "running", "error"],
  },
  data: SimpleSchema.oneOf(
    {
      type: String,
      optional: true,
    },
    {
      type: Array,
    }
  ),
  "data.$": {
    type: Object,
    blackbox: true,
  },
  fields: {
    type: Array,
    defaultValue: [],
  },
  "fields.$": String,
  updatedAt: {
    type: Date,
    autoValue: function () {
      const status = this.field("status").value;
      if (["ok", "error"].indexOf(status) !== -1 || this.isInsert)
        return new Date();
      else if (this.isUpsert) return { $setOnInsert: new Date() };
    },
  },
  expiresAt: {
    type: Date,
  },
  pid: {
    type: String,
    optional: true,
  },
});

JobResults.attachSchema(JobResults.schema);
