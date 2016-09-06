JobResults = new Mongo.Collection('jobResults');

JobResults.schema = new SimpleSchema({
  jobId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: true
  },
  status: {
    type: String,
    allowedValues: ['ok', 'running', 'error']
  },
  updatedAt: {
    type: Date,
    autoValue: () => new Date()
  },
  data: SimpleSchema.oneOf({
    type: String,
    optional: true
  }, {
    type: Array,
  }),
  'data.$': {
    type: Object,
    blackbox: true
  },
  fields: {
    type: Array,
    defaultValue: [],
  },
  'fields.$': String,
  pid: {
    type: Number,
    optional: true
  },
});

JobResults.attachSchema(JobResults.schema);