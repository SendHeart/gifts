var util = require('../../../utils/util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var now = new Date().getTime()
Page({
  data: {
    shop_type: shop_type,
    user: null,
    userInfo: {},
    username: null,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    page: 1,
    pagesize: 10,
    all_rows: 0,
    page_num: 0,
    userInfo: userInfo,
    hiddenmodalput: true,
    withdrawNum: null,
    withdrawWx: null,
    withdraw_selected: 1,
    message_list: [],
    messageHidden: true,
    dkheight: 300,
    message:{},
    currenttime: now ? parseInt(now / 1000) : 0,
  },
  //点击按钮指定的hiddenmodalput弹出框  
  modalinput_withdraw: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
  },
  //取消按钮  
  cancel_withdraw: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
  },
  //确认  
  confirm_withdraw: function () {
    var that = this
    var withdrawNum = that.data.withdrawNum ? that.data.withdrawNum : 0
    var withdrawWx = that.data.withdrawWx ? that.data.withdrawWx : ''
    var withdraw_selected = that.data.withdraw_selected ? that.data.withdraw_selected : 1
    var balance = that.data.balance
    console.log('withdrawNum:' + that.data.withdrawNum, 'balance:' + balance)
    if (withdrawNum - balance > 0) {
      wx.showToast({
        title: '大于可提现余额' + balance, withdrawNum,
        icon: 'none',
        duration: 1500
      })
    } else if (withdrawNum == 0) {
      wx.showToast({
        title: '提现金额不能为空',
        icon: 'none',
        duration: 1500
      })
    } else {
      that.setData({
        hiddenmodalput: !that.data.hiddenmodalput
      })
      that.withdraw_member_account()
    }
  },
  bindChangeNum: function (e) {
    var that = this;
    var withdrawNum = e.detail.value

    that.setData({
      withdrawNum: withdrawNum
    })
    console.log('withdrawNum:' + that.data.withdrawNum)
  },
  bindChangeWx: function (e) {
    var that = this;
    var withdrawWx = e.detail.value
    that.setData({
      withdrawWx: withdrawWx
    })
    console.log('withdrawWx:' + that.data.withdrawWx)
  },
  /** 
     * 预览图片
     */
  imgYu: function (event) {
    var src = event.currentTarget.dataset.src;//获取data-src
    var imgList =[]
     imgList.push(event.currentTarget.dataset.list)//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList, // 需要预览的图片http链接列表
    })
  },
  //领取 
  get_red_package: function (e) {
    var that = this
    var msg_id = e.currentTarget.dataset.msgId
    var coupon_id = e.currentTarget.dataset.couponId
    var coupons_type = e.currentTarget.dataset.amountType
    if (coupons_type == 1) {
      coupons_type=2
    } else if (coupons_type == 2){
      coupons_type = 3
    }else {
      coupons_type = 1
    }

    wx.navigateTo({
      url: '/pages/member/couponrcv/couponrcv?receive=1&coupons_flag=9&coupons_type=' + coupons_type+'&coupons_id=' + coupon_id+'&msg_id='+msg_id
    })
  },
  //确定按钮点击事件 
  messageConfirm: function () {
    var that = this
    var messageHidden = that.data.messageHidden
    that.setData({
      messageHidden: !messageHidden,
    })

  },
  message_detail: function (e) {
    var that = this
    var message_info = e.currentTarget.dataset.message
    var message_type = e.currentTarget.dataset.messageType;
    var amount = e.currentTarget.dataset.amount
    var amount_type = e.currentTarget.dataset.amountType
    var footer = e.currentTarget.dataset.footer
    var content = e.currentTarget.dataset.content
    var start_time = e.currentTarget.dataset.startTime
    var end_time = e.currentTarget.dataset.endTime
    var image = e.currentTarget.dataset.image
    var messageHidden = that.data.messageHidden
    var message = that.data.message
    start_time = util.getDateStr(start_time * 1000, 0)
    end_time = util.getDateStr(end_time * 1000, 0)
    console.log('message_detail message:',message)
    message = {
      message: message_info,
      message_type: message_type,
      amount: amount,
      amount_type: amount_type,
      footer: footer,
      content: content,
      start_time: start_time,
      end_time: end_time,
      image: image,
    }
    that.setData({
      message: message,
      messageHidden: !messageHidden,
    })
  },
  onLoad: function (options) {
    var that = this
    console.log('onLoad:', that.data.currenttime)
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log('getSystemInfo:', winHeight);
        that.setData({
          dkheight: winHeight,
        })
      }
    })
    that.get_member_message()

  },

  //获取消息
  get_member_message: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type

    wx.request({
      url: weburl + '/api/client/get_member_message',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var message_list = res.data
        if (message_list['status']=='y') {
          that.setData({
            message_list: message_list['result'],
          })
          console.log('获取消息:', message_list['result'])
        } else {
          wx.showToast({
            title: '暂无消息',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },
  getMoreAccountTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'loading',
        duration: 1000
      })
      return
    }
    that.setData({
      page: page,
    })
    that.get_member_message()
  },
  goBack: function () {
    var pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ changed: true })  /返回上一页
    } else {
      wx.switchTab({
        url: '../../my/index'
      })
    }
  },
  onPullDownRefresh: function () {
    //下拉刷新
    wx.stopPullDownRefresh()
  },

})