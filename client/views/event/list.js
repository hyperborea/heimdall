import d3 from 'd3';
import d3KitTimeline from 'd3kit-timeline';


function filterQuery() {
  var filters = Template.instance().filters;
  var conditions = [];

  if (filters.get('startDate')) conditions.push({ date: { $gte: filters.get('startDate') } });
  if (filters.get('endDate')) conditions.push({ date: { $lte: filters.get('endDate') } });
  if (!_.isEmpty(filters.get('tags'))) conditions.push({ tags: { $all: filters.get('tags') } });

  return conditions.length ? { $and: conditions } : {};
}


Template.eventList.onCreated(function() {
  this.subscribe('events');
  this.subscribe('tags', 'event');

  this.filters = new ReactiveDict();
});


Template.eventList.onRendered(function() {
  this.$('form.create-event').form({
    inline: true,
    fields: {
      date: 'regExp[/^\\d{4}\-\\d{2}\-\\d{2}$/]',
      title: 'empty',
    }
  });

  // this.$('.ui.calendar').calendar({ type: 'date' });
});

Template.eventList.onRendered(function() {
  var colorScale = d3.scale.category10();

  var container = this.find('.timeline');
  var width = $(container).width();
  var chart = new d3KitTimeline(container, {
    direction    : 'up',
    initialWidth : width,
    margin       : {left: 40, right: 40, top: 20, bottom: 60},
    labelBgColor : (d) => colorScale(d.text),
    dotColor     : (d) => colorScale(d.text),
    linkColor    : (d) => colorScale(d.text),
    labella      : { maxPos: width }
  });

  this.autorun(function() {
    var data = Events.find(filterQuery()).map((event) => Object({
      time: new Date(event.date),
      text: event.title
    }));

    chart.data(data).resizeToFit();
  });
});

Template.eventList.helpers({
  events: () => Events.find(),
  tags: () => Tags.find({ type: 'event' }).map((tag) => tag.name),
  filterValue: (key) => Template.instance().filters.get(key),
});


Template.eventList.events({
  'submit form.create-event': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    Meteor.call('saveEvent', data);

    $(event.target).form('reset');
  },

  'submit form.filter-events': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    _.each(data, (value, key) => template.filters.set(key, value));
  }
});


Template.eventItem.events({
  'click .js-delete': function(event, template) {
    Meteor.call('removeEvent', this._id);
  }
});