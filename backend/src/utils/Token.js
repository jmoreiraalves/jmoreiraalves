
module.exports = function (app) {

  var api = {};
  const uHash = app.src.utils.Hash;

  api.interceptor = async function (req, res, next) {
    try {

      if (!req.body.ids001) req.body.ids001 = (req.headers.ids001) ? parseInt(req.headers.ids001) : 1;

      if (req.headers['x-access-token']) {
        const token = req.headers['x-access-token'];

        const result = uHash.verifyToken({ token });

        if (result) {
          const date = new Date();

          if (result.expiredAt || (result.exp && (date.getTime() >= result.exp * 1000))) {
            const arMessage = ['Token Expirado!', 'Necessário realizar autenticação novamente!'];
            res.status(401).send({ arMessage });
          } else {
            const token = uHash.createToken(result);
            res.append('access-control-expose-headers', 'X-Token');
            res.append('X-Token', token);
          }
        }
      }

      next();

    } catch (err) { next(err); }
  };

  return api;

};