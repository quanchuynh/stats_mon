// Class to load queries into array
// Caller access these queries using table name.
PgQueries = function(queryFileName) {
  this.queries = JSON.parse(Assets.getText(queryFileName)); 
}

// Return table object where each query can be access.
PgQueries.prototype.findWhere = function(nv_pair) {
  var obj = _.findWhere(this.queries, nv_pair);
  if (obj) {
    return new QueryList(obj);
  }
  return obj;
}

/* 		EXAMPLE: Retrieve the query1 from prod_product_template_group table in "pgSelect.json" file.
    var pgq = new PgQueries("pgSelect.json");
    var ptgTable = pgq.findWhere({"table": 'prod_product_template_group'});
    console.log(_.sprintf(ptgTable.query1, 3723, 3815, 3816));
 */
