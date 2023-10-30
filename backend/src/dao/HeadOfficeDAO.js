module.exports = function (app) {

  var api  = {};
  const db = app.config.database;

  api.filter = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {
      
      ids001 = req.body.ids001;
      let result;
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

      if(resultu.ids002 === 1){ ///adm sistema

          const sql = `SELECT g001.idg001 id, g001.nmmatriz as text FROM g001`;

          result = await db.execute({ client, sql }).then(r => r.rows);
      }
      else{

        const sql = `SELECT g001.idg001 id, g001.nmmatriz as text FROM g001 WHERE g001.ids001ad = $1`;

        const params = [ids001];

        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }  

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filtermatrizduplicada = async function (req) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT g001.idg001 id, g001.nmmatriz as text FROM g001 where lower(g001.nmmatriz) = lower($1)`;

      const params = [req.body.nmmatriz];

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);                              

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

    

  }

  api.filteridmatriz = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT g001.idg001 id, g001.nmmatriz as text FROM g001  WHERE g001.idg001 =  $1 `;

      const params = [req.query.idg001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.list = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const { params, where } = db.where({ req, table: 'g001' });

      const sql = `SELECT g001.idg001
                        , g001.nmmatriz
                        , g001.ids001ad
                        , s001ad.nmusuari
                        , g001.dsendere
                        , g001.dsbairro
                        , g001.nrendere
                        , g001.nrcepend
                        , g001.nmcidade
                        , g001.cdestado
                        , g003ct.idcontat
                        , g003ct.dscontat
                        , g003ct.tpcontat
                        , s001op.idoperad
                        , s001op.nmoperad
                        , (SELECT COUNT(g002.idg002) FROM g002 WHERE g002.idg001 = g001.idg001) qtunidad
                        , case when g001.imgmatri is null then  'assets/img/images/SemImagem.png' else g001.imgmatri end as imgmatri
                        , case when g001.latitude is null then '-21.427282' else g001.latitude end latitude 
                        , case when g001.longitud is null then '-45.951314' else g001.longitud end as longitud
                        , g001.mapslink
                     FROM g001 g001
                     JOIN s001 s001ad ON s001ad.ids001 = g001.ids001ad
                     JOIN LATERAL (
                            SELECT STRING_AGG(CAST(g003.idg003 AS VARCHAR(50)), ',' ORDER BY g003.idg003) idcontat
                                 , STRING_AGG(g003.dscontat, ',' ORDER BY g003.idg003) dscontat
                                 , STRING_AGG(g003.tpcontat, ',' ORDER BY g003.idg003) tpcontat
                              FROM g003
                              JOIN g004 ON g004.idg003 = g003.idg003
                             WHERE g004.idg001 = g001.idg001
                          ) g003ct ON TRUE
                LEFT JOIN LATERAL (
                            SELECT STRING_AGG(CAST(g006.ids001op AS VARCHAR(50)), ',' ORDER BY g006.ids001op) idoperad
                                 , STRING_AGG(s001.nmusuari, ',' ORDER BY g006.ids001op) nmoperad
                              FROM s001
                              JOIN g006 ON g006.ids001op = s001.ids001 
                             WHERE g006.idg001 = g001.idg001
                          ) s001op ON TRUE
                        ${where}
                        order by G001.dtcadast desc  , g001.idg001 desc`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      next(err);

    }

  }

  api.search = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT g001.idg001
                        , g001.nmmatriz
                        , g001.ids001ad
                        , s001ad.nmusuari
                        , g001.dsendere
                        , g001.dsbairro
                        , g001.nrendere
                        , g001.nrcepend
                        , g001.nmcidade
                        , g001.cdestado
                        , g003ct.idcontat
                        , g003ct.dscontat
                        , g003ct.tpcontat
                        , s001op.idoperad
                        , s001op.nmoperad
                        , (SELECT COUNT(g002.idg002) FROM g002 WHERE g002.idg001 = g001.idg001) qtunidad
                        , case when g001.imgmatri is null then  'assets/img/images/SemImagem.png' else g001.imgmatri end as imgmatri
                     FROM g001 g001
                     JOIN s001 s001ad ON s001ad.ids001 = g001.ids001ad
                     JOIN LATERAL (
                            SELECT STRING_AGG(CAST(g003.idg003 AS VARCHAR(50)), ',' ORDER BY g003.idg003) idcontat
                                 , STRING_AGG(g003.dscontat, ',' ORDER BY g003.idg003) dscontat
                                 , STRING_AGG(g003.tpcontat, ',' ORDER BY g003.idg003) tpcontat
                              FROM g003
                              JOIN g004 ON g004.idg003 = g003.idg003
                             WHERE g004.idg001 = g001.idg001
                          ) g003ct ON TRUE
                LEFT JOIN LATERAL (
                            SELECT STRING_AGG(CAST(g006.ids001op AS VARCHAR(50)), ',' ORDER BY g006.ids001op) idoperad
                                 , STRING_AGG(s001.nmusuari, ',' ORDER BY g006.ids001op) nmoperad
                              FROM s001
                              JOIN g006 ON g006.ids001op = s001.ids001 
                             WHERE g006.idg001 = g001.idg001
                          ) s001op ON TRUE
                    WHERE g001.idg001 = $1
                    order by G001.dtcadast desc  , g001.idg001 desc`;

      const params = [req.body.idg001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      next(err);

    }
  }

  api.create = async function (req, res, next) {

    try {

      const { client } = req;

      const columns = {
         nmmatriz: req.body.nmmatriz
       , ids001ad: req.body.ids001ad
       , dsendere: req.body.dsendere
       , nrendere: req.body.nrendere
       , dsbairro: req.body.dsbairro
       , ids001  : req.body.ids001
       , nrcepend: req.body.nrcepend
       , nmcidade: req.body.nmcidade
       , cdestado: req.body.cdestado
       , imgmatri: req.body.imgmatri
       , mapslink: req.body.mapslink
      };
        
      const id = 'idg001';

      const result = await db.insert({ client, table  : 'g001', id, columns }).then(r => r[id]);

      return result;

    } catch (err) {
      throw err;
    }
    
  }

  api.update = async function (req, res, next) {

    try {

      const { client } = req;

      const columns = {
          nmmatriz: req.body.nmmatriz
        , ids001ad: req.body.ids001ad
        , dsendere: req.body.dsendere
        , nrendere: req.body.nrendere
        , dsbairro: req.body.dsbairro
        , ids001  : req.body.ids001
        , nrcepend: req.body.nrcepend
        , nmcidade: req.body.nmcidade
        , cdestado: req.body.cdestado
        , imgmatri: req.body.imgmatri
        , mapslink: req.body.mapslink
      };
      
      const conditions = `idg001 = $idg001`, parameters = { idg001: req.body.idg001 };

      const result = await db.update({ client, table  : 'g001', columns, conditions, parameters });

      return result;

    } catch (err) {
      throw err;
    }

  }

  api.updateimg = async function (req, res, next) {

    try {

      const { client } = req;

      const columns = {
          imgmatri: req.body.imgmatri
      };
      
      const conditions = `idg001 = $idg001`, parameters = { idg001: req.body.idg001 };

      const result = await db.update({ client, table  : 'g001', columns, conditions, parameters });

      return result;

    } catch (err) {
      throw err;
    }

  }

  api.delete = async function (req, res, next) {

    try {

      const { client } = req;

      const sql = 'DELETE FROM g001 WHERE idg001 = $1', params = [req.query.idg001];

      const result = await db.execute({ client, sql, params });

      return { result };

    } catch (err) {
      throw err;
    }

  }

  api.createHeadContact = async function (req, res, next) {

    try {

      const { client } = req;

      const id = 'idg004';

      const columns = {
          idg001: req.body.idg001
        , idg003: req.body.idg003
        , ids001: req.body.ids001
      };

      const result = await db.insert({ client, table  : 'g004', id, columns }).then(r => r[id]);

      return result;

    } catch (err) {
      throw err;
    }
    
  }

  api.deleteHeadContact = async function (req, res, next) {

    try {

      const { client } = req;

      const sql = 'DELETE FROM G004 WHERE IDG001 = $1', params = [req.query.idg001];

      const result = await db.execute({ client, sql, params });

      return { result };

    } catch (err) {
      throw err;
    }

  }

  api.createOperatorHead = async function (req, res, next) {

    try {

      const { client } = req;

      const id = 'idg006';

      const columns = {
          idg001  : req.body.idg001
        , ids001  : req.body.ids001
        , ids001op: req.body.ids001op
      };

      const result = await db.insert({ client, table: 'g006', id, columns }).then(r => r[id]);

      return result;

    } catch (err) {
      throw err;
    }
    
  }

  api.deleteOpetatorHead = async function (req, res, next) {
    try {

      const { client } = req;

      const idg001 = (req.query) ? (req.query.idg001 || req.body.idg001) : req.body.idg001;

      const sql = 'DELETE FROM g006 WHERE idg001 = $1', params = [idg001];

      const result = await db.execute({ client, sql, params });

      return result;

    } catch (err) {
      throw err;
    }

  }

  api.searchHeadContact = async function (req, res, next) {
    try {

      const { client } = req;

      const sql = `SELECT g003.idg003 FROM g003
                     JOIN g004 ON g004.idg003 = g003.idg003
                    WHERE g004.idg001 = $1`;

      const params = [req.query.idg001];

      const result = await db.execute({ client, sql, params })
                             .then(r => (r.rows && r.rows.length) ? r.rows.map(c => c.idg003) : []);

      return result;

    } catch (err) { throw err; }
  }

  api.verifyUnits = async function (req, res, next) {
    try {

      const { client } = req;

      const sql = `SELECT COUNT(g002.idg002) qtunidad FROM g002 WHERE g002.idg001 = $1`;

      const params = [req.query.idg001];

      const result = await db.execute({ client, sql, params })
                             .then(r => (r.rows && r.rows.length) ? parseInt(r.rows[0].qtunidad) : null);

      return result;

    } catch (err) { throw err; }
  }

  api.uploadimg = async function (req, res, next) {
        
        const newpath = process.env.PATH_FRONT;
        const file = req.files.file;
        const filename = file.name;
      
        file.mv(`${newpath}${filename}`, (err) => {
          if (err) {
            res.status(500).send({ message: "File upload failed", code: 200 });
          }
          res.status(200).send({ message: "File Uploaded", code: 200 });
        });
  }

  api.createlocation = async function (req, res, next) {

    try {

      const { pool, client } = await db.openDB();

      const columns = {
          latitude: req.body.params.latitude
        , longitud: req.body.params.longitude
      };
      
      const conditions = `idg001 = $idg001`, parameters = { idg001: req.body.params.idg001 };

      const result = await db.update({ client, table  : 'g001', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {
      throw err;
    }

  }

  api.filterlocation = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT case when g001.latitude is null then '-21.427282' else g001.latitude end latitude, 
                      case when g001.longitud is null then '-45.951314' else g001.longitud end as longitude
                  FROM g001
                  where g001.idg001  = $1`,  params = [req.query.idg001];

      const result = await db.execute({ client, sql , params}).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  return api;

}