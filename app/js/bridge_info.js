  //分享
  var shareData = {
    'share_title':share_title,
    'share_desc':share_desc,
    'share_url':share_link,
    'share_icon':share_icon,
  };
  bridge.send({
    type:'share',
    data:shareData
  });
  
  // 登录
  bridge.send({
    type: 'login',
    url: window.location.href 
  });
  // 产品详情
  bridge.send({
    type: 'productDetail',
    data: {
      fp_id: product['fp_id'],
      fp_title: product['fp_title'],
      fp_type: type
    }
  });

  // 商城－券码兑换详情
  bridge.send({
    type: 'mallDetail',
    data: {
      cb_id: id
    }
  });

  // 会员商城－首页
  bridge.send({
    type: 'pageSwitch',
    data: {
      name: name,
    }
  });



// 活动
  bridge.send({
    type: 'activity',
    data: {
      name: '', //活动具体名字
      link: '', //活动页面url
      needLogin: false //是否需要登录 true:需要, false:不需要
    }
  });
