//index.js
//获取应用实例
var app = getApp()
var socketOpen = false
var socketMsgQueue = []
Page({
  data: {
    userInfo: {},
    socktBtnTitle: '连接socket'
  },
  socketBtnTap: function () {
    var that = this
    var remindTitle = socketOpen ? '正在关闭' : '正在连接'
    wx.showToast({
      title: remindTitle,
      icon: 'loading',
      duration: 10000
    })
    if (!socketOpen) {
      wx.connectSocket({
        url: 'wss://czw.saleii.com/wss'
      })
      wx.onSocketError(function (res) {
        socketOpen = false
        console.log('WebSocket连接打开失败，请检查！')
        that.setData({
          socktBtnTitle: '连接socket'
        })
        wx.hideToast()
      })
      wx.onSocketOpen(function (res) {
        console.log('WebSocket连接已打开！')
        wx.hideToast()
        that.setData({
          socktBtnTitle: '断开socket'
        })
        socketOpen = true;
        var username = wx.getStorageSync('username');
        if (!username) {//登录
          wx.navigateTo({
            url: '../../login/login?wechat=1'
          })
        }else{
          that.sendSocketMessage(username);
        }
        for (var i = 0; i < socketMsgQueue.length; i++) {
          that.sendSocketMessage(socketMsgQueue[i])
        }
        socketMsgQueue = []
      })
      wx.onSocketMessage(function (res) {
        console.log('收到服务器内容：' + res.data)
      })
      wx.onSocketClose(function (res) {
        socketOpen = false
        console.log('WebSocket 已关闭！')
        wx.hideToast()
        that.setData({
          socktBtnTitle: '连接socket'
        })
      })
    } else {
      wx.closeSocket()
    }
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  sendSocketMessage: function (msg) {
    if (socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      socketMsgQueue.push(msg)
    }
  },
  sendMessageBtnTap: function (msg) {
    this.sendSocketMessage(msg)
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  }
})