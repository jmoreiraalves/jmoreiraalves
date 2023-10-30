module.exports = function(app) {

  const interceptor = app.src.utils.Token.interceptor;
  const utils       = app.src.utils.Utils;

  app.get('/api/utils/cep', utils.searchCep);

  app.post('/api/utils/check-token', interceptor, (req, res, next) => res.json(true));

}