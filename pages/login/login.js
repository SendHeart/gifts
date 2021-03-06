var utils = require('../../utils/util.js');
var interval = null; //倒计时函数
var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var app_secret = app.globalData.secret;
var shop_type = app.globalData.shop_type;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '请选择日期',
    fun_id: 2,
    time: '点击获取', //倒计时 
    currentTime: 60,
    phoneNo:'',
    scode:'12345',
    goods_id:null,
    username:null,
    wx_nickname:null,
    wx_headimg:null,
    user_gender:0,
    user_province:'',
    user_city:'',
    user_country:'',
    m_id:null,
    token:null,
    shop_type:shop_type,
    logininfo_logo:weburl+'/uploads/songxin_logo.png?rand='+Math.random()*100
  },

  goBack: function () {
    var that = this
    var pages = getCurrentPages()
    var frompage = that.data.frompage
    var userInfo = wx.getStorageSync('userInfo')
    console.log("login goBack() pages:", pages, ' frompage:', frompage)
    if (userInfo) {
      if (frompage!='') {
        if (frompage.indexOf('index/index') >= 0 || frompage.indexOf('hall/hall') >= 0 || frompage.indexOf('my/index') >= 0) {
          wx.switchTab({
            url: frompage
          })
        } else{
          wx.navigateTo({
            url: frompage+'?is_back=1'
          })
        }
      }else if (pages.length > 1) {
        wx.navigateBack({ changed: true });//返回上一页
      }else{
        wx.switchTab({
          url: '/pages/hall/hall'
        })
      }
    }
  },
  onGotUserInfo: function (e) {
    var that = this
    //var userInfo = e.detail.userInfo?e.detail.userInfo:''
    //var rawData = e.detail.rawData     
    console.log('wx.getUserProfile',wx.canIUse('getUserProfile'));
    wx.getUserProfile({
      lang:'zh_CN',
      desc: '需要完善您的个人信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log('onGotUserInfo success：'+JSON.stringify(res));        
        wx.setStorageSync('userInfo', res.userInfo)
      
        that.setData({
          wx_nickname: res.userInfo ? res.userInfo.nickName : '',
          wx_headimg: res.userInfo ? res.userInfo.avatarUrl : '',
          user_gender:res.userInfo ? res.userInfo.gender:0,
          user_province:res.userInfo ? res.userInfo.province:'',
          user_city:res.userInfo ? res.userInfo.city:'',
          user_country:res.userInfo ? res.userInfo.country:'',
        })
        that.login()
        console.log('获取用户公开信息授权 userInfo:', res.userInfo)
        //权限
        wx.getSetting({
        success(res) {
          var authMap = res.authSetting;
          var length = Object.keys(authMap).length;
          console.log("authMap 长度:", length, authMap)
          //通讯录权限
          if (!res.authSetting['scope.address']) {
            wx.authorize({
              scope: 'scope.address',
              success(e) {
                console.log('通讯录权限' + e.errMsg)
              },
              fail(e) {
                console.log('通讯录权限授权失败' + e.errMsg)
              }
            })
          }
          //保存到相册权限
          /* 
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success(e) {
                console.log('保存到相册权限' + e.errMsg)
              },
              fail(e) {
                console.log('保存到相册权限授权失败' + e.errMsg)
              }
            })
          }
          */
          //位置权限
          /* 
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success(e) {
                console.log('位置授权成功' + e.errMsg)
              },
              fail(e) {
                console.log('位置授权失败' + e.errMsg)
              }
            })
          }
          */
          //录音权限
          /*
          if (!res.authSetting['scope.record']) {
            wx.authorize({
              scope: 'scope.record',
              success(e) {
                console.log('录音权限成功' + e.errMsg)
              },
              fail(e) {
                console.log('录音权限失败' + e.errMsg)
              }
            })
          }
          */
        }
        })      
      },
      fail(err){
        console.log('onGotUserInfo error:'+JSON.stringify(err));
      }
    })
  
    //console.log(e.detail.errMsg)
    //console.log(e.detail.userInfo)
    //console.log(e.detail.rawData)
    /*
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('获取用户登录态 code:' + res.code);
          wx.request({
            url: weburl + '/api/WXPay/getOpenidAction',
            data: {
              js_code: res.code,
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var user = res.data//返回openid
              wx.setStorageSync('openid', user.openid)
              wx.setStorageSync('username', user.openid);
              wx.setStorageSync('session_key', user.session_key)
             // wx.setStorageSync('username', user.openid) //用openid代替用户手机号登录
              wx.getUserInfo({
                success: function (res) {
                  //wx.setStorageSync('userInfo', res.userInfo)
                  //console.log('获取用户公开信息授权：' + res.userInfo)
                }
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
    */
  },

  codeInput: function (e) {
    this.setData({
      scode: e.detail.value
    })
  },
  phoneNoInput(e) {
    this.setData({
      phoneNo: e.detail.value
    })
  },
  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        time: currentTime + '秒',
        disables: true
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '点击获取',
          currentTime: 60,
          disabled: false
        })
      }
    }, 1000)
  },
  getVerificationCode: function () {
    this.getCode();
    console.log(this.data.phoneNo);
    console.log(this.data.code);
    var that = this
    that.setData({
      disabled: true
    })
  },
  vscode: function() {
    if (!this.data.phoneNo) {
      app.wxToast({
        title: '请输入手机号码'
      })
      return;
    }
    if(this.data.phoneNo.length!=11) {
      app.wxToast({
        title: '手机号码格式不对'
      })
      return;
    }
    console.log(this.data.phoneNo)
    var that= this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    this.getVerificationCode()
    
    wx.request({
      url: weburl + '/api/web/user/login/login_sms_send',
      method: 'POST',
      data: {
        username: username, 
        access_token: token,
        shop_type:shop_type,
        phoneNo: that.data.phoneNo, 
        extensionCode: "09016" ,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        that.setData({
          scode: res.data.data
        })
      }
    })
  },
 
  login:function () {
    //console.log(this.data.scode)
    let that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
   
    that.setData({
      username: username,
      token:token,
    })
    /*
    if (!that.data.phoneNo) {
      app.wxToast({
        title: '请输入手机号码'
      })
      return;
    }
    if (that.data.phoneNo.length != 11) {
      app.wxToast({
        title: '手机号码格式不对'
      })
      return;
    }
    if (!that.data.scode) {
      app.wxToast({
        title: '请输入验证码'
      })
      return;
    }
    */
   //console.log('user_province:',that.data.user_province)
    wx.request({
      url: weburl + '/api/web/user/login/user_xcx_login',
      method: 'POST',
      data: { 
        username: username ?username:openid, 
        wx_nickname:that.data.wx_nickname,
        wx_headimg:that.data.wx_headimg,
        user_phone: user_phone,
        user_gender:that.data.user_gender,
        user_city:that.data.user_city,
        user_prov:that.data.user_province,
        user_name: user_name,
        login_type:1,
        type:8,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('login login() 用户基本信息:',res.data.result)
        that.setData({
          token: res.data.result['token'],
          user_group_id:res.data.result['member_group_id'],
          user_group_name:res.data.result['member_group_name'],
        })
        var userauth = JSON.parse(res.data.result['userauth'])
        wx.setStorageSync('token', res.data.result['token']?res.data.result['token']:'')
        wx.setStorageSync('extensionCode', res.data.result['extensionCode']?res.data.result['extensionCode']:'')
        wx.setStorageSync('username', res.data.result['username'])
        wx.setStorageSync('m_id', res.data.result['m_id'])
        wx.setStorageSync('user_phone', res.data.result['user_phone'])
        wx.setStorageSync('user_name', res.data.result['user_name'])
        wx.setStorageSync('user_gender', res.data.result['user_gender'])
        wx.setStorageSync('user_type', res.data.result['user_type'])
        wx.setStorageSync('userauth', userauth&&userauth[0]? userauth[0]:'')
        wx.setStorageSync('user_group_id', res.data.result['member_group_id'])
        wx.setStorageSync('user_group_name', res.data.result['member_group_name'])
        setTimeout(function () {
          that.goBack()
        }, 500)
      },
    })
  },
  
  returnTapTag: function (e) {
    var that = this
    wx.switchTab({
      url: '/pages/hall/hall'
    })
  },

  navigateToMyAgreement: function (e) {
    var that = this
    var isReadAgreement = 0
    wx.setStorageSync('isReadAgreement', isReadAgreement)
    wx.switchTab({
      url: '../my/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var frompage = options.frompage ? options.frompage:''
    console.log('login onload() frompage:', frompage)
    that.setData({
      frompage: frompage,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})