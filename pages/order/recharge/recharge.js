var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type; 
Page({
	data: {
    title_name: '送出礼品',
    title_logo: '../../images/footer-icon-05.png',
    amount : 0,
    liveid:0,
		carts: [],
    cartIds: null,
		addressList: [],
		addressIndex: 0,
    username:null,
    token:null,
    page: 1,
    pagesize: 5,
    page_num: 0,
    page_red: 1,
    page_red_num: 0,
    all_rows: 0,
    all_red_rows: 0,
    shop_type: shop_type,
    showmorehidden: false,
    modalHiddenCoupon: true,
    couponType: 1,
    selectedAllStatus: false,
    selectedAgreeStatus: false,
    recharge_selected:'',
    discountpay:0, //折扣差额
    payamount:0, //实际支付金额
    order_num:1,//订单份数
    
  },
  /*
  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'confirmOrder') {
      that.confirmOrder()
    } else if (form_name == 'getMoreOrders') {
      that.getMoreOrdersTapTag()
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
  */

  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
    var goods_price = e.currentTarget.dataset.goodsPrice
    var goods_sale = e.currentTarget.dataset.goodsSale
    var goods_info = e.currentTarget.dataset.goodsInfo
    var goods_image = e.currentTarget.dataset.image
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&goods_info=' + '&image=' + goods_image+'&token=' + token + '&username=' + username
    });
  },

  order_num: function (e) {
    var that = this
    var order_num = parseInt(e.detail.value ? e.detail.value:0)
    var amount = that.data.amount
    var discountpay = that.data.discountpay ? that.data.discountpay:0
    var payamount = (amount*order_num - discountpay).toFixed(2)
    console.log('order_num amount:', amount, ' discountpay:', discountpay,' order_num:',order_num,' payamount:',payamount)
    that.setData({
      order_num: order_num,
      payamount: payamount,
    });
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
	addressObjects: [],
	onLoad: function (options) {
    var that = this  
    that.readCarts(options)
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 60,
        })
      }
    })
  },
  
	onShow: function () {
    var that = this 
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    //that.loadAddress()
  },
  
	readCarts: function (options) {
		var that = this
    console.log('order checkout readCarts options:', options)
    var liveid = options.liveid ? options.liveid:0
		//var amount = parseFloat(options.amount)
    //var delivery_price = parseFloat(options.delivery_price)
    //var payamount = that.data.payamount
    var discountpay = that.data.discountpay
    var carts = JSON.parse(options.carts)
    var cartIds = options.cartIds
    var delivery_price = parseFloat(carts[0].delivery_price)
    var cartIdArray = cartIds.split(',')
    var recharge_recomment_image = carts[0].activity_image
    var recharge_note = options.recharge_note ? options.recharge_note:'点击“立即入会”按钮并购买会员资格时，即代表您已阅读、理解并接受黑贝会会员规则和权益协议特别规定'
    var recharge_note2 = options.recharge_note2 ? options.recharge_note2:'注意: 电子版会员卡将在购买成功后，被同时关联至您的微信账户和个人手机号，而会员卡号将作为唯一账户识别号'
    var order_type = options.order_type ? options.order_type:''
    var order_note = options.order_note ? options.order_note:''
    var order_image = options.order_image ? options.order_image:''
    var order_shape = options.order_shape ? options.order_shape: 0   //5贺卡请柬
    var order_voice = options.order_voice ? options.order_voice:''
    var order_voicetime = options.order_voicetime ? options.order_voicetime : 0   //5贺卡请柬
    var order_color = options.order_color ? options.order_color : '#333'   //5贺卡请柬文字颜色
    var is_buymyself = options.is_buymyself?options.is_buymyself:0  //自购
    var recharge_title1 = options.recharge_title1? recharge_title1:'6个月期' 
    var recharge_title2 = options.recharge_title2? recharge_title2:'1年期' 
    var recharge_title3 = options.recharge_title3? recharge_title3:'3年期' 
    var recharge_title4 = options.recharge_title4? recharge_title4:'终身' 
    var recharge_amount1 = options.recharge_amount1? recharge_amount1:88 
    var recharge_amount2 = options.recharge_amount2? recharge_amount2:168 
    var recharge_amount3 = options.recharge_amount3? recharge_amount3:358 
    var recharge_amount4 = options.recharge_amount4? recharge_amount4:1888 
    //payamount = (amount - discountpay).toFixed(2)

    that.setData({
			//amount: amount,
      //payamount: payamount,
      delivery_price: delivery_price,
      liveid: liveid,
      carts: carts,
      cartIds: cartIdArray,
      recharge_recomment_image:recharge_recomment_image,
      recharge_note:recharge_note,
      recharge_note2:recharge_note2,
      order_type: order_type,
      order_note: order_note,
      order_image: order_image,
      username: options.username,
      token: options.token,
      is_buymyself: is_buymyself,
      order_shape:order_shape,
      order_voice: order_voice,
      order_voicetime: order_voicetime,
      order_color:order_color,
      recharge_title1:recharge_title1,
      recharge_title2:recharge_title2,
      recharge_title3:recharge_title3,
      recharge_title4:recharge_title4,
      recharge_amount1:recharge_amount1,
      recharge_amount2:recharge_amount2,
      recharge_amount3:recharge_amount3,
      recharge_amount4:recharge_amount4,
		})
    console.log('checkouts readCarts() order_image:', order_image, 'order_shape:', order_shape)
	},

  confirmOrder: function () {
    var that = this
    var liveid = that.data.liveid ? that.data.liveid:0
    var order_num = that.data.order_num
    var selectedAgreeStatus = that.data.selectedAgreeStatus
    var amount = that.data.amount
    if (!selectedAgreeStatus){
      wx.showToast({
        title: '请确认会员规则和权益协议',
        icon: 'loading',
        duration: 2500
      })
      return
    }else if(amount == 0){
      wx.showToast({
        title: '请选择充值金额',
        icon: 'loading',
        duration: 2500
      })
      return
    }
    var is_buymyself = that.data.is_buymyself //自购
    var carts = that.data.carts
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var selectedAgreeStatus = that.data.selectedAgreeStatus
    var shop_type = that.data.shop_type
    var amount = that.data.amount
    var buy_num = amount*100 
    var order_type = that.data.order_type?that.data.order_type:'gift'
    var order_image = that.data.order_image
    var order_note = that.data.order_note
    var order_shape = that.data.order_shape
    var order_num = that.data.order_num
    var is_recharge  = 1
    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        liveid: liveid,
        sku_id: cartIds,
        buy_type: 'sku',
        order_type: order_type,
        note: order_note,
        order_image: order_image,
        order_shape: order_shape,
        is_recharge:is_recharge,
        buy_num:buy_num,
        order_num:order_num?order_num:1,
        is_buymyself: is_buymyself ? is_buymyself : 0  //1自购礼品
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('提交订单:',res.data.result,' order_shape:',order_shape);
        var order_data = res.data.result;
        if (!res.data.info) {
          /*wx.showToast({
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          })
          */
          if (order_data['order_pay'] == 0 || is_buymyself == 0){
            that.delete_cart()
            that.zero_pay(order_data['order_no']) //0支付直接送出
          }else{
            wx.navigateTo({
              url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay'] + '&is_buymyself=' + is_buymyself
            })
          }
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  delete_cart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var sku_id = that.data.cartIds
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
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('payment delete_cart:', res.data.result);
      }
    })
  },
  zero_pay: function (order_no='') {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var is_buymyself = that.data.is_buymyself

    //再次确认订单状态
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('order checkout zero_pay() 0支付订单查询:', res.data)
        var orderObjects = res.data.result;
        if (!orderObjects) {
          console.log('order checkout zero_pay() 没有该订单 orderObjects:', orderObjects)
          wx.showToast({
            title: '没有该订单',
            icon: 'none',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1500);
          return
        } else {
          if (orderObjects[0]['gift_status'] > 0) {
            console.log('order checkout zero_pay() 该订单已送出 orderObjects:', orderObjects)
            wx.showToast({
              title: '该订单已送出',
              icon: 'none',
              duration: 1500
            })
            setTimeout(function () {
              wx.navigateBack();
            }, 1500)
            return
          } else {
            wx.navigateTo({
              url: '../send/send?order_no=' + order_no + '&orders=' + JSON.stringify(orderObjects) + '&is_buymyself=' + is_buymyself
            })
          }
        }
      }
    })
  },
	loadAddress: function () {
		var that = this;
    var addressList = [];
    var addressObjects = null;
    var address = [];
    var token = that.data.token;
    var username = that.data.username;
    //取送货地址
    wx.request({
      url: weburl + '/api/client/get_member_address',
      method: 'POST',
      data: { username: username, token: token },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result);
        address = res.data.result;
        for (var i = 0; i < address.length; i++) {
          // find the default address
          if (address[i]['isDefault'] == 1) {
            that.setData({
              addressIndex: i
            });
          }
          addressList[i] = address[i];
          //console.log(addressList[i]);
        }
        that.setData({
          addressList: addressList
        });
        that.addressObjects = address;
      }
    })

	},
  bindAgree: function () {
    var that = this
    // 环境中目前已选状态
    var selectedAgreeStatus = that.data.selectedAgreeStatus
    var page_red_num = that.data.page_red_num
    // 取反操作
    selectedAgreeStatus = !selectedAgreeStatus
    that.setData({
      selectedAgreeStatus: selectedAgreeStatus,
    })
    console.log('bindAgree :', selectedAgreeStatus, 'page_red_num:', page_red_num)
  },

  
  bindRechargeSelect: function (e) {
    var that = this
    var amount = e.currentTarget.dataset.rechargeAmount?e.currentTarget.dataset.rechargeAmount:that.data.amount
    var recharge_selected = e.currentTarget.dataset.rechargeType?e.currentTarget.dataset.rechargeType:that.data.recharge_selected
    that.setData({
      amount: amount,
      recharge_selected:recharge_selected,
    })
  },

  bindRechargeNote: function () {
    var that = this
    app.globalData.my_index = 1 //1系统消息
    app.globalData.art_id = 28 //28会员制说明
  
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/my/index'
      })
    }, 300)
  },

  bindRechargeRule: function () {
    var that = this
    app.globalData.my_index = 1 //1系统消息
    app.globalData.art_id = 29 // 29 会员规则和权益协议
  
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/my/index'
      })
    }, 300)
  },
})