var minDigitForQuery = 0;   // minimum # of characters entered before sending query.
var minCharForQuery = 1;  // minimum # of characters entered before sending query.
var maxDisplayList = 30;
accountChart = [];    /* Store charts for re-rendering when switching tab. */
categoryLookupChart = [];  /* store chart ID and chart object for stats categories selective display */
var accountSearchSequence = 0; /* used for aborting search when new character entered. */
var hideAcordion = false;
accountGlobalCategory = 'all';
var selectSameAccountId = -1; /* Used for checking select same account on drop-down in 'Enter Account' section. */
var lastEnterAccountId = -1;  /* Save 'Enter Account' account ID */

Template.account.helpers({
  defaultAccount: function() {
    return -1;
  },

  account: function() {
    return AccountList.find();
  },

  accountStats: function() {
    var msg = "Stats reports for specified account for given date range. These reports \n" +
              "are in graphs for easy visualization. To run report click on \n" +
              "\"Enter Account\" or \"Use Account Watch Lists\" below.\n";
    return msg;
  },

  enterAccount: function() {
    var msg = "Enter either account ID or name to run starts report on\n";
    return msg;
  },

  useAccountList: function() {
    var msg = "This includes pre-created lists of accounts. Each account\n" +
              " can be selected to run stats report on.\n" +
              " You can add your own list by using\n" + 
              " \"Create a New Account Watch List\" section below.\n";
    return msg;
  },

  createNewAccountList: function() {
    var msg = "Upload a list of account IDs so you can use it\n" +
              "to run reports on each of these accounts";
    return msg;
  }

});

Template.account.events({
  'click .c3-axis-x .tick tspan': function(ev, template) {
    console.log("Click on a tick: " + ev.currentTarget.firstChild.data);
    console.log("This ID:  " + this.id + ", product: " + this.productName);
    var startOfMonth = moment(ev.currentTarget.firstChild.data).startOf('month');
    var endOfMonth = moment(ev.currentTarget.firstChild.data).endOf('month');
    console.log("This ID:  " + gCurrentAccountId + ", product: " + this.productName + 
                ", account: " + gCurrentAccountName);
    console.log("startOfMonth: " + startOfMonth.format("YYYY-MM-DD") + 
                ", endOfMonth: " + endOfMonth.format("YYYY-MM-DD"));
    var tInfo = getDateRangeParam();
    var fromPicker = $('#' + tInfo.fromDatePicker);
    var toPicker = $('#' + tInfo.toDatePicker);
    fromPicker.val(startOfMonth.format("MM/DD/YYYY HH:mm A"));
    toPicker.val(endOfMonth.format("MM/DD/YYYY HH:mm A"));

    Session.set(tInfo.fromDateKey, fromPicker.val());
    Session.set(tInfo.toDateKey, toPicker.val());
    $('#report-type-item').val('day');
    gReportType = 'day';
    renderAccountReport(gCurrentAccountId, gCurrentAccountName);
  },

  'click #accordion-chart': function(ev, template) {
    console.log("Accordion click event");
  },

  'change .statCategory': function(ev, template) {
    ev.preventDefault();
    var chartId = ev.currentTarget.id.replace(/select-/,'');
    var chart = _.where(categoryLookupChart, {chartId: chartId});
    if (chart) {
      displayStatCategory(chart[0].storedChart, ev.currentTarget.value, chart[0].chartObj);
      chart[0].storedChart.yoyStats.display = ev.currentTarget.value;
    }
  },

  'change #global-category-selection': function(ev, template) {
    ev.preventDefault();
    for (var i=0; i < categoryLookupChart.length; i++) {
      var chart = categoryLookupChart[i];
      chart.storedChart.yoyStats.display = ev.currentTarget.value;
      displayStatCategory(chart.storedChart, chart.storedChart.yoyStats.display, chart.chartObj);
    }
    $('.statCategory').val(ev.currentTarget.value);
    accountGlobalCategory = ev.currentTarget.value;
  },

  'click #submit_single_account': function(ev, template) {
     var accountId = template.find('#select_account').value;   /* IMPORTANT: don't use cammel case for id of HTML */
     if (!accountId) {
       alert("Please select an account");
       return;
     }
     ev.preventDefault();
     var statusUpdate = $('#account-report-render');
     statusUpdate.text(0);
     ProductForSingleAccount.remove({});
     accountChartListElement().empty();
     $('#global-category-selection').val('all');
     var accountName = $('#account_name').val();
     accountGlobalCategory = 'all';
     unhighlightUserSelectList();
     gHighLightSelect = highlightEnterAccount();
     setCurrentBoatAccount(accountId, accountName);
     renderAccountReport(accountId, accountName);
  },

  'click #hide-accordion': function(ev, template) {
     ev.preventDefault();
     console.log("Hide accordion");
     $("#accordion-chart li ul").hide();
  },

  'keyup #account_id': function(ev, template) {
     ev.preventDefault();
     /* Without ev.preventDefault we would get "Uncaught Error: Must be attached" from Blaze template
      * (see https://github.com/meteor/meteor/issues/2981 )
      */

     var accountId = template.find('#account_id').value;
     if (accountId.length > minDigitForQuery) {
       processAccountOnIdFastQuery(accountId, 5000);
     }
  },

  'keyup #account_name': function(ev, template) {
     ev.preventDefault(); /* prevent "Uncaught Error: Must be attached" from Blaze template */
     var accountName = template.find('#account_name').value;
     accountSearchSequence++;
     if (accountName.length > minCharForQuery) {
       processAccountOnNameFastQuery(accountName, 5000);
     }
  },

  'click #select_account': function(ev, template) {
     var accountId = template.find('#select_account').value;
     if (accountId == selectSameAccountId) {
       /* Mouse up, update input */
       selectSameAccountId = -1;
       updateEnterAccountInput(accountId);
       lastEnterAccountId = accountId;
     }
     else {
       /* Mouse down. */
       selectSameAccountId = accountId;
     }
  },

  'change #select_account': function(ev, template) {
     /* User select an account from "Enter Account" section. Update left fields to reflect that. */
     var accountId = template.find('#select_account').value;   /* IMPORTANT: don't use cammel case for id of HTML */
     lastEnterAccountId = accountId;
     updateEnterAccountInput(accountId);
  }
});

