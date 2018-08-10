import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
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
    var page = that.data.page
    var pagesize = that.data.pagesize

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
     this.get_project_gift_para()
    this.eventDraw()
  },

  eventDraw: function () {
    var that = this
    wx.showLoading({
      title: '绘制分享图片中',
      mask: true
    })
    that.setData({
      showSharePic: !that.data.showSharePic,
    })
    that.setData({
      painting: {
        width: 375,
        height: 555,
        clear: true,
        views: [
          {
            type: 'image',
            url: weburl + '/uploads/wishlist1.png',
            top: 0,
            left: 0,
            width: 375,
            height: 555
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
            type: 'text',
            content: userInfo.nickName + '的心愿单',
            fontSize: 30,
            color: '#383549',
            textAlign: 'left',
            top: 500,
            left: 40,
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
