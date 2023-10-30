module.exports = function (app) {

  var api  = {};
  const db = app.config.database;

  api.general = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH g010a AS (
                       SELECT SUM(g010.qtleads ) ttleads
                            , SUM(g010.qtleahot) ttleahot
                            , SUM(g010.qtagenda) ttagenda
                            , SUM(g010.qtcompar) ttcompar
                            , SUM(g010.qtfecham) ttfecham
                            , SUM(g010.vrfatdia) ttfatura
                            , SUM(g010.vropofec) ttvonf
                            , SUM(g010.vrfatdia/cOALESCE(g010.qtfecham,1)) ttticket
                       FROM g010
                       JOIN g011 ON g011.idg010 = g010.idg010
                       JOIN g002 ON g002.idg002 = g011.idg002
                       WHERE g010.dtlancto BETWEEN $1::timestamp - '1 MONTH'::INTERVAL AND $2::timestamp - '1 MONTH'::INTERVAL
                      ${where}
                   ), g010b as (
                     SELECT SUM(g010.qtleads ) ttleads
                          , SUM(g010.qtleahot) ttleahot
                          , SUM(g010.qtagenda) ttagenda
                          , SUM(g010.qtcompar) ttcompar
                          , SUM(g010.qtfecham) ttfecham
                          , SUM(g010.vrfatdia) ttfatura
                          , SUM(g010.vropofec) ttvonf
                          , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                       FROM g010
                       JOIN g011 ON g011.idg010 = g010.idg010
                       JOIN g002 ON g002.idg002 = g011.idg002
                      WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      ${where}
                   )
                   SELECT COALESCE(g010b.ttleads, 0) ttleads
                        , COALESCE(g010b.ttleahoT, 0) ttleahot
                        , COALESCE(g010b.ttagendA, 0) ttagenda
                        , COALESCE(g010b.ttcompaR, 0) ttcompar
                        , COALESCE(g010b.ttfechaM, 0) ttfecham
                        , COALESCE(g010b.ttfaturA, 0) ttfatura
                        , COALESCE(g010b.ttvonf , 0) ttvonf
                        , COALESCE(g010b.tttickeT, 0) ttticket
                        , COALESCE(ROUND((g010b.ttagenda * 100 / COALESCE(COALESCE(g010a.ttagenda,1), g010b.ttagenda / 2)) - 100) , 0)pcagenda
                        , COALESCE(ROUND((g010b.ttcompar * 100 / COALESCE(COALESCE(g010a.ttcompar,1), g010b.ttcompar / 2)) - 100) , 0)pccompar
                        , COALESCE(ROUND((g010b.ttfecham * 100 / COALESCE(COALESCE(g010a.ttfecham,1), g010b.ttfecham / 2)) - 100) , 0)pcfecham
                        , COALESCE(ROUND((g010b.ttfatura * 100 / COALESCE(COALESCE(g010a.ttfatura,1), g010b.ttfatura / 2)) - 100) , 0)pcfatura
                        , COALESCE(ROUND((g010b.ttleahot * 100 / COALESCE(COALESCE(g010a.ttleahot,1), g010b.ttleahot / 2)) - 100) , 0)pcleahot
                        , COALESCE(buscametaleadhotmatriz($3),0) metaleadhot
                        , COALESCE(buscametaagendamatriz($3),0)  metaagenda
                        , COALESCE(buscametacomparmatriz($3),0) metacompar
                        , COALESCE(buscametafechammatriz($3),0) metafecham
                        , COALESCE(buscametafaturamatriz($3),0) metafatura
                        , COALESCE(buscametaticketmatriz($3),0) metaticket
                     FROM g010b, g010a`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0] || null);
      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }

  api.generalM = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {
       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
       const idcanal   = req.query.idcanal;

      const params = [ startdate, enddate, idg001, idcanal];

      const sql = `WITH g010a AS (
                     SELECT SUM(g010.qtleads ) ttleads
                          , SUM(g010.qtleahot) ttleahot
                          , SUM(g010.qtagenda) ttagenda
                          , SUM(g010.qtcompar) ttcompar
                          , SUM(g010.qtfecham) ttfecham
                          , SUM(g010.vrfatdia) ttfatura
                          , SUM(g010.vropofec) ttvonf
                          , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                       FROM g010
                       JOIN g011 ON g011.idg010 = g010.idg010
                       JOIN g001 ON g001.idg001 = g011.idg001
                      WHERE g010.dtlancto BETWEEN $1::timestamp - '1 MONTH'::INTERVAL AND $2::timestamp - '1 MONTH'::INTERVAL
                      AND (g011.idg001 = $3 OR $3 = -1)
                      AND (g010.idcanal = $4 OR $4 = -1)
                   ), g010b as (
                     SELECT SUM(g010.qtleads ) ttleads
                          , SUM(g010.qtleahot) ttleahot
                          , SUM(g010.qtagenda) ttagenda
                          , SUM(g010.qtcompar) ttcompar
                          , SUM(g010.qtfecham) ttfecham
                          , SUM(g010.vrfatdia) ttfatura
                          , SUM(g010.vropofec) ttvonf
                          , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                       FROM g010
                       JOIN g011 ON g011.idg010 = g010.idg010
                       JOIN g001 ON g001.idg001 = g011.idg001
                      WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                       AND (g011.idg001 = $3 OR $3 = -1)
                       AND (g010.idcanal = $4 OR $4 = -1)
                   )
                   SELECT COALESCE(g010b.ttleads, 0) ttleads
                        , COALESCE(g010b.ttleahoT, 0) ttleahot
                        , COALESCE(g010b.ttagendA, 0) ttagenda
                        , COALESCE(g010b.ttcompaR, 0) ttcompar
                        , COALESCE(g010b.ttfechaM, 0) ttfecham
                        , COALESCE(g010b.ttfaturA, 0) ttfatura
                        , COALESCE(g010b.ttvonf , 0) ttvonf
                        , COALESCE(g010b.tttickeT, 0) ttticket
                        , COALESCE(ROUND((g010b.ttagenda * 100 / COALESCE(COALESCE(g010a.ttagenda,1), g010b.ttagenda / 2)) - 100) , 0)pcagenda
                        , COALESCE(ROUND((g010b.ttcompar * 100 / COALESCE(COALESCE(g010a.ttcompar,1), g010b.ttcompar / 2)) - 100) , 0)pccompar
                        , COALESCE(ROUND((g010b.ttfecham * 100 / COALESCE(COALESCE(g010a.ttfecham,1), g010b.ttfecham / 2)) - 100) , 0)pcfecham
                        , COALESCE(ROUND((g010b.ttfatura * 100 / COALESCE(COALESCE(g010a.ttfatura,1), g010b.ttfatura / 2)) - 100) , 0)pcfatura
                        , COALESCE(ROUND((g010b.ttleahot * 100 / COALESCE(COALESCE(g010a.ttleahot,1), g010b.ttleahot / 2)) - 100) , 0)pcleahot
                        , COALESCE(buscametaleadhotmatriz($3),0) metaleadhot
                        , COALESCE(buscametaagendamatriz($3),0)  metaagenda
                        , COALESCE(buscametacomparmatriz($3),0) metacompar
                        , COALESCE(buscametafechammatriz($3),0) metafecham
                        , COALESCE(buscametafaturamatriz($3),0) metafatura
                        , COALESCE(buscametaticketmatriz($3),0) metaticket
                     FROM g010b, g010a`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0] || null);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }

  api.perDayOfMonth = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH x AS (
                          SELECT EXTRACT(day FROM d) nrdiames
                            FROM GENERATE_SERIES(
                                    NOW()::timestamp - CONCAT(EXTRACT(day FROM NOW()::timestamp) - 1, ' days')::INTERVAL
                                  , NOW()::timestamp
                                  , '1 day'::INTERVAL
                                ) d
                      ), y as (
                          SELECT SUM(g010.qtleads ) ttleads
                                , SUM(g010.qtleahot) ttleahot
                                , SUM(g010.qtagenda) ttagenda
                                , SUM(g010.qtcompar) ttcompar
                                , SUM(g010.vrinvest) ttinvest
                                , SUM(g010.qtfecham) ttfecham
                                , SUM(g010.vrfatdia) ttfatura
                                , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                                , SUM(g010.vropofec) ttvonf
                                , EXTRACT(day FROM g010.dtlancto) nrdialan
                            FROM g010
                            JOIN g011 ON g011.idg010 = g010.idg010
                            JOIN g002 ON g002.idg002 = g011.idg002
                           WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                            ${where}
                        GROUP BY nrdialan
                      )
                      SELECT x.nrdiames nrdialan
                            , COALESCE(y.ttleads , 0) ttleads
                            , COALESCE(y.ttleahot, 0) ttleahot
                            , COALESCE(y.ttagenda, 0) ttagenda
                            , COALESCE(y.ttcompar, 0) ttcompar
                            , COALESCE(y.ttinvest, 0) ttinvest
                            , COALESCE(y.ttfecham, 0) ttfecham
                            , COALESCE(y.ttfatura, 0) ttfatura
                            , COALESCE(y.ttticket, 0) ttticket
                            , COALESCE(y.ttvonf, 0) ttvonf
                        FROM x
                    LEFT JOIN y on x.nrdiames = y.nrdialan
                    ORDER BY x.nrdiames`;

      

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;
    }

  }

  api.perDayOfMonthM = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
       const idcanal   = req.query.idcanal;
       const params = [ startdate, enddate, idg001, idcanal];

      const sql = `WITH x AS (
                      SELECT EXTRACT(day FROM d) nrdiames
                        FROM GENERATE_SERIES(
                                NOW()::timestamp - CONCAT(EXTRACT(day FROM NOW()::timestamp) - 1, ' days')::INTERVAL
                              , NOW()::timestamp
                              , '1 day'::INTERVAL
                            ) d
                   ), y as (
                       SELECT SUM(g010.qtleads ) ttleads
                            , SUM(g010.qtleahot) ttleahot
                            , SUM(g010.qtagenda) ttagenda
                            , SUM(g010.qtcompar) ttcompar
                            , SUM(g010.vrinvest) ttinvest
                            , SUM(g010.qtfecham) ttfecham
                            , SUM(g010.vrfatdia) ttfatura
                            , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                            , SUM(g010.vropofec) ttvonf
                            , EXTRACT(day FROM g010.dtlancto) nrdialan
                         FROM g010
                         JOIN g011 ON g011.idg010 = g010.idg010
                         JOIN g001 ON g001.idg001 = g011.idg001
                     WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                       AND (g011.idg001 = $3 OR $3 = -1)
                       AND (g010.idcanal = $4 OR $4 = -1)
                     GROUP BY nrdialan
                   )
                   SELECT x.nrdiames nrdialan
                        , COALESCE(y.ttleads , 0) ttleads
                        , COALESCE(y.ttleahot, 0) ttleahot
                        , COALESCE(y.ttagenda, 0) ttagenda
                        , COALESCE(y.ttcompar, 0) ttcompar
                        , COALESCE(y.ttinvest, 0) ttinvest
                        , COALESCE(y.ttfecham, 0) ttfecham
                        , COALESCE(y.ttfatura, 0) ttfatura
                        , COALESCE(y.ttticket, 0) ttticket
                        , COALESCE(y.ttvonf, 0) ttvonf
                     FROM x
                 LEFT JOIN y on x.nrdiames = y.nrdialan
                 ORDER BY x.nrdiames`;     

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }

  api.perDayOfMonthMPeriodo = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
       const idcanal   = req.query.idcanal;
       const params = [ startdate, enddate, idg001, idcanal];

      const sql = `WITH x AS (                      
                       SELECT SUM(g010.qtleads ) ttleads
                            , SUM(g010.qtleahot) ttleahot
                            , SUM(g010.qtagenda) ttagenda
                            , SUM(g010.qtcompar) ttcompar
                            , SUM(g010.vrinvest) ttinvest
                            , SUM(g010.qtfecham) ttfecham
                            , SUM(g010.vrfatdia) ttfatura
                            , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                            , SUM(g010.vropofec) ttvonf
                            , TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto
                         FROM g010
                         JOIN g011 ON g011.idg010 = g010.idg010
                         JOIN g001 ON g001.idg001 = g011.idg001
                     WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                       AND (g011.idg001 = $3 OR $3 = -1)
                       AND (g010.idcanal = $4 OR $4 = -1)
                     GROUP BY g010.dtlancto
                   )
                   SELECT x.dtlancto
                        , COALESCE(ttleads , 0) ttleads
                        , COALESCE(ttleahot, 0) ttleahot
                        , COALESCE(ttagenda, 0) ttagenda
                        , COALESCE(ttcompar, 0) ttcompar
                        , COALESCE(ttinvest, 0) ttinvest
                        , COALESCE(ttfecham, 0) ttfecham
                        , COALESCE(ttfatura, 0) ttfatura
                        , COALESCE(ttticket, 0) ttticket
                        , COALESCE(ttvonf, 0) ttvonf
                     FROM x
                 ORDER BY x.dtlancto`;     

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }
  api.perDayOfMonthPeriodo = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH x AS (                         
                          SELECT SUM(g010.qtleads ) ttleads
                                , SUM(g010.qtleahot) ttleahot
                                , SUM(g010.qtagenda) ttagenda
                                , SUM(g010.qtcompar) ttcompar
                                , SUM(g010.vrinvest) ttinvest
                                , SUM(g010.qtfecham) ttfecham
                                , SUM(g010.vrfatdia) ttfatura
                                , SUM(g010.vrfatdia/COALESCE(g010.qtfecham,1)) ttticket
                                , SUM(g010.vropofec) ttvonf
                                , TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto
                            FROM g010
                            JOIN g011 ON g011.idg010 = g010.idg010
                            JOIN g002 ON g002.idg002 = g011.idg002
                           WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                            ${where}
                        GROUP BY g010.dtlancto
                      )
                      SELECT x.dtlancto
                            , COALESCE(ttleads , 0) ttleads
                            , COALESCE(ttleahot, 0) ttleahot
                            , COALESCE(ttagenda, 0) ttagenda
                            , COALESCE(ttcompar, 0) ttcompar
                            , COALESCE(ttinvest, 0) ttinvest
                            , COALESCE(ttfecham, 0) ttfecham
                            , COALESCE(ttfatura, 0) ttfatura
                            , COALESCE(ttticket, 0) ttticket
                            , COALESCE(ttvonf, 0) ttvonf
                        FROM x
                    ORDER BY x.dtlancto`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }

  }

  api.perdayofcanaisM = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {
       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
	     const params = [ startdate, enddate, idg001];

      const sql = `WITH x AS (
                                SELECT EXTRACT(day FROM d) nrdialan
                                FROM GENERATE_SERIES(
                                  now()::timestamp - CONCAT(EXTRACT(day FROM now()::timestamp) - 1, ' days')::INTERVAL
                                      , now()::timestamp
                                      , '1 day'::INTERVAL
                                    ) d
                          ), y as (  
                          SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
                          EXTRACT(day FROM dtlancto) nrdialan,
                          coalesce (SUM(g010.qtleads), 0)  ttFacebook,
                          0 ttinstagram,
                          0 ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                     WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 1
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
                          EXTRACT(day FROM dtlancto) nrdialan,
                          0  ttFacebook,
                          coalesce (SUM(g010.qtleads), 0) ttinstagram,
                          0 ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 2
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                           TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
                          EXTRACT(day FROM dtlancto) nrdialan,
                          0  ttFacebook,
                          0 ttinstagram,
                          coalesce (SUM(g010.qtleads), 0) ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 3
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
                          EXTRACT(day FROM dtlancto) nrdialan,
                          0  ttFacebook,
                          0 ttinstagram,
                          0 ttgoogle,
                          coalesce (SUM(g010.qtleads), 0) ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 4
                     GROUP BY g010.dtlancto
                   )
                   SELECT
                   x.nrdialan,
                   COALESCE(sum(ttFacebook),0) ttFacebook ,
                   COALESCE(sum(ttinstagram),0) ttinstagram ,
                   COALESCE(sum(ttgoogle),0) ttgoogle ,
                   COALESCE(sum (ttlinkedin),0) ttlinkedin
                     FROM x
                     left join y on x.nrdialan = y.nrdialan
                     group by x.nrdialan
                     ORDER BY x.nrdialan`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });
      return result;
    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }
  }

  api.perdayofcanais = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH x AS (
                        SELECT EXTRACT(day FROM d) nrdialan
                        FROM GENERATE_SERIES(
                          now()::timestamp - CONCAT(EXTRACT(day FROM now()::timestamp) - 1, ' days')::INTERVAL
                              , now()::timestamp
                              , '1 day'::INTERVAL
                            ) d
                  ), y as (  
                  SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  EXTRACT(day FROM dtlancto) nrdialan,
                  coalesce (SUM(g010.qtleads), 0)  ttFacebook,
                  0 ttinstagram,
                  0 ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 1
                GROUP BY g010.dtlancto
                UNION
                SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  EXTRACT(day FROM dtlancto) nrdialan,
                  0  ttFacebook,
                  coalesce (SUM(g010.qtleads), 0) ttinstagram,
                  0 ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 2
                GROUP BY g010.dtlancto
                UNION
                SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  EXTRACT(day FROM dtlancto) nrdialan,
                  0  ttFacebook,
                  0 ttinstagram,
                  coalesce (SUM(g010.qtleads), 0) ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 3
                GROUP BY g010.dtlancto
                UNION
                SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  EXTRACT(day FROM dtlancto) nrdialan,
                  0  ttFacebook,
                  0 ttinstagram,
                  0 ttgoogle,
                  coalesce (SUM(g010.qtleads), 0) ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 4
                GROUP BY g010.dtlancto
                )
                SELECT
                x.nrdialan,
                COALESCE(sum(ttFacebook),0) ttFacebook ,
                COALESCE(sum(ttinstagram),0) ttinstagram ,
                COALESCE(sum(ttgoogle),0) ttgoogle ,
                COALESCE(sum (ttlinkedin),0) ttlinkedin
                FROM x
                left join y on x.nrdialan = y.nrdialan
                group by x.nrdialan
                ORDER BY x.nrdialan`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {
      await db.rollbackDB({ pool, client });
      throw err;
    }
  }

  
  api.perdayofcanaisMperiodo = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {
       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
	     const params = [ startdate, enddate, idg001];

      const sql = `WITH x AS (                                
                          SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                          coalesce (SUM(g010.qtleads), 0)  ttFacebook,
                          0 ttinstagram,
                          0 ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                     WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 1
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                          0  ttFacebook,
                          coalesce (SUM(g010.qtleads), 0) ttinstagram,
                          0 ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 2
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                          0  ttFacebook,
                          0 ttinstagram,
                          coalesce (SUM(g010.qtleads), 0) ttgoogle,
                          0 ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 3
                     GROUP BY g010.dtlancto
                     UNION
                     SELECT
                          TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                          0  ttFacebook,
                          0 ttinstagram,
                          0 ttgoogle,
                          coalesce (SUM(g010.qtleads), 0) ttlinkedin
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g001 ON g001.idg001 = g011.idg001
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                      AND (g011.idg001 = $3 OR $3 = -1)
                        AND g010.idcanal = 4
                     GROUP BY g010.dtlancto
                   )
                   SELECT
                   x.dtlancto,
                   COALESCE(sum(ttFacebook),0) ttFacebook ,
                   COALESCE(sum(ttinstagram),0) ttinstagram ,
                   COALESCE(sum(ttgoogle),0) ttgoogle ,
                   COALESCE(sum (ttlinkedin),0) ttlinkedin
                     FROM x
                     group by x.dtlancto
                     ORDER BY x.dtlancto`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.perdayofcanaisperiodo = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {
      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH x AS (                        
                  SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  coalesce (SUM(g010.qtleads), 0)  ttFacebook,
                  0 ttinstagram,
                  0 ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 1
                GROUP BY g010.dtlancto
                UNION
                SELECT
                  TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  0  ttFacebook,
                  coalesce (SUM(g010.qtleads), 0) ttinstagram,
                  0 ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 2
                GROUP BY g010.dtlancto
                UNION
                SELECT
                TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  0  ttFacebook,
                  0 ttinstagram,
                  coalesce (SUM(g010.qtleads), 0) ttgoogle,
                  0 ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 3
                GROUP BY g010.dtlancto
                UNION
                SELECT
                TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto,
                  0  ttFacebook,
                  0 ttinstagram,
                  0 ttgoogle,
                  coalesce (SUM(g010.qtleads), 0) ttlinkedin
                FROM g010
                JOIN g011 ON g011.idg010 = g010.idg010
                JOIN g002 ON g002.idg002 = g011.idg002
               WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                ${where}
                AND g010.idcanal = 4
                GROUP BY g010.dtlancto
                )
                SELECT
                x.dtlancto,
                COALESCE(sum(ttFacebook),0) ttFacebook ,
                COALESCE(sum(ttinstagram),0) ttinstagram ,
                COALESCE(sum(ttgoogle),0) ttgoogle ,
                COALESCE(sum (ttlinkedin),0) ttlinkedin
                FROM x
                group by x.dtlancto
                ORDER BY x.dtlancto`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.lastSalles = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `WITH x AS (
                              SELECT g002.idg002 ,
                              sum(g010.vrinvest) ttinvest,
                              sum(g010.vrfatdia) ttfatura,
                              sum(g010.vrfatdia) / COALESCE(sum(g010.qtfecham),1)  ttticket,
                              TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
                      ((sum(g010.vrfatdia) - buscametafaturamatriz(g002.idg001))/COALESCE(buscametafaturamatriz(g002.idg001),1)*100) pcfatura
                      FROM g010
                        JOIN g011 ON g011.idg010 = g010.idg010
                        JOIN g002 ON g002.idg002 = g011.idg002
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                              ${where}
                              group by g010.dtlancto, g002.idg002
                              order by g010.dtlancto asc
                              )
                      SELECT
                      ttinvest,
                      ttfatura,
                      replace(
                      replace(
                      replace(TO_CHAR(ttticket, '99999999999999D99') ,
                      '.',
                      '$'
                      ),
                      ',',
                      '.'
                      ),
                      '$',
                      ','
                      )ttticket ,
                                      dtlancto ,
                      /*replace(
                      replace(
                      replace(case when round(pcfatura) is null then '0' else TO_CHAR(round(pcfatura), '99999999999999D99') end  ,
                      '.',
                      '$'
                      ),
                      ',',
                      '.'
                      ),
                      '$',
                      ','
                      )*/
                      round(pcfatura) as pcfatura,
                      CASE
                        WHEN pcfatura >= 0  THEN 'success'
                        WHEN pcfatura < -30 THEN 'danger'
                        when pcfatura  is null then 'gray' ---valor não comparado
                                              ELSE 'warning'
                      END stfatura
                      FROM x`;

          const result = await db.execute({ client, sql, params }).then(r => r.rows);

          await db.closeDB({ pool, client });

          return result;

        } catch (err) {

          await db.rollbackDB({ pool, client });
          throw err;

        }




  }

  api.lastSallesM = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {
       const startdate = req.query.startdate;
       const enddate   = req.query.enddate;
       const idg001     = req.query.idg001;
       const idcanal   = req.query.idcanal;
       const params = [ startdate, enddate, idg001, idcanal];

      const sql = `with x as(
        select sum(g010.vrinvest) ttinvest,
               sum(g010.vrfatdia) ttfatura,
               sum(g010.vrfatdia) / COALESCE(sum(g010.qtfecham),1)   ttticket,
               TO_CHAR(g010.dtlancto, 'DD/MM/YYYY') dtlancto ,
               ((sum(g010.vrfatdia) - buscametafaturamatriz(g001.idg001))/COALESCE(buscametafaturamatriz(g001.idg001),1)*100) pcfatura
          FROM g010
          JOIN g011 ON g011.idg010 = g010.idg010
          JOIN g001 ON g001.idg001 = g011.idg001
         WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
          AND (g011.idg001 = $3 OR $3 = -1)
          AND (g010.idcanal = $4 OR $4 = -1)
          group by g010.dtlancto, g001.idg001
          order by g010.dtlancto asc
          )
          SELECT
                ttinvest,
                ttfatura,
                replace(
                  replace(
                  replace(TO_CHAR(ttticket, '99999999999999D99') ,
                  '.',
                  '$'
               ),
               ',',
               '.'
               ),
               '$',
               ','
               )ttticket ,
                dtlancto ,
                /*replace(
                  replace(
                  replace(case when round(pcfatura) is null then '0' else TO_CHAR(round(pcfatura), '99999999999999D99') end  ,
                  '.',
                  '$'
               ),
               ',',
               '.'
               ),
               '$',
               ','
               )*/
               round(pcfatura) as pcfatura,
                CASE
                    WHEN pcfatura >= 0  THEN 'success'
                    WHEN pcfatura < -30 THEN 'danger'
                    when pcfatura  is null then 'gray' ---valor não comparado
                    ELSE 'warning'
                END stfatura
          FROM x`;

          const result = await db.execute({ client, sql, params }).then(r => r.rows);

          await db.closeDB({ pool, client });

          return result;

        } catch (err) {

          await db.rollbackDB({ pool, client });
          throw err;

    }




  }

  api.verificalancamentoMatriz = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {
      const startdate = req.query.startdate;
      const enddate   = req.query.enddate;
      const idg001     = req.query.idg001;
      const idcanal   = req.query.idcanal;
      const params = [ startdate, enddate, idg001, idcanal];

      const sql = ` SELECT COUNT(g010.idg010) total
                         FROM g010
                         JOIN g011 ON g011.idg010 = g010.idg010
                         JOIN g001 ON g001.idg001 = g011.idg001
                        WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                         AND (g011.idg001 = $3 OR $3 = -1)
                         AND (g010.idcanal = $4 OR $4 = -1)`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.verificalancamentoUnidade = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.dtlancto, req.query.formatdt];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `SELECT COUNT(g010.idg010) total
                         FROM g010
                         JOIN g011 ON g011.idg010 = g010.idg010
                         JOIN g002 ON g002.idg002 = g011.idg002
                       WHERE TO_DATE(to_char(g010.dtlancto,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE(to_char($1::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD') AND TO_DATE(to_char($2::timestamp,'YYYY-MM-DD'),'YYYY-MM-DD')
                        ${where}`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.verificalancamento = async function(req, res, next){
    const { pool, client } = await db.openDB();

    try{
      let result;
      if(req.query.idg001 === null)
         req.query.idg001 = 0

      if(req.query.idg002 === null)
         req.query.idg002 = 0

         const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

         const start     = dbWhere.params.length + 3;
         const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      if(req.query.idcanal !== null ){
        const params = [req.query.formatdt, req.query.dtlancto, req.query.idg002, req.query.idg001 , req.query.idcanal];

        const sql = `with x as (
          select Count(*) total
          from g010
          join g011 on g011.idg010 = g010.idg010
          WHERE TO_CHAR(g010.dtlancto, $1) = TO_CHAR(Date($2), $1)
          AND g011.idg002 IN ($3)
          AND g010.idcanal = $5
          union all
          select Count(*) total
          from g010
          join g011 on g011.idg010 = g010.idg010
          WHERE TO_CHAR(g010.dtlancto, $1) = TO_CHAR(Date($2), $1)
          AND g011.idg001 IN ($4)
          AND g010.idcanal = $5
          )
          select sum(total) as total from x`;

          result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
      }
      else{
        const params = [req.query.formatdt, req.query.dtlancto, req.query.idg002, req.query.idg001 ];

        const sql = `with x as (
          select Count(*) total
          from g010
          join g011 on g011.idg010 = g010.idg010
          WHERE TO_CHAR(g010.dtlancto, $1) = TO_CHAR(Date($2), $1)
          AND g011.idg002 IN ($3)
          union all
          select Count(*) total
          from g010
          join g011 on g011.idg010 = g010.idg010
          WHERE TO_CHAR(g010.dtlancto, $1) = TO_CHAR(Date($2), $1)
          AND g011.idg001 IN ($4)
          )
          select sum(total) as total from x`;

         result = await db.execute({ client, sql, params }).then(r => r.rows[0]);
      }
      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

      }
  }

  api.markSalles = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const dbWhere   = db.where  ({ req, table: 'g010', start: 3, custom: true, notWhere: true });

      const start     = dbWhere.params.length + 3;
      const dbWhereIn = db.whereIn({ req, table: 'g010', start   , custom: true, notWhere: true });

      const where = `${dbWhere.where} ${dbWhereIn.where}`;
      const query  = [req.query.startdate, req.query.enddate];
      const params = [...query, ...dbWhere.params, ...dbWhereIn.params];

      const sql = `with x as (
                      SELECT
                          g001.idg001
                        , g001.nmmatriz
                        , g002.idg002
                        , g002.nmunidad
                        , SUM(g010.qtleads ) ttleads
                        , SUM(g010.qtleahot) ttleahot
                        , SUM(g010.qtagenda) ttagenda
                        , SUM(g010.qtcompar) ttcompar
                        , SUM(g010.qtfecham) ttfecham
                        , SUM(g010.vrfatdia) ttfatura
                        , SUM(g010.vrfatdia/g010.qtfecham) ttticket
                        , metaleadhotunidade(g002.idg002) qtleahot
                        , metaagendaunidade(g002.idg002) qtagenda
                        , metacomparunidade(g002.idg002) qtcompar
                        , metafechamunidade(g002.idg002) qtfecham
                        , metafaturaunidade(g002.idg002) vlfatura
                        , metaticketunidade(g002.idg002) vlticket
                        , COALESCE((SUM(g010.qtleahot) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcleahot
                        , COALESCE((SUM(g010.qtagenda) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcagenda
                        , COALESCE((SUM(g010.qtcompar) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pccompar
                        , COALESCE((SUM(g010.qtfecham) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcfecham
                      FROM g010
                      JOIN g011 ON g011.idg010 = g010.idg010
                      JOIN g002 ON g002.idg002 = g011.idg002
                      join g001 on g001.idg001 = g002.idg001
                        WHERE (g010.dtlancto  between $1::timestamp and $2::timestamp + time '23:59:59')
                       ${where}
                        GROUP BY g001.idg001
                        , g002.idg002
                        , g001.nmmatriz
                   )
                   select
                   x.idg001
                   , x.nmmatriz
                   , x.idg002
                   , x.nmunidad
                   , x.ttleads
                   , x.ttleahot
                   , x.ttagenda
                   , x.ttcompar
                   , x.ttfecham
                   , x.ttfatura
                   , x.ttticket
                   , x.qtleahot
                   , x.qtagenda
                   , x.qtcompar
                   , x.qtfecham
                   , x.vlfatura
                   , x.vlticket
                   , x.pcleahot
                   , x.pcagenda
                   , x.pccompar
                   , TRIM(TO_CHAR(x.pcfecham , '9999999999')) as pcfecham
                   , case
                      when x.pcleahot >= qtleahot then 'positive'
                      else 'negative'
                      end stleahot
                    , case
                      when x.pcagenda >= x.qtagenda then 'positive'
                      else 'negative'
                      end stagenda
                    , case
                      when x.pccompar >= x.qtcompar then 'positive'
                      else 'negative'
                      end stcompar
                    , case
                      when x.pcfecham >= x.qtfecham then 'positive'
                      else 'negative'
                      end stfecham
                    , case
                      when x.ttfatura >= x.vlfatura then 'positive'
                      else 'negative'
                      end stfatura
                    , case
                      when x.ttticket >= x.vlticket then 'positive'
                      else 'negative'
                      end stticket
                   from x`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.markSallesM = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const params = [req.query.startdate, req.query.enddate, req.query.idg001, req.query.idcanal]

      const sql = `with x as (
                              SELECT
                              g001.idg001
                            , g001.nmmatriz
                            , g011.idg002
                            , g001.nmmatriz nmunidad
                            , SUM(g010.qtleads ) ttleads
                            , SUM(g010.qtleahot) ttleahot
                            , SUM(g010.qtagenda) ttagenda
                            , SUM(g010.qtcompar) ttcompar
                            , SUM(g010.qtfecham) ttfecham
                            , SUM(g010.vrfatdia) ttfatura
                            , SUM(g010.vrfatdia/g010.qtfecham) ttticket
                            , metaleadhotmatriz(g001.idg001) qtleahot
                            , metaagendamatriz(g001.idg001) qtagenda
                            , metacomparmatriz(g001.idg001) qtcompar
                            , metafechammatriz(g001.idg001) qtfecham
                            , metafaturamatriz(g001.idg001) vlfatura
                            , metaticketmatriz(g001.idg001) vlticket
                            , COALESCE((SUM(g010.qtleahot) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcleahot
                            , COALESCE((SUM(g010.qtagenda) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcagenda
                            , COALESCE((SUM(g010.qtcompar) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pccompar
                            , COALESCE((SUM(g010.qtfecham) * 100 /  COALESCE(SUM(g010.qtleads ),1)), 0) pcfecham
                          FROM g010
                          JOIN g011 ON g011.idg010 = g010.idg010
                          JOIN g001 ON g001.idg001 = g011.idg001
                        WHERE (g010.dtlancto  between $1::timestamp with time zone and $2::timestamp + time '23:59:59' with time zone)
                          AND (g001.idg001  = $3 or $3 = -1)
                          AND (g010.idcanal = $4 or $4 = -1)
                        GROUP BY g001.idg001
                        , g011.idg002
                        , g001.nmmatriz
                   )
                   select
                     x.idg001
                   , x.nmmatriz
                   , x.idg002
                   , x.nmunidad
                   , x.ttleads
                   , x.ttleahot
                   , x.ttagenda
                   , x.ttcompar
                   , x.ttfecham
                   , x.ttfatura
                   , x.ttticket
                   , x.qtleahot
                   , x.qtagenda
                   , x.qtcompar
                   , x.qtfecham
                   , x.vlfatura
                   , x.vlticket
                   , x.pcleahot
                   , x.pcagenda
                   , x.pccompar
                   , TRIM(TO_CHAR(x.pcfecham , '9999999999')) as pcfecham
                   , case
                      when x.pcleahot >= qtleahot then 'positive'
                      else 'negative'
                      end stleahot
                    , case
                      when x.pcagenda >= x.qtagenda then 'positive'
                      else 'negative'
                      end stagenda
                    , case
                      when x.pccompar >= x.qtcompar then 'positive'
                      else 'negative'
                      end stcompar
                    , case
                      when x.pcfecham >= x.qtfecham then 'positive'
                      else 'negative'
                      end stfecham
                    , case
                      when x.ttfatura >= x.vlfatura then 'positive'
                      else 'negative'
                      end stfatura
                    , case
                      when x.ttticket >= x.vlticket then 'positive'
                      else 'negative'
                      end stticket
                   from x`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }




  return api;

}
