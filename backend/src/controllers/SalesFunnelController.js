const exceljs = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = function (app) {

  var api = {};
  const dao = app.src.dao.SalesFunnelDAO;
  const daoU = app.src.dao.UnitDAO;
  const db = app.config.database;
  const daoN = app.src.dao.NotifyDAO;

  api.ismetaexiste = async function (req, res, next) {
    try {

        const existemeta = await dao.ismetaexiste(req, res, next);
    
      res.json(existemeta);

    } catch (err) {
      next(err);
    }
  }

  api.list = async function (req, res, next) {
    try {

      const data = await dao.list(req, res, next);

      const result = data.map(d => {
        const ariduni = d.idunidad.split(',').map(id => parseInt(id));
        const arnmuni = d.nmunidad.split(',');

        d.arunidad = ariduni.map((idg002, i) => { return { idg002, nmunidad: arnmuni[i] } });

        delete d.idunidad;
        delete d.nmunidad;

        return d;
      });

      res.json(result);

    } catch (err) {
      next(err);
    }
  }

  api.search = async function (req, res, next) {
    try {

      const result = await dao.search(req, res, next);
      res.json(result);

    } catch (err) {
      next(err);
    }
  }

  api.create = async function (req, res, next) {
    try {
      let existemeta ;
      existemeta = await dao.existemetacadastrada(req, res, next);
      if (existemeta.qtdcadastrado) {
        const { result, message } = await api.save(req, res, next);
        if (!message) {
          let obmeta;
          let obfunil;
          let obultfunil;
          let stringuser;
          //Buscar o valor de meta para a unidade ou matriz
          if (req.body.tipolanc === 'U') {
            obmeta = await dao.buscametaunidade(req, res, next);
            //Buscar funil de vendas
            obfunil = await dao.buscafunilunidade(req, res, next);
            //buscar ultimo funil cadastrado
            obultfunil = await dao.buscaultfunilunidade(req, res, next);
          }
          else {
            obmeta = await dao.buscametamatriz(req, res, next);
            //Buscar funil de vendas
            obfunil = await dao.buscafunilmatriz(req, res, next);
            //buscar ultimo funil cadastrado
            obultfunil = await dao.buscaultfunilmatriz(req, res, next);
          }
          //testar se a meta não foi atingida
          if ((parseFloat(obmeta.result.vlfatura) > parseFloat(obfunil.result.vlfatdia))
            || (parseFloat(obmeta.result.vlticket) > parseFloat(obfunil.result.vrticket))
            || (parseInt(obmeta.result.pcagenda) > parseInt(obfunil.result.qtagenda))
            || (parseInt(obmeta.result.pccompar) > parseInt(obfunil.result.qtcompar))
            || (parseInt(obmeta.result.pcfecham) > parseInt(obfunil.result.qtfecham))
            || (parseInt(obmeta.result.qtleahot) > parseInt(obfunil.result.qtleadhot))
          ) {
            if (parseInt(obfunil.result.stnotify) === 0) {
              //se o total de stnotify =0 
              //1) enviar e-mail de notificação
              if (req.body.tipolanc !== 'U') {
                stringuser = `{"body":"","batemeta":"N","dsemail":"` + obultfunil.result.emailadmmat + `","nmusuari":"` + obultfunil.result.nmadmmat + `", "nmunidadematriz":"` + obultfunil.result.nmmatriz + `"}`;
              }
              else {
                stringuser = `{"body":"","batemeta":"N","dsemail":"` + obultfunil.result.emailadmuni + `","nmusuari":"` + obultfunil.result.nmadmuni + `", "nmunidadematriz":"` + obultfunil.result.nmunidad + `"}`;
              }
              await dao.sendMail(JSON.parse(stringuser));
              //2) setar o valor stnotify = 1
              let txUser = `{"idg010":"` + obultfunil.result.idg010 + `","stnotify":"1"}`;
              let body = JSON.parse(txUser);
              const res001 = await dao.setstnotify(body);
              //3) gravar a notificação

              if (req.body.tipolanc !== 'U') {
                ///lancar notificação para a matriz
                const cadnot = `{"idg001":"` + obultfunil.result.idg001 + `","idusuari": "` + obultfunil.result.ids001admat + `", "mensagem": "Atenção ` + obultfunil.result.nmmatriz + `, você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas", "titulo":"Lançamento diário Funil de Vendas", "unidade":"` + obultfunil.result.nmmatriz + `", "nmimage":"` + obultfunil.result.imgmatri + `"}`;
                const result = await daoN.createnotify(JSON.parse(cadnot));
              }
              else {
                ///lancar notificação para a unidade
                const cadnot = `{"idg002":"` + obultfunil.result.idg002 + `","idusuari": "` + obultfunil.result.ids001aduni + `", "mensagem": "Atenção ` + obultfunil.result.nmunidad + `, você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas", "titulo":"Lançamento diário Funil de Vendas", "unidade":"` + obultfunil.result.nmunidad + `", "nmimage":"` + obultfunil.result.nmimagem + `"}`;
                const result = await daoN.createnotify(JSON.parse(cadnot));
              }
            }
          }
          else {
            if (parseInt(obfunil.result.stnotify) === 1) {
              //se a meta foi atingida e o stnotify = 1
              // enviar e-mail de meta atingida


              if (req.body.tipolanc !== 'U') {
                stringuser = `{"body":"","batemeta":"S","dsemail":"` + obultfunil.result.emailadmmat + `","nmusuari":"` + obultfunil.result.nmadmmat + `", "nmunidadematriz":"` + obultfunil.result.nmmatriz + `"}`;
              }
              else {
                stringuser = `{"body":"","batemeta":"S","dsemail":"` + obultfunil.result.emailadmuni + `","nmusuari":"` + obultfunil.result.nmadmuni + `", "nmunidadematriz":"` + obultfunil.result.nmunidad + `"}`;
              }
              await dao.sendMail(JSON.parse(stringuser));
              //setar o valor stnotify = 2
              let txUser = `{"idg010":"` + obultfunil.result.idg010 + `","stnotify":"2"}`;
              let body = JSON.parse(txUser);
              const res001 = await dao.setstnotify(body);
            }
          }

        }
        (message) ? res.status(400).send({ message }) : res.json(result);
      }
      else {
        //não tem meta cadastrada
        message = 'Não existe uma Meta cadastrada.';
        res.status(400).send({ message })

      }
      //função que renorna menssagem quando não tem meta cadastrada
    } catch (err) { next(err); }
  }


api.createimport = async function (req, res, next) {
  try {
    const { result, message } = await api.saveimport(req, res, next);

    (message) ? res.status(400).send({ message }) : res.json(result);
  } catch (err) { next(err); }
}

api.save = async function (req, res, next) {
  try {

    const { pool, client } = await db.openDB();

    let message = '', result = [];

    if (client) {

      req.client = client;
      req.pool = pool;

      if (req.body.tipolanc === 'U') {
        ///função que verifica se ja houve lançamento para unidade no dia
        const obunidades = await dao.existelancamento(req, res, next)
        if (obunidades.qtdcadastrado === 0) {

          req.body.idg010 = await dao.create(req, res, next);

          if (req.body.idg010) {
            for (const idg002 of req.body.arunidad) {
              const rqRelSales = { client, body: { idg010: req.body.idg010, idg002 } };

              await dao.createRelSalesFun(rqRelSales, res, next).then(rs => result.push(rs));;
            }

            if (!result.length) message = 'Falha ao vincular unidade às vendas';
          } else {
            message = 'Falha ao cadastrar vendas';
          }

        }
        else {
          message = 'Funil de Vendas já cadastrada no sistema para Unidade ou Matriz,\n favor revise as informações do lançamento do dia.';
        }
      } //// fs inclusao de unidade
      else {
        ///função que verifica se ja houve lançamento para matriz no dia
        const obunidades = await dao.existelancamentomatriz(req, res, next)
        if (obunidades.qtdcadastrado === 0) {

          req.body.idg010 = await dao.create(req, res, next);

          if (req.body.idg010) {
            for (const idg002 of req.body.arunidad) {
              const rqRelSales = { client, body: { idg010: req.body.idg010, idg002 } };

              await dao.createRelSalesFunMatriz(rqRelSales, res, next).then(rs => result.push(rs));;
            }

            if (!result.length) message = 'Falha ao vincular matriz às vendas';
          } else {
            message = 'Falha ao cadastrar vendas';
          }

        }
        else {
          message = 'Funil de Vendas já cadastrada no sistema para Unidade ou Matriz,\n favor revise as informações do lançamento do dia.';
        }
      } ////fim da incusão de matriz     

    } else {
      message = 'Não foi possível abrir conexão';
    }

    if (message) {
      await db.rollbackDB({ pool, client });
    } else {
      await db.closeDB({ pool, client });
    }

    return { result, message };

  } catch (err) {

    if (req.pool && req.client) await db.rollbackDB(req);
    throw err;

  }
}

api.saveimport = async function (req, res, next) {
  try {

    const { pool, client } = await db.openDB();

    let message = '', result = [];

    if (client) {

      req.client = client;
      req.pool = pool;

      if (req.body.tipolanc === 'U') {
        ///função que verifica se ja houve lançamento para unidade no dia
        const obunidades = await dao.existelancamento(req, res, next)
        if (obunidades.qtdcadastrado === 0) {

          req.body.idg010 = await dao.createimport(req, res, next);

          if (req.body.idg010) {
            for (const idg002 of req.body.arunidad) {
              const rqRelSales = { client, body: { idg010: req.body.idg010, idg002 } };

              await dao.createRelSalesFun(rqRelSales, res, next).then(rs => result.push(rs));;
            }

            if (!result.length) message = 'Falha ao vincular unidade às vendas';
          } else {
            message = 'Falha ao cadastrar vendas';
          }

        }
        else {
          message = 'Funil de Vendas já cadastrada no sistema para Unidade ou Matriz,\n favor revise as informações do lançamento do dia.';
        }
      } //// fs inclusao de unidade
      else {
        ///função que verifica se ja houve lançamento para matriz no dia
        const obunidades = await dao.existelancamentomatriz(req, res, next)
        if (obunidades.qtdcadastrado === 0) {

          req.body.idg010 = await dao.createimport(req, res, next);

          if (req.body.idg010) {
            for (const idg002 of req.body.arunidad) {
              const rqRelSales = { client, body: { idg010: req.body.idg010, idg002 } };

              await dao.createRelSalesFunMatriz(rqRelSales, res, next).then(rs => result.push(rs));;
            }

            if (!result.length) message = 'Falha ao vincular matriz às vendas';
          } else {
            message = 'Falha ao cadastrar vendas';
          }

        }
        else {
          message = 'Funil de Vendas já cadastrada no sistema para Unidade ou Matriz,\n favor revise as informações do lançamento do dia.';
        }
      } ////fim da incusão de matriz





    } else {
      message = 'Não foi possível abrir conexão';
    }

    if (message) {
      await db.rollbackDB({ pool, client });
    } else {
      await db.closeDB({ pool, client });
    }

    return { result, message };

  } catch (err) {

    if (req.pool && req.client) await db.rollbackDB(req);
    throw err;

  }
}

api.update = async function (req, res, next) {

  try {
    const { pool, client } = await db.openDB();

    delete req.body.idcanal;
    delete req.body.dtlancto;

    let message = '', result = null, arIDG011 = [];

    if (client) {

      req.pool = pool;
      req.client = client;
      
      result = await dao.update(req, res, next);

      if (!result) message = 'Falha na atualização do funil de vendas';


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

      const deleteRelSalesFun = await dao.deleteRelSalesFun(req, res, next);

      if (deleteRelSalesFun) {

        result = await dao.delete(req, res, next);

        if (!result) message = 'Falha ao excluir funil de vendas';

      } else {
        message = 'Falha ao excluir unidade';
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

api.bulkSalesFun = async function (req, res, next) {
  try {
    const { file } = req;
    let result = null;
    let i = 0;
    let arLinhas = [];

    const filePath = path.resolve(process.cwd(), 'Funnil_Vendas.xlsx');
    const buffer = (file && file.buffer) || fs.readFileSync(filePath);

    if (buffer) {
      const arSales = await readExcel(
        buffer
        , 'Planilha1'
        , ['idcanal', 'unidad', 'qtleads', 'qtleahot', 'qtagenda', 'qtcompar', 'qtfecham'
          , 'vrfatdia', 'vropofec', 'vlticket', 'vrinvest', 'dtlancto']
        , ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);

      const arunits = arSales.map(p => p.unidad);

      for (let sales of arSales) {
        const linha = sales.linha;

        try {

          req.body.qtleads = sales.qtleads;
          req.body.qtleahot = sales.qtleahot;
          req.body.qtagenda = sales.qtagenda;
          req.body.qtcompar = sales.qtcompar;
          req.body.qtfecham = sales.qtfecham;
          req.body.vrfatdia = sales.vrfatdia;
          req.body.vropofec = sales.vropofec;
          req.body.vrinvest = sales.vrinvest;
          req.body.dtlancto = sales.dtlancto;

          req.body.idcanal = getCanal(sales.idcanal);

          req.body.idg002 = null;
          req.body.nmunidad = arunits[i];
          objUnit = await daoU.search(req, res, next);

          if (objUnit.result) {

            req.body.idg002 = objUnit.result.idg002;
            req.body.arunidad = [req.body.idg002];

            result = await api.save(req, res, next);

            if (result) arLinhas[i] = linha;
          } else {
            console.log('Não foi possível localizar a ' + arunits[i]);
          }

          i++;

        } catch (err) {
          fs.appendFileSync(path.resolve(process.cwd(), 'log-import-error.txt'), `Linha: ${linha} - ${err}\n`);
        }
      }
      console.log(`>>> Finalizando carga de funil de vendas - ${new Date().toLocaleString()}`);

      res.json(arLinhas);
    } else {
      res.status(400).send({ message: 'Arquivo não identificado!' });
    }
  } catch (err) { next(err); }
}

return api;

}

readExcel = async function (buffer, worksheet, model, cells) {
  const arOb = [];
  const wb = new exceljs.Workbook();

  await wb.xlsx.load(buffer);
  const sh = wb.getWorksheet(worksheet);

  for (let i = 2; i <= sh.rowCount; i++) {
    const row = sh.getRow(i);
    const ob = { linha: i };
    model.map((prop, i) => ob[prop] = row.getCell(cells[i]).value);
    if (ob.idcanal) arOb.push(ob);

  }

  return arOb;
}

getCanal = function (type) {
  const canais = {
    "Facebook": 1,
    "Linkedin": 2,
    "Instagram": 3,
    "Google": 4
  };

  return canais[type] || 'Canal inexistente';
};