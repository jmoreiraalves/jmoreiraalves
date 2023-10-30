module.exports = function (app) {

  var api    = {};
  const dao  = app.src.dao.MarkDAO;
  const db   = app.config.database;

  api.list = async function(req, res, next) {
    try {

      const result = await dao.list(req, res, next);
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

      let message = '', result = null;

      if (client) {

        req.pool   = pool;
        req.client = client;

        // validar se ja existe a meta cadastrada

        const obMark = await dao.searchduplicado(req,res,next);

          if(!obMark){
            req.body.idg008 = await dao.create(req, res, next);

            if (req.body.idg008) {

              result = await dao.createRelMark(req, res, next);

              if (!result) message = 'Falha ao vincular unidade a meta';
            } else {
              message = 'Falha ao cadastrar meta'
            }
          }
          else{
            message = 'Meta ou Unidade já cadastrada no sistema com mesmo nome';
          }  
        } else {
          message = 'Não foi possível abrir conexão';
        }
      

      if (message) {
        await db.rollbackDB({ pool, client });
        res.status(200).send({ message });
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

      let message = '', result = null;

      if (client) {

        req.pool   = pool;
        req.client = client;
        // validar se ja existe a meta cadastrada

        //const obMark = await dao.searchduplicado(req,res,next);

         // if(!obMark){
              result = await dao.update(req, res, next);

              if (!result) message = 'Falha na atualização da meta';

            //   if (!message) {
            //     await dao.deleteRelMark(req, res, next);

            //     const idg009 = await dao.createRelMark(req, res, next);
            //     if(!idg009) message = 'Falha ao vincular unidade'
            //   }
            // }
            // else{
            //   message = 'Meta ou Unidade já cadastrada no sistema com mesmo nome';
            // }    
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

        req.pool = pool;
        req.client = client;

        const countRelMark = await dao.deleteRelMark(req, res, next);

        if (countRelMark) {

          const countMark = await dao.delete(req, res, next);

          if (!countMark) message = 'Falha ao excluir Meta';

        } else {
          message = 'Falha ao excluir meta - A001';
        }

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