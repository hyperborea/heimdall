import hopscotch from 'hopscotch';
import 'hopscotch/dist/css/hopscotch.css';


Template.layout.onRendered(function() {
  this.$('.ui.disclaimer.modal').modal({
    blurring: true
  });

  var grid = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  var canvas = this.find('#logo');
  var ether = new Ethergrid(canvas, grid, { entropy: 0 });

  this.autorun(() => {
    ether.speed(Session.get('isLoading') ? 0.35 : 0.5);
    ether.entropy(Session.get('isLoading') ? 10 : 0);
    Session.get('isLoading') ? ether.color(255, 0, 0, 0.5) : ether.color(247, 202, 24, 0.5);
  });

  this.$('.js-start-tour').click();
});


Template.layout.helpers({
  userInitials: function() {
    var user = Meteor.user();
    return user && user.displayName.replace(/[^A-Z]/g, '');
  },

  isLoading: () => Session.get('isLoading'),
  mayAdmin: () => mayAdmin(Meteor.user()),
  isAdmin: (trueValue, falseValue) => isAdmin(Meteor.user()) ? trueValue || true : falseValue,
});


Template.layout.events({
  'click .js-toggle-admin': function(event, template) {
    Meteor.users.update(Meteor.userId(), {
      $set: { 'profile.adminEnabled': !Meteor.user().profile.adminEnabled }
    });
    location.reload();
  },

  'click .js-start-tour': function(event, template) {
    function restartTourAfterElementExists(element) {
      var checkExist = setInterval(function() {
        if ($(element).is(':visible')) {
          clearInterval(checkExist);
          hopscotch.startTour(tour, hopscotch.getCurrStepNum());
        }
      }, 100);
    }

    function tourRedirect(route, element) {
      return function() {
        FlowRouter.go(route);
        restartTourAfterElementExists(element);  
      }
    }

    var tour = {
      id: 'main-tour',
      bubbleWidth: 350,
      steps: [
        {
          title: "Welcome!",
          content: `
            Heimdall is a data visualization and business monitoring system.
            <br><br>
            At it's core it consists of <b>jobs</b> retrieving data from <b>sources</b>, which can be scheduled to refresh periodically.
            The results are then represented through <b>visualizations</b> and organized and shared through <b>dashboards</b>.
            <br><br>
            Let's have a look at these concepts in more details.
          `,
          target: "#brand",
          placement: "right",
          onNext: tourRedirect('sourceList', '.js-add-source'),
          multipage: true
        },
        {
          title: "Sources",
          content: `
            Sources are <b>reusable database connections</b> that you can set up for yourself or share with others.
            This page gives an overview over all sources you have currently access to.
            <br><br>
            First things first, let's <b>add a new source</b> to power our demo jobs, visualizations and dashboards.
          `,
          target: ".js-add-source",
          placement: "bottom",
          nextOnTargetClick: true,
          onNext: tourRedirect('sourceNew', '.js-save-source'),
          multipage: true
        },
        {
          content: `
            For the sake of this tour let's just select <em>SQlite</em> as the source type to set up a local in-memory database and give it a name like <em>Demo Source</em>.
            <br><br>
            After that, <b>save</b> and <b>test the connection</b> before continuing to the next step.
          `,
          target: ".type-dropdown",
          placement: "bottom",
          arrowOffset: 250,
          xOffset: -200,
          showCTAButton: true,
          ctaLabel: "Fill out automatically",
          onCTA: function() {
            $('[name=name]').val('Demo Source');
            $('.type-dropdown').dropdown('set selected', 'sqlite');
          },
          onNext: tourRedirect('jobList', '.js-add-job'),
          multipage: true
        },
        {
          title: "Jobs",
          content: `
            Jobs are the center piece of Heimdall and <b>query data</b> from sources either as a one-off or scheduled to run repeatedly.
            <br><br>
            Based on the results you can then send out reports, create visualizations and define alarms.
          `,
          target: ".js-add-job",
          placement: "bottom",
          nextOnTargetClick: true,
          onNext: tourRedirect('jobNew', '.source-dropdown'),
          multipage: true
        },
        {
          content: `
            Let's go on and create our first job using the <em>Demo Source</em> we've been creating before and give it a name, say <em>Demo Job</em>.
            <br><br>
            After that, <b>save</b> and <b>run</b> the job before continuing to the next step.
          `,
          target: '[name=name]',
          placement: 'bottom',
          showCTAButton: true,
          ctaLabel: "Fill out automatically",
          onCTA: function() {
            $('[name=name]').val('Demo Job');

            var source = Sources.findOne({name: 'Demo Source', ownerId: Meteor.userId()});
            $('.source-dropdown').dropdown('set selected', source._id);

            var sql = `SELECT date('now') as date, abs(random()) % 10 as random_10, abs(random()) % 100 as random_100
UNION ALL SELECT date('now', '-1 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-2 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-3 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-4 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-5 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-6 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-7 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-8 day'), abs(random()) % 10, abs(random()) % 100
UNION ALL SELECT date('now', '-9 day'), abs(random()) % 10, abs(random()) % 100`;
            $('.CodeMirror')[0].CodeMirror.doc.setValue(sql);
          }
        },
        {
          content: `create visualization`,
          target: '.js-add-visualization',
          placement: 'bottom'
        }
      ]
    };

    hopscotch.startTour(tour, 4);
  }
});