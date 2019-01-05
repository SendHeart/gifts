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

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
    that.eventDraw()
  },

  eventDraw: function () {
    var that = this
    var wechat_share = that.data.wechat_share
    var shop_type = that.data.shop_type
    var qr_type = that.data.qr_type ? that.data.qr_type:'couponshare'  //
    var act_id = that.data.act_id ? that.data.act_id : ''  //
    var act_title = that.data.act_title ? that.data.act_title : ''  //
    var coupons = that.data.coupons
    var coupons_json = that.data.coupons_json
    var coupons_id = that.data.coupons_id
    var coupons_type = that.data.coupons_type
    var coupons_flag = that.data.coupons_flag
    var coupons_name = that.data.coupons_name
    that.setData({
      qr_type: qr_type,
    })
    /*
    wx.showLoading({
      title: '生成优惠券扫码图片',
      mask: true
    })
    */
    console.log('优惠券扫码图片信息:', coupons,'qr_type:',qr_type)
    that.setData({
      painting: {
        width: 375,
        height: 667,
        clear: true,
        views: [
          {
            type: 'image',
            url: wechat_share,
            top: 0,
            left: 0,
            width: 375,
            height: 667
          },
          
          {
            type: 'image',
            url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&coupons_flag=' + coupons_flag + '&coupons_type=' + coupons_type +'&coupons_id=' + coupons_id + '&coupons=' + coupons_json + '&act_id=' + act_id ,
            top: 450,
            left: 130,
            width: 110,
            height: 125,

          },
          {
            type: 'text',
            content: '长按识别二维码，领取优惠券',
            fontSize: 18,
            color: '#dc344d',
            textAlign: 'left',
            top: 580,
            left: 70,
            lineHeight: 30,
            MaxLineNumber: 2,
            breakWord: true,
            //width: 150
          }
        ]
      }
    })
    console.log('二维码 paint:', that.data.painting)
  },
  eventSave: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  eventGetImage: function (event) {
    console.log('eventGetImage:', event)
    wx.hideLoading()
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
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
    
    //that.setNavigation()
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
		})
    that.get_project_gift_para()
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