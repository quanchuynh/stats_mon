pgDbConfig = new DbConfig("pgDatabase.json");
queryConfig = new PgQueries("pgQueries.json");
hadoopStats = new PgClient( pgDbConfig.findWhere({"connectionName": 'hadoopStats'}).conn );
Future = Npm.require('fibers/future');
var maxAccountSent = 100;  /* Maximum # of accounts sent to client. */


Meteor.methods({
  uploadCustomAccountList: function(listInfo, listData) {
    var boatId = listData.split('\n');
    var accountId = [];
    for (var i=0; i < boatId.length; i++)
    {
      if (isNaN(parseInt(boatId[i])))
        continue;
      accountId.push(parseInt(boatId[i]));
    }

    /* Create account IDs object here. */

    var listId = randomId()
    var repeatId = CustomAccountList.findOne({id: listId});
    while (repeatId) {
      listId = randomId()
      repeatId = CustomAccountList.findOne({id: listId});
    }

    listInfo.id = listId;
    listInfo._id = listId;
    listInfo.accountList = getAccountNameInList(accountId).rows;
    CustomAccountList.insert(listInfo);

    /* FS.collection has asynchronous client/server issue make it harder to use reliably. */
  },

  getStatsForAccount: function(boatAccountId, fromDate, toDate, reportType, productName = 'all') {
    /* Stats for the given boatAccountId within date range. The return result is suitable for rendering charts */
    return getStatsChartForAccount(parseInt0(boatAccountId), fromDate, toDate, reportType, productName);
  },

  getAccountList: function() {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = queryList.getQuery('accountList');
    var queryResult = runHadoopQuery(query);
    return {queryResult: queryResult};
  },

  getAccountHaveStatsOnId: function(boatAccountId, limit) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('accountHaveStatsOnId'), "'" + boatAccountId + "%'");
    console.log("getAccountHaveStatsOnId query: " + query);
    var queryResult = runHadoopQuery(query, limit);
    return {queryResult: queryResult, limit: limit};
  },

  getAccountOnId: function(boatAccountId, sequence) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    /* '%' is special character in _.sprintf, use it outside the query.  */
    var query = _.sprintf(queryList.getQuery('boatAccountOnId'), "'" + boatAccountId + "%'", maxAccountSent);
    var queryResult = runHadoopQuery(query);
    return {queryResult: queryResult, sequence: sequence};
  },

  getAccountHaveStatsOnName: function(boatAccountName, limit) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('accountHaveStatsOnName'), "'%" + boatAccountName + "%'");
    console.log("getAccountHaveStatsOnName query: " + query);
    var queryResult = runHadoopQuery(query);
    return {queryResult: queryResult, limit: limit};
  },

  getAccountOnName: function(boatAccountName, sequence) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('boatAccountOnName'), "'%" + boatAccountName + "%'", maxAccountSent);
    var queryResult = runHadoopQuery(query);
    return {queryResult: queryResult, sequence: sequence};
  },

  getStatsForDomain: function(fromDate, toDate, domainName) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('domainMonthlyStats'), fromDate, toDate, domainName);
    var queryResult = runHadoopQuery(query);
    return dateStatToChart(queryResult, 1000);
  },

  getStatsForProduct: function(fromDate, toDate, productName) {
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('productMonthlyStats'), fromDate, toDate, productName);
    // console.log("Execute Query: " + query);
    var queryResult = runHadoopQuery(query);
    return dateStatToChart(queryResult, 1000);
  },

  getStatsForDomainYOY: function(fromDate, toDate, domainName) {
    /* Build year-over-year comparison */
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('yearOverYearDomainMonthly'), fromDate, toDate, domainName,
                                                  fromDate, toDate, domainName);
    var queryResult = runHadoopQuery(query);
    return yoyStatToChart(queryResult, 1000);
  },

  getStatsForProductYOY: function(fromDate, toDate, productName) {
    /* Build year-over-year comparison */
    var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
    var query = _.sprintf(queryList.getQuery('yearOverYearProductMonthly'), fromDate, toDate, productName,
                                                  fromDate, toDate, productName);
    // console.log("Execute Query: " + query);
    var queryResult = runHadoopQuery(query);
    return yoyStatToChart(queryResult, 1000);
  }

});

