module.exports = function (app) {

  var api = {};
  const db = app.config.database;
  const utils = app.src.utils.Utils;

  api.list = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    const ids001 = req.body.ids001;

    try {

      ///recuperar o usuario e  nivel de acesso
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

      if (resultu.ids002 === 1) { ///adm sistema
        const { params, where } = db.where({ req, table: 'g010' });

        const sql = `WITH g000a AS (
                     SELECT g010.idg010
                        , g010.ids001
                        , g010.vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , g010.qtfecham
                        , g010.vrfatdia
                        , g010.vropofec
                        , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                        , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                        , STRING_AGG(CAST(g002.idg002 AS VARCHAR(50)), ',' ORDER BY g002.idg002) idunidad
                        , STRING_AGG(g002.nmunidad, ',' ORDER BY g002.idg002) nmunidad
                     FROM g010
                     JOIN g011 ON g011.idg010 = g010.idg010
                     JOIN g002 ON g002.idg002 = g011.idg002
                        ${where}
                      GROUP BY g010.idg010
                              , g010.ids001
                              , g010.vrinvest
                              , g010.idcanal
                              , g010.qtleads
                              , g010.qtleahot
                              , g010.qtagenda
                              , g010.qtcompar
                              , g010.qtfecham
                              , g010.vrfatdia
                              , g010.vropofec
                      union all 
                      SELECT g010.idg010
                              , g010.ids001
                              , g010.vrinvest
                              , g010.idcanal
                              , g010.qtleads
                              , g010.qtleahot
                              , g010.qtagenda
                              , g010.qtcompar
                              , g010.qtfecham
                              , g010.vrfatdia
                              , g010.vropofec
                              , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                              , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                              , STRING_AGG(CAST(g001.idg001 AS VARCHAR(50)), ',' ORDER BY g001.idg001) idunidad
                              , STRING_AGG(g001.nmmatriz , ',' ORDER BY g001.idg001) nmunidad
                            FROM g010
                            JOIN g011 ON g011.idg010 = g010.idg010
                            JOIN g001 ON g001.idg001 = g011.idg001                        
                        GROUP BY g010.idg010
                              , g010.ids001
                              , g010.vrinvest
                              , g010.idcanal
                              , g010.qtleads
                              , g010.qtleahot
                              , g010.qtagenda
                              , g010.qtcompar
                              , g010.qtfecham
                              , g010.vrfatdia
                              , g010.vropofec  
                        )
                        SELECT  
                          idg010
                        , ids001
                        , vrinvest
                        , idcanal
                        , qtleads
                        , qtleahot
                        , qtagenda
                        , qtcompar
                        , qtfecham
                        , vrfatdia
                        , vropofec
                        , dtcadast
                        , dtlancto
                        , idunidad
                        , nmunidad
                        FROM g000a         
                        ORDER BY g000a.dtcadast desc ,g000a.idg010 DESC`;

        result = await db.execute({ client, sql, params }).then(r => r.rows);

      }
      else if (resultu.ids002 === 2) { ///adm matriz
        
        const params = [ids001];

        const sql = `WITH g000a AS (
                     SELECT g010.idg010
                        , g010.ids001
                        , g010.vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , g010.qtfecham
                        , g010.vrfatdia
                        , g010.vropofec
                        , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                        , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                        , STRING_AGG(CAST(g002.idg002 AS VARCHAR(50)), ',' ORDER BY g002.idg002) idunidad
                        , STRING_AGG(g002.nmunidad, ',' ORDER BY g002.idg002) nmunidad
                     FROM g010
                     JOIN g011 ON g011.idg010 = g010.idg010
                     JOIN g002 ON g002.idg002 = g011.idg002
                     join g001 on g001.idg001 = g002.idg001 
                     join s001 ON s001.ids001 = g001.ids001ad  
                        where s001.ids001  = $1
                     GROUP BY g010.idg010
                        , g010.ids001
                        , g010.vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , g010.qtfecham
                        , g010.vrfatdia
                        , g010.vropofec
                    union all 
                    SELECT g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                          , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                          , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                          , STRING_AGG(CAST(g001.idg001 AS VARCHAR(50)), ',' ORDER BY g001.idg001) idunidad
                          , STRING_AGG(g001.nmmatriz , ',' ORDER BY g001.idg001) nmunidad
                        FROM g010
                        JOIN g011 ON g011.idg010 = g010.idg010
                        join g001 on g001.idg001 = g011.idg001 
                        join s001 ON s001.ids001 = g001.ids001ad
                        where s001.ids001  = $1
                        GROUP BY g010.idg010
                        , g010.ids001
                        , g010.vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , g010.qtfecham
                        , g010.vrfatdia
                        , g010.vropofec        
                    )
                    SELECT  
                      idg010
                    , ids001
                    , vrinvest
                    , idcanal
                    , qtleads
                    , qtleahot
                    , qtagenda
                    , qtcompar
                    , qtfecham
                    , vrfatdia
                    , vropofec
                    , dtcadast
                    , dtlancto
                    , idunidad
                    , nmunidad
                    FROM g000a         
                    ORDER BY g000a.dtcadast desc ,g000a.idg010 DESC `;

        result = await db.execute({ client, sql, params }).then(r => r.rows);

      }
      else if (resultu.ids002 === 3) { ///responsavel unidade
        
        const params = [ids001];

        const sql = `WITH g000a AS (
                      SELECT g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                          , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                          , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                          , STRING_AGG(CAST(g002.idg002 AS VARCHAR(50)), ',' ORDER BY g002.idg002) idunidad
                          , STRING_AGG(g002.nmunidad, ',' ORDER BY g002.idg002) nmunidad
                       FROM g010
                       JOIN g011 ON g011.idg010 = g010.idg010
                       JOIN g002 ON g002.idg002 = g011.idg002
                       join s001 on s001.ids001 = g002.ids001ad 
                       where s001.ids001  = $1                       
                   GROUP BY g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                    union 
                    SELECT g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                          , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                          , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                          , cast(g001.idg001 as VARCHAR(50))    idunidad
                          , g001.nmmatriz  nmunidad
                    FROM g010 
                    join g011 on g011.idg010 = g010.idg010 
                    join g001 on g001.idg001 = g011.idg001 
                    join g002 on g002.idg001 = g001.idg001 
                    join s001 on s001.ids001 = g002.ids001ad   
                    where s001.ids001  = $1
                    GROUP BY g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec  
                          , g001.nmmatriz
                          , g001.idg001    
                      )
                      SELECT  
                        idg010
                      , ids001
                      , vrinvest
                      , idcanal
                      , qtleads
                      , qtleahot
                      , qtagenda
                      , qtcompar
                      , qtfecham
                      , vrfatdia
                      , vropofec
                      , dtcadast
                      , dtlancto
                      , idunidad
                      , nmunidad
                      FROM g000a         
                      ORDER BY g000a.dtcadast desc ,g000a.idg010 DESC `;

        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }
      else { ///operador
        
        const params = [ids001];

        const sql = `WITH g000a AS (
                      SELECT g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                          , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                          , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                          , STRING_AGG(CAST(g002.idg002 AS VARCHAR(50)), ',' ORDER BY g002.idg002) idunidad
                          , STRING_AGG(g002.nmunidad, ',' ORDER BY g002.idg002) nmunidad
                       FROM s001
                       join g007 on g007.ids001op = s001.ids001 
                       join g002 on g002.idg002  = g007.idg002 
                       join g011 on g011.idg002  = g002 .idg002 
                       join g010 on g010.idg010  = g011.idg010 
                       where s001.ids001  = $1                       
                   GROUP BY g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                    union
                    SELECT g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec
                          , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                          , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                          , STRING_AGG(CAST(g001.idg001 AS VARCHAR(50)), ',' ORDER BY g001.idg001) idunidad
                          , STRING_AGG(g001.nmmatriz , ',' ORDER BY g001.idg001) nmunidad
                          FROM s001
                          join g007 on g007.ids001op = s001.ids001 
                          join g002 on g002.idg002  = g007.idg002 
                          join g001 on g002.idg001  = g001.idg001 
                          join g011 on g011.idg001  = g001.idg001 
                          join g010 on g010.idg010  = g011.idg010 
                          where s001.ids001  = $1    
                          GROUP BY g010.idg010
                          , g010.ids001
                          , g010.vrinvest
                          , g010.idcanal
                          , g010.qtleads
                          , g010.qtleahot
                          , g010.qtagenda
                          , g010.qtcompar
                          , g010.qtfecham
                          , g010.vrfatdia
                          , g010.vropofec   
                      )
                      SELECT  
                        idg010
                      , ids001
                      , vrinvest
                      , idcanal
                      , qtleads
                      , qtleahot
                      , qtagenda
                      , qtcompar
                      , qtfecham
                      , vrfatdia
                      , vropofec
                      , dtcadast
                      , dtlancto
                      , idunidad
                      , nmunidad
                      FROM g000a         
                      ORDER BY g000a.dtcadast desc ,g000a.idg010 DESC  `;

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

      const sql = `SELECT g010.idg010
                        , g010.ids001
                        , TRIM(TO_CHAR(g010.vrinvest, '9999999D99')) as vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , TRIM(TO_CHAR(g010.qtfecham, '9999999D99')) as qtfecham
                        , TRIM(TO_CHAR(g010.vrfatdia, '9999999D99')) as vrfatdia
                        , TRIM(TO_CHAR(g010.vropofec, '9999999D99')) as vropofec
                        , TO_CHAR(g010.dtcadast, 'dd/mm/yyyy') dtcadast
                        , TO_CHAR(g010.dtlancto, 'dd/mm/yyyy') dtlancto
                        , STRING_AGG(CAST(g002.idg002 AS VARCHAR(50)), ',' ORDER BY g002.idg002) idunidad
                        , STRING_AGG(g002.nmunidad, ',' ORDER BY g002.idg002) nmunidad
                     FROM g010
                     JOIN g011 ON g011.idg010 = g010.idg010
                     JOIN g002 ON g002.idg002 = g011.idg002
                    WHERE g010.idg010 = $1
                 GROUP BY g010.idg010
                        , g010.ids001
                        , g010.vrinvest
                        , g010.idcanal
                        , g010.qtleads
                        , g010.qtleahot
                        , g010.qtagenda
                        , g010.qtcompar
                        , g010.qtfecham
                        , g010.vrfatdia
                        , g010.vropofec
                 ORDER BY g010.dtcadast desc ,g010.idg010 DESC`;

      const params = [req.body.idg010];

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
        vrinvest: parseFloat(req.body.vrinvest.replace(/[\D]+/g, '')) / 100
        , ids001: req.body.ids001
        , idcanal: req.body.idcanal
        , qtleads: req.body.qtleads
        , qtleahot: req.body.qtleahot
        , qtagenda: req.body.qtagenda
        , qtfecham: parseInt(req.body.qtfecham.replace(/[\D]+/g, '')) // 100
        , qtcompar: req.body.qtcompar
        , vrfatdia: parseFloat(req.body.vrfatdia.replace(/[\D]+/g, '')) / 100
        , vropofec: parseFloat(req.body.vropofec.replace(/[\D]+/g, '')) / 100
        , dtlancto: new Date(req.body.dtlancto)
        , tipolanc: req.body.tipolanc
      };

      const id = 'idg010';

      const result = await db.insert({ client, table: 'g010', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.createimport = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
        vrinvest: req.body.vrinvest
        , ids001: req.body.ids001
        , idcanal: req.body.idcanal
        , qtleads: req.body.qtleads
        , qtleahot: req.body.qtleahot
        , qtagenda: req.body.qtagenda
        , qtfecham: req.body.qtfecham
        , qtcompar: req.body.qtcompar
        , vrfatdia: req.body.vrfatdia
        , vropofec: req.body.vropofec
        , dtlancto: new Date(req.body.dtlancto)
        , tipolanc: req.body.tipolanc
      };

      const id = 'idg010';

      const result = await db.insert({ client, table: 'g010', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.update = async function (req, res, next) {
    try {

      const { client } = req;

      const columns = {
        vrinvest: parseFloat(req.body.vrinvest.replace(/[\D]+/g, '')) / 100
        , ids001: req.body.ids001        
        , qtleads: req.body.qtleads
        , qtleahot: req.body.qtleahot
        , qtagenda: req.body.qtagenda
        , qtfecham: req.body.qtfecham
        , qtcompar: req.body.qtcompar
        , vrfatdia: parseFloat(req.body.vrfatdia.replace(/[\D]+/g, '')) / 100
        , vropofec: parseFloat(req.body.vropofec.replace(/[\D]+/g, '')) / 100
      };

      const conditions = `idg010 = $idg010`, parameters = { idg010: req.body.idg010 };

      const result = await db.update({ client, table: 'g010', columns, conditions, parameters });

      return result;

    } catch (err) { throw err; }
  }

  api.delete = async function (req, res, next) {
    try {
      const { client } = req;

      const sql = 'DELETE FROM g010 WHERE idg010 = $1', params = [req.query.idg010];

      const result = await db.execute({ client, sql, params })
        .then(r => r.rows);

      return { result };

    } catch (err) { throw err; }
  }

  api.createRelSalesFun = async function (req, res, next) {
    try {

      const { client } = req;

      const id = 'idg011';

      const columns = {
        idg010: req.body.idg010
        , idg002: req.body.idg002
      };

      const result = await db.insert({ client, table: 'g011', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.createRelSalesFunMatriz = async function (req, res, next) {
    try {

      const { client } = req;

      const id = 'idg011';

      const columns = {
        idg010: req.body.idg010
        , idg001: req.body.idg002
      };

      const result = await db.insert({ client, table: 'g011', id, columns }).then(r => r[id]);

      return result;

    } catch (err) { throw err; }
  }

  api.deleteRelSalesFun = async function (req, res, next) {
    try {
      const { client } = req;

      const idg010 = (req.query) ? (req.query.idg010 || req.body.idg010) : req.body.idg010;

      const sql = 'DELETE FROM g011 WHERE idg010 = $1', params = [idg010];

      const result = await db.execute({ client, sql, params })
        .then(r => r.rows);

      return { result };

    } catch (err) { throw err; }
  }

  api.existelancamento = async function (req, res, next) {

    const { pool, client } = await db.openDB();
    let qtdcadastrado = 0;

    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select * from g011
                          inner join g010  on g011.idg010 = g010.idg010
                          where g011.idg002 = $1
                            and g010.idcanal  = $2
                            and g010.dtlancto = $3`;

        const params = [idg002, req.body.idcanal, new Date(req.body.dtlancto)];

        const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
        if (result) { qtdcadastrado++; }
      }

      await db.closeDB({ pool, client });

      return { qtdcadastrado };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.existelancamentomatriz = async function (req, res, next) {

    const { pool, client } = await db.openDB();
    let qtdcadastrado = 0;

    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select * from g011
                          inner join g010  on g011.idg010 = g010.idg010
                          where g011.idg001 = $1
                            and g010.idcanal  = $2
                            and g010.dtlancto = $3`;

        const params = [idg002, req.body.idcanal, new Date(req.body.dtlancto)];

        const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
        if (result) { qtdcadastrado++; }
      }

      await db.closeDB({ pool, client });

      return { qtdcadastrado };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  
  api.ismetaexiste = async function (req, res, next) {

    const { pool, client } = await db.openDB();
    let qtdcadastrado = 0;
    try {

      if (req.query.tipolanc === 'U') {
        const idg002 = req.query.idg002
          const sql = `select * from g008 m
                          inner join g009 mmu  on m.idg008 = mmu.idg008
                          where mmu.idg002 = $1`;

          const params = [idg002];

          const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
          if (result) { qtdcadastrado++; } 
        
      }
      else {
        const idg002 = req.query.idg002
          const sql = `select * from g008 m
                          inner join g009 mmu  on m.idg008 = mmu.idg008
                          where mmu.idg001 = $1`;

          const params = [idg002];

          const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
          if (result) { qtdcadastrado++; } 
        
      }

      await db.closeDB({ pool, client });

      return { qtdcadastrado };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.existemetacadastrada = async function (req, res, next) {

    const { pool, client } = await db.openDB();
    let qtdcadastrado = 0;
    try {

      if (req.body.tipolanc === 'U') {
        for (const idg002 of req.body.arunidad) {
          const sql = `select * from g008 m
                          inner join g009 mmu  on m.idg008 = mmu.idg008
                          where mmu.idg002 = $1`;

          const params = [idg002];

          const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
          if (result) { qtdcadastrado++; } else { qtdcadastrado = null; }
        }
      }
      else {
        for (const idg002 of req.body.arunidad) {
          const sql = `select * from g008 m
                          inner join g009 mmu  on m.idg008 = mmu.idg008
                          where mmu.idg001 = $1`;

          const params = [idg002];

          const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
          if (result) { qtdcadastrado++; } else { qtdcadastrado = null; }
        }
      }

      await db.closeDB({ pool, client });

      return { qtdcadastrado };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  /* ======================================================================================
                      preparar para notificação de metas 
===========================================================================================*/
  api.buscametaunidade = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;

    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                            g008.qtagenda , g008.qtcompar , g008.qtfecham, g008.vlfatura , 
                            g008.vlticket , g008.qtleahot , 
                            round(g008.qtleahot * g008.qtagenda/100) pcagenda,
                            round(g008.qtleahot * g008.qtcompar/100) pccomprar,
                            round(g008.qtleahot * g008.qtfecham/100) pcfecham
                          from g008 
                          join g009 on g009.idg008 = g008.idg008 
                          where g009.idg002 = $1`;

        const params = [idg002];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.buscametamatriz = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;
    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                          g008.qtagenda , g008.qtcompar , g008.qtfecham, g008.vlfatura , 
                          g008.vlticket , g008.qtleahot , 
                          round(g008.qtleahot * g008.qtagenda/100) pcagenda,
                          round(g008.qtleahot * g008.qtcompar/100) pccompar,
                          round(g008.qtleahot * g008.qtfecham/100) pcfecham
                          from g008 
                          join g009 on g009.idg008 = g008.idg008 
                          where g009.idg001 = $1`;

        const params = [idg002];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.buscafunilunidade = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;

    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                              sum(g010.qtagenda) qtagenda,
                              sum(g010.qtcompar) qtcompar,
                              sum(g010.qtfecham) qtfecham,
                              sum(g010.vrfatdia) vlfatdia,
                              sum(g010.vrfatdia) /case when (sum(g010.qtfecham) is null or sum(g010.qtfecham) = 0) 
                                                    then 1 
                                                    else sum(g010.qtfecham) 
                                                  end vrticket,      
                              sum(g010.qtleahot) qtleadhot,
                              SUM(g010.stnotify) stnotify
                        from g010 
                        join g011 on g011.idg010 = g010.idg010
                        where g011.idg002 = $1
                          and g010.dtlancto  = $2 `;

        const params = [idg002, new Date(req.body.dtlancto)];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.buscafunilmatriz = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;
    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                      sum(g010.qtagenda) qtagenda,
                      sum(g010.qtcompar) qtcompar,
                      sum(g010.qtfecham) qtfecham,
                      sum(g010.vrfatdia) vlfatdia,
                      sum(g010.vrfatdia) /case when (sum(g010.qtfecham) is null or sum(g010.qtfecham) = 0) 
                                            then 1 
                                            else sum(g010.qtfecham) 
                                          end vrticket,      
                      sum(g010.qtleahot) qtleadhot,
                      SUM(g010.stnotify) stnotify
                from g010 
                join g011 on g011.idg010 = g010.idg010
                where g011.idg001 = $1
                  and g010.dtlancto  = $2 `;

        const params = [idg002, new Date(req.body.dtlancto)];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.buscaultfunilunidade = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;
    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                          g010.idg010 , g010.stnotify, g011.idg002 , g011.idg001, g001.nmmatriz, g002.nmunidad, 
                            case when g001.imgmatri is null then 'assets/img/images/SemImagem.png' else g001.imgmatri end as imgmatri 
                           ,case when g002.nmimagem  is null then 'assets/img/images/SemImagem.png' else g002.nmimagem  end as nmimagem
                          , g001.ids001ad ids001admat , g002.ids001ad ids001aduni, admmat.nmusuari nmadmmat, admmat.dsemail emailadmmat,
                          admuni.nmusuari nmadmuni, admuni.dsemail emailadmuni
                          from g010 
                          join g011 on g011.idg010 = g010.idg010
                          left join g001 on g001.idg001 = g011.idg001
                          left join g002 on g002.idg002 = g011.idg002 
                          left join s001 admmat on admmat.ids001 = g001.ids001ad 
                          left join s001 admuni on admuni.ids001 = g002.ids001ad 
                          where g011.idg002 = $1
                            and g010.dtlancto  = $2   
                            order by idg010  desc
                            limit 1`;

        const params = [idg002, new Date(req.body.dtlancto)];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.buscaultfunilmatriz = async function (req, res, next) {
    const { pool, client } = await db.openDB();
    let result;

    try {
      for (const idg002 of req.body.arunidad) {
        const sql = `select 
                          g010.idg010 , g010.stnotify, g011.idg002 , g011.idg001, 
                          case when g001.imgmatri is null then 'assets/img/images/SemImagem.png' else g001.imgmatri end as imgmatri 
                           ,case when g002.nmimagem  is null then 'assets/img/images/SemImagem.png' else g002.nmimagem  end as nmimagem
                          , g001.imgmatri , g002.nmimagem 
                          , g001.nmmatriz
                          , g002.nmunidad
                          ,g001.ids001ad ids001admat , g002.ids001ad ids001aduni, admmat.nmusuari nmadmmat, admmat.dsemail emailadmmat,
                          admuni.nmusuari nmadmuni, admuni.dsemail emailadmuni
                          from g010 
                          join g011 on g011.idg010 = g010.idg010
                          left join g001 on g001.idg001 = g011.idg001
                          left join g002 on g002.idg002 = g011.idg002 
                          left join s001 admmat on admmat.ids001 = g001.ids001ad 
                          left join s001 admuni on admuni.ids001 = g002.ids001ad 
                          where g011.idg001 = $1
                            and g010.dtlancto  = $2   
                            order by idg010  desc
                            limit 1`;

        const params = [idg002, new Date(req.body.dtlancto)];

        result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      }

      await db.closeDB({ pool, client });

      return { result };

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.setstnotify = async function (req) {
    const { pool, client } = await db.openDB();
    const columns = {
      stnotify: req.stnotify
    }
    try {
      const conditions = `idg010 = $idg010`, parameters = { idg010: req.idg010 };

      const result = await db.update({ client, table: 'g010', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }


  api.sendMail = async function (req) {
    try {
      let arMessage = [], result = null, stCode = 200;


      const EMDESTIN = req.dsemail;
      const DSASSUNT = `Sistema 6D - Notificação de Meta`;

      let DSMENSAG;
      if (req.batemeta === 'N') {
        DSMENSAG = utils.getHtmlNotify(req);
      } else {
        DSMENSAG = utils.getHtmlNotifyOK(req);
      }
      
      const msg = {
        EMDESTIN: EMDESTIN,
        DSASSUNT: DSASSUNT,
        DSMENSAG: DSMENSAG
      };
      result = await utils.sendEmail(msg);

      stCode = (result && result.blOk) ? 200 : 400;

    } catch (err) { next(err) }
  }

  return api;

}