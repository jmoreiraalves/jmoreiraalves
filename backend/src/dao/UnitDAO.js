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

        //recupera as matrizes do usuario

        const sql = `SELECT g002.idg002 id, g002.nmunidad as text FROM g002 
                     WHERE stcadast = 'A'`;

         result = await db.execute({ client, sql }).then(r => r.rows);
      }  
      else if(resultu.ids002 === 2) {////adm matriz
        const sql = `SELECT g002.idg002 id, g002.nmunidad as text 
                     FROM  s001 s001
                     INNER JOIN g001 g001  ON  g001.ids001ad = s001.ids001 
                     INNER JOIN g002 g002  ON  g002.idg001   = g001.idg001  
                     AND  g002.stcadast = 'A'
                     WHERE s001.ids001  = $1`;
        const params = [ids001];

         result = await db.execute({ client, sql, params }).then(r => r.rows);
            
      }   
      else if(resultu.ids002 === 3) { /// responsavel matriz
        const sql = `SELECT g002.idg002 id, g002.nmunidad as text 
                      FROM  s001 s001
                      INNER JOIN g002 g002  ON  g002.ids001ad = s001.ids001  AND  g002.stcadast = 'A'
                      WHERE s001.ids001  = $1`;
        const params = [ids001];

         result = await db.execute({ client, sql, params }).then(r => r.rows);
      }                    
      else{  ////operador
        const sql = `SELECT g002.idg002 id, g002.nmunidad as text 
                     FROM g007  
                     INNER JOIN g002 ON g002.idg002 = g007.idg002  AND  g002.stcadast = 'A'
                     INNER JOIN s001 ON g007.ids001op  = s001.ids001
                     WHERE s001.ids001  = $1`;
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

  api.filterMatriz = async function (req, res, next) {

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

        //recupera as matrizes do usuario

        const sql = `SELECT g001.idg001 id, g001.nmmatriz as text FROM g001`;

         result = await db.execute({ client, sql }).then(r => r.rows);
      }  
      else if(resultu.ids002 === 2) {////adm matriz
        const sql = `SELECT g001.idg001 id, g001.nmmatriz  as text
                     FROM  s001 s001
                     INNER JOIN g001 g001  ON  g001.ids001ad = s001.ids001 
                     WHERE s001.ids001  = $1`;
        const params = [ids001];

         result = await db.execute({ client, sql, params }).then(r => r.rows);
            
      }   
      else if(resultu.ids002 === 3) { /// responsavel unidade
        const sql = `SELECT g001.idg001 id, g001.nmmatriz  as text
                      FROM  s001 s001
                      INNER JOIN g002 g002  ON  g002.ids001ad = s001.ids001 AND  g002.stcadast = 'A'
                      INNER JOIN g001 g001  ON  g001.idg001    = g002.idg001
                      WHERE s001.ids001  = $1
                      group by g001.idg001, g001.nmmatriz`;
        const params = [ids001];

         result = await db.execute({ client, sql, params }).then(r => r.rows);
      }                    
      else{  ////operador
        const sql = `SELECT g001.idg001 id, g001.nmmatriz  as text
                      FROM s001 
                      INNER join g006 on g006.ids001op  = s001.ids001  
                      INNER join g001 on g001.idg001  = g006.idg001 
                      WHERE s001.ids001 = $1
                     group by g001.idg001, g001.nmmatriz`;
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

  api.filterunitstoope = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `select g.idg002 id, g.nmunidad  as text 
                    from g007 g7 
                         inner join g002 g  on g.idg002 = g7.idg002 AND  g.stcadast = 'A'
                         inner join s001 s  on g7.ids001op  = s.ids001
                    group by g.idg002 , g.nmunidad     
                    having  count(s.ids001) < 3 `;

      const result = await db.execute({ client, sql }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filterbymatriz = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      
      const idg001 = req.query.idg001;
      const params = [idg001];
      const sql = `SELECT g002.idg002 id, g002.nmunidad as text
                    FROM g002 g002
                    JOIN g001 g001   ON g001.idg001   = g002.idg001
                    JOIN g005 g005   ON g005.idg002   = g002.idg002
                    JOIN g003 g003   ON g003.idg003   = g005.idg003
                                    AND g003.tpcontat = 'T'
                    JOIN s001 s001ad ON s001ad.ids001 = g002.ids001ad
                    JOIN g007 g007   ON g007.idg002   = g002.idg002
                    JOIN s001 s001op ON s001op.ids001 = g007.ids001op  
                    where g001.idg001  = $1
                    AND  g002.stcadast = 'A'
                    GROUP BY g002.idg002
                      , g002.nmunidad`;

      const result = await db.execute({ client, sql , params}).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filterByNome = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const nmunidad = req.query.nmunidad;

      const sql = `SELECT g002.idg002 id, g002.nmunidad as text FROM g002 WHERE lower(g002.nmunidad) = lower($1)`, params = [nmunidad];

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

      const { params, where } = db.where({ req, table: 'g002' });



      const sql = `SELECT g002.idg002
                        , g002.nmunidad
                        , g002.idg001
                        , g001.nmmatriz
                        , g002.ids001ad
                        , s001ad.nmusuari
                        , g002.dsendere
                        , g002.dsbairro
                        , g002.nrendere
                        , g002.nrcepend
                        , g002.nmcidade
                        , g002.cdestado
                        , g003.idg003
                        , g003.dscontat nrtelefo
                        , STRING_AGG(CAST(g007.ids001op AS VARCHAR(50)), ',' ORDER BY g007.ids001op) idoperad
                        , STRING_AGG(s001op.nmusuari, ',' ORDER BY g007.ids001op) nmoperad
                        , case when g002.nmimagem is null then 'assets/img/images/SemImagem.png' else g002.nmimagem end as nmimagem
                        , g002.stcadast
                     FROM g002 g002
                     JOIN g001 g001   ON g001.idg001   = g002.idg001
                     JOIN g005 g005   ON g005.idg002   = g002.idg002
                     JOIN g003 g003   ON g003.idg003   = g005.idg003
                                     AND g003.tpcontat = 'T'
                     JOIN s001 s001ad ON s001ad.ids001 = g002.ids001ad
                     JOIN g007 g007   ON g007.idg002   = g002.idg002
                     JOIN s001 s001op ON s001op.ids001 = g007.ids001op
                     ${where}
                 GROUP BY g002.idg002
                        , g002.nmunidad
                        , g002.idg001
                        , g001.nmmatriz
                        , g002.ids001ad
                        , s001ad.nmusuari
                        , g002.dsendere
                        , g002.dsbairro
                        , g002.nrendere
                        , g002.nrcepend
                        , g002.nmcidade
                        , g002.cdestado
                        , g003.idg003
                        , g003.dscontat`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

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

      const where  = req.body.nmunidad ? `g002.nmunidad like $1 ` : `g002.idg002 = $1`;
      const params = req.body.nmunidad ? [`%${req.body.nmunidad}%`] : [req.body.idg002];

      const sql = `SELECT g002.idg002
                        , g002.nmunidad
                        , g002.idg001
                        , g001.nmmatriz
                        , g002.ids001ad
                        , s001ad.nmusuari
                        , g002.dsendere
                        , g002.dsbairro
                        , g002.nrendere
                        , g002.nrcepend
                        , g002.nmcidade
                        , g002.cdestado
                        , g003.idg003
                        , g003.dscontat nrtelefo
                        , STRING_AGG(CAST(g007.ids001op AS VARCHAR(50)), ',' ORDER BY g007.ids001op) idoperad
                        , STRING_AGG(s001op.nmusuari, ',' ORDER BY g007.ids001op) nmoperad
                        , case when g002.nmimagem is null then 'assets/img/images/SemImagem.png' else g002.nmimagem end as nmimagem
                     FROM g002 g002
                     JOIN g001 g001   ON g001.idg001   = g002.idg001
                     JOIN g005 g005   ON g005.idg002   = g002.idg002
                     JOIN g003 g003   ON g003.idg003   = g005.idg003
                                     AND g003.tpcontat = 'T'
                     JOIN s001 s001ad ON s001ad.ids001 = g002.ids001ad
                     JOIN g007 g007   ON g007.idg002   = g002.idg002
                     JOIN s001 s001op ON s001op.ids001 = g007.ids001op AND  g002.stcadast = 'A'
                    WHERE ${where}
                 GROUP BY g002.idg002
                        , g002.nmunidad
                        , g002.idg001
                        , g001.nmmatriz
                        , g002.ids001ad
                        , s001ad.nmusuari
                        , g002.dsendere
                        , g002.dsbairro
                        , g002.nrendere
                        , g002.nrcepend
                        , g002.nmcidade
                        , g002.cdestado
                        , g003.idg003
                        , g003.dscontat`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.create = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          nmunidad: req.body.nmunidad
        , ids001ad: req.body.ids001ad
        , dsendere: req.body.dsendere
        , nrendere: req.body.nrendere
        , dsbairro: req.body.dsbairro
        , ids001  : req.body.ids001
        , nrcepend: req.body.nrcepend
        , nmcidade: req.body.nmcidade
        , cdestado: req.body.cdestado
        , idg001  : req.body.idg001
        , nmimagem: req.body.nmimagem
      };

      const result = await db.insert({ client, table: 'g002', id: 'idg002', columns }).then(r => r.idg002 || null);

      return result;

    } catch (err) { throw err; }
  }

  api.update = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          nmunidad: req.body.nmunidad
        , ids001ad: req.body.ids001ad
        , dsendere: req.body.dsendere
        , nrendere: req.body.nrendere
        , dsbairro: req.body.dsbairro
        , nrcepend: req.body.nrcepend
        , nmcidade: req.body.nmcidade
        , cdestado: req.body.cdestado
        , idg001: req.body.idg001
        , nmimagem: req.body.nmimagem
      };

      const conditions = `idg002 = $idg002`, parameters = { idg002: req.body.idg002 };

      const result = await db.update({ client, table  : 'g002', columns, conditions, parameters });

      return result;

    } catch (err) {
      throw err;
    }

  }

  api.delete = async function (req, res, next) {
    try {
      const { pool, client } = await db.openDB();

      const sql = 'SELECT stcadast from g002 WHERE idg002 = $1', params = [req.query.idg002];
      const obunidade = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      let result;

      if(obunidade.stcadast === 'A'){

      // inativar a unidade 29/03/2022 - alinhado com Ronaldo
      const sql = `UPDATE g002 SET stcadast = 'I' WHERE idg002 = $1`;

      result = await db.execute({ client, sql, params });
      }
      else{
        const sql = `UPDATE g002 SET stcadast = 'A' WHERE idg002 = $1`;

        result = await db.execute({ client, sql, params });
      }

      await db.closeDB({ pool, client });

      return result;

    } catch (err) { throw err; }
  }

  api.createUnitContact = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          idg002: req.body.idg002
        , idg003: req.body.idg003
        , ids001: req.body.ids001
      };

      const result = await db.insert({ client, table: 'g005', id: 'idg005', columns }).then(r => r.idg005 || null);

      return result;

    } catch (err) { throw err; }
  }

  api.searchUnitContact = async function (req, res, next) {
    try {

      const { client } = req;

      const sql = `SELECT g003.idg003 FROM g003
                     JOIN g005 ON g005.idg003 = g003.idg003
                    WHERE g005.idg002 = $1`;

      const params = [req.query.idg002];

      const result = await db.execute({ client, sql, params })
                             .then(r => (r.rows && r.rows.length) ? r.rows.map(c => c.idg003) : []);

      return result;

    } catch (err) { throw err; }
  }

  api.deleteUnitContact = async function (req, res, next) {
    try {
      const { client } = req;

      const sql = 'DELETE FROM g005 WHERE idg002 = $1', params = [req.query.idg002];

      const result = await db.execute({ client, sql, params });

      return result;

    } catch (err) { throw err; }
  }

  api.createOperatorUnit = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
          idg002  : req.body.idg002
        , ids001  : req.body.ids001
        , ids001op: req.body.ids001op
      };

      const result = await db.insert({ client, table: 'g007', id: 'idg007', columns }).then(r => r.idg007 || null);

      return result;

    } catch (err) { throw err; }
  }

  api.deleteOperatorUnit = async function (req, res, next) {
    try {

      const { client } = req;

      const idg002 = (req.query) ? (req.query.idg002 || req.body.idg002) : req.body.idg002;

      const sql = 'DELETE FROM g007 WHERE idg002 = $1', params = [idg002];

      const result = await db.execute({ client, sql, params });

      return result;

    } catch (err) { throw err; }
  }

  return api;

}