parseInt0 = function(value) {
  if (value) return parseInt(value);
  return 0;
}

getDomainProductList = function() {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = _.sprintf(queryList.getQuery('domainProductList'));
  return runHadoopQuery(query);
}

getAccountName = function(accountId) {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = _.sprintf(queryList.getQuery('boatAccountName'), accountId);
  result = runHadoopQuery(query);
  if (result.rows.length > 0)
    return result.rows[0].account_name;
  else
    return "";
}

getProductList = function() {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = _.sprintf(queryList.getQuery('productList'));
  return runHadoopQuery(query);
}

getStatsForAccountFromDb = function(levelName, accountId, startDate, endDate, productDomainName, 
                                    reportType = 'month') {
  /* Get monthly stats for the given date range, product/domain, account ID.
   * levelName: domain, name (name is product name see product_template_group)
   * accountId: an int
   * startDate, endDate: string, e.g. '2013-01-01'
   * productDomainName:
   *   if levelName = 'domain': e.g. 'britannica.com'
   *   if levelName = 'name': e.g. 'Britannica Online Academic Edition (BOLAE)'
   */
  var tableName = 'dc_stats_monthly_rollup';
  if (reportType == 'day') {
    tableName = 'dc_stats_daily_rollup';
  }
  else {
    /* dc_stats_monthly_rollup have data on 1st of each month. Adjust startDate to include 1st always. */
    startOfMonth = moment(startDate).startOf('month').format('YYYY-MM-DD');
    // console.log("Start date for monthly stats: " + startDate + ", first day of month: " + startOfMonth); 
    startDate = startOfMonth;
  }
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = queryList.getQuery('statsForAccount').replace(/:column/g, levelName).
                replace(/:start_date/g, startDate).
                replace(/:end_date/g, endDate).
                replace(/:account_id/g, accountId.toString()).
                replace(/:pname/g, productDomainName).
                replace(/:rollup_table/g, tableName);
  // console.log("statsForAccount query: " + query);
  return runHadoopQuery(query);
}

getAccountNameInList = function(accountIdList) {
  /*
   */
  var accountIdString = arrayToString(accountIdList);
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = _.sprintf(queryList.getQuery('boatAccountNameInList'), accountIdString);
  // console.log("boatAccountNameInList query: " + query);
  return runHadoopQuery(query);
}

getYoyStatsForAccount = function(levelName, accountId, startDate, endDate, productDomainName) {
  /* Get monthly stats for the given date range, product/domain, account ID.
   * levelName: domain, name (name is product name see product_template_group)
   * accountId: an int
   * startDate, endDate: string, e.g. '2013-01-01'
   * productDomainName:
   *   if levelName = 'domain': e.g. 'britannica.com'
   *   if levelName = 'name': e.g. 'Britannica Online Academic Edition (BOLAE)'
   */
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = queryList.getQuery('yoyStatsForAccount').replace(/:column/g, levelName).
                replace(/:start_date/g, startDate).
                replace(/:end_date/g, endDate).
                replace(/:account_id/g, accountId.toString()).
                replace(/:dName/g, productDomainName);
  // console.log("statsForAccount query: " + query);
  return runHadoopQuery(query);
}

getProductListForAccount = function(startDate, endDate, accountId) {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = _.sprintf(queryList.getQuery('productListForAccount'), startDate, endDate, accountId);
  // console.log("getProductListForAccount query:\n" + query);
  return runHadoopQuery(query);
}

getDomainListForProductAccount = function(startDate, endDate, productName, accountId) {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = queryList.getQuery('domainListForProductAccount').replace(/:account_id/g, accountId.toString()).
                replace(/:start_date/g, startDate).
                replace(/:end_date/g, endDate).
                replace(/:product_name/g, productName);
  // console.log("getDomainListForProductAccount query: " + query);
  return runHadoopQuery(query);
}

