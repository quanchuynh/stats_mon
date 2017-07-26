Router.configure({
  /* See header.html and others in client/template/include */
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

/* For template product, domain, and account see product.html, domain.html and account.html in client/template */
Router.map( function() {
  this.route('home', {
    path: '/',
    template: 'product',  
    data: { chart_id: 'product' }
  });

  this.route('domain', {
    path: '/domain',
    template: 'domain', 
    data: { chart_id: 'domain' }
  });

  this.route('account', {
    path: '/account',
    template: 'account', 
    data: { chart_id: 'account' }
  });

} );

