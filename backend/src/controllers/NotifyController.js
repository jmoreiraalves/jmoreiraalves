module.exports = function (app) {

  var api = {};
  const dao = app.src.dao.NotifyDAO;

  const uHash = app.src.utils.Hash;
  const utils = app.src.utils.Utils;

  api.listnotify = async function (req, res, next) {
    try {
      const result = await dao.listnotify(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.list = async function (req, res, next) {
    try {
      const result = await dao.list(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }
  api.listall = async function (req, res, next) {
    try {
      const result = await dao.listall(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }
  api.listfav = async function (req, res, next) {
    try {
      const result = await dao.listfav(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }
  api.count = async function (req, res, next) {
    try {
      const result = await dao.count(req, res, next);
      res.json(result);
    } catch (err) { next(err); }
  }

  api.upd = async function (req, res, next) {
    try {

      const result = await dao.lido(req, res, next);
      res.json(result);

    }
    catch (err) { next(err); }
  }

  api.fav = async function (req, res, next) {
    try {
      const result = await dao.favorito(req, res, next);
      res.json(result);
    }
    catch (err) { next(err); }
  }

  api.createnotify = async function (req, res, next) {
    try {

      const ok = null;

      const obmatriz = await dao.listmatriz(req, res, next);
      const obunidad = await dao.listunidades(req, res, next);

      for (const item of obmatriz) {
        //confirmar que não teve lançamento do funil para a matriz
        let txUser = `{"idg001":"` + item.idg001 + `","nmmatriz":"` + item.nmmatriz + `"}`;
        let body = JSON.parse(txUser);
        const funil = await dao.funilmatriz({ body });

        if (funil.length === 0) {
          ///lancar notificação para a matriz
          const cadnot = `{"idg001":"` + item.idg001 + `","idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmmatriz + `, você ainda não realizou o lançado diário do funil de venda", "titulo":"Lançamento diário Funil de Vendas", "unidade":"` + item.nmmatriz + `", "nmimage":"` + item.nmimagem + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }
      }

      for (const item of obunidad) {
        //confirmar que não teve lançamento do funil para a unidade
        let txUser = `{"idg002":"` + item.idg002 + `","nmunidad":"` + item.nmunidad + `"}`;
        let body = JSON.parse(txUser);
        const funil = await dao.funilunidade({ body });

        if (funil.length === 0) {
          ///lancar notificação para a unidade
          const cadnot = `{"idg002":"` + item.idg002 + `","idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmunidad + `, você ainda não realizou o lançado diário do funil de venda", "titulo":"Lançamento diário Funil de Vendas", "unidade":"` + item.nmunidad + `", "nmimage":"` + item.nmimagem + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }

      }

      res.json(ok);
    }
    catch (err) { next(err); }
  }

  api.createnotifymeta = async function (req, res, next) {
    try {

      const ok = null;

      const obmatriz = await dao.listmatrizmedia(req, res, next);
      const obunidad = await dao.listunidadesmedia(req, res, next);

      for (const item of obmatriz) {
        //confirmar que não teve lançamento do funil para a matriz
        let txUser = `{"idg001":"` + item.idg001 + `","nmmatriz":"` + item.nmmatriz + `"}`;
        let body = JSON.parse(txUser);
        const funil = await dao.funilmatrizmedia({ body });

        if (!funil) {
          ///lancar notificação para a matriz
          const cadnot = `{"idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmmatriz + `,  você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas", "titulo":"Funil de Vendas Media abaixo", "unidade":"` + item.nmmatriz + `", "nmimage":"` + item.nmimagem + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }
        else if (funil.media < obmatriz.vlfatura) {
          const cadnot = `{"idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmmatriz + `,  você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas", "titulo":"Funil de Vendas Media abaixo", "unidade":"` + item.nmmatriz + `", "nmimage":"` + item.nmimagem + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }
      }

      for (const item of obunidad) {
        //confirmar que não teve lançamento do funil para a matriz
        let txUser = `{"idg002":"` + item.idg002 + `","nmunidad":"` + item.nmunidad + `"}`;
        let body = JSON.parse(txUser);
        const funil = await dao.funilunidademedia({ body });

        if (funil.length === 0) {
          ///lancar notificação para a matriz
          const cadnot = `{"idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmunidad + `, você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas.", "titulo":"Funil de Vendas Media abaixo", "unidade":"` + item.nmunidad + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }
        else if (funil.media < obunidad.vlfatura) {
          ///lancar notificação para a matriz
          const cadnot = `{"idusuari": "` + item.ids001ad + `", "mensagem": "Atenção ` + item.nmunidad + `, você esta abaixo da média cadastrada, favor acompanhe os lançamentos e atualize caso necessário o lançamento do funil de vendas.", "titulo":"Funil de Vendas Media abaixo", "unidade":"` + item.nmunidad + `"}`;
          const result = await dao.createnotify(JSON.parse(cadnot));
        }

      }

      res.json(ok);
    }
    catch (err) { next(err); }
  }

  return api;

} //final da classe