runHadoopQuery = function(query, limit=5000) {
  // console.log("Query: " + query);
  var fut = new Future();
  hadoopStats.runSelect(query, function(err, result) {
    if (!result) {
      console.log("ERROR ***: check query \n" + query);
    }
    if (err) console.error("Error: " + err);
    if (result.rows.length > limit) result.rows.length = limit;
    fut.return(result);
  });
  return fut.wait();
}


updateDomain = function() {
  result = getDomainProductList();
  if (result.rows.length > 0)
    Domain.remove({});
  console.log("updateDomain: insert " + result.rows.length + " domains");
  for (var i=0; i < result.rows.length; i++) {
    var aRow = result.rows[i];
    Domain.insert(aRow);
  }
}

updateProduct = function() {
  result = getProductList();
  if (result.rows.length > 0)
    Product.remove({});
  console.log("updateProduct: insert " + result.rows.length + " products");
  for (var i=0; i < result.rows.length; i++) {
    var aRow = result.rows[i];
    Product.insert(aRow);
  }
}

updateList = function() {
  updateDomain();
  updateProduct();
}

fillAccountTable = function( ) {
  var queryList = queryConfig.findWhere({"connectionName": 'hadoopStats'});
  var query = queryList.getQuery('boatAccount');
  var queryResult = runHadoopQuery(query);
  console.log("About to fill " + queryResult.rows.length + " accounts");
  Account.remove();
  /* This take too much times. Can't do it.
  for (var i=0; i < queryResult.rows.length; i++) {
    var aRow = queryResult.rows[i];
    Account.insert({account_id: aRow.account_id, account_name: aRow.account_name});
  }
  */
}

dateStatToChart = function(queryResult, scaleFactor) {
    /* Convert query's reult to column data to be rendered as Chart in client side. 
     * scaleFactor: e.g. 1000000, 1000, 1 etc.
     */
    var dates = ['x']; 
    var docs = ['Document'];
    var queries = ['Queries'];
    var media =  ['Media'];
    var total =  ['Total'];
    var result = [ dates, docs, queries, media, total];
    for (var i=0; i < queryResult.rows.length; i++) {
      /* NOTE: see query domainMonthlyStats for attribute names. */
      var aRow = queryResult.rows[i];
      dates.push(new Date(aRow.month));
      docs.push(parseInt0(aRow.document)/scaleFactor);
      queries.push(parseInt0(aRow.queries)/scaleFactor);
      media.push(parseInt0(aRow.media)/scaleFactor);
      total.push(parseInt0(aRow.totalpageview)/scaleFactor);
    }
    return result;
}

yoyStatToChart = function(queryResult, scaleFactor) {
    /* Convert year-over-year query's reult to column data to be rendered as Chart in client side. */
    var monthAsCat = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',  '12']; 
    var col = [];
    var queryColumn = [];
    var documentColumn = [];
    var mediaColumn = [];
    var result = {columns: col, categories: monthAsCat, queryName: queryColumn, 
                  documentName: documentColumn, mediaName: mediaColumn};
    /* var result = {columns: col, categories: monthAsCat}; */
    var years = [];
    var currentYear = '0';
    var yearObj = {};
    for (var i=0; i < queryResult.rows.length; i++) {
      /* NOTE: see yearOverYearDomainMonthly for attribute names. The return result are sorted on year, month. */
      var aRow = queryResult.rows[i];
      if (aRow.year != currentYear) {
        currentYear = aRow.year;
        yearObj = {year: aRow.year, doc: ['doc-' + aRow.year], 
                         query: ['query-' + aRow.year], media: ['media-' + aRow.year]};
        years.push(yearObj);
        queryColumn.push('query-' + aRow.year);
        documentColumn.push('doc-' + aRow.year);
        mediaColumn.push('media-' + aRow.year);
      }
      yearObj.doc.push(parseInt0(aRow.document)/scaleFactor);
      yearObj.query.push(parseInt0(aRow.queries)/scaleFactor);
      yearObj.media.push(parseInt0(aRow.media)/scaleFactor);
    }

    years.forEach( function(yr) { col.push(yr.doc); });
    years.forEach( function(yr) { col.push(yr.query); });
    years.forEach( function(yr) { col.push(yr.media); });

    return result;
}

