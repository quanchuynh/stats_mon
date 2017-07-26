/*
 * 
 */
Template.dateRange.helpers({
  tomorrow: function() {
      if (gToDate) return gToDate;
      gToDate = moment().add(1, 'day').format("MM/DD/YYYY");
      return gToDate;

      /* tInfo is not yet valid when this is called. 
        var tInfo = getDateRangeParam();
        Session.set(tInfo.toDateKey, now);
        console.log("tomorrow(): " + now + ", key: " + tInfo.fromDateKey); */
  },

  m3old: function() {
      if (gFromDate) return gFromDate;
      gFromDate = moment().subtract(3, 'month').format("MM/DD/YYYY");
      return gFromDate;
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
    Session.set(tInfo.toDateKey, gToDate);
    Session.set(tInfo.fromDateKey, gFromDate);
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
      gToDate = toDate;
      gFromDate = fromDate;
   },

   /* Recommended by Meteor, use 'blur' instead of 'change' */
   'blur .drange': function(evt, template) {
      Session.set(evt.currentTarget.id, evt.currentTarget.value);
      evt.preventDefault();
      // console.log("Change: " + evt.currentTarget.id + " to " + evt.currentTarget.value);

      var tInfo = getDateRangeParam();
      gFromDate = Session.get(tInfo.fromDateKey);
      gToDate = Session.get(tInfo.toDateKey);
   }
});

