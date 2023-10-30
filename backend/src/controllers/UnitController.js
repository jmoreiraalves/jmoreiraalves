module.exports = function (app) {

  var api    = {};
  const dao  = app.src.dao.UnitDAO;
  const daoc = app.src.dao.ContactDAO;
  const datu = app.src.dao.UserDAO;
  const db   = app.config.database;

  api.filter = async function(req, res, next) {
    try {      
      const result = await dao.filter(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.filterMatriz = async function(req, res, next) {
    try {      
      const result = await dao.filterMatriz(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.filterunitstoope = async function(req, res, next) {
    try {
      const result = await dao.filterunitstoope(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.filterbymatriz = async function(req, res, next) {
    try {
      const result = await dao.filterbymatriz(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.filterByNome = async function(req, res, next) {
    try {
      const result = await dao.filterByNome(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.list = async function(req, res, next) {
    try {

      const data = await dao.list(req, res, next);

      const result = data.map(d => {
        const aridope = d.idoperad.split(',').map(id => parseInt(id));
        const arnmope = d.nmoperad.split(',');

        d.aroperad = aridope.map((ids001, i) => { return { ids001, nmusuari: arnmope[i] } });

        delete d.idoperad;
        delete d.nmoperad;

        return d;
      });

      res.json(result);

    } catch (err) {
      next(err);
    }
  }

  api.search = async function(req, res, next) {
    try {

      const result = await dao.search(req, res, next);
      res.json(result);

    } catch (err) {
      next(err);
    }
  }

  api.create = async function (req, res, next) {
    try {

      const { pool, client } = await db.openDB();

      let message = '', arIDG003 = [], arIDG005 = [], arIDG007 = [];

      if (client) {

        req.pool   = pool;
        req.client = client;
        
        //testar se já existe unidade cadastrada com este nome
        req.query.nmunidad = req.body.nmunidad;
        obunidade = await dao.filterByNome (req, res, next);
        if(obunidade.length === 0){
            if (req.body.nrtelefo) {
              const rqContact = {
                client, body: {
                    ids001   : req.body.ids001
                  , nmcontat: req.body.nmunidad
                  , dscontat: req.body.nrtelefo
                  , tpcontat: 'T'
                }
              };

              await daoc.create(rqContact, res, next).then(rs => arIDG003.push(rs));
            }

            if (arIDG003.length) {

              req.body.idg002 = await dao.create(req, res, next);

              if (req.body.idg002) {
                for (const idg003 of arIDG003) {
                  const rqContactUnit = {
                    client, body: {
                        idg002: req.body.idg002
                      , ids001: req.body.ids001
                      , idg003
                    }
                  };

                  await dao.createUnitContact(rqContactUnit, res, next).then(rs => arIDG005.push(rs));
                }

                if (!arIDG005.length) message = 'Falha ao vincular contatos';

                if (!message) {
                  for (const ids001op of req.body.aroperad) {
                    const rqOperad = {
                      client, body: {
                          idg002: req.body.idg002
                        , ids001: req.body.ids001
                        , ids001op
                      }
                    };

                    await dao.createOperatorUnit(rqOperad, res, next).then(rs => arIDG007.push(rs));
                  }
                }

                if (!arIDG007.length) message = 'Falha ao vincular operadores';

              } else {

                message = 'Falha ao cadastrar unidade';

              }

            } else {

              message = 'Falha ao cadastrar contato';

            }
          }
          else{
            message = 'Unidade já cadastrada no sistema com mesmo nome';
          } 


      } else {

        message = 'Não foi possível abrir conexão';

      }

      if (message) {
        await db.rollbackDB({ pool, client });
        res.status(400).send({ message });
      } else {
        await db.closeDB({ pool, client });
        res.json({ idg002: req.body.idg002 });
      }
    } catch (err) {
      if (req.pool && req.client) await db.rollbackDB(req);
      next(err);
    }
  }


  api.update = async function(req, res, next) {

    try {
      const { pool, client } = await db.openDB();

      let message = '', result = [], arIDG003 = [], arIDG005 = [], arIDG007 = [];

      if (client) {

        req.pool   = pool;
        req.client = client;

        if (req.body.nrtelefo) {
          if (req.body.idg003) {
            const rqContact = {
              client, body: {
                  idg003  : req.body.idg003
                , nmcontat: req.body.nmunidad
                , dscontat: req.body.nrtelefo
                , tpcontat: 'T'
              }
            };

            await daoc.update(rqContact, res, next).then(rs => arIDG003.push(rs));

            if (!arIDG003) message = 'Falha na atualização dos contatos';
          } else {
            const rqContact = {
              client, body: {
                  ids001   : req.body.ids001
                , nmcontat: req.body.nmunidad
                , dscontat: req.body.nrtelefo
                , tpcontat: 'T'
              }
            };

            await daoc.create(rqContact, res, next).then(rs => arIDG003.push(rs));

            if (arIDG003.length) {
              for (const idg003 of arIDG003) {
                const rqContactUnit = {
                  client, body: {
                      idg002: req.body.idg002
                    , ids001: req.body.ids001
                    , idg003
                  }
                };

                await dao.createUnitContact(rqContactUnit, res, next).then(rs => arIDG005.push(rs));
              }

              if (!arIDG005.length) message = 'Falha ao vincular contatos';
            } else {
              message = 'Falha na criação do novo contato';
            }
          }
        }

        if (!message) {
          await dao.deleteOperatorUnit(req, res, next);

          for (const ids001op of req.body.aroperad) {
            const rqOperad = {
              client, body: {
                  idg002: req.body.idg002
                , ids001: req.body.ids001
                , ids001op
              }
            };

            await dao.createOperatorUnit(rqOperad, res, next).then(rs => arIDG007.push(rs));
          }
        }

        if (!arIDG007.length) message = 'Falha ao vincular operadores';

        if (!message) result = await dao.update(req, res, next);

        if (!result) message = 'Falha na atualização da Unidade';

      } else {
        message = 'Não foi possível abrir conexão';
      }

      if (message) {
        await db.rollbackDB({ pool, client });
        res.status(400).send({ message });
      } else {
        await db.closeDB({ pool, client });
        res.json(result);
      }

    } catch (err) {
      if (req.pool && req.client) await db.rollbackDB(req);
      next(err);
    }

  }


  api.delete = async function (req, res, next) {
    try {
      const { pool, client } = await db.openDB();

      let message = '', result = null;

      if (client) {

        req.pool   = pool;
        req.client = client;

        ////inativar a unidade
        await dao.delete(req, res, next);


      } else {
        message = 'Não foi possível abrir conexão';
      }

      if (message) {
        await db.rollbackDB({ pool, client });
        res.status(400).send({ message });
      } else {
        await db.closeDB({ pool, client });
        res.json(result);
      }

    } catch (err) {

      if (req.pool && req.client) await db.rollbackDB(req);
      next(err);

    }
  }

  return api;

}