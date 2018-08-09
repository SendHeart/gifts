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
    openid: null,
    username: null,
    code: null,
    shop_type:2 , //礼物类应用
   
  },
 
    onLaunch: function() {
        console.log('App Launch');
        var that = this;
            //调用API从本地缓存中获取数据
        var appid = this.globalData.appid;
        var appsecret = this.globalData.secret
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
                  console.log('获取用户OpenId:');
                  console.log(user.openid);
                  
                }
              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
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
    

    onShow: function() {
        console.log('App Show')
        var that = this;
    },
    onHide: function() {
        console.log('App Hide')
    },
   
})
