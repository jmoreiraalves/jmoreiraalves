const { application } = require("express");

module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const user        = app.src.controllers.UserController;

  app.post  ('/api/login'          , user.login         );
  app.post  ('/api/user/send-mail' , user.sendMail      );
  app.post  ('/api/forgot-password', user.forgotPassword);

  app.get   ('/api/isactive'          , user.isactive);
  app.get   ('/api/filtraunidadesresp' , user.filtraunidadesresp);
  app.get   ('/api/filtraunidadesope'  , user.filtraunidadesope);
  app.get   ('/api/filtramatriz'       , user.filtramatriz);
  
  app.get   ('/api/users/filterbyuserid', interceptor, user.filterbyuserid);
  app.get   ('/api/users/filter', interceptor, user.filter);
  app.get   ('/api/users'       , interceptor, user.list  );
  app.post  ('/api/user'        , interceptor, user.create);
  app.patch ('/api/user'        , interceptor, user.update);
  app.patch ('/api/user/perfil' , interceptor, user.updateperfil);
  app.delete('/api/user'        , interceptor, user.delete);
  app.patch ('/api/userimnage'  , interceptor, user.updateimage);

}