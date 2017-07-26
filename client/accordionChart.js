Template.accordionChart.helpers({
  product: function() {
    return ProductForSingleAccount.find();
  }
});


Template.accordionChart.rendered = function() {
  renderProductAsAccordion();
}

renderProductAsAccordion = function() {
  var element = $('#accordion-chart');
  // console.log("renderProductAsAccordion ...");
  element.dcAccordion({
    eventType: 'click',
    menuClose: true,
    autoClose: false,
    saveState: false,
    disableLink: false,
    showCount: false,
    speed: 'slow',
    collapsible: true
  });
}

