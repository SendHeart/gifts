import defaultData from '../../../data';
var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var secret = app.globalData.secret;
Page({
  data:{
    weburl: weburl,
    appid: appid,
    secret: secret,
  },
	onLoad: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var appid = that.data.appid
    var secret = that.data.secret
  	this.setData({
      username:username,
      appid: appid,
      secret: secret,
		});
	}
});