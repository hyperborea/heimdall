SEVERITIES = {
  critical : { rank: 1, name: 'critical', color: 'red', hexColor: '#DB2828', icon: 'red flag' },
  warning  : { rank: 2, name: 'warning', color: 'orange', hexColor: '#F2711C', icon: 'orange warning' },
  info     : { rank: 3, name: 'info', color: 'blue', hexColor: '#2185D0', icon: 'blue info' },
};

OPERATORS = {
  eq: { name: 'eq', display: '=', fn: (v1, v2) => v1 == v2 },
  ne: { name: 'ne', display: '!=', fn: (v1, v2) => v1 != v2 },
  lt: { name: 'lt', display: '<', fn: (v1, v2) => Number(v1) < Number(v2) },
  gt: { name: 'gt', display: '>', fn: (v1, v2) => Number(v1) > Number(v2) },
  in: { name: 'in', display: 'IN', fn: (v1, v2) => _.find(tokenize(v2), (vv) => v1 == vv) },
  nin: { name: 'nin', display: 'NOT IN', fn: (v1, v2) => !_.find(tokenize(v2), (vv) => v1 == vv) },
};

AGGREGATIONS = {
  max: { name: 'max', fn: _.max },
  min: { name: 'min', fn: _.min },
  avg: { name: 'avg', fn: (items) => _.reduce(items, (memo, num) => memo+num, 0) / (items.length || 1) },
  sum: { name: 'sum', fn: (items) => _.reduce(items, (memo, num) => memo+num, 0) },
  first: { name: 'first', fn: _.first },
  last: { name: 'last', fn: _.last },
};

SOURCE_SETTINGS = {
  maxRows: 10000,
  timeoutMs: 1000 * 3600 * 24,
};

SOURCE_TYPES = {
  postgres: { value: 'postgres', text: 'PostgreSQL', fields: ['credentials', 'ssl'] },
  mysql: { value: 'mysql', text: 'MySQL', fields: ['credentials'] },
  mssql: { value: 'mssql', text: 'SQL Server', fields: ['credentials', 'mssql'] },
  impala: { value: 'impala', text: 'Impala' },
};