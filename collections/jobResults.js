JobResults = new Mongo.Collection('jobResults');

JobResults.schema = new SimpleSchema({
  jobId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: true
  },
  parameters: {
    type: Object,
    blackbox: true
  },
  status: {
    type: String,
    allowedValues: ['ok', 'running', 'error']
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
  updatedAt: {
    type: Date,
    autoValue: () => new Date()
  },
  pid: {
    type: Number,
    optional: true
  },
});

JobResults.attachSchema(JobResults.schema);