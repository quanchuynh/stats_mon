// 
// This object should be returned by PgQueries object. This class is created to support
// multiple lines query in json query file (see pgQueries.json) 
//
QueryList = function(obj) {
  this.queries = obj 
}

// Return table object where each query can be access.
QueryList.prototype.getQuery = function(queryName) {
  return this.queries[queryName].join('\n');
}

/*		EXAMPLE: Retrieve a list of queries in connection name devDcstats specified in "pgQueries.json"
  		         and print out query1.
  	var conName = 'devDcstats';
  	var pgq = new PgQueries("pgQueries.json");
  	var queryList = pgq.findWhere({"connectionName": conName});
  	console.log(queryList.getQuery('query1');
 */
