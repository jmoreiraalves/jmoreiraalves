module.exports = function(app) {

  app.get('/', function(req, res) {
    res.json({ message: 'Bem vindo a sua api NodeJS!' });
  });

}