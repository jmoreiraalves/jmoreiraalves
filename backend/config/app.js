require('dotenv').config();

if(process.env.APP_ENV == undefined){  process.env.APP_ENV = 'dev';  }

require('dotenv').config({ path: '.env.' + process.env.APP_ENV.toLowerCase() });

/* importar as configurações do servidor */
var app = require('./server');

/* parametrizar a porta de escuta */
app.listen(process.env.PORT, function() {
  console.log('Servidor online');
});