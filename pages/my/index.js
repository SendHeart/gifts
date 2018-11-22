var wxparse = require("../../wxParse/wxParse.js");
var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var appsecret = app.globalData.secret;
var user_type = app.globalData.user_type;
var shop_type = app.globalData.shop_type;
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
    hideviewagreementinfo: true,
    agreementinfoshowflag: 0,
    playsxinfoshowflag: 0,
    scrollTop: 0,
    scrollTop_init: 10,
    modalHiddenAgreement:true,
    modalHiddenPlaysx: true,
    shop_type:shop_type,
     
  },
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
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
  navigateToAgreement:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var art_id = '21'  //送心用户协议
    var art_cat_id = '9'  //送心协议类
    var shop_type = that.data.shop_type
    var agreementinfoshowflag = that.data.agreementinfoshowflag ? that.data.agreementinfoshowflag:0
    if (agreementinfoshowflag == 0) {
      wx.request({
        url: weburl + '/api/client/query_art',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          art_id: art_id,
          art_cat_id: art_cat_id,
          shop_type:shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          that.setData({
            agreementInfo: res.data.result,
          })
          console.log('送心协议:', that.data.agreementInfo)
          that.showAgreementinfo()
        }

      })
    } else{
      that.showAgreementinfo()
    }
    
    
  },
  navigateToPlaysx: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var art_id = '22'  //玩转送心
    var art_cat_id = '9'  //送心协议类
    var playsxinfoshowflag = that.data.playsxinfoshowflag

    if (playsxinfoshowflag == 0) {
      wx.request({
        url: weburl + '/api/client/query_art',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          art_id: art_id,
          art_cat_id: art_cat_id,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          that.setData({
            playsxInfo: res.data.result,
          })
          console.log('玩转送心:', that.data.playsxInfo)
          that.showPlaysxinfo()
        }

      })
    } else {
      that.showPlaysxinfo()
    }


  },
  showAgreementinfo: function () {
    let winPage = this
    //var hideviewagreementinfo = winPage.data.hideviewagreementinfo
    var modalHiddenAgreement = winPage.data.modalHiddenAgreement
    var agreementinfoshowflag = winPage.data.agreementinfoshowflag ? winPage.data.agreementinfoshowflag:0
  
    winPage.setData({
      //hideviewagreementinfo: !hideviewagreementinfo,
      modalHiddenAgreement: !modalHiddenAgreement,
    })

    if (!winPage.data.modalHiddenAgreement && agreementinfoshowflag == 0) {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          console.log(winHeight);
          winPage.setData({
            dkheight: winHeight - winHeight * 0.05 - 120,
            
          })
        }
      })
      winPage.setData({
        agreementinfoshowflag: 1,
      })
      wxparse.wxParse('dkcontent1', 'html', winPage.data.agreementInfo[0]['desc'], winPage, 1)
     
    }
    
  },

  showPlaysxinfo: function () {
    let winPage = this
    //var hideviewagreementinfo = winPage.data.hideviewagreementinfo
    var modalHiddenPlaysx = winPage.data.modalHiddenPlaysx
    var playsxinfoshowflag = winPage.data.playsxinfoshowflag
    winPage.setData({
      //hideviewagreementinfo: !hideviewagreementinfo,
      modalHiddenPlaysx: !modalHiddenPlaysx,
    })

    if (!winPage.data.modalHiddenPlaysx && playsxinfoshowflag == 0) {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          //console.log(winHeight);
          winPage.setData({
            dkheight: winHeight - winHeight * 0.05 - 120,
          })
        }
      })
      winPage.setData({
        playsxinfoshowflag: 1,
      })
      wxparse.wxParse('dkcontent2', 'html', winPage.data.playsxInfo[0]['desc'], winPage, 1)
    }

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
  //确定按钮点击事件  用户协议
  modalBindaconfirmAgreement: function () {
     
    this.setData({
      modalHiddenAgreement: !this.data.modalHiddenAgreement,
    })
    wx.setStorageSync('isReadAgreement', 1) //协议阅读标志
  },
  //取消按钮点击事件  用户协议
  modalBindcancelAgreement: function () {
    this.setData({
      modalHiddenAgreement: !this.data.modalHiddenAgreement
    })
  },  
  //确定按钮点击事件  玩转送心
  modalBindaconfirmPlaysx: function () {
    this.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx,

    })
  },
  //取消按钮点击事件  玩转送心
  modalBindcancelPlaysx: function () {
    this.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx
    })
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
   
  },
  onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var user_type = wx.getStorageSync('user_type') ? wx.getStorageSync('user_type') : user_type
    var isReadAgreement = wx.getStorageSync('isReadAgreement') ? wx.getStorageSync('isReadAgreement'):0
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/left_arrow.png',
      })
      
    }  
    if (isReadAgreement == 0 && username){ //已登录未阅读用户购买协议
      that.navigateToAgreement()
    }
    that.setData({
      user_type: user_type,
    })
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
    })
  },
  navigateToDonate: function () {
    wx.navigateTo({
      url: '/pages/member/donate/donate'
    })
  },
  navigateToShare: function () {
    wx.navigateTo({
      url: '/pages/member/share/share?qr_type=membershare'
    })
  },
  navigateToCoupon: function () {
    wx.navigateTo({
      url: '/pages/member/couponsnd/couponsnd'
    })
  },
  navigateToMyCoupon: function () {
    wx.navigateTo({
      url: '/pages/member/couponmy/couponmy'
    })
  }
})