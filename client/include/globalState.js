/* Replace global by client collection */
GlobalState = new Mongo.Collection(null);

GlobalState.insert({key: 'reportType', value: 'month'});   /* gReportType */
GlobalState.reportType = function(){ return GlobalState.findOne({key: 'reportType'}).value; }
GlobalState.updateReportType = function(newValue){
  GlobalState.update( {key: 'reportType'}, {$set: {value: newValue}} );
}

/* Current boat account whose reports are rendered */
GlobalState.insert({key: 'currentAccountId', value: -1}); /* gCurrentAccountId */
GlobalState.currentAccountId = function(){ return GlobalState.findOne({key: 'currentAccountId'}).value; }
GlobalState.updateCurrentAccountId = function(newValue){
  GlobalState.update( {key: 'currentAccountId'}, {$set: {value: newValue}} );
}

GlobalState.insert({key: 'currentAccountName', value: ''}); /* gCurrentAccountName */
GlobalState.currentAccountName = function(){ return GlobalState.findOne({key: 'currentAccountName'}).value; }
GlobalState.updateCurrentAccountName = function(newValue){
  GlobalState.update( {key: 'currentAccountName'}, {$set: {value: newValue}} );
}

GlobalState.insert({key: 'emailAddress', value: ''});
GlobalState.emailAddress = function(){ return GlobalState.findOne({key: 'emailAddress'}).value; }
GlobalState.updateEmailAddress = function(newValue){
  GlobalState.update( {key: 'emailAddress'}, {$set: {value: newValue}} );
}

GlobalState.insert({key: 'emailLocalStorageKey', value: 'gEmailLocalStorageKey'});
GlobalState.emailLocalStorageKey = function(){ return GlobalState.findOne({key: 'emailLocalStorageKey'}).value; }
GlobalState.updateEmailLocalStorageKey = function(newValue){
  GlobalState.update( {key: 'emailLocalStorageKey'}, {$set: {value: newValue}} );
}

GlobalState.insert({key: 'fromDate', value: moment().subtract(3, 'month').format("MM/DD/YYYY")}); /* gFromDate */
GlobalState.fromDate = function(){ return GlobalState.findOne({key: 'fromDate'}).value; }
GlobalState.updateFromDate= function(newValue){
  GlobalState.update( {key: 'fromDate'}, {$set: {value: newValue}} );
}

/* */
GlobalState.insert({key: 'toDate', value: moment().add(1, 'day').format("MM/DD/YYYY")}); /* gToDate toDate */
GlobalState.toDate = function(){ return GlobalState.findOne({key: 'toDate'}).value; }
GlobalState.updateToDate = function(newValue){
  GlobalState.update( {key: 'toDate'}, {$set: {value: newValue}} );
}

