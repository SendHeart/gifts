var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl; 
var shop_type = app.globalData.shop_type; 
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
Page({
	data: {
    title_name: '送出礼物',
    title_logo: '../../../images/footer-icon-05.png',
    orderNo: '',
    orders: [],
    totalFee:0,
    sku_id:'',
    navList2: navList2,
    page: 1,
    pagesize: 5,
    page_num: 0,
    all_rows: 0,
    shop_type: shop_type,
    is_buymyself:0,
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
  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'pay') {
      that.pay()
    }
    if (formId) that.submintFromId(formId)
  },

  //提交formId，让服务器保存到数据库里
  submintFromId: function (formId) {
    var that = this
    var formId = formId
    var shop_type = that.data.shop_type
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.request({
      url: weburl + '/api/client/save_member_formid',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        formId: formId,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('submintFromId() update success: ', res.data)
      }
    })
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true })//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    var navList2 = that.data.navList2

    console.log('payment get_project_gift_para navList2:', navList2, 'length:', navList2.length)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return;
          } else {
            that.setData({
              navList2: navList_new
            })
            console.log('payment get_project_gift_para navList_new:', navList_new)
          }
        }
      })
    }
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },
	onLoad: function (options) {
    var that = this
    var orderNo = options.orderNo;
    var totalFee = options.totalFee ? options.totalFee:0
    var is_buymyself = options.is_buymyself ? options.is_buymyself:0 //自购礼品
    var received = options.received ? options.received : 0 //未支付礼物订单支付
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var navList2 = that.data.navList2
    //that.setNavigation()
    that.get_project_gift_para()
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: orderNo,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('payment onload:',res.data.result)
        var orderObjects = res.data.result
        var sku_id = that.data.sku_id
        if (!res.data.info) {
          var order_price =0
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'] .indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
              if (sku_id!=''){
                sku_id = sku_id + ','+orderObjects[i]['order_sku'][j]['sku_id']
              }else{
                sku_id = orderObjects[i]['order_sku'][j]['sku_id']
              }
              
            }
            order_price = order_price + orderObjects[i]['order_price']
          }
          totalFee = order_price.toFixed(2)*100
          //totalFee = totalFee.toFixed(0)
          console.log('order_price:'+order_price)
          that.setData({
            orders: orderObjects,
            orderNo: orderNo,
            username: username,
            token: token,
            totalFee: totalFee ? totalFee:order_price,
            sku_id:sku_id,
            is_buymyself:is_buymyself,
            received:received,
          })
         if(is_buymyself==0 && received==0) that.pay()
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          })
        }
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 120,
        })
      }
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
  },

  pay: function () {
		var that = this;
    var openId = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var totalFee = that.data.totalFee;
    var orderNo = that.data.orderNo;
    var shop_type = that.data.shop_type
    var is_buymyself = that.data.is_buymyself
    var received = that.data.received
    console.log('payment openId', openId, ' totalFee:', totalFee, ' is_buymyself:', is_buymyself, ' received:', received);

		//统一下单接口对接
    if (totalFee<=0){
      that.delete_cart()
      wx.navigateTo({
        url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
      })
        return
    }
    if (is_buymyself==1 || received==1){ //自购礼品 未支付礼物被接收 支付
      wx.request({
        url: weburl + '/api/WXPay',
        data: {
          openid: openId,
          body: '商城',
          tradeNo: that.data.orderNo,
          totalFee: that.data.totalFee,
          shop_type: shop_type
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (response) {
          // 发起支付
          if (response.data.timeStamp) {
            wx.requestPayment({
              'timeStamp': response.data.timeStamp,
              'nonceStr': response.data.nonceStr,
              'package': response.data.package,
              'signType': 'MD5',
              'paySign': response.data.paySign,
              'success': function (res) {
                console.log('支付成功:' + res);
                wx.showToast({
                  title: '支付成功'
                })
                if(received==1){
                  wx.navigateTo({
                    url: '/pages/lottery/lottery?lottery_type=0' + '&order_no=' + orderNo,
                  })
                } else {
                  that.delete_cart()
                  wx.navigateTo({
                    url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: response.data,
              icon: 'loading',
              duration: 2000,
            })
          }
        },
        fail: function (response) {
          console.log('发起支付失败', response);
          //console.log(response);
        }
      })
    }else{ //未支付 送礼
      console.log('未支付送礼', 'orderNo:', that.data.orderNo,' orders:',that.data.orders);
      that.delete_cart()
      wx.navigateTo({
        url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
      })
    }
	},
  delete_cart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var sku_id = that.data.sku_id
    var shop_type = that.data.shop_type
    console.log('payment delete_cart sku_id:', sku_id);
    // 购物车单个删除
    wx.request({
      url: weburl + '/api/client/delete_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        sku_id: sku_id,
        shop_type:shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('payment delete_cart:',res.data.result);
      }
    })
  },

})