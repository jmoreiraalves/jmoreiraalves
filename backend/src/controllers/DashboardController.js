module.exports = function (app) {

  var api   = {};
  const dao = app.src.dao.DashboardDAO;

  api.all = async function(req, res, next) {
    try {
      
      const idg001 = req.query.idg001;
      const idg002 = req.query.idg002;
      
      let data;
      let rows;
      let rowsperiodo;
      let arvendas;
      let rowscanais;     

       //não considerar a matriz, apenas filtro por unidade
       if(idg001 !=='null' && (idg002 === undefined || idg002 === 'null')) {
          const { query, where } = getDataWhereM(req.query);
          req.where = where;
          req.query = query;
          data     = await dao.generalM(req, res, next);
       
          rowsperiodo = await dao.perDayOfMonthMPeriodo(req, res, next);
          arvendas = await dao.lastSallesM(req, res, next);
       
          rowscanais = await dao.perdayofcanaisMperiodo(req, res, next);
        }
        else{
            if(req.query.idcanal === '-1'){
              req.query.idcanal = null;
            }
            const { query, where } = getDataWhere(req.query);
            req.where = where;
            req.query = query;
             data     = await dao.general(req, res, next);
           
             rowsperiodo = await dao.perDayOfMonthPeriodo(req, res, next);
             arvendas = await dao.lastSalles(req, res, next);
           
            rowscanais = await dao.perdayofcanaisperiodo(req, res, next);
          }    

      const arleads  = verifyLength(rowsperiodo.map(r => parseInt  (r.ttleads )));
      const arleahot = verifyLength(rowsperiodo.map(r => parseInt  (r.ttleahot)));
      const aragenda = verifyLength(rowsperiodo.map(r => parseInt  (r.ttagenda)));
      const arcompar = verifyLength(rowsperiodo.map(r => parseInt  (r.ttcompar)));
      const arfecham = verifyLength(rowsperiodo.map(r => parseInt  (r.ttfecham)));
      const arfatura = verifyLength(rowsperiodo.map(r => parseFloat(r.ttfatura)));
      const arvonf   = verifyLength(rowsperiodo.map(r => parseFloat(r.ttvonf)));
      const ardtlancto = verifyLength(rowsperiodo.map(r => (r.dtlancto)));

      const arfacebook = verifyLength(rowscanais.map(r => parseInt(r.ttfacebook)));
      const arinstagram = verifyLength(rowscanais.map(r => parseInt(r.ttinstagram)));
      const argoogle = verifyLength(rowscanais.map(r => parseInt(r.ttgoogle)));
      const arlinkedin = verifyLength(rowscanais.map(r => parseInt(r.ttlinkedin)));
      const arcanaisdt = verifyLength(rowscanais.map(r => (r.dtlancto)));

      
      const result = { ...data, ... { arleads, arleahot, aragenda, arcompar, arfecham, arfatura, arvendas, arvonf, ardtlancto , arfacebook, arinstagram, argoogle, arlinkedin, arcanaisdt} };

      res.json(result);
    } catch (err) { next(err); }
  }

  api.verificalancamento = async function(req, res, next){
    try { 
    let result =0;
    let resultm;
    let resultu;
    const idg001 = req.query.idg001;
    const idg002 = req.query.idg002;

    const { query, where } = getDataWhereVL(req.query);
    req.where = where;
    req.query = query;

    //buscar lançamentos para matriz
    if(idg002 === 'null') {
      req.where.g001_idg001 = idg001;
      delete req.where.g002_idg002;
      resultm = await  dao.verificalancamentoMatriz (req, res, next);
    }else{
      req.where.g002_idg002 = idg002;
      delete req.where.g001_idg001;
      resultu = await  dao.verificalancamentoUnidade (req, res, next);
    }
    
    let ttmatriz  = 0;
    if(resultm === undefined) {ttmatriz = 0; } else {ttmatriz = resultm.total  ;} 
    let ttunidade = 0;
    if(resultu === undefined) {ttunidade = 0;} else{ttunidade = resultu.total;}

    result = parseInt(ttunidade) + parseInt(ttmatriz);
    
    res.json(result);
    } catch (err) { next(err); }
    
  }

  api.markSalles = async function(req, res, next) {
    try {
      const idg001 = req.query.idg001;
      const idg002 = req.query.idg002;

      let result;

      if(idg001 !=='null' && (idg002 === undefined || idg002 === 'null')) {
           const { query, where } = getDataWhereM(req.query);

           req.where = where;
           req.query = query;
          
          delete req.where.g002_idg001;
          
          result = await dao.markSallesM(req, res, next);
        }
        else{
          if(req.query.idcanal === '-1'){
            req.query.idcanal = null;
          }
          const { query, where } = getDataWhere(req.query);

          req.where = where;
          req.query = query;
         
          result = await dao.markSalles(req, res, next);
        }
      

      res.json(result);
    } catch (err) { next(err); }
  }

  return api;

}

