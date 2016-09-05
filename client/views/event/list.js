import d3 from 'd3';
import d3KitTimeline from 'd3kit-timeline';

/*
TODO:
- update form
- integration with time series visualizations
- limit event subscription & infinite scroll
- comments
- access control
- new visualization type for event displays
- download as csv
*/

loadHandler(Template.eventList);


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
  this.cursor = new ReactiveVar();
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

const LIMIT = 10;

Template.eventList.onRendered(function() {
  var template = this;
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
    dotRadius    : (d) => d.dotRadius || 3,
    layerGap     : 30,
    labella      : { maxPos: width - 40, algorithm: 'simple', density: 0.5 },
    // textStyle    : { cursor: 'pointer' }
  });

  // chart.on('labelClick', function(d) {
  //   console.log(d);
  // });

  this.autorun(function() {
    var cursor = Events.find(filterQuery(), {
      sort: { date: -1 },
      limit: LIMIT
    });

    var data = cursor.map((event) => Object({
      eventId: event._id,
      time: new Date(event.date),
      text: event.title
    }));

    chart.data(data).resizeToFit();
    template.cursor.set(cursor);
  });
});

Template.eventList.helpers({
  events: () => Template.instance().cursor.get(),
  hasMore: (events) => events && events.count() >= LIMIT,
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
  },

  'click h3': function(event, template) {
    $(event.target).next()
      .toggle()
      .find('input:first')
        .focus();
  }
});


Template.eventListItem.events({
  'click .js-delete': function(event, template) {
    confirmModal("Are you sure you want to delete this event?", () => {
      Meteor.call('removeEvent', this._id); 
    });
  }
});