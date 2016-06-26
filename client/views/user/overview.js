Template.userOverview.helpers({
  groups: () => Meteor.user().groups.sort()
});

Template.userOverview.events({
  'submit form': function(event, template) {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), {
      $set: {
        'profile.icon': template.find('[name=icon]').value
      }
    });
  }
});