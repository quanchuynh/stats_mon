// Class to load database configurations 
// Caller access connection strings using database name (e.g. connectionName)
DbConfig = function(queryFileName) {
  this.databases = JSON.parse(Assets.getText(queryFileName)); 
}

// Return table object where each query can be access.
DbConfig.prototype.findWhere = function(nv_pair) {
  return _.findWhere(this.databases, nv_pair);
}
