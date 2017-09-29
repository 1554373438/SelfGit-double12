$(function() {

  var ua = navigator.userAgent;

  var sessionId = util.getSearch()['sessionId'] || '';
  var terminal = util.getSearch()['terminal'];

  var isWeiXin = /micromessenger/.test(ua.toLowerCase());

  var share_title = "诺诺镑客双十二瓜分千万现金"; //分享标题
  var share_desc = "次次返现，时时拿钱，上不封顶！千万现金等你来抢！"; //分享描述
  var share_link = HOST + '/nono/double12/index.html'; //分享链接
  var share_icon = HOST + '/nono/double12/share_icon.png'; //分享icon 图片地址

  var bridge = new Bridge();
  var ruleJSON = null;

  if (isWeiXin) {
    wxShare();
  }

  var toastr = {
    active: false,
    info: function(msg) {
      var _this = this;
      if (_this.active) {
        return;
      }
      _this.active = true;
      vm.toastrInfo = msg;
      setTimeout(function() {
        vm.toastrInfo = '';
        _this.active = false;
      }, 3000)
    }
  };

  var vm = new Vue({
    el: 'body',
    data: {
      // showLoading: false,
      is_open:false,
      toastrInfo: '',
      shareMask: false,

      inputNum: '10000',
      countNum: '130',

      showRule: false,
      showShare: false,
      gologin: true,
      guafen: '0.00',
      annualMoney: '0.00',
      curRule: null,
      downLoad: false,

      product: [],
      mallList: [],
      moreHope: [],
      tabItems: [{
        'textDate': '7',
        'textMonth': '12月',
        'time': '2016-12-07',
        'active': true,
        'content': []
      }, {
        'textDate': '8',
        'textMonth': '12月',
        'time': '2016-12-08',
        'active': false,
        'content': []
      }, {
        'textDate': '9',
        'textMonth': '12月',
        'time': '2016-12-09',
        'active': false,
        'content': []
      }, {
        'textDate': '10',
        'textMonth': '12月',
        'time': '2016-12-10',
        'active': false,
        'content': []
      }, {
        'textDate': '11',
        'textMonth': '12月',
        'time': '2016-12-11',
        'active': false,
        'content': []
      }, {
        'textDate': '12',
        'textMonth': '12月',
        'time': '2016-12-12',
        'active': false,
        'content': []
      }, {
        'textDate': '13',
        'textMonth': '12月',
        'time': '2016-12-13',
        'active': false,
        'content': []
      }, ],
      winnerList: [],
    },

    methods: {
      init: function() {
        var self = this;
        var params = {
          'sessionId': sessionId,
        };
        $.ajax({
          url: HOST + '/msapi/doubleTwelve/getStaticInfo', 
          type: 'POST',
          data: params,
          dataType: 'json',
          success: function(res) {
            if (res.flag == 1) {
              // if(sessionId) {                   
              //   self.gologin = false;
              //   self.guafen = res.data.my_gua_fen;
              //   console.log(self.guafen);
              // }
              self.is_open = res.data.is_open;
              if (res.data.is_login) {
                self.gologin = false;
                self.guafen = res.data.my_gua_fen;
                self.annualMoney = res.data.annual_invest_money;
                console.log(self.annualMoney);
              }

              self.product[0] = res.data.stageplan['tiexin12'];
              self.product[1] = res.data.stageplan['tiexin6'];
              self.product[2] = res.data.stageplan['tiexin3'];
              self.product[3] = res.data.stageplan['xinke'];

              self.mallList = res.data.membermall; //会员商城
              if (self.mallList.length < 5) {
                var hopeLength = 4 - self.mallList.length;
                // for (var i = 0; i < 3; i++){
                //   self.moreHope[i] = '1' ;
                //   console.log(self.moreHope);
                //   console.log(self.moreHope.length);
                // }

                self.moreHope = new Array(hopeLength);
              }
            }
          }
        });

        // if (terminal != 4 && terminal != 5) {
        //   self.downLoad = true;
        // }
        if(!isFromApp) {
           self.downLoad = true;
        }
        this.getWinnerList(0);
      },

      selectTab: function(index) {
        var len = this.tabItems.length;
        for (var i = 0; i < len; i++) {
          this.tabItems[i]['active'] = false;
        }
        var curTab = this.tabItems[index];
        curTab.active = true;

        this.getWinnerList(index);
      },
      getWinnerList: function(index) {
        var self = this;
        var index = index || 0;
        var curTab = self.tabItems[index];
        var time = curTab['time'];
        console.log('time=' + time);

        $.ajax({
          type: 'POST',
          url: HOST + '/msapi/doubleTwelve/getPaiHao',
          dataType: 'json',
          data: {
            'sessionId': sessionId,
            time: time
          },
          success: function(res) {
            if (res.flag == 1) {
              self.winnerList = res.data && res.data.paiHaoBangInfo;
              curTab.content = res.data && res.data.paiHaoBangInfo;
            }
          }
        });
      },

      add: function() {
        var self = this;
        var inputNum = parseInt(self.inputNum);
        self.inputNum = inputNum + 1000;
        if (self.inputNum >= 9999999) {
          self.inputNum = 9999999;
          toastr.info('投资额最大金额为9999999元');
        }

        var month = $('.active').attr('month');
        var id = $('.active').attr('id');
        this.countInput(month, id);
      },

      sub: function() {
        var self = this;
        var inputNum = parseInt(self.inputNum);
        self.inputNum = inputNum - 1000;
        if (self.inputNum < 1000) {
          self.inputNum = 1000;
          toastr.info('投资额最少为1000元');
        }

        var month = $('.active').attr('month');
        var id = $('.active').attr('id');
        this.countInput(month, id);
      },

      countInput: function(month, element) {
        var self = this;
        if (self.inputNum > 9999999) {
          toastr.info('投资额最大为9999999元');
          return;
        }
        if (self.inputNum < 1000) {
          toastr.info('投资额最少为1000元');
          return;
        }
        $('.typeBtn').removeClass('active');
        $("#" + element).addClass("active");

        var N = parseInt(self.inputNum / 10000);
        if (month == 3) {
          self.countNum = 20 * N;
        } else if (month == 6) {
          self.countNum = 50 * N;
        } else if (month == 12) {
          self.countNum = 130 * N;
        } else if (month == 1 && self.inputNum >= 5000) {
          self.countNum = 10;
        } else if (month == 1 && self.inputNum < 5000) {
          self.countNum = 0;
        }
      },

      share: function() {
        _czc.push(["_trackEvent", "落地页", "点击", "分享", "", ""]);
        var self = this;
        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          var shareData = {
            'share_title': share_title,
            'share_desc': share_desc,
            'share_url': share_link,
            'share_icon': share_icon,
          };
          bridge.send({
            type: 'share',
            data: shareData
          });
          return;
        }
        self.shareMask = true;
      },

      goLogin: function(type) {
        if (type == 0) {
          _czc.push(["_trackEvent", "落地页", "点击", "查看我分到的现金", "", ""]);
        }
        _czc.push(["_trackEvent", "落地页", "点击", "查看我的年化投资额", "", ""]);

        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          if (!sessionId) {
            bridge.send({
              type: 'login',
              url: window.location.href
            });
          }
          return;
        }
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      },

      goProDetail: function(index) {
        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          var curPro = this.product[index];
          if (!curPro['fp_id']) {
            return;
          }
          if (index == 3) {
            _czc.push(["_trackEvent", "落地页", "点击", "投资新客计划", "", ""]);
          }
          _czc.push(["_trackEvent", "落地页", "点击", "投资贴心计划", "", ""]);
          bridge.send({
            type: 'productDetail',
            data: {
              fp_id: curPro['fp_id'],
              fp_title: curPro['fp_title'],
              fp_type: 1
            }
          });
          return;
        }
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      },

      getDetail: function(index, type) {
        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          if (sessionId) {
            if (type == 1) {
              var item = this.mallList[index];
              bridge.send({
                type: 'mallDetail',
                data: {
                  cb_id: item.cb_id
                }
              });
            }
            return;
          }
          bridge.send({
            type: 'login',
            url: window.location.href
          });
          return;
        }
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      },

      goApp: function(name) {
        _czc.push(["_trackEvent", "落地页", "点击", "更多商品", "", ""]);
        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          if (sessionId) {
            bridge.send({
              type: 'pageSwitch',
              data: {
                name: name
              }
            });
            return;
          }
          bridge.send({
            type: 'login',
            url: window.location.href
          });
          return;
        }
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      },

      goZero: function() {
        _czc.push(["_trackEvent", "落地页", "点击", "0元计划", "", ""]);
        // if (terminal == 4 || terminal == 5) {
        if(isFromApp) {
          bridge.send({
            type: 'pageSwitch',
            data: {
              name: 'specInvest',
            }
          });
          return;
        }
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      },

      goActive: function() {
        _czc.push(["_trackEvent", "落地页", "点击", "微信活动", "", ""]);
        // bridge.send({
        //   type: 'activity',
        //   data: {
        //     name: '微信活动', //活动具体名字
        //     link: 'http://mp.weixin.qq.com/s/2kfyEGUqwuATsNOzb62Pvw', //活动页面url
        //     needLogin: false //是否需要登录 true:需要, false:不需要
        //   }
        // });
        window.location.href = 'http://mp.weixin.qq.com/s/2kfyEGUqwuATsNOzb62Pvw';
      },

      showRuleMask: function(name) {
        var self = this;
        self.showRule = true;
        if (ruleJSON) {
          self.curRule = ruleJSON[name];
          return;
        }
        if (!ruleJSON) {
          $.ajax({
            methods: 'GET',
            url: './json/rule.json',
            dataType: 'json',
            success: function(res) {
              ruleJSON = res;
              self.curRule = ruleJSON[name];
            }
          });
        }
      },

      hideRuleMask: function() {
        this.shareMask = false;
        this.showRule = false;
        self.curRule = null;
      },
      
      goDownload: function() {
        _czc.push(["_trackEvent", "落地页", "点击", "下载app", "", ""]);
        window.location.href = 'https://m.nonobank.com/nono/land-page/download.html';
      }
    }
  });

  vm.init();
  vm.$watch('inputNum', function() {
    var month = $('.active').attr('month');
    var id = $('.active').attr('id');
    vm.countInput(month, id);
  });


  function wxShare() {
    var href = window.location.href;
    $.ajax({
      url: HOST + '/feserver/wechat/signature',
      type: 'POST',
      dataType: 'json',
      data: {
        url: href,
        type: /m.nonobank.com/.test(HOST) ? 'nonobank' : 'zhanglin'
      },
      success: function(res) {
        if (res.errcode) {
          alert(res.errmsg);
          return;
        }

        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: res.appId, // 必填，公众号的唯一标识
          timestamp: res.timestamp, // 必填，生成签名的时间戳
          nonceStr: res.nonceStr, // 必填，生成签名的随机串
          signature: res.signature, // 必填，签名，见附录1
          jsApiList: ["checkJsApi", "onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.error(function(res) {
          alert('error=' + JSON.stringify(res));
        });

        wx.ready(function() {
          //朋友圈
          wx.onMenuShareTimeline({
            title: share_title, // 分享标题
            link: share_link, // 分享链接
            imgUrl: share_icon, // 分享图标
            success: function() {
              // 用户确认分享后执行的回调函数
              // shareSuccess();
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });
          //好友
          wx.onMenuShareAppMessage({
            title: share_title, // 分享标题
            desc: share_desc, // 分享描述
            link: share_link, // 分享链接
            imgUrl: share_icon, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
              // alert(1)// 用户确认分享后执行的回调函数
              // shareSuccess();
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });
          //QQ
          wx.onMenuShareQQ({
            title: share_title, // 分享标题
            desc: share_desc, // 分享描述
            link: share_link, // 分享链接
            imgUrl: share_icon, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
              // alert(1)// 用户确认分享后执行的回调函数
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });
          //空间
          wx.onMenuShareQZone({
            title: share_title, // 分享标题
            desc: share_desc, // 分享描述
            link: share_link, // 分享链接
            imgUrl: share_icon, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
              // alert(1)// 用户确认分享后执行的回调函数
            },
            cancel: function() {
              // 用户取消分享后执行的回调函数
            }
          });

        });
      },
      error: function(res) {}
    });
  }

  // function shareSuccess() {

  // }
})
