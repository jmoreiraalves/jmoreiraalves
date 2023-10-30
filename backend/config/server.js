/* importar o módulo do framework express */
var express = require('express');

/* importar o módulo do consign */
var consign = require('consign');

/* importar o módulo do body-parser */
var bodyParser = require('body-parser');

/* importar o módulo do cors */
var cors = require('cors');

/* iniciar o objeto do express */
var app = express();

/* setar as variáveis 'view engine' e 'views' do express */
app.set('view engine', 'ejs');
app.set('views', './src/views');

/* configurar o middleware express.static */
app.use(express.static('./src/public'));

/* configurar o middleware body-parser */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors(
  {
    credentials: true,
    origin: [
      'http://localhost:4200',
      'http://localhost:3001',
      'https://develop.d2c5rncjclet9f.amplifyapp.com'
    ]
  }
));

/* efetua o autoload das rotas, dos models, dos daos e dos controllers para o objeto app */
consign()
  .then('config/database.js')
  .then('src/utils')
  .then('src/models')
  .then('src/dao')
  .then('src/controllers')
  .then('src/routes')
  .into(app);

/* middleware que configura páginas de status */
app.use(function(req, res, next) {
  res.status(404).render('errors/404');
  next();
});

/* middleware que configura msgs de erros internos */
app.use(function(req, res, next) {
  res.status(500).render('errors/500');
  next();
});

/* exportar o objeto app */
module.exports = app;