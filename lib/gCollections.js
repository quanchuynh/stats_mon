Domain = new Meteor.Collection('domain');   /* unique domain names from product_template_group table */
Product = new Meteor.Collection('product');   /* unique product names from product_template_group table */
// Account = new Meteor.Collection('account');

/* Contain account list name, description, account IDs etc. */
CustomAccountList = new Meteor.Collection('account_list');

/* Files containing list of topics. 
 * ListFile becomes available to client for inserting file to this store. 
 */
listFs = "listFile";
listFilePath = "/home/aws/working/statsListFile/";
listStore = new FS.Store.FileSystem(listFs, {path: listFilePath});
ListFile  = new FS.Collection(listFs, { stores: [listStore] });
