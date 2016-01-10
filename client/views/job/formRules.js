function newRule() {
  return {
    _id: Random.id(),
    conditions: [newCondition()],
    severity: 'info'
  };
}

function newCondition() {
  return {
    _id: Random.id()
  };
}


Template.jobFormRules.onCreated(function() {
  var doc = Template.currentData().doc;
  this.rules = new ReactiveVar(doc.rules || []);
});

Template.jobFormRules.helpers({
  rules: () => Template.instance().rules.get()
});

Template.jobFormRules.events({
  'click .js-add-rule': function(event, template) {
    var rules = template.rules.get()

    rules.push(newRule());
    template.rules.set(rules);
  },

  'click .js-remove-rule': function(event, template) {
    var ruleIdx = Blaze.getData(event.target).ruleIdx;
    var rules = template.rules.get();
    
    rules.splice(ruleIdx, 1);
    template.rules.set(rules);
    template.$('input.dummy').change();
  },

  'click .js-add-condition': function(event, template) {
    var ruleIdx = Blaze.getData(event.target).ruleIdx;
    var rules = template.rules.get()

    rules[ruleIdx].conditions.push(newCondition());
    template.rules.set(rules);
  },

  'click .js-remove-condition': function(event, template) {
    var ruleIdx = Blaze.getData(event.target).ruleIdx;
    var condIdx = Blaze.getData(event.target).condIdx;
    var rules = template.rules.get();
    var conditions = rules[ruleIdx].conditions;
    
    conditions.splice(condIdx, 1);
    if (conditions.length === 0) {
      conditions.push(newCondition());
    }

    template.rules.set(rules);
    template.$('input.dummy').change();
  },
});


Template.jobFormRulesItem.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});

Template.jobFormRulesItem.helpers({
  path: (addendum) => {
    var data = Template.currentData();
    return `rules[${data.ruleIdx}]${addendum}`;
  }
});


Template.jobFormRulesItemCondition.onRendered(function() {
  this.$('.ui.dropdown').dropdown();
});

Template.jobFormRulesItemCondition.helpers({
  operators: () => _.values(OPERATORS),
  path: () => {
    var data = Template.currentData();
    return `rules[${data.ruleIdx}][conditions][${data.condIdx}]`;
  }
});