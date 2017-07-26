//
// Gobal utility functions
//
dumpSqlResult = function(result) {
  if (!result) return;
  if (result.rows.length < 1) return;

  var hd = [];
  var hdStr = "";
  for (var fd in result.rows[0]){
     hd.push(fd);
     hdStr += fd + ", ";
  }
  console.log(hdStr)
  for (i=0; i < result.rows.length; i++) {
    var r = result.rows[i];
    var res = " ";
    for (s=0; s < hd.length; s++) res += r[hd[s]] + ", ";
    console.log(res);
  }
};

arrayToString = function(anArray) {
  var ss = "";
  for (var i=0; i < anArray.length - 1; i++)
    ss += anArray[i] + ',';
  ss += anArray[anArray.length - 1];
  return ss;
};

