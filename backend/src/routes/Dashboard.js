module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const dashboard   = app.src.controllers.DashboardController;

  app.get('/api/dashboard/all'                , interceptor, dashboard.all);
  app.get('/api/dashboard/alllancamento'      , interceptor, dashboard.verificalancamento);
  app.get('/api/dashboard/mark-salles'        , interceptor, dashboard.markSalles);

}