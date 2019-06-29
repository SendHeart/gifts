import defaultData from '../../../data'
var util = require('../../../utils/util.js')
var app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid
var secret = app.globalData.secret
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []

Page({
  data:{
    title_name: '二维码',
    title_logo: '../../../images/footer-icon-05.png',
    weburl: weburl,
    appid: appid,
    secret: secret,
    openid: openid,
    shop_type: shop_type,
    hiddenqrcode:true,
    shop_type: shop_type,
    coupon_img: weburl + '/uploads/coupon_bg.jpg', //
    wechat_share: '', //优惠券分享背景
    navList2:navList2 ,
    
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }
  },
  returnTapTag: function (e) {
    /*
    wx.navigateTo({
      url: '../../order/list/list'
    });
    */
    wx.switchTab({
      url: '../../my/index'
    });
  },
  get_project_gift_para: function () {
    var that = this
    var page = that.data.page
    var pagesize = that.data.pagesize
    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    console.log('share get_project_gift_para navList2:', navList2)
    if (!navList_new) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return;
          }
        }
      })
    }
    that.setData({
      navList2: navList_new,
      //wechat_share: navList_new[6]['img2'],
      //coupon_img: navList_new[7]['img'],
    })
   
  },

  eventDraw: function () {
    var that = this
    var qrcode_width= 200
    var qrcode_height = 230
    var qrcode_left = 100
    var qrtitle_left = 120
   
    var qrcode_top = 50
    var wechat_share = that.data.wechat_share
    var shop_type = that.data.shop_type
    var qr_type = that.data.qr_type ? that.data.qr_type:'couponshare'  //
    var act_id = that.data.act_id ? that.data.act_id : ''  //
    var act_title = that.data.act_title ? that.data.act_title : '开启礼物电商时代，200万人都在用的礼物小程序'  //
    var coupons = that.data.coupons
    var coupons_json = that.data.coupons_json
    var coupons_id = that.data.coupons_id
    var coupons_type = that.data.coupons_type
    var coupons_flag = that.data.coupons_flag
    var coupons_name = that.data.coupons_name
    var share_activity_qrcode = that.data.share_activity_qrcode_cache ? that.data.share_activity_qrcode_cache : weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&coupons_flag=' + coupons_flag + '&coupons_type=' + coupons_type + '&coupons_id=' + coupons_id + '&coupons=' + coupons_json + '&act_id=' + act_id
    var share_coupon_qrcode = that.data.share_coupon_qrcode_cache ? that.data.share_coupon_qrcode_cache : weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&coupons_flag=' + coupons_flag + '&coupons_type=' + coupons_type + '&coupons_id=' + coupons_id + '&coupons=' + coupons_json
    var share_member_qrcode_cache = that.data.share_member_qrcode_cache ? that.data.share_member_qrcode_cache : weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type
    var share_qrcode = ''
    var qrtitle_len = act_title.length //计算文字居中
    if (qrtitle_len<11){
      var qrtitle_width = qrtitle_len*20  /*每个默认字体的汉字宽度大约20px*/
      qrtitle_left = (400 - qrtitle_width)/2   /*画布宽度默认400*/
    }

    if (act_id) {
      share_qrcode = share_activity_qrcode
    } else if (coupons_id){
      share_qrcode = share_coupon_qrcode
    } else if (qr_type=='membershare') {
      share_qrcode = share_member_qrcode_cache
      qrtitle_left = 60
      qrcode_width = 230
      qrcode_left = 85
      qrcode_top = 80
    }
    console.log('member share eventDraw() title len:',act_title.length)
    that.setData({
      qr_type: qr_type,
      share_qrcode: share_qrcode,
    })
    /*
    wx.showLoading({
      title: '生成优惠券扫码图片',
      mask: true
    })
    */
    console.log('扫码图片信息:', coupons, 'qr_type:', qr_type, 'windowWidth:', that.data.windowWidth, ' windowHeight',that.data.windowHeight)
    that.setData({
      painting: {
        width: 400,
        height: 350,
        windowHeight: that.data.windowHeight ? that.data.windowHeight:400,
        windowWidth: that.data.windowWidth ? that.data.windowWidth:200,
        clear: true,
        background: 'white',
        views: [
          {
            type: 'text',
            content: act_title,
            fontSize: 18,
            color: '#333',
            textAlign: 'left',
            top: 20,
            left: qrtitle_left,
            lineHeight: 30,
            MaxLineNumber: 2,
            breakWord: true,
            width: qrcode_width
          },
          {
            type: 'image',
            url: share_qrcode,
            top: qrcode_top,
            left: qrcode_left,
            width: qrcode_width,
            height: qrcode_height,
          },
        ]
      }
    })
    console.log('二维码 paint:', that.data.painting)
  },
  eventSave: function () {
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        var length = Object.keys(authMap).length;
        console.log("authMap info 长度:" + length, authMap)
        if (authMap.hasOwnProperty('scope.writePhotosAlbum')) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.showModal({
              title: '用户未授权',
              content: '请授权保存相册权限',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定授权保存相册权限')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('openSetting success', res.authSetting);
                    }
                  })
                }
              }
            })
          }
        }
      }
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.share_qrcode_image,
      success(res) {
        wx.showToast({
          title: '图片已保存到相册，赶紧晒一下吧~',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  eventGetImage: function (event) {
    console.log('eventGetImage:', event)
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        share_qrcode_image: tempFilePath
      })
      wx.hideLoading()
    }
  },

  //保存图片
  saveImg: function (e) {
    var that = this;
    wx.showModal({
      title: '请确认',
      content: '保存相册',
      success: function (res) {
        if (res.confirm) {
          that.eventSave()
        }
      }
    })
  },
	onLoad: function (options) {
    var that = this
    console.log('share options:', options)
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var hiddenqrcode = that.data.hiddenqrcode
    var appid = that.data.appid
    var secret = that.data.secret
    var qr_type = options.qr_type ? options.qr_type:''
    var act_id = options.act_id ? options.act_id : ''
    var act_title = options.act_title ? options.act_title : ''
    var coupons_json = options.coupons ? options.coupons:''
    var coupons = coupons_json?JSON.parse(coupons_json):[{}]
    var coupons_name = coupons_json?coupons['name']:''
    var coupons_id = coupons_json?coupons['id']:0
    var coupons_type = coupons_json ? coupons['type'] : 1
    var coupons_flag = coupons_json?coupons['flag']:0
    var share_activity_qrcode_cache = options.share_activity_qrcode_cache ? options.share_activity_qrcode_cache : ''
    var share_coupon_qrcode_cache = options.share_coupon_qrcode_cache ? options.share_coupon_qrcode_cache : ''
    var share_member_qrcode_cache = options.share_member_qrcode_cache ? options.share_member_qrcode_cache : ''
   
    that.setData({
      username:username,
      appid: appid,
      secret: secret,
      qr_type: qr_type,
      act_id: act_id,
      act_title: act_title,
      coupons: coupons,
      coupons_json: coupons_json,
      hiddenqrcode:true,
      coupons_name: coupons_name,
      coupons_id: coupons_id,
      coupons_type: coupons_type,
      coupons_flag: coupons_flag,
      share_activity_qrcode_cache: share_activity_qrcode_cache,
      share_coupon_qrcode_cache: share_coupon_qrcode_cache,
      share_member_qrcode_cache: share_member_qrcode_cache,
		})
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 10,
        })
      }
    })
    that.get_project_gift_para()
    wx.showToast({
      title: "开始生成分享码",
      icon: 'loading',
      duration: 2000,
    })
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
      that.eventDraw()
    }, 2000)
   // that.eventDraw()
	},
  onShow:function(){
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
  }
})