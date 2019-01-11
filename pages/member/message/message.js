var util = require('../../../utils/util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var navList_order = [
  { id: "task", title: "任务" },
  { id: "message", title: "系统消息" },
];
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
    task_list: [],
    messageHidden: true,
    dkheight: 300,
    message:{},
    messageflag: 0,
    task_num: 0,
    message_num: 0,
    navList_order: navList_order,
    tab2: 'task',
    activeIndex2: 0,
    currenttime: now ? parseInt(now / 1000) : 0,
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var messageflag = that.data.messageflag;
    if (tab == 'task') { //task
      messageflag = 0;
    } else {
      messageflag = 1; //message
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      messageflag: messageflag,
    });
    console.log('tab:' + tab, ' messageflag:', messageflag)
    //that.reloadData()
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
  message_action: function (e) {
    var that = this
    var msg_id = e.currentTarget.dataset.msgId
    var msg_type = e.currentTarget.dataset.msgType
    var coupon_id = e.currentTarget.dataset.couponId
    var coupons_type = e.currentTarget.dataset.amountType
    if(msg_type==5){
      if (coupons_type == 1) {
        coupons_type = 2
      } else if (coupons_type == 2) {
        coupons_type = 3
      } else {
        coupons_type = 1
      }

      wx.navigateTo({
        url: '/pages/member/couponrcv/couponrcv?receive=1&coupons_flag=9&coupons_type=' + coupons_type + '&coupons_id=' + coupon_id + '&msg_id=' + msg_id
      })
    } else if (msg_type == 6){
      wx.switchTab({
        url: '/pages/member/task/task'
      })
    }
    
  },

  //领取 
  task_action: function (e) {
    var that = this
    var msg_id = e.currentTarget.dataset.msgId
    var task_status = e.currentTarget.dataset.taskStatus ? e.currentTarget.dataset.taskStatus : 0
    var image = e.currentTarget.dataset.image
    if (task_status < 9) {
      wx.navigateTo({
        url: '/pages/wish/wishshare/wishshare?task=1&image=' + image + '&msg_id=' + msg_id
      })
    }

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
    var accept_time = e.currentTarget.dataset.acceptTime
    var start_time = e.currentTarget.dataset.startTime
    var end_time = e.currentTarget.dataset.endTime
    var image = e.currentTarget.dataset.image
    var messageHidden = that.data.messageHidden
    var message = that.data.message
    start_time = util.getDateStr(start_time * 1000, 0)
    end_time = util.getDateStr(end_time * 1000, 0)
    if (message_type>3) return
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
    console.log('message_detail message:', that.data.message)
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
   

  },
  onShow: function(){
    var that = this
    that.get_member_messages()
  },
  //获取消息
  get_member_messages: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type

    wx.request({
      url: weburl + '/api/client/get_member_messages',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        message_type:0, //所有消息
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var messages_all = res.data
        if (messages_all['status']=='y') {
          var messages = messages_all['result']
          var task_list =[]
          var message_list = []
          for (var i = 0; i < messages.length;i++){
            if(messages[i].type==6) {
              task_list.push(messages[i])
            }else{
              message_list.push(messages[i])
            }
          }
          that.setData({
            message_list: message_list,
            task_list: task_list,
          })
          console.log('获取消息:', messages)
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