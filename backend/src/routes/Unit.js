module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const unit        = app.src.controllers.UnitController;

  app.get   ('/api/units/filter'          , interceptor, unit.filter);
  app.get   ('/api/units/filterMatriz'    , interceptor, unit.filterMatriz);
  app.get   ('/api/units/filterbymatriz'        , interceptor, unit.filterbymatriz);
  app.get   ('/api/units/filterbyname'    , interceptor, unit.filterByNome);
  app.get   ('/api/units/filterunitstoope', interceptor, unit.filterunitstoope);
  app.get   ('/api/units'             , interceptor, unit.list  );
  app.get   ('/api/unit'              , interceptor, unit.search);
  app.post  ('/api/unit'              , interceptor, unit.create);
  app.patch ('/api/unit'              , interceptor, unit.update);
  app.delete('/api/unit'              , interceptor, unit.delete);

}