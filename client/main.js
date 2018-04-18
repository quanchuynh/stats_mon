import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

//  import './main.html';
Template.registerHelper('TabularTables', TabularTables);

var blur = 0;
var focus = 0;

trackFocusState();
console.debug("Hidden property: " + getHiddenProp());

addVisibilityChangeListener();
