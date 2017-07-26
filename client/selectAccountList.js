var selectSameAccountId = -1; /* used to check if you select the same account form drop-down manu. */

/*
 * Create List section which includes uploading the custom report topic file.
 */
Template.selectAccountList.helpers({
  selectedList: function() {
    var list = [{"acct_id":"7655565","account_name":"HENNEPIN TECHNICAL COLLEGE-EDEN PRAIRIE"}];
    var found = CustomAccountList.findOne({_id: this._id});
    if (found) {
      list = found.accountList;
    }
    return list;
  }
});

Template.selectAccountList.events({
  'change .select_account_drop_down': function(ev, template) {
    var elementId = '#' + this._id;
    var boatId = $(elementId).val();
    selectSameAccountId = -1;
    var accountName = $(elementId + ' option:selected').attr("name");
    unhighlightUserSelectList(); 
    unhighlightEnterAccount();
    gHighLightSelect = elementId;
    highlightAccountSelectBox(gHighLightSelect);
    setCurrentBoatAccount(boatId, accountName);
    renderAccountReport(boatId, accountName);
    $('#global-category-selection').val('all');
  },

  'click .select_account_drop_down': function(ev, template) {
    var elementId = '#' + this._id;
    var boatId = $(elementId).val();
    console.log("Boat ID: " + boatId);
    if (selectSameAccountId == boatId) {
      selectSameAccountId = -1;
      var accountName = $(elementId + ' option:selected').attr("name");
      unhighlightUserSelectList();
      unhighlightEnterAccount();
      gHighLightSelect = elementId;
      highlightAccountSelectBox(gHighLightSelect);
      setCurrentBoatAccount(boatId, accountName);
      renderAccountReport(boatId, accountName);
      $('#global-category-selection').val('all');
    }
    else {
      selectSameAccountId = boatId;
    }
  }
});

function toCheckName(name) {
  return name.toLowerCase().replace("'s", "");
}

renderAccountReport = function(accountId, accountName) {
  var tInfo = getDateRangeParam();
  var fromDate = Session.get(tInfo.fromDateKey);
  var toDate = Session.get(tInfo.toDateKey);
  var fDt = moment(fromDate, "MM/DD/YYYY");         // from date-picker format
  var tDt = moment(toDate, "MM/DD/YYYY");
  gToDate = toDate;
  gFromDate = fromDate;
  console.log("Query for date range: " + fromDate + " to " + toDate + ", Account: " + accountId.toString());
  accountSearchSequence = 0;
  var statusUpdate = $('#account-report-render');
  statusUpdate.text(0);
  accountChartListElement().empty();
  ProductForSingleAccount.remove({});
  Meteor.call('getStatsForAccount', accountId, fDt.format("YYYY-MM-DD"), tDt.format("YYYY-MM-DD"), gReportType,
    function(err, result) {
      if (err) { console.log("Error: " + err); return; }
      if (result.length > 0) {
        accountChart = result;
        categoryLookupChart = [];
      }
      if (result.length == 0) {
        alert("Account: " + accountName + " (ID: " + accountId + ") has no stats for duration: " +
             fDt.format("YYYY-MM-DD") + " To " + tDt.format("YYYY-MM-DD"));
        return;
      }
      renderResultChart(result);
    }
  );
}

Template.selectAccountList.rendered = function() {
  if (gHighLightSelect) highlightAccountSelectBox(gHighLightSelect);
}
