module.exports = function (app) {

  var api = {};
  const db = app.config.database;

  api.list = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    const ids001 = req.body.ids001;

    let result;

    try {

      ///recuperar o usuario e  nivel de acesso
      //verificar dados do usuario
      const sql = `SELECT ids001
                        , nmusuari
                        , dsemail
                        , dssenha
                        , stcadast
                        , snenvema
                        , s001.ids002
                        , dstipo
                        , case when firstac is null then 0 else 1 end as firstac
                     FROM s001
                     JOIN s002 on s002.ids002 = s001.ids002
                    WHERE ids001 = $1`;

      const params = [ids001];

      const resultu = await db.execute({ client, sql, params })
        .then(r => r.rows[0]);

      /// .recuperar o usuario e  nivel de acesso

      if (resultu.ids002 === 1) { ///adm sistema
        const { params, where } = db.where({ req, table: 'g008' });

        const sql = `SELECT g008.idg008
                        , g008.qtleahot
                        , g008.qtagenda
                        , g008.qtcompar
                        , g008.qtfecham
                        , g008.vlfatura
                        , (g008.vlfatura*g008.qtfecham/100) as vlticket
                       /*, TRIM(TO_CHAR(g008.vlfatura, '9999999D99')) as vlfatura
                        , TRIM(TO_CHAR((g008.vlfatura*g008.qtfecham/100), '9999999D99')) as vlticket*/
                        , g008.ids001
                        , TO_CHAR(g008.dtcadast, 'dd/mm/yyyy') dtcadast
                        , g002.idg002
                        , g002.nmunidad
                     FROM g008
                     JOIN g009 ON g009.idg008 = g008.idg008
                     JOIN g002 ON g002.idg002 = g009.idg002
                        ${where}
                        union 
                        select  g008.idg008
                                                , g008.qtleahot
                                                , g008.qtagenda
                                                , g008.qtcompar
                                                , g008.qtfecham
                                                , g008.vlfatura
                                                , (g008.vlfatura*g008.qtfecham/100) as vlticket
                                               /* , TRIM(TO_CHAR(g008.vlfatura, '9999999D99')) as vlfatura
                                                , TRIM(TO_CHAR((g008.vlfatura*g008.qtfecham/100), '9999999D99')) as vlticket*/
                                                , g008.ids001
                                                , TO_CHAR(g008.dtcadast, 'dd/mm/yyyy') dtcadast
                                                , g001.idg001 as idg002
                                                , g001.nmmatriz  as nmunidad
                                             FROM g008
                                             JOIN g009 ON g009.idg008 = g008.idg008
                                             JOIN g001 ON g001.idg001 = g009.idg001
                                             ${where} `;

        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }
      else { ///responsavel unidade
       
        const params = [ids001]

        const sql = `select 
                            g8.idg008
                          , g8.qtleahot
                          , g8.qtagenda
                          , g8.qtcompar
                          , g8.qtfecham
                          , g8.vlfatura
                          , (g8.vlfatura*g8.qtfecham/100) as vlticket  
                          , g8.ids001
                          , TO_CHAR(g8.dtcadast, 'dd/mm/yyyy') dtcadast
                          , g.idg001 as idg002
                          , g.nmmatriz  as nmunidad
                      from s001 s 
                      join g001 g on g.ids001ad  = s.ids001 
                      join g009 g9 on g9.idg001  = g.idg001 
                      join g008 g8 on g8.idg008  = g9.idg008 
                      where s.ids001  = $1
                      union
                      select 
                            g8.idg008
                          , g8.qtleahot
                          , g8.qtagenda
                          , g8.qtcompar
                          , g8.qtfecham
                          , g8.vlfatura
                          , (g8.vlfatura*g8.qtfecham/100) as vlticket  
                          , g8.ids001
                          , TO_CHAR(g8.dtcadast, 'dd/mm/yyyy') dtcadast
                          , g2.idg002 as idg002
                          , g2.nmunidad  as nmunidad
                      from s001 s 
                      join g001 g1 on g1.ids001ad = s.ids001  
                      join g002 g2 on g2.idg001  = g1.idg001
                      join g009 g9 on g9.idg002  = g2.idg002 
                      join g008 g8 on g8.idg008  = g9.idg008 
                      where s.ids001  = $1 `;

        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.search = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT g008.idg008
                        , g008.qtleahot
                        , g008.qtagenda
                        , g008.qtcompar
                        , g008.qtfecham
                        , TRIM(TO_CHAR(g008.vlfatura, '9999999D99')) as vlfatura
                        , TRIM(TO_CHAR(g008.vlticket, '9999999D99')) as vlticket
                        , g008.ids001
                        , TO_CHAR(g008.dtcadast, 'dd/mm/yyyy') dtcadast
                        , g002.idg002
                        , g002.nmunidad
                     FROM g008
                     JOIN g009 ON g009.idg008 = g008.idg008
                LEFT JOIN g002 ON g002.idg002 = g009.idg002
                    WHERE g008.idg008 = $1`;

      const params = [req.body.idg008];

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.searchduplicado = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {
      let sql;
      let params;
      if (req.body.idg001 === null) {
        sql = `SELECT g008.idg008
                        , g008.qtleahot
                        , g008.qtagenda
                        , g008.qtcompar
                        , g008.qtfecham
                        , TRIM(TO_CHAR(g008.vlfatura, '9999999D99')) as vlfatura
                        , TRIM(TO_CHAR(g008.vlticket, '9999999D99')) as vlticket
                        , g008.ids001
                        , TO_CHAR(g008.dtcadast, 'dd/mm/yyyy') dtcadast
                        , g002.idg002
                        , g002.nmunidad
                     FROM g008
                     JOIN g009 ON g009.idg008 = g008.idg008
                LEFT JOIN g002 ON g002.idg002 = g009.idg002
                    WHERE g002.idg002 = $1`;
        params = [req.body.idg002];
      }
      else {
        sql = `SELECT g008.idg008
              , g008.qtleahot
              , g008.qtagenda
              , g008.qtcompar
              , g008.qtfecham
              , TRIM(TO_CHAR(g008.vlfatura, '9999999D99')) as vlfatura
              , TRIM(TO_CHAR(g008.vlticket, '9999999D99')) as vlticket
              , g008.ids001
              , TO_CHAR(g008.dtcadast, 'dd/mm/yyyy') dtcadast
              , g001.idg001
              , g001.nmmatriz
            FROM g008
            JOIN g009 ON g009.idg008 = g008.idg008
        LEFT JOIN g001 ON g001.idg001 = g009.idg001
          WHERE g001.idg001 = $1`;
        params = [req.body.idg001];
      }

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.create = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
        qtagenda: req.body.qtagenda
        , qtcompar: req.body.qtcompar
        , qtfecham: req.body.qtfecham
        , vlfatura: req.body.vlfatura
        , vlticket: req.body.vlticket
        , ids001: req.body.ids001
        , qtleahot: req.body.qtleahot
      };

      const id = 'idg008';

      const result = await db.insert({ client, table: 'g008', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.update = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
        qtagenda: req.body.qtagenda
        , qtcompar: req.body.qtcompar
        , qtfecham: req.body.qtfecham
        , vlfatura: req.body.vlfatura
        , vlticket: req.body.vlticket
        , ids001: req.body.ids001
        , qtleahot: req.body.qtleahot
      };

      const conditions = `idg008 = $idg008`, parameters = { idg008: req.body.idg008 };

      const result = await db.update({ client, table: 'g008', columns, conditions, parameters });

      return result;

    } catch (err) { throw err; }
  }

  api.delete = async function (req, res, next) {
    try {

      const { client } = req;

      const sql = 'DELETE FROM G008 WHERE IDG008 = $1', params = [req.query.idg008];

      const result = await db.execute({ client, sql, params });

      return result;

    } catch (err) { throw err; }
  }

  api.createRelMark = async function (req, res, next) {
    try {

      const { client } = req;

      const id = 'idg009';

      let columns;

      if (req?.body?.idg001 !== null) {
        columns = {
          idg008: req.body.idg008
          , idg001: req.body.idg001
          , idg002: null
        };
      } else {
        columns = {
          idg008: req.body.idg008
          , idg001: null
          , idg002: req.body.idg002

        };
      }
      const result = await db.insert({ client, table: 'g009', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.deleteRelMark = async function (req, res, next) {
    try {

      const { client } = req;

      const idg008 = (req.query) ? (req.query.idg008 || req.body.idg008) : req.body.idg008;

      const sql = 'DELETE FROM g009 WHERE idg008 = $1', params = [idg008];

      const result = await db.execute({ client, sql, params });

      return { result };

    } catch (err) { throw err; }
  }

  return api;

}