import Tabular from 'meteor/aldeed:tabular'  /* New in tablular */

TabularTables = {};

var customAccountListColumn = [
       {data: 'name', title: 'List Name'},
       {data: 'desc', title: 'List Desc'},
       {data: 'date', title: 'Created On', width: "12%"},
       {tmpl: Meteor.isClient && Template.selectAccountList, title: 'Select Account From a List'}
];

TabularTables.customAccountList = new Tabular.Table({
  name: "Account List",
  collection: CustomAccountList,
  "aLengthMenu": [[3, 10, 25, 100], [3, 10, 25, 100]],
  "iDisplayLength": 3,
  "order": [[ 2, "desc" ]],  /* use column 2: created dates from new to old. */
  columns: customAccountListColumn
});

var domainTableColumn = [
    { data: 'domain', title: 'Domain' }, /* 1st column */
    { data: 'product', title: 'Product' }, /* 2nd column */
    { tmpl: Meteor.isClient && Template.rowCheckBox, title: 'Check to Select'}
  ];

TabularTables.domain = new Tabular.Table({
    name: "Host Name of WebApp",
    collection: Domain,
    "order": [[ 0, "asc" ]],
    columns: domainTableColumn,
    "aLengthMenu": [[200], [200]],
    "iDisplayLength": 200, /* display all in single page. jQuery can only select the displayed items. */

    /* Once a re-draw is called, we want to mark all selected items as checked. */
    "drawCallback": function(settings) {
       redrawCheckBox(settings);
    }
});

var productTableColumn = [
    { data: 'product', title: 'Product' }, /* 1st column */
    { tmpl: Meteor.isClient && Template.rowCheckBox, title: 'Check to Select'}
  ];

TabularTables.product = new Tabular.Table({
    name: "Product Name of the WebApp",
    collection: Product,
    title: "Product Table",
    "order": [[ 0, "asc" ]],
    columns: productTableColumn,
    "aLengthMenu": [[200], [200]],
    "iDisplayLength": 200, /* display all in single page. jQuery can only select the displayed items. */

    /* Once a re-draw is called, we want to mark all selected items as checked. */
    "drawCallback": function(settings) {
       redrawCheckBox(settings);
    },
    stateSave: true
});