addAccountChartObject = function(columnName, boatAccountId, accountName, fromDate, toDate, 
   matchName, result, chartSequence, reportType) {
  /* Add monthly and yeear-over-year chart of the given account ID to result.
   * columnName: e.g. 'name' for product_name, 'domain' for domain
   * matchName: if columnName = 'name' give the product name (e.g. 'Britannica Online Academic Edition (BOLAE)')
   *            if columnName = 'domain' give the domain name (e.g. 'britannica.com')
   * result: an array which 2 chart objects will be added.
   * chartSequence: Used for generating unique chartId for this account.
   */

  /*
  console.log("addAccountChartObject: " + columnName + ", " + boatAccountId.toString() +
              ", " + accountName + ", " + fromDate + ", " + toDate + ", " + matchName);
  */
  var statTitle = ' Monthly Stats';
  if (reportType == 'day') statTitle = ' Daily Stats';
              
  monthlyStat = getStatsForAccountFromDb(columnName, boatAccountId, fromDate, toDate, matchName, reportType);
  var chartObj = {title: matchName + statTitle,
                  subtitle: '(Account: ' + accountName + ')',
                  chartType: 'date', 
                  chartId: "D_" + boatAccountId.toString() + "_" + chartSequence.toString(),
                  chartData: dateStatToChart(monthlyStat, 1)};
  result.push(chartObj);
  if (columnName == "name") {
    chartObj.productName = matchName;
    // console.log("Product name: " + chartObj.productName);
  }
  var chartType = 'category'; 
  if (reportType == 'day') {
    chartType = 'ignored';
  }
  aProductYoyStat = getYoyStatsForAccount(columnName, boatAccountId, fromDate, toDate, matchName);
  chartObj = {title: matchName + ' Year-Over-Year Stats',
              subtitle: '(Account: ' + accountName + ')',
              chartType: chartType,
              chartId: "C_" + boatAccountId.toString() + "_" + chartSequence.toString(),
              chartData: yoyStatToChart(aProductYoyStat, 1)};
  result.push(chartObj);
}

getStatsChartForAccount = function(boatAccountId, fromDate, toDate, reportType, productName) {
  /* Stats for the given boatAccountId within date range. The return result is suitable for rendering charts */
  var result = [];
  accountName = getAccountName(boatAccountId);
  productResult = getProductListForAccount(fromDate, toDate, boatAccountId);
  var sequence = 0;
  console.log("accountName: " + accountName + ", products found: " + productResult.rows.length);
  for (var i=0; i < productResult.rows.length; i++) {
    var product = productResult.rows[i].name;
    if (productName != 'all' && product != productName)
      continue;  /* User wants single specific product. */
    console.log("productName: " + productName);
    addAccountChartObject('name', boatAccountId, accountName, fromDate, toDate, product, 
                                                           result, ++sequence, reportType);
    var chartObj = result[result.length - 2];
    chartObj.total = productResult.rows[i].total;
    chartObj.avg = productResult.rows[i].avg;
    chartObj.min = productResult.rows[i].min;
    chartObj.max = productResult.rows[i].max;
    domainResult = getDomainListForProductAccount(fromDate, toDate, product, boatAccountId);
    for (var j=0; j < domainResult.rows.length; j++) {
      addAccountChartObject('domain', boatAccountId, accountName, fromDate, toDate, 
         domainResult.rows[j].domain, result, ++sequence, reportType);
    }
  }
  return result;
}

function randomId()
{
  var text = "C_";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 7; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
