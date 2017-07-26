var gFile = null;

/*
 * Create List section which includes uploading the custom report topic file.
 */
Template.createAccountList.helpers({
  listFileFormat: function() {
     var desc = "Single colummn containing valid BOAT IDs.\n";
     desc += "Example: \n";
     desc += "\t 300204\n";
     desc += "\t 7655428\n";
     desc += "\t 7655559\n";
     desc += "\t 7655565\n";
     return desc;
  },

  accountListDescription: function() {
     var desc = "This allows you to store a list of BOAT IDs/Name.\n";
     desc += "After creation complete, you can display your list and\n";
     desc += "select any account from this list to run reports.\n";
     return desc;
  }
});

Template.createAccountList.events({
  'change .listFileClass': function(ev) {
     /* ev.srcElement.files: does not work. From debugger currentTarget  */
     _.each(ev.currentTarget.files, function(file) {
       console.log("Selected file: " + file.name);
       gFile = file;
     });
  },

  'change #list-name': function(ev, template) {
     newList(template);
  },

  'click #create_list':  function(event, template) {
    event.preventDefault();

    var rName = template.find('#list-name').value;
    if (!rName) {
      alert("You must enter list name");
      return;
    }

    var rDesc = template.find('#list-desc').value;
    if (!rDesc) {
      var r = confirm("Description helps user understand your list. Ignore description anyway???");
      if (!r) return;
    }

    if (!newList(template)) return;

    if (gFile) {
      /* ListFile.insert(gFile) ... client/server asynchonous problem. Meteor method gets called sometimes
       * before data is available. Use simple upload instead.
       */
      var today = moment();
      var listObj = {"name": rName,
                     "desc": rDesc, "check_name": toCheckName(rName),
                     "date": today.format("YYYY-MM-DD") };
      var reader = new FileReader();
      reader.readAsBinaryString(gFile);
      reader.onload = function(fileLoadEvent) {
        Meteor.call('uploadCustomAccountList', listObj, reader.result);
      };
    }
    else {
      alert("You must choose a file first");
    }
  }
});

function newList(template) {
  var rName = template.find('#list-name').value;
  if (rName) {
    var found = CustomAccountList.findOne({check_name: toCheckName(rName)});
    if (found) {
      var msg = rName + ' List already EXIST !!!  ' +
              ' Match name: ' + '"' + found.name + '"' + 
              ' List Description: ' + '"' + found.desc + '"' +
              ' Created on: ' + '"' + found.date + '"' + ' Choose a unique name ';
      alert(msg);
      return false;
    }
  }
  return true;
}



function toCheckName(name) {
  return name.toLowerCase().replace("'s", "");
}
