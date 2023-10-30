module.exports = function (app) {

  var api    = {};
  const dao  = app.src.dao.HeadOfficeDAO;
  const daoc = app.src.dao.ContactDAO;
  const db   = app.config.database;

  api.filter = async function(req, res, next) {
    try {
      const result = await dao.filter(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
  api.filteridmatriz = async function(req, res, next) {
    try {
      const result = await dao.filteridmatriz(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.list = async function(req, res, next) {
    try {

      const data = await dao.list(req, res, next);

      const result = data.map(d => {
        const aridcon = (d.idcontat) ? d.idcontat.split(',').map(id => parseInt(id)) : [];
        const ardscon = (d.dscontat) ? d.dscontat.split(',') : [];
        const artpcon = (d.tpcontat) ? d.tpcontat.split(',') : [];

        d.arcontat = aridcon.map((idg003, i) => { return { idg003, dscontat: ardscon[i], tpcontat: artpcon[i] } }) || [];

        delete d.idcontat;
        delete d.dscontat;
        delete d.tpcontat;

        const aridope = (d.idoperad) ? d.idoperad.split(',').map(id => parseInt(id)) : [];
        const arnmope = (d.nmoperad) ? d.nmoperad.split(',') : [];

        d.aroperad = aridope.map((ids001, i) => { return { ids001, nmusuari: arnmope[i] } }) || [];

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

      let message = '', result = [], arIDG003 = [], arIDG004 = [];

      if (client) {

        req.pool   = pool;
        req.client = client;
        //verificar se nome está duplicado

        const obmatriz = await dao.filtermatrizduplicada(req);
        if(!obmatriz)
        {

            if (req.body.arcontat) {
              for (const contact of req.body.arcontat) {
                const rqContact = {
                  client, body: {
                      ids001  : req.body.ids001
                    , nmcontat: req.body.nmmatriz
                    , dscontat: contact.dscontat
                    , tpcontat: contact.tpcontat
                  }
                };
                await daoc.create(rqContact, res, next).then(rs => arIDG003.push(rs));
              }
            }

            if (req.body.arcontat && req.body.arcontat.length === arIDG003.length) {

              req.body.idg001 = await dao.create(req, res, next);

              if (req.body.idg001) {

                for (const idg003 of arIDG003) {
                  const rqContactHead = {
                    client, body: {
                        idg001: req.body.idg001
                      , ids001: req.body.ids001
                      , idg003
                    }
                  };
                  await dao.createHeadContact(rqContactHead, res, next).then(rs => arIDG004.push(rs));
                }

                if (!arIDG004.length) message = 'Falha ao cadastrar matriz - A002';

                if (!message && req.body.aroperad) {
                  for (const ids001op of req.body.aroperad) {
                    const rqOperad = {
                      client, body: {
                          idg001: req.body.idg001
                        , ids001: req.body.ids001
                        , ids001op
                      }
                    };
                    await dao.createOperatorHead(rqOperad, res, next).then(rs => result.push(rs));
                  }

                  if (!result.length) message = 'Falha ao cadastrar matriz - A003';
                }

              } else {

                message = 'Falha ao cadastrar matriz - A001';

              }

            } else {

              message = 'Falha ao cadastrar contato';

            }
          }else {
            message = 'Matriz já cadastrada no sistema com mesmo nome';
           } 

       //testar se teve duplicidade
      } else {

        message = 'Não foi possível abrir conexão';

      }

     

      if (message) {
        await db.rollbackDB({ pool, client });
        res.status(400).send({ message });
      } else {
        await db.closeDB({ pool, client });
        res.json({ idg001: req.body.idg001 });
      }

    } catch (err) {
      if (req.pool && req.client) await db.rollbackDB(req);
      next(err);
    }
  }
  api.updateimg = async function(req, res, next){
    try {
      const { pool, client } = await db.openDB();

      let message = '', result = [], arIDG003 = [], arIDG006 = [];

      if (client) {

        req.pool   = pool;
        req.client = client;

        if (!message) result = await dao.updateimg(req, res, next);

        if (!result) message = 'Falha na atualização da Matriz';

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

  api.update = async function(req, res, next) {
    try {
      const { pool, client } = await db.openDB();

      let message = '', result = [], arIDG003 = [], arIDG006 = [];

      if (client) {

        req.pool   = pool;
        req.client = client;

        if (req.body.arcontat) {
          for (const contact of req.body.arcontat) {
            const rqContact = {
              client, body: {
                  idg003  : contact.idg003
                , dscontat: contact.dscontat
                , tpcontat: contact.tpcontat
                , nmcontat: req.body.nmmatriz
              }
            };
            await daoc.update(rqContact, res, next).then(rs => arIDG003.push(rs));
          }

          if (!arIDG003.length) message = 'Falha na atualização dos contatos';
        }

        if (!message) {
          await dao.deleteOpetatorHead(req, res, next);

          for (const ids001op of req.body.aroperad) {
            const rqOperad = {
              client, body: {
                  idg001: req.body.idg001
                , ids001: req.body.ids001
                , ids001op
              }
            };

            await dao.createOperatorHead(rqOperad, res, next).then(rs => arIDG006.push(rs));
          }
        }

        if (!arIDG006.length && req.body.aroperad.length > 0) message = 'Falha ao vincular operadores';

        if (!message) result = await dao.update(req, res, next);

        if (!result) message = 'Falha na atualização da Matriz';

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

        const countUnit = await dao.verifyUnits(req, res, next);

        if (countUnit) {
          
          message = 'Não foi possível concluir a operação,\n matriz possui unidades vinculadas,\n remova as unidades e conclua a exclusão!'          
        } else {
          req.body.arIDG003 = await dao.searchHeadContact(req, res, next);

          if (req.body.arIDG003 && req.body.arIDG003.length) {
            const deleteHeadContact = await dao.deleteHeadContact(req, res, next);

            if (deleteHeadContact) {
              let arResContact = [];
              for (const idg003 of req.body.arIDG003) {
                const rqContact = { client, body: { idg003 } };

                await daoc.delete(rqContact, res, next).then(r => arResContact.push(idg003));
              }

              if (req.body.arIDG003.length !== arResContact.length) message = 'Falha ao excluir contato da unidade';
            } else {
              message = 'Falha ao excluir vínculo contato da matriz';
            }
          }

          if (!message) {
            const deleteOperatorHead = await dao.deleteOpetatorHead(req, res, next);

            if (deleteOperatorHead) {
              result = await dao.delete(req, res, next);
              if (!result) message = 'Falha ao excluir matriz';

            } else {
              message = 'Falha ao excluir operador da matriz';
            }
          }

        } 
      } else {
        message = 'Falha ao excluir Matriz';
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

  api.uploadimg = async function(req, res, next) {
    try {
      const result = await dao.uploadimg(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.createlocation = async function(req, res, next) {
    try {

      const { pool, client } = await db.openDB();

        req.pool   = pool;
        req.client = client;

      const result = await dao.createlocation(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  api.filterlocation = async function(req, res, next) {
    try {
      const { pool, client } = await db.openDB();

        req.pool   = pool;
        req.client = client;
        
      const result = await dao.filterlocation(req, res, next);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  return api;

}