module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const mark        = app.src.controllers.MarkController;

  app.get   ('/api/marks', interceptor, mark.list  );
  app.get   ('/api/mark' , interceptor, mark.search);
  app.post  ('/api/mark' , interceptor, mark.create);
  app.patch ('/api/mark' , interceptor, mark.update);
  app.delete('/api/mark' , interceptor, mark.delete);

}