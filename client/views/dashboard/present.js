Template.dashboardPresent.onCreated(function() {
  this.subscribe('dashboards');
});


Template.dashboardPresent.onRendered(function() {
  var template = this;

  template.$('.ui.checkbox').checkbox();

  var currentDashboard = undefined;
  var timer = undefined;

  template.autorun(() => {
    FlowRouter.watchPathChange();
    if (timer) Meteor.clearTimeout(timer);

    var ids = (FlowRouter.getQueryParam('ids') || '').split(',');
    var speed = FlowRouter.getQueryParam('speed') || 10000;
    var animation = FlowRouter.getQueryParam('animation') || 'fade';
    var duration = '100ms';

    function transition(delay) {
      timer = Meteor.setTimeout(function() {
        var index = ids.indexOf(currentDashboard);
        var nextIndex = index < (ids.length-1) ? index + 1 : 0;

        // break cycle if there's nothing to rotate
        if (currentDashboard === ids[nextIndex]) return;

        function showNext() {
          currentDashboard = ids[nextIndex];
          var $el = template.$('#dashboard-' + currentDashboard);

          if ($el.hasClass('invisible')) {
            $el.removeClass('invisible');
          } else {
            $el.transition({
              animation: animation,
              duration: duration
            });
          }
        }

        if (currentDashboard) {
          template.$('#dashboard-' + currentDashboard).transition({
            animation: animation,
            duration: duration,
            onComplete: showNext
          });
        }
        else {
          showNext();
        }

        transition(speed);
      }, delay);
    }

    transition(0);
  });
});


Template.dashboardPresent.helpers({
  dashboardItems: function() {
    return Dashboards.find().map((dashboard) => {
      return {
        value : dashboard._id,
        text  : dashboard.title,
      }
    });
  },

  requestedIds: function() {
    var ids = FlowRouter.getQueryParam('ids') || '';
    return ids.split(',');
  }
});


Template.dashboardPresent.events({
  'submit form': function(event, template) {
    event.preventDefault();

    var data = $(event.target).serializeJSON();
    FlowRouter.go('dashboardPresent', {}, data);
  },

  'click .js-go-fullscreen': function(event, template) {
    FlowRouter.setQueryParams({ fullscreen: true });
  },

  'click .js-close-fullscreen': function(event, template) {
    FlowRouter.setQueryParams({ fullscreen: false });
  }
});