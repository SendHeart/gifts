import defaultData from '../../../data';
var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var secret = app.globalData.secret;
Page({
  data:{
    title_name: '二维码',
    title_logo: '../../../images/footer-icon-05.png',
    weburl: weburl,
    appid: appid,
    secret: secret,
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
	onLoad: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var appid = that.data.appid
    var secret = that.data.secret
    that.setNavigation()
  	this.setData({
      username:username,
      appid: appid,
      secret: secret,
		})
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