updateEnterAccountInput = function(accountId) {
  /* Work-around to findOne({account_id: accountId}). */
  var list = AccountList.find({}).fetch();
  for (i = 0; i < list.length; i++) {
    if (accountId == list[i].account_id) {
      $('#account_name').val(list[i].account_name);
      break;
    }
  }
  $('#account_id').val(accountId);
}


Template.account.rendered = function() {
  $('#global-category-selection').val(accountGlobalCategory);
  if (gHighLightSelect) highlightAccountSelectBox(gHighLightSelect);
  if (lastEnterAccountId != -1) $('#select_account').val(lastEnterAccountId).change();
  renderAccountAccordion();
  Meteor.setTimeout(delayRender, 500); // delay 500 miliseconds before rendering
}

delayRender = function() {
  renderResultChart(accountChart);
}

updateAccountSelectList =  function(err, result, whichToUpdate) {
  /* Update account list in 'Enter Account' section */
  if (err) { console.log("Error: " + err); return; }
  if (result.rows.length > 0) AccountList.remove({});
  else return;

  if (whichToUpdate == 'account_name')
    $('#account_name').val(result.rows[0].account_name);
  else
    $('#account_id').val(result.rows[0].account_id);
  
  for (var i=0; i < result.rows.length; i++) {
    var aRow = result.rows[i];
    if (i > maxDisplayList) break;
    AccountList.insert({account_id: aRow.account_id, account_name: aRow.account_name});
  }
  if (result.rows.length > maxDisplayList) {
     var moreString = "Too many for displaying, > " + result.rows.length + " matches found";
     AccountList.insert({account_id: -1, account_name: moreString});
  }
}

renderResultChart = function(result) {
  ProductForSingleAccount.remove({});

  /* Render all charts returned by Query. Can also be used for switching tab. */
  var chartList = accountChartListElement(); /* render charts in this element. */
  chartList.empty();  /* Clean up first */
  var shouldStoreChart = (categoryLookupChart.length == 0);

  if (result.length > 0) {
    firstChart = result[0];
    chartList.append(firstChart.subtitle);
  }
  var statusUpdate = $('#account-report-render');
  statusUpdate.text(0);
  for (var i = 0; i < result.length; i++) {
    statusUpdate.text(i);
    aChart = result[i];
    var chartObject = {};
    if (!(aChart.productName === undefined || aChart.productName == null)) {
      var productAsId = prepareProductNameForId(aChart.productName);
      ProductForSingleAccount.insert({productName: aChart.productName, id: productAsId, 
                                      total: aChart.total, avg: aChart.avg, min: aChart.min, max: aChart.max});
      chartList = dynamicChartListElement(productAsId);
    }
    if (aChart.chartType == "date") {
      var hotlink = (gReportType == 'month');
      var xLabel = xLabelFromReportType(gReportType);
      chartObject = renderChart(aChart.chartId, aChart.chartData, aChart.title, chartList, 'Unit', 
                       aChart.subtitle, hotlink, xLabel);
    }
    if (aChart.chartType == "category") { 
      chartObject = renderChartCategory(aChart.chartId, aChart.chartData.columns, 
        aChart.title, chartList, aChart.chartData.categories, 'Unit', aChart.subtitle);
      if (shouldStoreChart) {
        var storedChart = {};
        storedChart.yoyStats = {chartId: aChart.chartId, data: aChart.chartData.columns,
                                title: aChart.title, categories: aChart.chartData.categories,
                                queryName: aChart.chartData.queryName, documentName: aChart.chartData.documentName,
                                mediaName: aChart.chartData.mediaName, display: 'all'};
        categoryLookupChart.push({chartId: aChart.chartId, chartObj: chartObject, storedChart: storedChart});
      }
      var chart = _.where(categoryLookupChart, {chartId: aChart.chartId});
      if (chart) {
        chart[0].chartObj = chartObject;
        $('#select-' + aChart.chartId).val(chart[0].storedChart.yoyStats.display);
        Meteor.setTimeout( function() {
          displayStatCategory(chart[0].storedChart, chart[0].storedChart.yoyStats.display, chart[0].chartObj);
        }, 100);
      }
    }
  }
  renderProductAsAccordion();
}

