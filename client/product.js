productYoyChart = []; /* Store charts to render when switching tab */
var globalCategory = 'all';

Template.product.helpers({
  productName: function() {
    return ProductList.find();
  },

  tomorrow: function() {
      var now = moment().add(1, 'day');
      return now.format("MM/DD/YYYY");
    },

  m3old: function() {
      var older = moment().subtract(90, 'day');
      return older.format("MM/DD/YYYY");
    },

  productStats: function() {
    var msg = "Stats reports for specified product(s) for given date range. These reports \n" +
              "are in graphs for easy trend visualization. To run reports check those\n" +
              "interested products in the list below, then click submit\n";
    return msg;
  }
});

Template.product.rendered = function() {
  var charts = ProductChart.find({});
  productYoyChart = [];
  charts.forEach( function(ch) {
    var chartList = productChartListElement();
    renderChart(ch.monthlyStats.chartId, ch.monthlyStats.data, ch.monthlyStats.title, chartList, 'Thousands');
    var chart = renderChartCategory(ch.yoyStats.chartId, ch.yoyStats.data, ch.yoyStats.title, 
                    chartList, ch.yoyStats.categories, 'Thousands');
    productYoyChart.push({chartId: ch.yoyStats.chartId, chartObj: chart, storedChart: ch});
    displayStatCategory(ch, ch.yoyStats.display, chart);
    var el = $('#' + 'select-' + ch.yoyStats.chartId);
    if (el) {
      el.val(ch.yoyStats.display);
    }
    // console.log("Template.product.rendered, chartId: " + ch.yoyStats.chartId);
  });
  renderCategoryForProductChart(globalCategory);
  $('#global-category-selection').val(globalCategory);
}
renderCategoryForProductChart = function(category) {
  for (var i=0; i < productYoyChart.length; i++) {
    var chart = productYoyChart[i];
    chart.storedChart.yoyStats.display = category;
    displayStatCategory(chart.storedChart, chart.storedChart.yoyStats.display, chart.chartObj);
  }
  $('.statCategory').val(category);
}

Template.product.events({
  'change #global-category-selection': function(ev, template) {
     ev.preventDefault();
     renderCategoryForProductChart(ev.currentTarget.value);
     globalCategory = ev.currentTarget.value;
  },

  'change .statCategory': function(ev, template) {
      /* See renderChartCategory. Allow interactive filtering of stats categories. */
      ev.preventDefault();
      var key = ev.currentTarget.id.replace(/select-/,'').replace(/-yoy/,'');
      var useKey = ProductChart.findOne({key: key});
      if (useKey) {
        var chart = _.where(productYoyChart, {chartId: key + '-yoy'});
        if (chart) {
          displayStatCategory(useKey, ev.currentTarget.value, chart[0].chartObj);
          useKey.yoyStats.display = ev.currentTarget.value;
          ProductChart.remove({key: key});
          ProductChart.insert(useKey);
        }
      }
    },

  'click #clear_select_list': function(ev) {
      ev.preventDefault();
      var chartList = productChartListElement();
      chartList.empty();  // Remove all charts first. Needed to clear check box.
      var checkList = ProductList.find({}, {sort: {'product': 1}} );
      checkList.forEach( function(tp) {
        var boxId = ('#' + prepareProductNameForId(tp.product));
        clearCheckBox(boxId);
      });
      emptyProductList();
      ProductChart.remove({});
      // console.log("Unselected all product")
      clearCheckbox();
    },

  'click #select_all_list': function(ev, template) {
      ev.preventDefault();
      var checkList = Product.find({});
      emptyProductList();
      checkList.forEach( function(tp) {
        /* IMPORTANT: can only select those items currently displayed. */
        var boxId = ('#' + prepareProductNameForId(tp.product));
        setCheckBox(boxId);
        var box1 = template.find(boxId);
        ProductList.insert(tp);
      });
    },

  'click #submit_query': function(ev, template) {
      ev.preventDefault();
      $('#global-category-selection').val('all');
      var tInfo = getDateRangeParam();
      var fromDate = Session.get(tInfo.fromDateKey);
      var toDate = Session.get(tInfo.toDateKey);
      var fDt = moment(fromDate, "MM/DD/YYYY");         // from date-picker format
      var tDt = moment(toDate, "MM/DD/YYYY");
      // console.log("Query for date range: " + fromDate + " to " + toDate);

      productYoyChart = [];
      ProductChart.remove({});
      var checkList = ProductList.find({}, {sort: {'product': 1}} );
      if (checkList.count() == 0) { 
        alert("No product selected. Please select at least 1 product for stats reporting.") 
        return;
      }

      var chartList = productChartListElement();
      chartList.empty();  // Remove all charts first.
      checkList.forEach( function(tp) {
        var charId = prepareProductNameForId(tp.product);
        var storedChart = {key: charId}; 
        Meteor.call('getStatsForProduct', fDt.format("YYYY-MM-DD"), tDt.format("YYYY-MM-DD"), tp.product,
          function(err, result) {
            if (err) { console.log("Error: " + err); return; }
            storedChart.monthlyStats = {chartId: charId, data: result, title: tp.product + " Monthly Stats"};
            renderChart(charId, result, tp.product + " Monthly Stats", chartList, 'Thousands');
          }
        );
        Meteor.call('getStatsForProductYOY', fDt.format("YYYY-MM-DD"), tDt.format("YYYY-MM-DD"), tp.product,
          function(err, result) {
            if (err) { console.log("getStatsForDomainYOY Error: " + err); return; }
            var yoyCharId = charId + "-yoy";
            var chart = renderChartCategory(yoyCharId, result.columns, tp.product + " Year-Over-Year Stats", 
                    chartList, result.categories, 'Thousands');
            storedChart.yoyStats = {chartId: yoyCharId, data: result.columns, 
                                    title: tp.product + " Year-Over-Year Stats", categories: result.categories,
                                    queryName: result.queryName, documentName: result.documentName, 
                                    mediaName: result.mediaName, display: 'all'};
            productYoyChart.push({chartId: yoyCharId, chartObj: chart, storedChart: storedChart});
            // console.log("Template.product.rendered, chartId: " + yoyCharId);
            ProductChart.insert(storedChart);
            var checkList = ProductList.find({});
            // console.log("ProductList count: " + checkList.count());
          }
        );
      });
    }
});
