module.exports = function (app) {

  var api  = {};
  const db = app.config.database;

  api.login = async function (req) {

    const { pool, client } = await db.openDB();

    try {

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
                    WHERE dsemail = $1`;

      const params = [req.body.email];

      const result = await db.execute({ client, sql, params })
                                 .then(r => r.rows[0]);   
       if(result){
        if(result.firstac === 0) {
          const ids001 = result.ids001;
          const columns = {
            firstac: true              
          };
  
          const conditions = `ids001 = $ids001`, parameters = { ids001: ids001 };
  
          const result3 = await db.update({ client, table  : 's001', columns, conditions, parameters });
        }        
      }                              

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.nomeduplicado = async function (req) {

    const { pool, client } = await db.openDB();

    try {

      const sql = `SELECT ids001
                        , nmusuari
                        , dsemail
                        , dssenha
                        , stcadast
                        , snenvema
                        , s001.ids002
                        , dstipo
                     FROM s001
                     JOIN s002 on s002.ids002 = s001.ids002
                    WHERE LOWER(nmusuari) = LOWER(trim($1))`;

      const params = [req.body.nmusuari];

      const result = await db.execute({ client, sql, params })
                                 .then(r => r.rows[0]);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.setLastAccess = async function (req) {

    const { pool, client } = await db.openDB();

    try {

      const columns = { dtultace: new Date() };

      const conditions = `ids001 = $ids001`;

      const parameters = { ids001: req.obUser.ids001 };

      const result = await db.update({ client, table: 's001', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }
  }

  api.filter = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const { params, where } = db.where({ req, table: 's001' });

      const sql = ` SELECT s001.ids001 id, s001.nmusuari as text FROM s001 ${where}`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filterbyuserid = async function (req, res, next) {

    
    const { pool, client } = await db.openDB();

    try {

      const sql = ` SELECT ids001
                      , nmusuari
                      , dsemail
                      , dssenha
                      , stcadast
                      , snenvema
                      , s001.ids002
                      , nmimage
                       FROM s001 WHERE s001.ids001 = $1`, params = [req.query.ids001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filtramatriz = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {     

      const sql = `select g.idg001 id, g.nmmatriz as text from g001 g where ids001ad  = $1 limit 1`, 
          params = [req.query.ids001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filtraunidadesresp = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {     

      const sql = `select g.idg002 id , g.nmunidad as text 
                    from  s001 s 
                    inner join g002 g  on g.ids001ad  = s.ids001 
                    where s.ids002  = $1 and 
                    s.ids001 = $2`,  params = [req.query.ids002, req.query.ids001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.filtraunidadesope = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {     

      const sql = `select g.idg002 id, g.nmunidad  as text 
                  from g007 g7 
                  inner join g002 g  on g.idg002 = g7.idg002 
                  inner join s001 s  on g7.ids001op  = s.ids001
                    where s.ids002  = $1 and 
                    s.ids001 = $2`,  params = [req.query.ids002, req.query.ids001];

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.isactive = async function (req, res, next) {

    
    const { pool, client } = await db.openDB();

    try {

      const sql = ` SELECT ids001
                      , nmusuari
                      , dsemail
                      , dssenha
                      , stcadast
                      , snenvema
                      , s001.ids002
                      , nmimage
                       FROM s001 WHERE s001.ids001 = $1`, params = [req.query.ids001];

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

      const { params, where } = db.where({ req, table: 's001' });

      const sql = ` SELECT s001.ids001
                         , s001.nmusuari
                         , s001.dsemail
                         , s001.stcadast
                         , CASE s001.stcadast WHEN 'A' THEN 'Ativo' ELSE 'Inativo' END dsstatus
                         , s001.snenvema
                         , s002.ids002
                         , s002.dstipo
                         , CASE WHEN s001.nmimage is null THEN 'assets/img/imagesuser/SemImagem.jpg' ELSE s001.nmimage END nmimage 
                         , s002.nacesso
                         , (select concat( cast(g.idg001 as varchar(50)), ',' , g.nmmatriz )  from g001 g where ids001ad  = s001.ids001 limit 1) AS arunidade
                         , (select cast(sum( total ) as varchar(50)) from (
                          select count(*) as total from  s001 s 
                            inner join g002 g  on g.ids001ad  = s.ids001 
                            where s.ids001 = s001.ids001
                              union 
                              select count(*) as total 
                                from g007 g7 
                            inner join g002 g  on g.idg002 = g7.idg002 
                            inner join s001 s  on g7.ids001op  = s.ids001
                            where s.ids001 = s001.ids001
                          ) total)  as qtunidade
                      FROM s001
                      JOIN s002 ON s002.ids002 = s001.ids002                      
                         ${where}
                      ORDER BY s001.dtcadast DESC`;

      const result = await db.execute({ client, sql, params }).then(r => r.rows);

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.create = async function (req, res, next) {

    const { pool, client } = await db.openDB();
    
    //remover os campos matriz e unidad
    const idg001 = req.body.matriz;
    const unidad = req.body.unidad; //id administrador da unidade
    const ids001 = req.body.ids001;

    delete req.body.ids001;
    delete req.body.matriz;
    delete req.body.unidad;


    try {

      const columns = req.body, id = 'ids001';

      const result = await db.insert({ client, table: 's001', id, columns }).then(r => r[id]);
      
      ///vincular o usuario a matriz
      if(req.body.ids002 === 2){
          if(idg001 !== undefined && idg001 !== null)
          {
              const columns = {
                ids001ad  : result
            }, conditions = `idg001 = $idg001`, parameters = { idg001 };

            const result2 = await db.update({ client, table: 'g001', columns, conditions, parameters });

          }
      }

      ///vincluar o usuario como responsavel da unidade
      if(req.body.ids002 === 3){
        if(unidad !== undefined && unidad !== null)
        { 
          for(const val of unidad) {
            const idg002 = val.id;
            const columns = {
              ids001ad: ids001              
            };    
            const conditions = `idg002 = $idg002`, parameters = { idg002: idg002 };
      
            const result3 = await db.update({ client, table  : 'g002', columns, conditions, parameters });

          }         
        
        }
    }

      ///incluir o usuario na lista de operador da unidade
      if(req.body.ids002 === 4){
        if(unidad !== undefined && unidad !== null)
        {      
          ///deletar todos as unidades da qual o usuario faz parte para recriar
           const sql = 'DELETE FROM g007 WHERE ids001op = $1', params = [ids001];

           const result = await db.execute({ client, sql, params });

          for(const val of unidad) {
              const columns = {
                idg002  : val.id
              , ids001  : ids001
              , ids001op: ids001
            };

            const result4 = await db.insert({ client, table: 'g007', id: 'idg007', columns }).then(r => r.idg007 || null);
           }
        }
      } 


      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.update = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const ids001 = req.body.ids001;

      const idg001 = req.body.matriz;

      const unidad = req.body.unidad;

      delete req.body.ids001;
      delete req.body.matriz;
      delete req.body.unidad;
      if( !!req.body.stcadast ){
      req.body.stcadast = req.body.stcadast.id;
      }

      const columns = req.body, conditions = `ids001 = $ids001`, parameters = { ids001 };

      const result = await db.update({ client, table: 's001', columns, conditions, parameters });

      ///vincular o usuario a matriz
      if(req.body.ids002 === 2){
        if(idg001 !== undefined && idg001 !== null)
          {
              const columns = {
                ids001ad  : ids001
            }, conditions = `idg001 = $idg001`, parameters = { idg001 };

            const result2 = await db.update({ client, table: 'g001', columns, conditions, parameters });

          }
      }

      ///vincluar o usuario como responsavel da unidade
      if(req.body.ids002 === 3){
        if(unidad !== undefined && unidad !== null)
        { 
          for(const val of unidad) {
            const idg002 = val.id;
            const columns = {
              ids001ad: ids001              
            };    
            const conditions = `idg002 = $idg002`, parameters = { idg002: idg002 };
      
            const result3 = await db.update({ client, table  : 'g002', columns, conditions, parameters });

          }         
         
        }
    }

      ///incluir o usuario na lista de operador da unidade
      if(req.body.ids002 === 4){
        if(unidad !== undefined && unidad !== null)
        {      
          ///deletar todos as unidades da qual o usuario faz parte para recriar
           const sql = 'DELETE FROM g007 WHERE ids001op = $1', params = [ids001];

           const result = await db.execute({ client, sql, params });

          for(const val of unidad) {
              const columns = {
                idg002  : val.id
              , ids001  : ids001
              , ids001op: ids001
            };

            const result4 = await db.insert({ client, table: 'g007', id: 'idg007', columns }).then(r => r.idg007 || null);
           }
        }
      } 

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.updateimage = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const ids001 = req.body.ids001;

      delete req.body.ids001;
      delete req.body.dsemail;
      delete req.body.dsstatus;
      delete req.body.dstipo;
      delete req.body.ids002;
      delete req.body.nmusuari;
      delete req.body.snenvena;
      delete req.body.stcadast;

      const columns = req.body, conditions = `ids001 = $ids001`, parameters = { ids001 };

      const result = await db.update({ client, table: 's001', columns, conditions, parameters });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  api.delete = async function (req, res, next) {

    const { pool, client } = await db.openDB();

    try {

      const sql = 'DELETE FROM s001 WHERE ids001 = $1', params = [req.query.ids001];

      const result = await db.execute({ client, sql, params });

      await db.closeDB({ pool, client });

      return result;

    } catch (err) {

      await db.rollbackDB({ pool, client });
      throw err;

    }

  }

  return api;

}