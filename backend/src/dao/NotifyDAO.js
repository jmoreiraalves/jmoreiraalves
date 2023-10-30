module.exports = function (app) {

  var api = {};
  const db = app.config.database;

  api.listnotify = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const { params, where } = db.where({ req, table: 'g012' });

      const sql = ` SELECT idg012, 
                            idusuari, 
                            --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now() - dtcadast) as text) , ' Horas')
                            --        else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
                            --end 
                            to_char(dtcadast, 'DD/MM/YYYY HH24:MM')
                            dtcadast, 
                            to_char(dtleitur, 'DD/MM/YYYY') as dtleitur,       
                            case when  tpnotify = 2 then true else false end as efavorit, 
                            mensagem, titulo, unidade,
                            case when icone is null then  'assets/img/images/SemImagem.png' else icone end as nmimage,  media
                      FROM g012                   
                         ${where}
                      ORDER BY g012.dtcadast DESC`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }//fim da listagem de notificação por tipo

  api.list = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {


      if (req.body.filter === '') {
        /* notificaçoes não lidas */
        const sql = ` SELECT idg012, idusuari, 
                          --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
                          --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
                          --end
                          to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, 
                      to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
                      case when efavorit = 1 then true else false end as efavorit, mensagem, 
                          titulo, unidade, case when icone is null then  'assets/img/images/SemImagem.png' else icone end as icone,  media
                           FROM g012
                           WHERE g012.idusuari = $1
                             AND ( g012.elido = 0 ) 
                    ORDER BY idg012 ASC  `;


        const params = [req.body.id];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);

        await db.closeDB({ pool, client });

        return result;
      }
      else {
        /* notificaçoes não lidas */
        const sql = ` SELECT idg012, idusuari, 
              --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
              --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
              --end
              to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, 
          to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
          case when efavorit = 1 then true else false end as efavorit, mensagem, 
              titulo, unidade, 
              case when icone is null then  'assets/img/images/SemImagem.png' else icone end as icone,  media
                FROM g012
                WHERE g012.idusuari = $1 
                AND (
                  (lower(g012.titulo) like concat('%',  lower(cast($2 as varchar)) , '%'))
                  OR (lower(g012.unidade) like concat('%',  lower(cast($2 as varchar)) , '%'))
                  )
                  AND ( g012.elido = 0 ) 
        ORDER BY idg012 ASC  `;


        const params = [req.body.id, req.body.filter];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);
        await db.closeDB({ pool, client });

        return result;
      }


    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.listall = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {


      if (req.body.filter === '') {
        /* todas notificações */
        const sql = ` SELECT idg012, idusuari, 
                              --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
                              --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
                              --end
                              to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
                          case when efavorit = 1 then true else false end as efavorit, mensagem, 
                          titulo, unidade, 
                          case when icone is null then  'assets/img/images/SemImagem.png' else icone end as icone,  media
                           FROM g012
                           WHERE g012.idusuari = $1
                    ORDER BY idg012 ASC  `;


        const params = [req.body.id];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);

        await db.closeDB({ pool, client });

        return result;
      }
      else {
        const sql = ` SELECT idg012, idusuari, 
                              --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
                              --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
                              --end
                              to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
                          case when efavorit = 1 then true else false end as efavorit, mensagem, 
                          titulo, unidade,
                          case when icone is null then  'assets/img/images/SemImagem.png' else icone end as icone,  media
                           FROM g012
                           WHERE g012.idusuari = $1
                           AND (
                              (lower(g012.titulo) like concat('%',  lower(cast($2 as varchar)) , '%'))
                              OR (lower(g012.unidade) like concat('%',  lower(cast($2 as varchar)) , '%'))
                              )

                    ORDER BY idg012 ASC  `;


        const params = [req.body.id, req.body.filter];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);
        await db.closeDB({ pool, client });

        return result;
      }


    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.listfav = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {


      if (req.body.filter === '') {
        /* notificações favoritas */
        const sql = ` SELECT idg012, idusuari, 
                              --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
                              --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
                              --end
                              to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
                          case when efavorit = 1 then true else false end as efavorit, mensagem, 
                          titulo, unidade, icone,  media
                           FROM g012
                           WHERE g012.idusuari = $1 
                           AND ( g012.efavorit = 1 )
                    ORDER BY idg012 ASC  `;



        const params = [req.body.id];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);

        await db.closeDB({ pool, client });

        return result;
      }
      else {
        /* notificações favoritas */
        const sql = ` SELECT idg012, idusuari, 
              --case when  extract(day from now() - dtcadast) = 0 then concat(cast(extract(hours from now()            - dtcadast) as text) , ' Horas')
              --else concat(cast(extract(day from now()- dtcadast) as text) , ' Dias')
              --end
              to_char(dtcadast, 'DD/MM/YYYY HH24:MM') dtcadast, to_char(dtleitur, 'DD/MM/YYYY') as dtleitur, 
          case when efavorit = 1 then true else false end as efavorit, mensagem, 
          titulo, unidade, icone,  media
            FROM g012
            WHERE g012.idusuari = $1 
            AND (
              (lower(g012.titulo) like concat('%',  lower(cast($2 as varchar)) , '%'))
              OR (lower(g012.unidade) like concat('%',  lower(cast($2 as varchar)) , '%'))
              )
            AND ( g012.efavorit = 1 )
        ORDER BY idg012 ASC  `;



        const params = [req.body.id, req.body.filter];

        const result = await db.execute({ client, sql, params }).then(r => r.rows);
        await db.closeDB({ pool, client });

        return result;
      }


    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.count = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {
      /* notificações favoritas */
      const sql = `with contador as (
                      select count(*) as todas, 0 entrada, 0 favorita from g012 where idusuari  = $1 
                      union
                      select 0 todas, count(*) as entrada, 0 favorita from g012 where idusuari  = $1 and tpnotify = 1
                      union
                      select 0 todas, 0 entrada, count(*) as favorita from g012 where idusuari  = $1 and tpnotify  = 2
                    )
                    select sum(todas) as todas, sum(entrada) as entrada, sum(favorita) as favorita 
                    from contador`;



      const params = [req.query.idusuari];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }


  api.lido = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const idg012 = req.query.id;

      req.body.tpnotify = req.query.tpnotify;
      req.body.dtleitur = req.query.dtleitur;
      req.body.elido = req.query.elido;

      const columns = req.body, conditions = `idg012 = $idg012 AND elido = 0`, parameters = { idg012 };

      const result = await db.update({ client, table: 'g012', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.favorito = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const idg012 = req.query.id;

      req.body.efavorit = req.query.efavorit;
      req.body.tpnotify = req.query.tpnotify;


      const columns = req.body, conditions = `idg012 = $idg012`, parameters = { idg012 };

      const result = await db.update({ client, table: 'g012', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar matriz funil diario
  api.listmatriz = async function (req, res, next) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = ` SELECT idg001, nmmatriz, ids001ad, imgmatri AS nmimagem FROM g001`;

      const result = await db.execute({ client, sql }).then(r => r.rows);
      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar matriz media mensal
  api.listmatrizmedia = async function (req, res, next) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = `select 
                        g001.idg001,
                        g001.nmmatriz,
                        g001.ids001ad,
                        g008.vlfatura, 
                        g001.imgmatri AS nmimagem  
                    from g001
                    left join g009 on g009.idg001  = g001.idg001 
                    left join g008 on g008.idg008  = g009.idg008
                    where g008.vlfatura is not null`;

      const result = await db.execute({ client, sql }).then(r => r.rows);
      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar unidades funil diario
  api.listunidades = async function (req, res, next) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = ` SELECT idg002, nmunidad, ids001ad, nmimagem FROM g002`;

      const result = await db.execute({ client, sql }).then(r => r.rows);
      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar unidades media mensal
  api.listunidadesmedia = async function (req, res, next) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = `select 
                        g002.idg002,
                        g002.nmunidad,
                        g002.ids001ad,
                        g008.vlfatura,
                        g002.nmimagem     
                    from g002
                    left join g009 on g009.idg002  = g002.idg002
                    left join g008 on g008.idg008  = g009.idg008
                    where g008.vlfatura is not null`;

      const result = await db.execute({ client, sql }).then(r => r.rows);
      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar funil matriz funil diario
  api.funilmatriz = async function (req) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = `select 
                          g010.idg010 ,
                          g010.dtlancto ,
                          g001.idg001 ,
                          g001.nmmatriz ,
                          g001.ids001ad 
                    from g010 
                    join g011 on g010.idg010  = g011.idg010 
                    join g001 on g001.idg001  = g011.idg001 
                    where g001.idg001  = $1
                    and g010.dtlancto = CURRENT_DATE`;


      const params = [req.body.idg001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar funil matriz media mensal
  api.funilmatrizmedia = async function (req) {
    const { pool, client } = await db.openDB();

    try {

      const sql = `select        
                    to_char(g010.dtlancto, 'MM/YYYY') dtlancto  ,
                    g001.idg001 ,
                    g001.nmmatriz ,
                    g001.ids001ad ,
                    AVG(g010.vrfatdia) as media
              from g010 
              join g011 on g010.idg010  = g011.idg010 
              join g001 on g001.idg001  = g011.idg001 
              where g001.idg001= $1
              and TO_CHAR(g010.dtlancto, 'MM/YYYY') = TO_CHAR(Date(now()), 'MM/YYYY')
              group by                      
                     to_char(g010.dtlancto, 'MM/YYYY'),
                     g001.idg001 ,
                     g001.nmmatriz  ,
                     g001.ids001ad  `;


      const params = [req.body.idg001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  //listar funil unidade
  api.funilunidade = async function (req) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = `select 
                          g010.idg010 ,
                          g010.dtlancto ,
                          g002.idg002 ,
                          g002.nmunidad ,
                          g002.ids001ad 
                    from g010 
                    join g011 on g010.idg010  = g011.idg010 
                    join g002 on g002.idg002  = g011.idg002 
                    where g002.idg002  = $1
                    and g010.dtlancto = CURRENT_DATE`;


      const params = [req.body.idg002];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }
  //listar funil unidade media mensal
  api.funilunidademedia = async function (req) {
    const { pool, client } = await db.openDB();

    try {
      /* notificaçoes não lidas */
      const sql = `select 
                          to_char(g010.dtlancto, 'MM/YYYY') dtlancto ,
                          g002.idg002 ,
                          g002.nmunidad ,
                          g002.ids001ad ,
                          AVG(g010.vrfatdia) as media
                    from g010 
                    join g011 on g010.idg010  = g011.idg010 
                    join g002 on g002.idg002  = g011.idg002 
                    where g002.idg002  = $1
                    and TO_CHAR(g010.dtlancto, 'MM/YYYY') = TO_CHAR(Date(now()), 'MM/YYYY')
                    group by 
                          to_char(g010.dtlancto, 'MM/YYYY') ,
                          g002.idg002 ,
                          g002.nmunidad ,
                          g002.ids001ad`;


      const params = [req.body.idg002];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }


  ////gravar a notificacao
  api.createnotify = async function (req) {
    const { pool, client } = await db.openDB();

    const idg001 = req?.idg001;
    const idg002 = req?.idg002;
    delete req.idg001;
    delete req.idg002;

    const columns = {
      idusuari: req.idusuari
      , mensagem: req.mensagem
      , titulo: req.titulo
      , unidade: req.unidade
      , icone: req.nmimage
    };

    try {
      const result4 = await db.insert({ client, table: 'g012', id: 'idg012', columns }).then(r => r.idg012 || null);

      let sql = `insert into g012(idusuari, mensagem, titulo, unidade, icone)
        select 
        ids001,
        $1 mensagem,
        $2 titulo,
        $3 unidade,
        $4 icone
        from s001 s where ids002  = 1`;


      let params = [req.mensagem, req.titulo, req.unidade, req.nmimage];

      let result = await db.execute({ client, sql, params }).then(r => r.rows);

      ////operdores da matriz
      if (idg001) {
        sql = `insert into g012(idusuari, mensagem, titulo, unidade, icone)
          select 
          s001.ids001,
          $1 mensagem,
          $2 titulo,
          $3 unidade,
          $4 icone
          from g001
          join g006 on g006.idg001 = g001.idg001 
          join s001 on s001.ids001 = g006.ids001op 
          where g001.idg001  = $5`;


        params = [req.mensagem, req.titulo, req.unidade, req.nmimage, idg001];
        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }
      ////operdores unidade
      if (idg002) {
        sql = `insert into g012(idusuari, mensagem, titulo, unidade, icone)
          select 
          s001.ids001,
          $1 mensagem,
          $2 titulo,
          $3 unidade,
          $4 icone
          from g002 
          join g007 on g007.idg002 = g002.idg002 
          join s001 on s001.ids001 = g007.ids001op 
          where g002.idg002 = $5`;

        //const params = [req.body.id, req.body.filter, req.body.elido, req.body.efavorit];    
        params = [req.mensagem, req.titulo, req.unidade, req.nmimage, idg002];
        result = await db.execute({ client, sql, params }).then(r => r.rows);
      }


      await db.closeDB({ pool, client });

      return result4;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  return api;

} //final da classe    