import defaultData from '../../../data';
var app = getApp();
var weburl = app.globalData.weburl;
Page({
  data:{
    weburl: weburl,
    appid:null,
    secret:null,
  },
	onLoad: function (options) {
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var appid = wx.getStorageSync('appid') ? wx.getStorageSync('appid') : '';
    var secret = wx.getStorageSync('appsecret') ? wx.getStorageSync('appsecret') : '';
  	this.setData({
      username:username,
      appid: appid,
      secret: secret,
		});
	}
});