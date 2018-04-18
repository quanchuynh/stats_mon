/*
 * 
 */
Template.dateRange.helpers({
  tomorrow: function() {
      return GlobalState.toDate();
  },

  m3old: function() {
      return GlobalState.fromDate();
  }
});

Template.dateRange.rendered = function() {
  /* Don't use onRendered, use rendered instead */
  var tInfo = getDateRangeParam();
  tInfo.log();
  $('#' + tInfo.fromDatePicker).datetimepicker(); // have datetimepicker control the input
  $('#' + tInfo.toDatePicker).datetimepicker();
  var fromDate = Session.get(tInfo.fromDateKey);
  var toDate = Session.get(tInfo.toDateKey);
  var result = Session.get(tInfo.resultKey);
  if (fromDate && toDate) {
      var fDt = moment(fromDate, "MM/DD/YYYY");			// from date-picker format
      var tDt = moment(toDate, "MM/DD/YYYY");
  }
  else {
    Session.set(tInfo.toDateKey, GlobalState.toDate());
    Session.set(tInfo.fromDateKey, GlobalState.fromDate());
  }
};

storeDateRangeInSession = function(evt, template) {
  var tInfo = getDateRangeParam();
  evt.preventDefault();
  var fromDate = template.find('#' + tInfo.fromDatePicker).value;
  var toDate = template.find('#' + tInfo.toDatePicker).value;
  Session.set(tInfo.fromDateKey, fromDate);
  Session.set(tInfo.toDateKey, toDate);
  return tInfo;
}

Template.dateRange.events({
  'click button': function (evt, template) {
      // Retrieve input parameters and store in session object when user click submit button
      evt.preventDefault();
      var tInfo = getDateRangeParam();
      var fromDate = Session.get(tInfo.fromDateKey);
      var toDate = Session.get(tInfo.toDateKey);
      var fDt = moment(fromDate, "MM/DD/YYYY");			// from date-picker format
      var tDt = moment(toDate, "MM/DD/YYYY");
      GlobalState.updateToDate(toDate);
      GlobalState.updateFromDate(fromDate);
   },

   /* Recommended by Meteor, use 'blur' instead of 'change' */
   'blur .drange': function(evt, template) {
      Session.set(evt.currentTarget.id, evt.currentTarget.value);
      evt.preventDefault();
      console.debug("Change: " + evt.currentTarget.id + " to " + evt.currentTarget.value);

      var tInfo = getDateRangeParam();
      GlobalState.updateFromDate(Session.get(tInfo.fromDateKey));
      GlobalState.updateToDate(Session.get(tInfo.toDateKey));
   }
});

