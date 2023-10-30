module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const headOffice  = app.src.controllers.HeadOfficeController;

  app.get   ('/api/head-offices/filter'        , interceptor, headOffice.filter);
  app.get   ('/api/head-offices/filteridmatriz', interceptor, headOffice.filteridmatriz);
  app.get   ('/api/head-offices'               , interceptor, headOffice.list  );
  app.get   ('/api/head-office'                , interceptor, headOffice.search);
  app.post  ('/api/head-office'                , interceptor, headOffice.create);
  app.patch ('/api/head-office'                , interceptor, headOffice.update);
  app.delete('/api/head-office'                , interceptor, headOffice.delete);
  app.patch ('/api/head-officeimage'           , interceptor, headOffice.updateimg);
  app.post  ('/api/head-officeuploadimage'     , interceptor, headOffice.uploadimg);
 
  app.post  ('/api/head-office/location'                , interceptor, headOffice.createlocation);
  app.get  ('/api/head-office/location'                 , interceptor, headOffice.filterlocation);
}