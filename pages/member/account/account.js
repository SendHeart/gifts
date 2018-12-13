var util = require('../../../utils/util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
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
    withdrawNum:null,
    withdraw_selected:1,
  
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
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
    that.withdraw_member_account()
  },
  bindChangeNum: function (e) {
    var that = this;
    var withdrawNum = e.detail.value
    that.setData({
      withdrawNum: withdrawNum
    })
    console.log('withdrawNum:' + that.data.withdrawNum)
  },
  withdrawSelect: function (e) {
    var that = this
    var withdraw_selected = e.currentTarget.dataset.withdrawType;
    that.setData({
      withdraw_selected: withdraw_selected
    })
    console.log('withdraw_selected:' + that.data.withdraw_selected)
  },
  //账户提现申请
  withdraw_member_account: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var withdrawNum = that.data.withdrawNum ? parseFloat(that.data.withdrawNum):0
    var withdraw_selected = that.data.withdraw_selected
    var balance = that.data.balance
    console.log('账户提现申请 withdrawNum:' + withdrawNum, ' balance:', balance)
    if (withdrawNum > 0 && withdrawNum <= balance && withdraw_selected == 2){ //银行卡提现
      //获取我的银行列表
      wx.request({
        url: weburl + '/api/client/get_member_bankcardinfo',
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
          if (res.data.status == 'y') {
            var mbank_info = res.data.result
            that.setData({
              bank_name: mbank_info[0]['bank_name'],
              bank_id: mbank_info[0]['bank_id'],
              bankcard_no: mbank_info[0]['bank_cardno'],
              bankcard_name: mbank_info[0]['bank_cardname'],
            })
            console.log('获取我的银行卡完成 bank id:',that.data.bank_id, ' bankcard_no:',that.data.bankcard_no)
            wx.request({
              url: weburl + '/api/client/withdraw_member_account',
              method: 'POST',
              data: {
                username: username,
                access_token: token,
                shop_type: shop_type,
                withdraw_type: 2,
                amount: withdrawNum*100,
                bank_id: that.data.bank_id,
                bank_cardno: that.data.bankcard_no,
                bank_cardname: that.data.bankcard_name,
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                if (res.data.status == 'y') {
                  wx.showToast({
                    title: '提现申请完成',
                    icon: 'loading',
                    duration: 1000
                  })
                  console.log('提现申请完成', withdrawNum)
                } else {
                  wx.showToast({
                    title: res.data.info + '[失败]',
                    icon: 'none',
                    duration: 1500
                  })
                }
              }
            })
          }
        }
      })

      
    } else if (withdrawNum > 0 && withdrawNum <= balance && withdraw_selected == 1){ //微信提现
      wx.request({
        url: weburl + '/api/client/withdraw_member_account',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          shop_type: shop_type,
          withdraw_type:1,
          amount: withdrawNum * 100,
         
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          if (res.data.status == 'y') {
            wx.showToast({
              title: '提现申请完成',
              icon: 'loading',
              duration: 1000
            })
            console.log('提现申请完成', withdrawNum)
          } else {
            wx.showToast({
              title: res.data.info + '[失败]',
              icon: 'none',
              duration: 1500
            })
          }
        }
      })
    } else {
      wx.showToast({
        title:  '提现金额有误',
        icon: 'loading',
        duration: 1500
      })
    }
  },
  onLoad: function (options) {
    var that = this
    that.get_member_account_bal()
    that.get_member_account_detail()
  },

  //获取账户余额
  get_member_account_bal: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    
    wx.request({
      url: weburl + '/api/client/get_member_account_bal',
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
        var balance_info = res.data.result
        
        if (balance_info) {
          var balance = 0 
          balance = balance_info['balance']/100
          that.setData({
            balance: balance.toFixed(2),
        
          })

          console.log('获取账户余额:', balance)
        } else {
          wx.showToast({
            title: '暂无账户信息',
            icon: 'loading',
            duration: 1000
          })
        }
      }
    })
  },
  //获取账户明细
  get_member_account_detail: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var all_rows = that.data.all_rows
    var page = that.data.page
    var pagesize = that.data.pagesize
    wx.request({
      url: weburl + '/api/client/get_member_account_detail',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        page:page,
        pagesize:pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var balance_detail_info = res.data.result
        var all_rows = res.data.all_rows ? res.data.all_rows : 1
        if (balance_detail_info) {
          var page_num = that.data.page_num
          page_num = (all_rows / pagesize + 0.5)
          for (var i = 0; i < balance_detail_info.length; i++) {
            balance_detail_info[i]['addtime'] = util.getDateStr(balance_detail_info[i]['addtime'] * 1000, 0)
            balance_detail_info[i]['amount'] = (balance_detail_info[i]['amount'] / 100).toFixed(2)
          }
          that.setData({
            balance_detail: balance_detail_info,
            all_rows: all_rows,
            page_num: page_num.toFixed(0),
          })
          console.log('获取账户明细:', balance_detail_info)
        } else {
          wx.showToast({
            title: '暂无账户明细',
            icon: 'loading',
            duration: 1000
          })
        }
      }
    })
  },

  getMoreAccountTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'loading',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    })
    that.get_member_account_detail()
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../../my/index'
      })
    }

  },
 
})