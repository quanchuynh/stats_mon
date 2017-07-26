/* Utility functions common to template "dateRange" */
getDateRangeParam = function() {
  // Get parameters passed into dateRange template (see dateRange.html)
  var fromSuffix = '_fromPicker', toSuffix = '_toPicker', chartSuffix = '_chart';

  var id = {};
  id.name = $('#dateRange').attr('name');		// See the submit button dateRange.html
  id.title = $('#drange_button').val();

  id.chartId = id.name + chartSuffix;
  id.methodName = $('#' + id.chartId).attr('data-method');
  id.fromDatePicker = id.name + fromSuffix;
  id.toDatePicker = id.name + toSuffix;

  id.fromDateKey = id.name + fromSuffix;       // Session key
  id.toDateKey = id.name + toSuffix;
  id.resultKey = id.name + '_result';

  id.log = function() {
    console.log("date range params: " + JSON.stringify(id));
  }
  return id;
}

formatDates = function(id) {
  var toDate = $('#' + id.toDatePicker).val();
  var fromDate = $('#' + id.fromDatePicker).val();
  id.fDt = moment(fromDate, "MM/DD/YYYY");
  id.tDt = moment(toDate, "MM/DD/YYYY");
  return id;
}
