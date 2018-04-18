
checkBoxes = []; /* stores check/uncheck of each checkbox. This is a work-around Meteor Tracker.flush issue
                  * which clear all checkboxes when a box is checked/unchecked. */

/* 
 * check box embedded in earch cell in TabularTables.domain or TabularTables.product table. 
 * The collection used by this table is Domain, Product (etc.). Therefere, each _id can be used to find that
 * row of data. Note that this template detects which is the current active table by using the existing column:
 * if this.domain, this is domain table.
 * else if this.product, this is product table
 * else if this.account, this is account table
 */
Template.rowCheckBox.events( {
  'change .check-box-row': function(ev, template) {
    ev.preventDefault();
    var checkBoxId = ev.target.id;
    var oldValue = document.getElementById(checkBoxId).checked;

    var cBox = checkBoxes.find(function(e) { return e.checkBoxId == checkBoxId; });
    if (cBox) {
      cBox.checked = oldValue;
    }
    else {
      var thisBox = {checkBoxId: checkBoxId, checked: oldValue};
      if (this.domain) thisBox.domain = this.domain;
      checkBoxes.push(thisBox);
    }

    if (this.domain) updateDomainList(ev, this._id);
    else if (this.product) updateProductList(ev, this._id);
  }
});

Template.rowCheckBox.helpers( {
  boxId: function() {
    if (this.domain) return domainAsBoxId(this._id);
    if (this.product) return productAsBoxId(this._id);
  },

  name: function() {
    if (this.domain) return productOfDomainAsName(this._id);
    if (this.product) return productAsName(this._id);
  }

});

Template.rowCheckBox.rendered = function() {
  renderCheckmark();
}

updateDomainList = function(ev, itemId) {
   var check = ev.target.checked;
   var row = Domain.findOne({_id: itemId});   // find the click row, 
   if (check) {
      var found = DomainList.findOne({domain: row.domain}); 
      if (!found) DomainList.insert({domain: row.domain, product: row.product});
      console.debug("Set box, Domain: " + row.domain + ", Product: " + row.product);
   }
   else {
      var cBox = checkBoxes.find(function(e) { return e.domain == row.domain && e.checked == true; });
      if (cBox) return;  //  found matching domain w/ different check (e.g. packs)
      DomainList.remove({domain: row.domain});
      console.debug("Clear box, Domain: " + row.domain + ", Product: " + row.product);
   }
}

domainAsBoxId = function(id) {
  var row = Domain.findOne({_id: id});   // find the click row, 
  var cid = null;
  if (row) {
    cid = row.domain.replace(/\./g, '_');  // We use domain name as unique check box ID.
    cid = cid + '_' + prepareProductNameForId(row.product);         // Add products (e.g. packs special case)
  }
  return cid;
}

productOfDomainAsName = function(id) {
  var row = Domain.findOne({_id: id});   // find the click row, 
  if (row) return row.product;  // We use domain name as unique check box ID.
  return null
}


updateProductList = function(ev, itemId) {
   var check = ev.currentTarget.checked;
   var row = Product.findOne({_id: itemId});   // find the click row, 
   if (check) {
      var found = ProductList.findOne({product: row.product}); 
      if (!found) ProductList.insert({product: row.product});
      console.debug("Set box, Product: " + row.product);
   }
   else {
      console.debug("Clear box, Product: " + row.product);
      removeOneFromProductList({product: row.product});
   }
}

productAsBoxId = function(id) {
  var row = Product.findOne({_id: id});   // find the click row, 
  if (row)
    return prepareProductNameForId(row.product);
  return null;
}

productAsName = function(id) {
  var row = Product.findOne({_id: id});   // find the click row, 
  if (row) return row.product;  
  return null
}

renderCheckmark = function() {
  for (var ii=0; ii < checkBoxes.length; ii++) {
    var id = checkBoxes[ii].checkBoxId;
    var check = checkBoxes[ii].checked;
    try {
      document.getElementById(id).checked = check;
    }
    catch(e) {
      // This checkbox not visible, ignore error.
    }
  }
}

clearCheckbox = function() {
  for (var ii=0; ii < checkBoxes.length; ii++) {
    checkBoxes[ii].checked = false;
  }
  renderCheckmark();
}
