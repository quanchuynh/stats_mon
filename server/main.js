import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
  testQuery();
  updateList();

  Meteor.setInterval(updateList, 60000 * 60 * 12);  /* Update every 12 Hrs */

  var b1 = new TestCallback("Callback b1");
  var b2 = new TestCallback("Callback b2 ...");
  var a1 = new TestF(b1.callback);
  var a2 = new TestF(b2.callback);

  a1.handler();
  a2.handler();
  

  /* TEST CODE 
  try {
    console.log("Running startup");
    throw (new Meteor.Error(500, 'Failed to save file.')); 
  }
  catch (e) {
    console.log("Failed test ");
    console.log(e);
    console.log(e.stack); // print stack trace
  }
  */

  /*
  retVal = statsSummary(655915, '2016-01-01', '2017-11-01');
  csvString = convertToCSV(retVal.rows);
  console.log(csvString);
  */

});

testQuery = function( ) {
  accountName = getAccountName(7655597);
  console.log("Account ID: 7655597 has name: " + accountName);

  result = getStatsForAccountFromDb('name', 7655597, '2013-01-01', '2017-01-01', 'Britannica Online Academic Edition (BOLAE)');
  console.log("getStatsForAccountDb product return " + result.rows.length + " rows");
  result = getStatsForAccountFromDb('domain', 7655597, '2013-01-01', '2017-01-01', 'academic.eb.com');
  console.log("getStatsForAccountDb domain return " + result.rows.length + " rows");
  result = getYoyStatsForAccount('name', 7655597, '2013-01-01', '2017-01-01', 'Britannica Online Academic Edition (BOLAE)');
  console.log("getYoyStatsForAccount product return " + result.rows.length + " rows");
  result = getYoyStatsForAccount('domain', 7655597, '2013-01-01', '2017-01-01', 'academic.eb.com');
  console.log("getYoyStatsForAccount domain return " + result.rows.length + " rows");

  result = getProductListForAccount('2013-01-01', '2017-01-01', 7655597);
  console.log("Product List for 7655597: ");
  for (var i=0; i < result.rows.length; i++) {
    var aRow = result.rows[i];
    console.log("\t" + aRow.name);
  }

  result = getDomainListForProductAccount('2013-01-01', '2017-01-01', 'Britannica Online Academic Edition (BOLAE)',
             7655597);
  console.log("Domain List for 7655597, Britannica Online Academic Edition (BOLAE): ");
  for (var i=0; i < result.rows.length; i++) {
    var aRow = result.rows[i];
    console.log("\t" + aRow.domain);
  }

  charts = getStatsChartForAccount(7655597, '2013-01-01', '2017-01-01', 'month');
  for (var i = 0; i < charts.length; i++) {
    console.log("Title: " + charts[i].title +
                "\nchart type: " + charts[i].chartType +
                "\nchart ID: " + charts[i].chartId +
                "\nchartData: " + JSON.stringify(charts[i].chartData));
  }
}

function TestF(aa) {
  this.callBack = aa;  /* will call this function */
}

TestF.prototype.handler = function() {
  console.log("Call call back: ");
  this.callBack();
}

function TestCallback(ss) {
  this.ss = ss;
}

TestCallback.prototype.callback = function() {
  console.log("TestCallback: " + this.ss);
}

callBack1 = function() {
  console.log("callBack1");
}

callBack2 = function() {
  console.log("callBack 2 ...");
}

