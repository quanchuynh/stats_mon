Template.reportType.helpers({
  reportTypeExplain: function() {
    var msg = "Monthly Report will generate summation of activities for each month within the given duration.\n" +
              "  If the duration spans multiple years, year-over-year reports also generated for comparison.\n" +
              "Daily Report will generate summation of activities for each day within the given duration.\n";
    return msg;
  }
});

Template.reportType.rendered = function() {
  $('#report-type-item').val(gReportType);
  gReportType = $('#report-type-item').val();
  // console.log("Report type: " + reportType);
};

Template.reportType.events({
  'change #report-type-item': function (evt, template) {
     evt.preventDefault();
     gReportType = $('#report-type-item').val();
     // console.log("Change reportType: " + gReportType);
  }
});

