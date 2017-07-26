Future = Npm.require('fibers/future');

PgClient = function PgClient(connectionString) {
  this.conn = connectionString;
  this.errorHandler = function(err) {
      if(!err) return false;
      this.client.end();
      return true;
  };

  this.client = new pg.Client(connectionString);
  var fut = new Future();
  this.client.connect( function(err) { 
    if (err) console.error("Failed connection: " + connectionString, err);
    console.log("Connected to: " + connectionString);
    fut.return("Connected");
  } );
  return fut.wait();
};

PgClient.prototype.runSelect = function(qStr, callback) {
  var fut = new Future();
  this.client.query(qStr, 
    function(err, result) {
      callback(err, result);
      fut.return("Complete select");
    }
  );
  return fut.wait();
}

PgClient.prototype.runInsert = function(qStr, parmArr, callback) {
  var fut = new Future();
  this.client.query(qStr, parmArr,
    function(err, result) {
      callback(err, result);
      fut.return("Complete insert");
    }
  );
  return fut.wait();
}

PgClient.prototype.query = function(qStr) {
  return this.client.query(qStr);
}

PgClient.prototype.disconnect = function() {
  this.client.end();
  console.log("Disconnect from: " + this.conn);
  this.errorHandler("Test Error");
};
