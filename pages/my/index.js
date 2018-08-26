var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var appsecret = app.globalData.secret;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';

Page({
  data:{
    title_name: '我的',
    title_logo: '../../images/footer-icon-05.png',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
  },
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../hall/hall'
      })
    }

  },
  showWish: function () {
    /*
    wx.navigateTo({
      url: '../wish/wish?wish_id='
    })
    */
    wx.switchTab({
      url: '../wish/wish?wish_id='
    })
  },
  navigateToOrder: function (e) {
    var status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '../../order/list/list?status=' + status
    });
  },
  logout: function () {

  },
  onGotUserInfo: function (e) {
    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('获取用户登录态 code:' + res.code);
          wx.request({
            url: weburl + '/api/WXPay/getOpenidAction',
            data: {
              js_code: res.code,
              appid: appid,
              appsecret: appsecret
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var user = res.data//返回openid
              wx.setStorageSync('openid', user.openid);
              wx.setStorageSync('session_key', user.session_key)
              wx.setStorageSync('username', user.openid) //用openid代替用户手机号登录
              that.setData({
                username: user.openid
              })
              console.log('获取用户OpenId:')
              console.log(user.openid)
              wx.navigateTo({
                url: '../login/login?wechat=1'
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  customerService: function (e) {
    wx.navigateTo({
     // url: '../wechat/wechat'
      url: '../cs/cs'
    });
  },
  onLoad: function () {
    var that = this;
    var gifts_rcv = that.data.gifts_rcv;
    var gifts_send = that.data.gifts_send;
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    console.log("openid:" + openid + ' username:' + username)
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?wechat=1'
      })
    }
    that.setNavigation()
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight - 200,
          scrollTop: that.data.scrollTop + 10
        })
      }
    })  

   
    // 送收礼物信息查询
    /*
    wx.request({
      url: weburl + '/api/client/query_member_gift',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        openid: openid
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('会员礼物收送信息获取');
        console.log(res.data);
        var gifts_rcv = res.data.result['giftgetnum'];
        var gifts_send = res.data.result['giftsendnum'];

        that.setData({
          gifts_rcv: gifts_rcv,
          gifts_send: gifts_send,
        });
      }
    })
    */
  },
  onShow: function () {
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/left_arrow.png'
      })
    }  
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    
  },
  chooseImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths[0];

      }
    })
  },
  navigateToAboutus: function () {
    wx.navigateTo({
      url: '/pages/member/aboutus/aboutus'
    });
  },
  navigateToDonate: function () {
    wx.navigateTo({
      url: '/pages/member/donate/donate'
    });
  },
  navigateToShare: function () {
    wx.navigateTo({
      url: '/pages/member/share/share'
    });
  }
})