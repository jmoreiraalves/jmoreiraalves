
module.exports = function (app) {

  const axios = require('axios');
  const mail  = require('nodemailer');

  var api = {};

  api.getHtmlRecovery = function (req) {
    try {

      const html = `<!DOCTYPE html>
                    <html lang="pt">
                      <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sistema 6D - Recuperação de Senha</title>
                        <style>
                          body {
                            font-family: Roboto, sans-serif;
                          }

                          .body {
                            display: flex;
                          }

                          .container {
                            border: 1px solid #ccc;
                            max-width: 650px;
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .header {
                            color: #ffd31b;
                            display: flex;
                            text-align: center;
                            background-color: #8538a7;
                            padding: 0 1rem;
                          }

                          .header h3 {
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .content {
                            text-align: center;
                            padding: 0 1rem;
                          }

                          .title {
                            color: #ec3e75;
                          }

                          .button {
                            padding: 1rem 0;
                          }

                          .button a {
                            border: 1px solid #8538a7;
                            color: #fff;
                            text-decoration: none;
                            padding: 0.5rem 1rem;
                            background-color: #8538a7;
                            border-radius: 4px;
                          }

                          .message {
                            color: #666;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="body">
                          <div class="container">
                            <div class="header">
                              <h3>Recuperação de Senha</h3>
                            </div>

                            <div class="content">
                              <div class="title">
                                <h3>OLÁ, ${ req.nmusuari }</h3>
                              </div>

                              <div>
                                <p><b>Foi solicitado a redefinição de senha através do nosso Portal Sistema 6D.</b></p>
                              </div>

                              <div class="button"><a href="${ req.dslink }" target="_blank">Redefinir Senha</a></div>

                              <div class="message">
                                <p>Agradecemos o seu contato e conte sempre com a EWORLD.</p>
                              </div>

                              <div class="alert">
                                <p>
                                  <b>
                                    Caso não tenha solicitado a redefinição de senha,
                                    entrar em contato no número (35) 98705-1241.
                                  </b>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </body>
                    </html>`;

      return html;

    } catch (err) { throw err; }
  }

  /****************************************************************************************************/
  api.getHtmlNotify = function (req) {
    try {

      const html = `<!DOCTYPE html>
                    <html lang="pt">
                      <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sistema 6D - Notificação de Meta</title>
                        <style>
                          body {
                            font-family: Roboto, sans-serif;
                          }

                          .body {
                            display: flex;
                          }

                          .container {
                            border: 1px solid #ccc;
                            max-width: 650px;
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .header {
                            color: #ffd31b;
                            display: flex;
                            text-align: center;
                            background-color: #8538a7;
                            padding: 0 1rem;
                          }

                          .header h3 {
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .content {
                            text-align: center;
                            padding: 0 1rem;
                          }

                          .title {
                            color: #ec3e75;
                          }

                          .button {
                            padding: 1rem 0;
                          }

                          .button a {
                            border: 1px solid #8538a7;
                            color: #fff;
                            text-decoration: none;
                            padding: 0.5rem 1rem;
                            background-color: #8538a7;
                            border-radius: 4px;
                          }

                          .message {
                            color: #666;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="body">
                          <div class="container">
                            <div class="header">
                              <h3>Notificação de Meta</h3>
							  <h4>Lançamento do Funil de Vendas<h4>
                            </div>

                            <div class="content">
                              <div class="title">
                                <h3>OLÁ, ${req.nmusuari}</h3>
                              </div>

                              <div>
                                <p><b>Atenção Matriz/Unidade: ${req.nmunidadematriz}, lembrete de que você esta abaixo da média cadastrada.</b></p>
                                <p><b>Por favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas, através do nosso Portal Sistema 6D.</b></p>
                              </div>                             

                              <div class="message">
                                <p>Agradecemos o seu contato e conte sempre com a EWORLD.</p>
                              </div>

                              <div class="alert">
                                <p>
                                  <b>
                                    Caso não tenha algum questionamento entrar em contato no número (35) 98705-1241.
                                  </b>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </body>
                    </html>`;

      return html;

    } catch (err) { throw err; }
  }
  /****************************************************************************************************/
  api.getHtmlNotifyOK = function (req) {
    try {

      const html = `<!DOCTYPE html>
                    <html lang="pt">
                      <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sistema 6D - Confirmação de Meta</title>
                        <style>
                          body {
                            font-family: Roboto, sans-serif;
                          }

                          .body {
                            display: flex;
                          }

                          .container {
                            border: 1px solid #ccc;
                            max-width: 650px;
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .header {
                            color: #ffd31b;
                            display: flex;
                            text-align: center;
                            background-color: #8538a7;
                            padding: 0 1rem;
                          }

                          .header h3 {
                            margin-left: auto;
                            margin-right: auto;
                          }

                          .content {
                            text-align: center;
                            padding: 0 1rem;
                          }

                          .title {
                            color: #ec3e75;
                          }

                          .button {
                            padding: 1rem 0;
                          }

                          .button a {
                            border: 1px solid #8538a7;
                            color: #fff;
                            text-decoration: none;
                            padding: 0.5rem 1rem;
                            background-color: #8538a7;
                            border-radius: 4px;
                          }

                          .message {
                            color: #666;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="body">
                          <div class="container">
                            <div class="header">
                              <h3>Confirmação de Meta</h3>
                <h5>Lançamento do Funil de Vendas<h5>
                            </div>

                            <div class="content">
                              <div class="title">
                                <h3>OLÁ, ${ req.nmusuari }</h3>
                              </div>

                              <div>
                                <p><b>Atenção Matriz/Unidade: ${ req.nmunidadematriz }, você acabou de atingir a média cadastrada, é possível acompanhar os lançamentos do funil de vendas através do nosso Portal Sistema 6D.</b></p>
                              </div>                             

                              <div class="message">
                                <p>Agradecemos o seu contato e conte sempre com a EWORLD.</p>
                              </div>
                              <div class="alert">
                                <p>
                                  <b>
                                    Caso não tenha algum questionamento entrar em contato no número (35) 98705-1241.
                                  </b>
                                </p>
                              </div>							  
                              
                            </div>
                          </div>
                        </div>
                      </body>
                    </html>`;

      return html;

    } catch (err) { throw err; }
  }
  /****************************************************************************************************/

  api.sendEmail = async function (req) {
    try {
      const from        = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`
      const subject     = (!req.DSASSUNT) ? 'Assunto' : req.DSASSUNT;
      const html        = (!req.DSMENSAG) ? '' : req.DSMENSAG;
      const attachments = (!req.ANEXO   ) ? [] : req.ANEXO;
      const to          = req.EMDESTIN;

      const obMail = { from, to, subject, html, attachments };

      const obConfig = api.mailConfig();
      const smtp     = mail.createTransport(obConfig);

      const result = await smtp.sendMail(obMail)
                               .then((info) => { return { ...info, ...{ blOk: true } }; })
                               .catch((err) => { return { ...err, ...{ blOk: false } }; });

      return result;
    } catch (err) { throw err; }
  }


  api.mailConfig = function () {

    const obConfig = {
      secure : false,
      host   : process.env.MAIL_HOST,
      port   : process.env.MAIL_PORT,
      service: process.env.MAIL_DRIVER,
      tls    : { rejectUnauthorized: false },
      auth   : { user: process.env.MAIL_FROM_ADDRESS, pass: process.env.MAIL_FROM_PASSWORD }
    };

    return obConfig;
  }

  api.searchCep = async function (req, res, next) {
    try {

      const result = await axios.get("http://viacep.com.br/ws/" + req.params.nrcepend + "/json");
      res.json(result.data);

    } catch (err) { next(err); }
  }

  return api;

};