import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var appid = app.globalData.appid;
var secret = app.globalData.secret;
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "/uploads/songxin_banner.png" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_share", title: "背景", value: "", img: "/uploads/wechat_share.png" },

]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []

Page({
  data: {
    title_name: '分享心愿单',
    title_logo: '../../../images/footer-icon-05.png',
    painting: {},
    shareImage: '',
    shop_type:shop_type,
    wechat_share: ''
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
    if (pages.length >1) {
      wx.navigateBack({ changed: true });//返回上一页
    }else{
      wx.switchTab({
        url: '../../hall/hall'
      })
    }
   
  },
  get_project_gift_para: function () {
    var that = this
    
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
    var shop_type = that.data.shop_type
    console.log('wishshare get_project_gift_para navList2:', navList2)
    if (!navList_new) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          var navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return;
          }else{
            that.setData({
              navList2: navList_new,
              wechat_share: navList_new[5]['img']
            })
          }
        }
      })
    }else{
      that.setData({
        navList2: navList_new,
        wechat_share: navList_new[5]['img']
      })
    }
   

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
    that.eventDraw()
  },
  onLoad () {
    if (app.globalData.openid && app.globalData.openid != '') {
      // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中

    } else {
      app.openidCallBack = openid => {
        if (openid != '') {

        }
      }
    }
    var that = this
    that.setNavigation()
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 30,
          scrollTop: that.data.scrollTop + 10
        })
      }
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
  },
  eventDraw: function () {
    var that = this
    var wechat_share = that.data.wechat_share
    var shop_type = that.data.shop_type
    var qr_type = 'wishshare'  //
    wx.showLoading({
      title: '生成分享图片',
      mask: true
    })
     
    that.setData({
      painting: {
        width: 375,
        height: 667,
        clear: true,
        views: [
          {
            type: 'image',
            url:  wechat_share,
            top: 0,
            left: 0,
            width: 375,
            height: 667
          },
          /*
         {
           type: 'image',
           url: weburl+'/uploads/gift_logo.png',
           top: 27.5,
           left: 29,
           width: 55,
           height: 55
         },
        
         {
           type: 'text',
           content: '您的好友【kuckboy】',
           fontSize: 16,
           color: '#402D16',
           textAlign: 'left',
           top: 33,
           left: 96,
           bolder: true
         },
         */
          {
            type: 'image',
            url: weburl + '/api/WXPay/getQRCode?username='+username +'&appid='+appid+'&secret='+ secret+'&shop_type='+shop_type+'&qr_type='+qr_type,
            top: 480,
            left: 130,
            width: 110,
            height: 125,
            
          },
          {
            type: 'text',
            content: '长按识别二维码，查看我的心愿单',
            fontSize: 12,
            color: '#FFF',
            textAlign: 'left',
            top: 620,
            left: 95,
            lineHeight: 30,
            MaxLineNumber: 2,
            breakWord: true,
            //width: 150
          }
        ]
      }
    })
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
    console.log(event)
    wx.hideLoading()
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
  }
})
