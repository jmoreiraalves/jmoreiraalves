module.exports = function(app) {

    const interceptor = app.src.utils.Token.interceptor;
    const notify      = app.src.controllers.NotifyController;


     
    app.post    ('/api/notify'           ,  notify.list  );
    app.post    ('/api/notify/all'       ,  notify.listall  );
    app.post    ('/api/notify/favorit'   ,  notify.listfav  );
    app.get     ('/api/notify/ler'       ,  notify.upd  );
    app.get     ('/api/notify/fav'       ,  notify.fav  );
    app.get     ('/api/notify/count'     ,  notify.count);

    ////gerador de notificação
    app.get    ('/api/notify/createnotify'           ,  notify.createnotify  );
    app.get    ('/api/notify/createnotifymeta'       ,  notify.createnotifymeta  );
    //listagem para o modelo de tabela
    app.get    ('/api/notify/listnotify'             , notify.listnotify);
   
  }