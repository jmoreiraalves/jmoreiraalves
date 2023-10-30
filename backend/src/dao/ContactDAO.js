module.exports = function (app) {

  var api  = {};
  const db = app.config.database;

  api.list = async function (req, res, next) {
    // busca com filtros ou sem
    const { pool, client } = await db.openDB();

    try {

      const sql = 'SELECT * FROM G003';

      const message = await db.execute({ client, sql})
                                 .then(r => r.rows[0].message);

      console.log(message);

      await db.closeDB({ pool, client });

      return { message };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      next(err);

    }

  }

  api.search = async function (req, res, next) {
    //busca por id
    const { pool, client } = await db.openDB();

    try {

      const sql = 'SELECT * FROM G003 WHERE IDG001 = $1', params = [req.body.idg001];

      const message = await db.execute({ client, sql, params })
                                 .then(r => r.rows[0].message);

      console.log(message);

      await db.closeDB({ pool, client });

      return { message };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      next(err);

    }
  }

  api.create = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          ids001  : req.body.ids001
        , nmcontat: req.body.nmcontat
        , dscontat: req.body.dscontat
        , tpcontat: req.body.tpcontat
      };

      const result = await db.insert({ client, table: 'g003', id: 'idg003', columns }).then(r => r.idg003 || null);

      return result;

    } catch (err) { throw err; }
  }

  api.update = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          nmcontat: req.body.nmcontat
        , dscontat: req.body.dscontat
        , tpcontat: req.body.tpcontat
      };

      const conditions = `idg003 = $idg003`, parameters = { idg003: req.body.idg003 };

      const result = await db.update({ client, table: 'g003', columns, conditions, parameters });

      return result;

    } catch (err) { throw err; }
  }

  api.delete = async function (req, res, next) {
    try {
      const { client } = req;

      const idg003 = (req.query) ? (req.query.idg003 || req.body.idg003) : req.body.idg003;

      const sql = 'DELETE FROM g003 WHERE idg003 = $1', params = [idg003];

      const result = await db.execute({ client, sql, params });

      return result;

    } catch (err) { throw err; }
  }

  return api;

}