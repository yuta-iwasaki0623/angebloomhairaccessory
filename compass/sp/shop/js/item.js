$(function(){
  $.ajaxSetup({
    scriptCharset:'utf-8',
    cache: false
  });

  // IDのリスト
  var IDS_LIST = {
    'TOP15': '_top15',
    'TOP3': '_top3',
    'RECOMMEND_1': '_bottom1_5',
    'RECOMMEND_2': '_bottom6_10',
    'RECOMMEND_3': '_bottom11_15',
  };
  Object.freeze(IDS_LIST);

  // セレクタリスト
  var SELECTORS_LIST = {
    'TOP15': '#itemRanking .ranking_wrapper',
    'TOP3': '#itemRanking3 .ranking_wrapper',
    'RECOMMEND_1': '#itemRecommend .ranking_wrapper',
    'RECOMMEND_2': '#itemRecommend .ranking_wrapper',
    'RECOMMEND_3': '#itemRecommend .ranking_wrapper',
  }
  Object.freeze(SELECTORS_LIST);

  // 処理用パラメータをセット
  var getArgs = function() {
    var arg = []
    arg[0] = {};
    arg[0]['id'] = IDS_LIST.TOP15;
    arg[0]['selector'] = SELECTORS_LIST.TOP15;
    arg[1] = {};
    arg[1]['id'] = IDS_LIST.TOP3;
    arg[1]['selector'] = SELECTORS_LIST.TOP3;
    arg[2] = {};
    arg[2]['id'] = IDS_LIST.RECOMMEND_1;
    arg[2]['selector'] = SELECTORS_LIST.RECOMMEND_1;
    arg[3] = {};
    arg[3]['id'] = IDS_LIST.RECOMMEND_2;
    arg[3]['selector'] = SELECTORS_LIST.RECOMMEND_2;
    arg[4] = {};
    arg[4]['id'] = IDS_LIST.RECOMMEND_3;
    arg[4]['selector'] = SELECTORS_LIST.RECOMMEND_3;
    return arg;
  }

  // JSONファイル読込
  var getSettings = function(id) {
    return $.getJSON("../../tool/item/data/item" + id + ".json");
  };

  // 画像をスマホ用にサイズ調整
  var makeItemImage = function(image) {
    var SP_IMAGE_SIZE = '200';
    var img = '<img src="' + image.replace(/\?_ex=\d+x\d+/, '?_ex=' + SP_IMAGE_SIZE + 'x' + SP_IMAGE_SIZE) + '"/>';
    return img;
  };

  var createItemPatternTop3 = function(json_item, i) {
    var obj = $('<a>');
    obj.attr('href', json_item.url);
    obj.append('<p class="item_rank">' + (parseInt(i,10) + 1) + '</p>');
    obj.append('<p class="item_thum">' + makeItemImage(json_item.image) + '</p>');
    obj.append('<p class="item_name">' + json_item.name + '</p>');
    obj.append('<p class="item_price">' + json_item.price + '</p>');
    return obj;
  };

  var createItemPatternRecommend = function(json_item) {
    var obj = $('<a>');
    obj.attr('href', json_item.url);
    obj.append('<p class="item_thum">' + makeItemImage(json_item.image) + '</p>');
    obj.append('<p class="item_name">' + json_item.name + '</p>');
    obj.append('<p class="item_price">' + json_item.price + '</p>');
    return obj;
  };

  var createItemPatternTop15 = function(json_item, i) {
    var obj = $('<a>');
    obj.attr('href', json_item.url);
    obj.append('<p class="item_rank">' + (parseInt(i,10) + 1) + '</p>');
    var layoutLeft = $('<div class="item_layoutLeft">');
    layoutLeft.append('<p class="item_thum">' + makeItemImage(json_item.image) + '</p>');
    obj.append(layoutLeft);
    var layoutRight = $('<div class="item_layoutRight">');
    layoutRight.append('<p class="item_name">' + json_item.name + '</p>');
    layoutRight.append('<p class="item_price">' + json_item.price + '</p>');
    obj.append(layoutRight);
    return obj;
  };

  // 商品情報をHTMLに挿入できる形で生成
  var createItem = function(id, json, i) {
    var item = $('<li class="ranking_item">');

    if (id === IDS_LIST.TOP3) {
      item.append(createItemPatternTop3(json.items[i], i))
    } else if (id === IDS_LIST.TOP15) {
      item.append(createItemPatternTop15(json.items[i], i))
    } else if (id === IDS_LIST.RECOMMEND_1 || id === IDS_LIST.RECOMMEND_2 || id === IDS_LIST.RECOMMEND_3) {
      item.append(createItemPatternRecommend(json.items[i]))
    } else {
      alert('対応していないIDです。対応するIDを設定してください。: ' + id);
    }
    return item;
  };

  // 商品群の情報取得
  var createItems = function(id, json) {
    var items = []
    for (var i in json.items) {
      var item = createItem(id, json, i);
      items.push(item)
    }
    return items;
  };

  // 商品情報の取得開始
  var startCreateItems = function(arg, result_items) {
    return new Promise(function(fulfilled, rejected){
      $.when(getSettings(arg.id)).done(function(json) {
        if (json.items == null) {
          return;
        }
        var items = createItems(arg.id, json);
        result_items[arg.selector] = result_items[arg.selector].concat(items);
        fulfilled(result_items);
      });
    });
  }

  // 取得した商品をHTMLに出力する
  var appendItems = function(items, args) {
    var selectors = [];
    // selectorを抽出
    for (var i = 0; i < args.length; i++) {
      selectors.push(args[i].selector);
    }
    // 重複除去
    selectors = selectors.filter(function (x, i, self) {
      return self.indexOf(x) === i;
    });
    // 商品取得処理完了後、商品をHTMLにappendする
    // 1秒setTimeoutで1秒遅らせているので、読込完了しているはず。
    // 読み込まれる前に実行される可能性もあるので要注意
    for (var j = 0; j < selectors.length; j++) {
      appendItem(selectors[j], items[selectors[j]]);
    }
  }

  // HTMLに商品書出
  var appendItem = function(selector, items) {
    $(selector).empty();
    for (var i = 0; i < items.length; i++) {
      $(selector).append(items[i]);
    }
  }

  // 取得処理が何かしらの理由で終わらなくなった場合、一定時間で強制終了させる
  // var safeReturn = function() {
  //   if (count++ > 20) {
  //     clearInterval(id);
  //     return true;
  //   }
  //   return false;
  // }

  // ---------------main-------------
  // initialize
  var args = getArgs();
  var items = {};
  var count = 0;
  var id = null;
  for(var i = 0; i < args.length; i++) {
    items[args[i].selector] = [];
  }

  Promise.resolve()
    .then(function(){
      return startCreateItems(args[0], items);
    })
    .then(function(items){
      return startCreateItems(args[1], items);
    })
    .then(function(items){
      return startCreateItems(args[2], items);
    })
    .then(function(items){
      return startCreateItems(args[3], items);
    })
    .then(function(items){
      return startCreateItems(args[4], items);
    })
    .then(function(result){
      // 全商品の取得が完了したら、appendItemsする
      appendItems(result, args);
    })
    .catch(function(error){
      console.log(error);
    });
});
