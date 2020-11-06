//app.js
var wxToast = require('toast/toast.js')
var weburl = 'https://sendheart.dreamer-inc.com'
var wssurl = 'wss://sendheart.dreamer-inc.com'
App({
  globalData: {
    appid: 'wx986f630cc3d1a7fc',//  小程序开发账号  wxe59fb5712b45adb7
    secret: 'add3c71b7907a7ce99722d0e9cbac7f1',//   9666f44dd87410cf85949f3a053dc14a
    weburl:'https://sendheart.dreamer-inc.com', //https://xcx.itoldfarmer.com
    wssurl:'wss://sendheart.dreamer-inc.com' ,
    uploadurl: weburl+'/api/upload/index4',
    httpserviceurl: weburl + '/api/upload/http_service',
    pusherurl: 'rtmp://push.dreamer-inc.com',
    playerurl: 'http://play.dreamer-inc.com/live',
    mapkey: 'SSPBZ-ALR32-4BWUC-CLUXY-HAFM3-3ABQF',
    mapkey2: 'BJFBZ-ZFTHW-Y2HRO-RL2UZ-M6EC3-GMF4U',
    md5_key: '9666f44dd87410cf85949f3a053dc14a',
    openid: null,
    username: null,
    is_task:0,
    is_receive:0,
    wish_id:0,
    order_no: '',
    order_id: '',
    goods_flag:0,
    code: null,
    shop_type:2 , //礼物类应用
    messageflag:2, //0任务 1系统消息 gotop
    my_index:0,
    art_id:0,
    hall_gotop: 0, //1 gotop 
    from_page:null,
    user_type:0,
    navList2:[],
    userInfo: null,
    navHeight: 0,
    looks : {
			w : [
				{name : 'wx' , url : '01.png'} , 
				{name : 'xk' , url : '02.png'} , 
				{name : 'xk1' , url : '03.png'} , 
				{name : 'lh' , url : '04.png'} , 
				{name : 'ng' , url : '05.png'} , 
				{name : 'kx' , url : '06.png'} , 
				{name : 'hx' , url : '07.png'} , 
				{name : 'ng1' , url : '08.png'} , 
			] , 
			web : [
				{name : 'wx' , url : '01.gif'} , 
				{name : 'xk' , url : '02.jpg'} , 
				{name : 'xk1' , url : '03.jpg'} , 
				{name : 'lh' , url : '04.jpg'} , 
				{name : 'ng' , url : '05.jpg'} , 
				{name : 'kx' , url : '06.jpg'} , 
				{name : 'hx' , url : '07.jpg'} , 
				{name : 'ng1' , url : '08.jpg'} , 
				{name : 'ng12' , url : '09.jpg'} , 
				{name : 'ng13' , url : '10.jpg'} , 
				{name : 'ng11' , url : '11.jpg'} , 
				{name : 'ng11' , url : '12.gif'} , 
				{name : 'ng14' , url : '13.jpg'} , 
				{name : 'ng15' , url : '14.gif'} , 
			]
		} , 
  },
 
  onLaunch: function() {
        console.log('App Launch');
        var that = this;
            //调用API从本地缓存中获取数据
        var appid = that.globalData.appid;
        var appsecret = that.globalData.secret
        wx.setStorageSync('appid', appid);
        wx.setStorageSync('appsecret', appsecret);
        
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
                  wx.setStorageSync('session_key', user.session_key);
                  //wx.setStorageSync('username', user.openid); //用openid代替用户手机号登录
                  //wx.setStorageSync('username', ''); //测试
                  console.log('获取用户OpenId:', user);
                  //console.log(user.openid);
                  that.login(user.openid)
                  
                }
              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
      })
    that.get_project_gift_para()
  // 获取顶部栏信息
  wx.getSystemInfo({
    success: res => {
      //导航高度
      this.globalData.navHeight = res.statusBarHeight + 46;
    }, fail(err) {
      console.log(err);
    }
  })
  },

  login: function (openid) {
    var openid = openid ? openid: wx.getStorageSync('openid') 
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
    var userInfo = wx.getStorageSync('userInfo') 
    var shop_type = this.globalData.shop_type
    wx.request({
      url: weburl + '/api/web/user/login/user_xcx_login',
      method: 'POST',
      data: {
        username: openid ? openid:username,
        wx_nickname: userInfo.nickName,
        wx_headimg: userInfo.avatarUrl,
        user_phone: user_phone,
        user_name: user_name,
        login_type: 1,
        type: 8,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('app login 用户基本信息:', res.data.result)
        wx.setStorageSync('token', res.data.result['token'])
        wx.setStorageSync('extensionCode', res.data.result['extensionCode'])
        wx.setStorageSync('username', res.data.result['username'])
        wx.setStorageSync('m_id', res.data.result['m_id'])
        wx.setStorageSync('user_phone', res.data.result['user_phone'])
        wx.setStorageSync('user_name', res.data.result['user_name'])
        wx.setStorageSync('user_gender', res.data.result['user_gender'])
        wx.setStorageSync('user_type', res.data.result['user_type'])
      },

    })
  },  

  get_project_gift_para: function () {
    var that = this
    var navList2 = that.globalData.navList2
    var shop_type = that.globalData.shop_type

    //项目列表
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        type: 2,  //暂定 1首页单图片 2首页轮播  
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('app.js get_project_gift_para:', res.data.result)
        var navList_new = res.data.result;
        if (!navList_new) {
          /*
           wx.showToast({
             title: '没有菜单项2',
             icon: 'loading',
             duration: 1500
           });
           */
          return
        }
        wx.setStorageSync('navList2', navList_new)
        that.globalData.navList2 = navList_new
      }
    })
  },
  getUserInfo: function (cb) {
      var that = this
      if (that.globalData.userInfo) {
        typeof cb == "function" && cb(that.globalData.userInfo)
      } else {
        wx.login({
          success: function (res) {
            if (res.code) {
              that.globalData.code = res.code
              wx.setStorageSync('code', res.code)
              wx.getUserInfo({
                success: function (res) {
                  that.globalData.encrypted = { encryptedData: res.encryptedData, iv: res.iv }
                  that.globalData.userInfo = res.userInfo
                  typeof cb == "function" && cb(that.globalData.userInfo)
                  console.log('getUserInfo获取用户登录态:' + res.userInfo.nickName)
                }
              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          },
          fail: function (res) {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        })
      }

  },
  location: function () {
    var that = this
    //获取当前位置
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              console.log('位置授权成功' + res.errMsg)
            },
            fail() {
              return
            }
          })
        }
      }
    })

    // 实例化腾讯地图API核心类
    var QQMapWX = require('./utils/qqmap-wx-jssdk.min.js')
    var qqmapsdk
    qqmapsdk = new QQMapWX({
      key: that.globalData.mapkey // 必填
    })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude);
        wx.setStorageSync('speed', speed);
        wx.setStorageSync('accuracy', accuracy)
        qqmapsdk.reverseGeocoder({
          poi_options: 'policy=2',
          get_poi: 1,
          success: function (res) {
            console.log('qqmapsdk:', res);
            wx.setStorageSync('mylocation', res.result.address + res.result.formatted_addresses.recommend)
            wx.setStorageSync('city', res.result.address_component.city)
            wx.setStorageSync('district', res.result.address_component.district)
            wx.setStorageSync('province', res.result.address_component.province)
            wx.setStorageSync('street', res.result.address_component.street)
            wx.setStorageSync('street_number', res.result.address_component.street_number)
            console.log('位置获取成功:' + res.result.address)
          },
          fail: function (res) {
            console.log('位置获取失败')
            console.log(res)
          },
          complete: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  onShow: function() {
        console.log('App Show')
        var that = this;
  },
  onHide: function() {
        console.log('App Hide')
  },
   
  //全局Header
  
})
