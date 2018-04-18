domainYoyChart = [];
var globalCategory = 'all';

Template.selectList.helpers({
  selectedDomain: function() {
    return DomainList.find();
  },

  tomorrow: function() {
      var now = moment().add(1, 'day');
      return now.format("MM/DD/YYYY");
    },

  m3old: function() {
      var older = moment().subtract(90, 'day');
      return older.format("MM/DD/YYYY");
    }
});

renderCategoryForDomainChart = function(category) {
  for (var i=0; i < domainYoyChart.length; i++) {
    var chart = domainYoyChart[i];
    chart.storedChart.yoyStats.display = category;
    displayStatCategory(chart.storedChart, chart.storedChart.yoyStats.display, chart.chartObj);
  }
  $('.statCategory').val(category);
}

Template.selectList.rendered = function() {
  var charts = DomainChart.find({});
  domainYoyChart = [];
  charts.forEach( function(ch) {
    var chartList = domainChartListElement();
    renderChart(ch.monthlyStats.chartId, ch.monthlyStats.data, ch.monthlyStats.title, chartList, 'Thousands');
    var chart = renderChartCategory(ch.yoyStats.chartId, ch.yoyStats.data, ch.yoyStats.title, 
                    chartList, ch.yoyStats.categories, 'Thousands');
    domainYoyChart.push({chartId: ch.yoyStats.chartId, chartObj: chart, storedChart: ch});
    displayStatCategory(ch, ch.yoyStats.display, chart);
    var el = $('#' + 'select-' + ch.yoyStats.chartId);
    if (el) {
      el.val(ch.yoyStats.display);
    }
    console.debug("Template.selectList.rendered, chartId: " + ch.yoyStats.chartId);
  });
  renderCategoryForDomainChart(globalCategory);
  $('#global-category-selection').val(globalCategory);
}

Template.selectList.events({
  'change #global-category-selection': function(ev, template) {
     ev.preventDefault();
     renderCategoryForDomainChart(ev.currentTarget.value);
     globalCategory = ev.currentTarget.value;
  },

  'change .statCategory': function(ev, template) {
      /* See renderChartCategory. Allow interactive filtering of stats categories. */
      ev.preventDefault();
      var key = ev.currentTarget.id.replace(/select-/,'').replace(/-yoy/,'');
      var useKey = DomainChart.findOne({key: key});
      if (useKey) {
        var chart = _.where(domainYoyChart, {chartId: key + '-yoy'});
        if (chart) {
          displayStatCategory(useKey, ev.currentTarget.value, chart[0].chartObj);
          useKey.yoyStats.display = ev.currentTarget.value;
          DomainChart.remove({key: key});
          DomainChart.insert(useKey);
        }
      }
    },

  'click #clear_select_list': function(ev) {
      ev.preventDefault();
      var chartList = domainChartListElement();
      chartList.empty();  // Remove all charts first. Needed to clear check box.
      var checkList = DomainList.find({}, {sort: {'domain': 1}} );
      checkList.forEach( function(tp) {
        var boxId = ('#' + tp.domain.replace(/\./g, '_')).trim();
        clearCheckBox(boxId);
      });
      DomainList.remove({});
      {
        checkList = DomainList.find(); 
        console.debug(checkList.count() + " domains after removed all");
      }
      DomainChart.remove({});
      clearCheckbox();
      console.debug("Unselected all domains")
    },

  'click #select_all_list': function(ev, template) {
      ev.preventDefault();
      var checkList = Domain.find({});
      DomainList.remove({});
      checkList.forEach( function(tp) {
        /* IMPORTANT: can only select those items currently displayed. */
        var boxId = ('#' + tp.domain.replace(/\./g, '_')).trim();
        setCheckBox(boxId);
        var box1 = template.find(boxId);
        DomainList.insert(tp);
      });
    },

  'click #submit_query': function(ev, template) {
      ev.preventDefault();
      $('#global-category-selection').val('all');
      globalCategory = 'all';
      var tInfo = getDateRangeParam();
      var fromDate = Session.get(tInfo.fromDateKey);
      var toDate = Session.get(tInfo.toDateKey);
      var fDt = moment(fromDate, "MM/DD/YYYY");         // from date-picker format
      var tDt = moment(toDate, "MM/DD/YYYY");
      console.debug("Query for date range: " + fromDate + " to " + toDate);

      domainYoyChart = [];
      DomainChart.remove({});
      var checkList = DomainList.find({}, {sort: {'domain': 1}} );
      if (checkList.count() == 0) { 
        alert("No domain selected. Please select at least 1 domain for stats reporting.") 
        return;
      }
      console.debug(checkList.count() + " selected domains");

      var chartList = domainChartListElement();
      chartList.empty();  // Remove all charts first.
      checkList.forEach( function(tp) {
        var charId = tp.domain.replace(/\./g, '_');
        var storedChart = {key: charId}; 
        Meteor.call('getStatsForDomain', fDt.format("YYYY-MM-DD"), tDt.format("YYYY-MM-DD"), tp.domain,
          function(err, result) {
            if (err) { console.error("Error: " + err); return; }
            storedChart.monthlyStats = {chartId: charId, data: result, title: tp.domain + " Monthly Stats"};
            renderChart(charId, result, tp.domain + " Monthly Stats", chartList, 'Thousands');
          }
        );
        Meteor.call('getStatsForDomainYOY', fDt.format("YYYY-MM-DD"), tDt.format("YYYY-MM-DD"), tp.domain,
          function(err, result) {
            if (err) { console.error("getStatsForDomainYOY Error: " + err); return; }
            var yoyCharId = charId + "-yoy";
            var chart = renderChartCategory(yoyCharId, result.columns, tp.domain + " Year-Over-Year Stats", 
                    chartList, result.categories, 'Thousands');
            storedChart.yoyStats = {chartId: yoyCharId, data: result.columns, 
                                    title: tp.domain + " Year-Over-Year Stats", categories: result.categories,
                                    queryName: result.queryName, documentName: result.documentName, 
                                    mediaName: result.mediaName, display: 'all'};
            domainYoyChart.push({chartId: yoyCharId, chartObj: chart, storedChart: storedChart});
            console.debug("Template.selectList.rendered, chartId: " + yoyCharId);
            DomainChart.insert(storedChart);
          }
        );
      });
    }

});
