var multer = require('multer');

const storageMulter = multer.memoryStorage()
const uploadMulter  = multer({ storage: storageMulter });

module.exports = function (app) {

  const interceptor = app.src.utils.Token.interceptor;
  const salesfunnel = app.src.controllers.SalesFunnelController;

  app.get   ('/api/sales-funnels'           , interceptor, salesfunnel.list  );
  app.get   ('/api/sales-funnel'            , interceptor, salesfunnel.search);
  app.get   ('/api/sales-funel/ismetaexiste', interceptor, salesfunnel.ismetaexiste);
  app.post  ('/api/sales-funnel'            , interceptor, salesfunnel.create);
  app.post  ('/api/sales-funnelimport'      , interceptor, salesfunnel.createimport);
  app.patch ('/api/sales-funnel'            , interceptor, salesfunnel.update);
  app.delete('/api/sales-funnel'            , interceptor, salesfunnel.delete);
  app.post  ('/api/sales-funnel/excel'      , uploadMulter.single('file'), salesfunnel.bulkSalesFun);

}