var currentDomainItemCount = 0;
var currentProductItemCount = 0;

setCheckBox = function(checkBoxId) {
  var box = $(checkBoxId);
  if (box) {
    box.prop("checked", true);
  }
}

domainChartListElement = function() {
  /* Use this to render domain (e.g. academic.eb.com) charts. */
  return $("#domainChartList");  /* This is defined in template/selectList.html */
}

productChartListElement = function() {
  /* Use this to render product (e.g. Britannica Online Academic Edition) charts. */
  return $("#productChartList");  /* This is defined in template/product.html */
}

accountChartListElement = function() {
  /* Use this to product (e.g. Britannica Online Academic Edition) charts. */
  return $("#account_chart_list");  /* This is defined in template/account.html */
}

dynamicChartListElement = function(idString) {
  return $('#' + idString);
}

clearCheckBox = function(checkBoxId) {
  var box = $(checkBoxId);
  if (box) {
    box.prop("checked", false);
  }
}

redrawCheckBox = function(settings) {
  // Don't draw the first time so screen will not jump (a work-around to table library)
  if (settings.iDraw == 1) return;  

  var path = Router.current().route.path().replace(/\//g, '').toLowerCase();
  var count = 0;
  if (path == 'domain') markkDomainBoxAsNeeded();
  else markProductBoxAsNeeded();
}

markkDomainBoxAsNeeded = function() {
  markDomainCheckBox();
}

markProductBoxAsNeeded = function(count) {
  markProductCheckBox();
}

countDiplayDomainItem = function() {
  /* Count domains which are displayed on current page. */
  var count = 0;
  var allItem = Domain.find({});
  allItem.forEach( function(tp) {
     var boxId = ('#' + tp.domain.replace(/\./g, '_')).trim();
     if ($(boxId).attr('name')) {
       count++;
     }
  });
  return count;
}

markDomainCheckBox = function() {
  var checkList = DomainList.find({});
  checkList.forEach( function(tp) {
     var boxId = ('#' + tp.domain.replace(/\./g, '_')).trim();
     setCheckBox(boxId);
  });
  console.log("markDomainCheckBox called");
}

displayStatCategory = function(storedChart, displayOption, chart) {
  /* 
   * storedChart: Chart ID.
   * displayOption: option returned by user's selection on Document, Queries, Media.
   * chart: Chart object returned by rendering function.
   */
  /* See function renderProductChartCategory for displayOption values */
  switch (displayOption)
  {
    case 'query':
      // console.log("displayStatCategory: " + 'display query');
      hideAllStatCategory(storedChart, chart);
      chart.show(storedChart.yoyStats.queryName);
      chart.legend.show(storedChart.yoyStats.queryName);
      break;
    case 'doc':
      // console.log("displayStatCategory: " + 'display document');
      hideAllStatCategory(storedChart, chart);
      chart.show(storedChart.yoyStats.documentName);
      chart.legend.show(storedChart.yoyStats.documentName);
      break;
    case 'media':
      // console.log("displayStatCategory: " + 'display media');
      hideAllStatCategory(storedChart, chart);
      chart.show(storedChart.yoyStats.mediaName);
      chart.legend.show(storedChart.yoyStats.mediaName);
      break;
    default:
      // console.log("displayStatCategory: " + 'display all');
      showAllStatCategory(storedChart, chart);
  }
}

hideAllStatCategory = function(storedChart, chart) {
  chart.hide(storedChart.yoyStats.queryName);
  chart.hide(storedChart.yoyStats.documentName);
  chart.hide(storedChart.yoyStats.mediaName);

  chart.legend.hide(storedChart.yoyStats.queryName);
  chart.legend.hide(storedChart.yoyStats.documentName);
  chart.legend.hide(storedChart.yoyStats.mediaName);
}

showAllStatCategory = function(storedChart, chart) {
  chart.show(storedChart.yoyStats.queryName);
  chart.show(storedChart.yoyStats.documentName);
  chart.show(storedChart.yoyStats.mediaName);

  chart.legend.show(storedChart.yoyStats.queryName);
  chart.legend.show(storedChart.yoyStats.documentName);
  chart.legend.show(storedChart.yoyStats.mediaName);
}

prepareProductNameForId = function(productName) {
  /* Product can not be used as HTML ID of an element. Convert it so it's compatible. */
  var idName = productName.replace(/ /g, '_').replace(/\(/g, '').replace(/\)/g,'');
  idName = idName.replace(/\*/g, '_').replace(/\//g, '-').replace(/^21/, '').trim();
  idName = idName.replace(/\:/g, '_');
  idName = idName.replace(/\./g, '_');

  /* 21st ... is the only product w/ preceding digits. */
  return idName;
}

xLabelFromReportType = function(reportType) {
  /* Return x-axis labeling. See reportType.html for possible values. */
  if (reportType == 'month') return 'Month';
  if (reportType == 'day') return 'Date';
  return reportType;  /* Unknown type. */
}

renderChart = function(charId, columnData, title, chartList, unit, subtitle = null, 
                hotlink = false, xLabel = 'Month') {
  /* Use this to render bar charts of domain/product/account over a date range. */
  chartList.append("<h4><center>" + title + "</center></h4");
  if (subtitle) {
    chartList.append("<p><center><small>" + subtitle + "</small></center></p");
  }
  chartList.append("<div id=\"" + charId + "\"></div>");
  var chartIdS = ('#' + charId).trim();
  var el = $(chartIdS);
  if (el) {
    /* console.log("Selected: " + chartIdS); */
    el.attr('name', 'Test Name');
    if (hotlink) el.attr('class', 'blue-tick');
  }
  var tickValues = [];
  for (i = 1; i < columnData[0].length; i++) {
    columnData[0][i] = moment(columnData[0][i]).add(1, 'day');
    tickValues.push(columnData[0][i]);
  }
  var charData = {
       bindto: chartIdS,
       legend: { position: 'right' },
       data: {
         x: 'x',
         columns: columnData,
         type: 'bar',
         onclick: function(e) { 
           console.log("This works w/ firefox, but no chrome or opera: " + e.value);
         }
       },
       bar: { width: { ratio: 0.4 } },
       zoom: { enabled: true, rescale: true },
       axis: {
         x: {
           type: 'timeseries',
           tick: {
             count: columnData[0].length - 1,
             values: tickValues,
             rotate: 60,
             format: '%Y-%m-%d'
           },
           label: {
             text: xLabel,
             position: 'outer-center'
           }
         },
         y: {
           label: {
             text: 'Page View in ' + unit,
             position: 'outer-middle'
           }
         }
       }
     }
  return c3.generate(charData);
}

renderStatCategorySelection = function(charId) {
  var selection = '<select class="input-xlarge statCategory right" id="select-' + charId + '">' +
                     '<option value="all">All Categories</option>' +
                     '<option value="query">Query</option>' +
                     '<option value="doc">Document</option>' +
                     '<option value="media">Media</option>' +
                  '</select>';
  return selection;
}

renderChartCategory = function(charId, columnData, title, chartList, months, unit, subtitle = null) {
  /* 
   * Use this to render domain/product/account chart for year-over-year comparison
   * Categories are the 12 months
   */
  chartList.append("<h4><center>" + title + "</center></h4");
  if (subtitle) {
    chartList.append("<p><center><small>" + subtitle + "</small></center></p");
  }
  /*
  var selection = '<select class="input-xlarge statCategory right" id="select-' + charId + '">' +
                     '<option value="all">All Categories</option>' +
                     '<option value="query">Query</option>' +
                     '<option value="doc">Document</option>' +
                     '<option value="media">Media</option>' +
                  '</select>';
                  */
  var selection = renderStatCategorySelection(charId);
  chartList.append(selection);
  chartList.append("<div id=\"" + charId + "\"></div>");
  var chartIdS = ('#' + charId).trim();
  var charData = {
       bindto: chartIdS,
       padding: { right: 100 },
       legend: { position: 'right' },
       data: {
         columns: columnData,
         type: 'line',
       },
       bar: { width: { ratio: 0.4 } },
       zoom: { enabled: true },
       axis: {
         x: {
           type: 'category',
           categories: months,
           tick: {
             rotate: 60
           },
           label: {
             text: 'Month',
             position: 'outer-center'
           }
         },
         y: {
           label: {
             text: 'Page View in ' + unit,
             position: 'outer-middle'
           }
         }
       }
     }
  return c3.generate(charData);
}

countDiplayProductItem = function() {
  /* Count number of products current displayed on this page. */
  var count = 0;
  var allItem = Product.find({});
  allItem.forEach( function(tp) {
     var boxId = ('#' + prepareProductNameForId(tp.product));
     if ($(boxId).attr('name')) {
       count++;
     }
  });
  return count;
}

markProductCheckBox = function() {
  var checkList = ProductList.find({});
  console.log("markProductCheckBox count: " + checkList.count());
  checkList.forEach( function(tp) {
     var boxId = ('#' + prepareProductNameForId(tp.product));
     setCheckBox(boxId);
  });
  console.log("markProductCheckBox called");
}

emptyProductList = function() {
  ProductList.remove({});
}

removeOneFromProductList = function(obj) {
  ProductList.remove(obj);
}

setCurrentBoatAccount = function(accountId, accountName) {
  gCurrentAccountId = accountId;
  gCurrentAccountName = accountName;
}

unhighlightUserSelectList = function( ) {
  $('.select_account_drop_down').removeClass('highlight-user-drop-down');
}

unhighlightEnterAccount = function( ) {
  $('#select_account').removeClass('highlight-user-drop-down');
}

highlightEnterAccount = function( ) {
  $('#select_account').addClass('highlight-user-drop-down');
  return '#select_account';
}

highlightAccountSelectBox = function(elementId) {
  $(elementId).addClass('highlight-user-drop-down');
}