verifyLength = (data) => (data.length === 1) ? [...[0], ...data] : data;

getDataWhere = function (data) {
  try {
    // Valida nulos e indefinidos
   
    data.startdate= validateNullUndefined(data.startdate);
    data.enddate = validateNullUndefined(data.enddate);
 
    data.idg002   = validateNullUndefined(data.idg002  );
 
    data.idcanal  = validateNullUndefined(data.idcanal );
    data.idg001   = validateNullUndefined(data.idg001  );

    // Trata parâmetros filtro
    data.idg002   = (data.idg002 && !Array.isArray(data.idg002)) ? [data.idg002] : data.idg002 || null;
     
    data.startdate = (data.startdate) ? new Date(data.startdate) : new Date();
    data.enddate = (data.enddate) ? new Date(data.enddate) : new Date();
      
    const where = { g002_idg002: data.idg002, g010_idcanal: data.idcanal, g002_idg001: data.idg001 };
    
    const query = {  startdate: data.startdate, enddate: data.enddate, idcanal: data.idcanal, idg002: data.idg002};

    return { query, where };
  } catch (err) { throw err; }
}

getDataWhereM = function (data) {
  try {
    // Valida nulos e indefinidos
    data.dtlancto = validateNullUndefined(data.dtlancto);
    data.startdate= validateNullUndefined(data.startdate);
    data.enddate = validateNullUndefined(data.enddate);
    
    data.idg002   = validateNullUndefined(data.idg002  );
   
    data.idcanal  = validateNullUndefined(data.idcanal );
    data.idg001   = validateNullUndefined(data.idg001  );

    // Trata parâmetros filtro
    data.idg002   = (data.idg002 && !Array.isArray(data.idg002)) ? [data.idg002] : data.idg002 || null;
   
    data.startdate = (data.startdate) ? new Date(data.startdate) : new Date();
    data.enddate = (data.enddate) ? new Date(data.enddate) : new Date();

   
    const where = { g002_idg002: data.idg002 };
    const query = { startdate: data.startdate, enddate: data.enddate, idcanal: data.idcanal, idg001: data.idg001};
   

    return { query, where };
  } catch (err) { throw err; }
}

getDataWhereVL = function (data) {
  try {
    // Valida nulos e indefinidos
    data.dtlancto = validateNullUndefined(data.dtlancto);
    data.mesanola = validateNullUndefined(data.mesanola);
    data.idg002   = validateNullUndefined(data.idg002  );
    data.nrdialan = validateNullUndefined(data.nrdialan);
    data.idcanal  = validateNullUndefined(data.idcanal );
    data.idg001   = validateNullUndefined(data.idg001  );

    // Trata parâmetros filtro
    data.idg002   = (data.idg002 && !Array.isArray(data.idg002)) ? [data.idg002] : data.idg002 || null;
    data.dtlancto = (data.dtlancto) ? new Date(data.dtlancto) : new Date();
    data.formatdt = (data.nrdialan) ? 'DD/MM/YYYY' : 'MM/YYYY';

    const where = { g002_idg002: data.idg002, g010_idcanal: data.idcanal, g001_idg001: data.idg001 };
    const query = { dtlancto: data.dtlancto, formatdt: data.formatdt };

    return { query, where };
  } catch (err) { throw err; }
}
validateNullUndefined = (data) => (data === 'null' || data === 'undefined') ? null : data;