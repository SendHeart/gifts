
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';

Page({
  data: {
    username: username,
    token: null,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    shop_type:shop_type,
    messageHidden:true,
    lottery_flag:0, //0未抽奖
  }, 

  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '/pages/hall/hall'
      })
    }
  },
  //确定按钮点击事件 
  messageConfirm: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var order_no = that.data.order_no
    var lottery_flag = that.data.lottery_flag
    if(lottery_flag==0){
      wx.request({
        url: weburl + '/api/client/get_order_lottery',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          order_no: order_no,
          lottery_type: 1, //礼物订单抽奖
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(' 礼物订单抽奖:', res.data.result)
          var lottery_result = res.data.result
          if (lottery_result) {
            that.setData({
              lottery_money: lottery_result['money'],
              lottery_note: lottery_result['note'],
              lottery_flag: 1,
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '您已获得过奖励了',
        icon: 'loading',
        duration: 1500
      })
      that.messageCandel()
    }
  },
  //取消按钮点击事件  
  messageCandel: function () {
    var that = this
    that.setData({
      messageHidden: true,
    })
    wx.switchTab({
      url: '/pages/hall/hall'
    })
  }, 

  get_order_lottery: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var order_no = that.data.order_no
    var messageHidden = that.data.messageHidden
 
    wx.request({
      url: weburl + '/api/client/get_order_lottery',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        lottery_type: 0, //查询抽取活动
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(' 查询奖励活动:', res.data.result)
        var lottery_info = res.data.result
        if (res.data.status!='y') {
          wx.showToast({
            title: '' + res.data.info,
            icon: 'none',
            duration: 1500
          })
        } else {
          that.setData({
            messageHidden: !messageHidden,
            main_prom_image: lottery_info['img']
          })
        }
      }
    })
  },
 
  onLoad: function (options) {
    var that = this
    var lottery_type = options.lottery_type ? options.lottery_type:''
    var order_no = options.order_no ? options.order_no:''

    that.setData({
      lottery_type: lottery_type,
      order_no: order_no,
    })
    console.log('activity lottery_type:', lottery_type, ' order_no:', order_no)
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log('getSystemInfo:', winHeight);
        that.setData({
          dkheight: winHeight,
        })
      }
    })
    if (lottery_type==0){ //查询订单抽奖
      that.get_order_lottery()
    }
  },

 
  onShow: function () {
    var that = this
  
  },
  onShareAppMessage: function () {
    return {
      title: '黑贝会',
      desc: '开启礼物电商时代，200万人都在用的礼物小程序！',
      path: '/pages/hall/hall?refername='+username
    }
  } 
})
