module.exports = function (app) {

  var api     = {};
  const dao   = app.src.dao.UserDAO;
  const uHash = app.src.utils.Hash;
  const utils = app.src.utils.Utils;

  api.login = async function(req, res, next) {
    try {
      let arMessage = [], token = '';
      const txUser = await uHash.decryptJS(req.body.hash);
      const body   = JSON.parse(txUser);

      const obUser = await dao.login({ body });

      if (obUser) {
        const hash = await uHash.encrypt(body.password);

        if (obUser.stcadast !== 'A') {

          
          arMessage = ['Dados Inválidos, favor contactar o administrador do sistema',''];

        } else if (obUser.snenvema) {

          arMessage = ['','Aguardando confirmação de email e/ou redefinição de senha!'];

        } else if (obUser.dssenha !== hash) {

          
          arMessage = [ 'Dados Inválidos, favor contactar o administrador do sistema', ''];

        } else {

          await dao.setLastAccess({ obUser });
          token = uHash.createToken(obUser);
          delete obUser.dssenha;

        }
      } else {

        arMessage = ['','Dados Inválidos, favor contactar o administrador do sistema'];

      }

      if (arMessage.length) {
        res.status(400).send({ arMessage });
      } else {
        res.json({ obUser, token });
      }
    } catch (err) { next(err); }
  }

  api.sendMail = async function(req, res, next) {
    try {
      let arMessage = [], result = null, stCode = 200;
      const txUser = await uHash.decryptJS(req.body.hash, true);
      const body   = JSON.parse(txUser);

      const obUser = await dao.login({ body });

      if (obUser) {
        if(obUser.stcadast ==='A'){ 

            const dslink = `${process.env.LINK_REDEFINIRSENHA}/recovery?hash=${req.body.hash}`

              req.body.EMDESTIN = body.email;
              req.body.DSASSUNT = `Sistema 6D - Recuperação de Senha`;
              req.body.DSMENSAG = utils.getHtmlRecovery({ ...obUser, ...{ dslink } });

              result = await utils.sendEmail(req.body);

              stCode = (result && result.blOk) ? 200 : 400;

              if (result && result.blOk) {
                const rqUser = { body: { ids001: obUser.ids001, snenvema: true } };
                await dao.update(rqUser, res, next);
              }
            }
            else{
              arMessage = ['', 'Dados inválidos, informe um usuário válido!'];
            }  
      } else {
        arMessage = ['', 'E-mail informado inválido!'];        
      }

      if (arMessage.length) {
        res.status(400).send({ arMessage });
      } else {
        res.status(stCode).json(result);
      }
    } catch (err) { next(err) }
  }

  api.forgotPassword = async function(req, res, next) {
    try {
      let arMessage = [];
      const txUser = await uHash.decryptJS(req.body.hash);
      const body   = JSON.parse(txUser);

      const obUser = await dao.login({ body });

      if (obUser) {
        const hash = await uHash.encrypt(body.password);

        if (obUser.stcadast !== 'A') {

          arMessage = ['', 'Usuário inativo!\n Por favor, entre em contato com administrador para reativação do seu cadastro!']

        } else {

          const rqUser = {
            body: {
                ids001  : obUser.ids001
              , dssenant: obUser.dssenha
              , dssenha : hash
              , snenvema: false
            }
          };

          await dao.update(rqUser, res, next);
        }
      } else {

        arMessage = ['', 'Email não cadastrado!\nPor favor, contate um administrador para realização do seu cadastro!'];

      }

      if (arMessage.length) {
        res.status(400).send({ arMessage });
      } else {
        res.json(true);
      }
    } catch (err) { next(err); }
  }

  api.isactive = async function(req, res, next) {
    try {
      const result = await dao.isactive(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }


  api.filter = async function(req, res, next) {
    try {
      const result = await dao.filter(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.filterbyuserid = async function(req, res, next) {
    try {
      const result = await dao.filterbyuserid(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }
    
  api.filtraunidadesresp = async function(req, res, next) {
    try {
      const result = await dao.filtraunidadesresp(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.filtramatriz = async function(req, res, next) {
    try {
      const result = await dao.filtramatriz(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.filtraunidadesope = async function(req, res, next) {
    try {
      const result = await dao.filtraunidadesope(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }


  api.list = async function(req, res, next) {
    try {
      const result = await dao.list(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.create = async function(req, res, next) {
    try {
      
      delete req.body.dstipo;
      delete req.body.dssenhaconf;
      
      if(req.body.stcadast?.id !== null && req.body.stcadast?.id !== undefined){
            req.body.stcadast = req.body.stcadast.id;
      }   
      else {
        req.body.stcadast = 'A';
      }   
      
      //validar se o usuario já está cadastrado
      let txUser = `{"email":"`+req.body.dsemail+`","password":"`+req.body.dssenha+`"}`;
      let body = JSON.parse(txUser);
      const obUser = await dao.login({ body });

      txUser = `{"nmusuari":"`+req.body.nmusuari+`","password":"`+req.body.dssenha+`"}`;
      body = JSON.parse(txUser);

      if (obUser === undefined) 
      {

            req.body.dssenha  = await uHash.encrypt(req.body.dssenha);
            req.body.dssenant = req.body.dssenha;
            const result = await dao.create(req, res, next);
            res.json(result);
        
      } else {
          arMessage = ['', 'Ja existe um usuário cadastrado com o e-mail informado!'];
          res.status(400).send({ arMessage });
        }
  
         
    } catch (err) { next(err); }
  }

  api.update = async function(req, res, next) {
    try {
      delete req.body.dstipo;
      delete req.body.dsstatus;
      delete req.body.dssenhaconf;
      if(req.body.dssenha === null || req.body.dssenha === undefined){  delete req.body.dssenha;} 
        else {
          req.body.dssenha  = await uHash.encrypt(req.body.dssenha);
        }

      //validar se o usuario já bloqueado ou desbloqueado
      let txUser = `{"email":"`+req.body.dsemail+`","password":"`+req.body.dssenha+`"}`;
      let body = JSON.parse(txUser);
      const obUser = await dao.login({ body });

      if(req.body.dssenha === null || req.body.dssenha === undefined){ delete  req.body.dssenant;}
      else {req.body.dssenant = obUser.dssenha;}

      const result = await dao.update(req, res, next);
      if(obUser.stcadast === req.body.stcadast){
         res.json(result);
       }
       else{
            if(req.body.stcadast = 'A'){
              arMessage = ['', 'Usuário desbloqueado com sucesso!'];
              res.status(200).send({ arMessage });
            }else{
              arMessage = ['', 'Usuário bloqueado com sucesso!'];
              res.status(200).send({ arMessage });
            }
       }

    } catch (err) { next(err); }
  }

  api.updateperfil = async function(req, res, next) {
    try {
      delete req.body.dstipo;
      delete req.body.dsstatus;
      delete req.body.dssenhaconf;
      delete req.body.dtcadastr;
      delete req.body.stcadast;
      delete req.body.ids002;
      delete req.body.firstac;
      delete req.body.matriz;
      delete req.body.unidad;
      if(req.body.dssenha === null || req.body.dssenha === undefined){  delete req.body.dssenha;} 
        else {
          req.body.dssenha  = await uHash.encrypt(req.body.dssenha);
        }

      //validar se o usuario é o mesmo do id
      let txUser = `{"email":"`+req.body.dsemail+`","password":"`+req.body.dssenha+`"}`;
      let body = JSON.parse(txUser);
      const obUser = await dao.login({ body });

      ///buscar nome duplicado
      txUser = `{"nmusuari":"`+req.body.nmusuari+`","password":"`+req.body.dssenha+`"}`;
      body = JSON.parse(txUser);

      const obUserUnome = await dao.nomeduplicado({ body });
      
      if(obUser.ids001 = req.body.ids001){

        if(!obUserUnome){
          const result = await dao.update(req, res, next);
          res.json(result);
        }else
        if(obUserUnome.ids001 === req.body.ids001){

        const result = await dao.update(req, res, next);
        res.json(result);

        }
        else{
          arMessage = ['', 'Usuário já cadastrado no sistema com mesmo nome!'];
          res.status(400).send({ arMessage });
        }
      }
      else{
          arMessage = ['', 'Ja existe um usuário cadastrado com o e-mail informado!'];
          res.status(400).send({ arMessage });
      }

      

    } catch (err) {
       next(err);
       }
  }

  api.updateimage = async function(req, res, next) {
    try {
      delete req.body.dstipo;
      delete req.body.dsstatus;

      const result = await dao.updateimage(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.delete = async function(req, res, next) {
    try {
      const result = await dao.delete(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  return api;

}