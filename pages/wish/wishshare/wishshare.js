import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var appid = wx.getStorageSync('appid') ? wx.getStorageSync('appid') : '';
var secret = wx.getStorageSync('appsecret') ? wx.getStorageSync('appsecret') : '';
var navList2 = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },

];

Page({
  data: {
    painting: {},
    shareImage: ''
  },
  get_project_gift_para: function () {
    var that = this
    var navList2 = that.data.navList2
  

    //项目列表
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        type: 1,  //暂定
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
        }

        that.setData({
          navList2: navList_new
        })

        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },
  onLoad () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
          scrollTop: that.data.scrollTop + 10
        })
      }
    })
    that.get_project_gift_para()
    that.eventDraw()
  },

  eventDraw: function () {
    var that = this
    wx.showLoading({
      title: '生成分享图片',
      mask: true
    })
     
    that.setData({
      painting: {
        width: 375,
        height: 580,
        clear: true,
        views: [
          {
            type: 'image',
            url: weburl + '/uploads/wishlist1.png',
            top: 0,
            left: 0,
            width: 375,
            height: 355
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
            url: weburl + '/api/WXPay/getQRCode?username='+username +'&appid='+appid+'&secret='+ secret,
            top: 440,
            left: 140,
            width: 100,
            height: 110,
            
          },
          {
            type: 'text',
            content: '长按识别二维码，查看我的心愿单',
            fontSize: 12,
            color: '#FFF',
            textAlign: 'left',
            top: 565,
            left: 100,
            lineHeight: 20,
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