quickUpdateAccountSelectList =  function(err, result) {
  if (result.rows.length > 0) {
    AccountList.remove({});
    var aRow = result.rows[0];
    AccountList.insert({account_id: aRow.account_id, account_name: aRow.account_name});
  }
}

renderAccountAccordion = function() {
  var element = $('#account-accordion');
  element.dcAccordion({
    eventType: 'click',
    menuClose: true,
    autoClose: false,
    saveState: true,
    disableLink: false,
    showCount: false,
    speed: 'slow'
  });
}

processAccountOnId = function(accountId, accountSearchSequence) {
  Meteor.call('getAccountOnId', accountId, accountSearchSequence, 
    function(err, result) {
      var accountId = $('#account_id').val();
      qResult = result.queryResult;
      if (qResult.rows.length == 0) {
        // console.log("No matching account found for name: " + accountName);
        return;
      }
      var whichToUpdate = 'account_name';   /* User change ID, update name to match */
      if (qResult.length == 0) return;
      if (result.sequence < accountId.length) {
        processAccountOnId(accountId, accountId.length);
        return;
      }
      updateAccountSelectList(err, qResult, whichToUpdate);
    }
  );
}

processAccountOnName = function(accountName, accountSearchSequence) {
  Meteor.call('getAccountOnName', accountName, accountSearchSequence,
    function(err, result) {
      var accountName = $('#account_name').val();
      qResult = result.queryResult;
      if (qResult.rows.length == 0) {
        // console.log("No matching account found for name: " + accountName);
        return;
      }
      var whichToUpdate = 'account_id';   /* User change name, update ID to match */
      if (result.sequence < accountName.length) {
        // console.log("Longer name entered, abandon short name"); 
        processAccountOnName(accountName, accountName.length);
        return;
      }
      updateAccountSelectList(err, qResult, whichToUpdate);
    }
  )
}

processAccountOnIdFastQuery = function(accountId, accountSearchSequence) {
  Meteor.call('getAccountHaveStatsOnId', accountId, accountSearchSequence, 
    function(err, result) {
      var accountId = $('#account_id').val();
      qResult = result.queryResult;
      if (qResult.rows.length == 0) {
        /* Switch to more complete slower query */
        processAccountOnId(accountId, accountId.length);
        return;
      }
      var whichToUpdate = 'account_name';   /* User change ID, update name to match */
      if (qResult.length == 0) return;
      if (result.sequence < accountId.length) {
        processAccountOnIdFastQuery(accountId, accountSearchSequence);
        return;
      }
      updateAccountSelectList(err, qResult, whichToUpdate);
    }
  );
}

processAccountOnNameFastQuery = function(accountName, accountSearchSequence) {
  Meteor.call('getAccountHaveStatsOnName', accountName, accountSearchSequence,
    function(err, result) {
      var accountName = $('#account_name').val();
      qResult = result.queryResult;
      if (qResult.rows.length == 0) {
        console.log("Switch to slower more complete query");
        processAccountOnName(accountName, accountName.length);
        return;
      }
      var whichToUpdate = 'account_id';   /* User change name, update ID to match */
      if (result.sequence < accountName.length) {
        // console.log("Longer name entered, abandon short name"); 
        processAccountOnNameFastQuery(accountName, accountSearchSequence);
        return;
      }
      updateAccountSelectList(err, qResult, whichToUpdate);
    }
  )
}
