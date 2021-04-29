var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type; 
Page({
	data: {
    title_name: '加入黑贝会',
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
    selectedAllStatus: false,
    selectedAgreeStatus: false,
    recharge_selected:'2',
    recharge_note:'勾选此选项并购买会籍资格时，即代表您已阅读、理解并接受',
    recharge_note2 :'注意: 电子版会员卡将在购买成功后，被同时关联至您的微信账户和个人手机号，而会员卡号将作为唯一账户识别号',
    discountpay:0, //折扣差额
    payamount:0, //实际支付金额
    order_num:1,//订单份数
    order_voice :'',
    order_voicetime : '',
    order_color : '',
    order_shape:'8',
    order_type : 'recharge',  
    order_note : '会员充值' ,
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
    var recharge_options
    if(options.recharge_options){
      recharge_options = JSON.parse(options.recharge_options)
    }else{
      recharge_options = options
    }
    var recharge_selected = recharge_options.recharge_selected?recharge_options.recharge_selected:that.data.recharge_selected
    var recharge_note = recharge_options.recharge_note ? recharge_options.recharge_note:that.data.recharge_note
    var recharge_note2 = recharge_options.recharge_note2 ? recharge_options.recharge_note2:that.data.recharge_note2
    that.setData({
      recharge_options: recharge_options,
      recharge_selected:recharge_selected,
      recharge_note:recharge_note,
      recharge_note2:recharge_note2,
    })  
    //console.log('order/recharge onLoad() options:',options)
    that.getRechargeInfo()
    //that.readCarts(recharge_options)
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
  
  getRechargeInfo: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var is_recharge = 1
    var recharge_type = 1
    var recharge_level = that.data.recharge_selected //默认第二档
    var is_buymyself = 1
    var recharge_selected = that.data.recharge_selected
    var buy_num = that.data.buy_num
   
    wx.request({
      url: weburl + '/api/client/add_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type:shop_type,
        is_recharge: is_recharge,
        recharge_type:recharge_type,
        recharge_level:recharge_level,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('order recharge getRechargeInfo() res data:', res.data);
        var result =  res.data.result
        var membercard_no = result.card_no? result.card_no:''
        if(membercard_no==''){        
          wx.showToast({
            title: '会员卡生成失败',
            icon:'error',
            duration: 2000
          })
          return
        }  
        let recharge_amount1 =  result.recharge_amount1?result.recharge_amount1:'68'
        let recharge_amount2 =  result.recharge_amount2?result.recharge_amount2:'108'
        let recharge_amount3 =  result.recharge_amount3?result.recharge_amount3:'368'
        let recharge_amount4 =  result.recharge_amount4?result.recharge_amount4:'1888'
        if(recharge_selected == 1){
          buy_num = recharge_amount1
        }else if(recharge_selected == 2){
          buy_num = recharge_amount2
        }else if(recharge_selected == 3){
          buy_num = recharge_amount3
        }else if(recharge_selected == 4){
          buy_num = recharge_amount4
        }else{
          buy_num = recharge_amount2
        }
        var sku_sell_price = result.recharge_price
        var amount = parseFloat(sku_sell_price) * buy_num
        that.setData({
          buy_num:buy_num,
          amount:amount,
          is_buymyself:is_buymyself,
          recharge_skuid: result.recharge_skuid,
          recharge_price: result.recharge_price,
          recharge_image: result.recharge_image,
          recharge_title1: result.recharge_title1?result.recharge_title1:'6个月期', 
          recharge_title2: result.recharge_title2?result.recharge_title2:'1年期',
          recharge_title3: result.recharge_title3?result.recharge_title3:'3年期', 
          recharge_title4: result.recharge_title4?result.recharge_title4:'终身', 
          recharge_amount1: recharge_amount1,
          recharge_amount2: recharge_amount2, 
          recharge_amount3: recharge_amount3, 
          recharge_amount4: recharge_amount4, 
          recharge_note: result.recharge_note?result.recharge_note:that.data.recharge_note,
          recharge_note2: result.recharge_note2?result.recharge_note2:that.data.recharge_note2,
          order_voice: result.order_voice?result.order_voice:'',
          order_voicetime: result.order_voicetime?result.order_voicetime:'',
          order_color:result.order_color?result.order_color:'',
        },function(){
          that.queryCart()
        })
      }
    })  
  },

  queryCart: function () {
    var that = this
     var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type
    var recharge_selected = that.data.recharge_selected
  
    var recharge_image = that.data.recharge_image
    var sku_id = that.data.recharge_skuid  
    var goods_shape = 7 
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        sku_id: sku_id,
        goods_shape:goods_shape
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('order/recharge queryCart():', res.data);
        var carts = []
        var cartIds = []
        if (!res.data.result) {
          wx.showToast({
            title: '会员充值:' + res.data.info,
            icon: 'none',
            duration: 1500
          })
          return
        }
        var cartlist = res.data.result.list;
        var index = 0;
        for (var key in cartlist) {
          cartlist[key]['sku_list'][0]['image'] = recharge_image
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
              cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image']
            } 
            cartlist[key]['sku_list'][i]['selected'] = true
            cartlist[key]['sku_list'][i]['shop_id'] = key
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id']
            carts[index] = cartlist[key]['sku_list'][i]
            cartIds[index] = cartlist[key]['sku_list'][i]['objectId']
            index++;
          }
        }
        
        that.setData({              
          carts: carts,
          cartIds: cartIds,
          recharge_recomment_image:carts[0]?carts[0].activity_image:'',                  
        })
        console.log('order/recharge getRechargeInfo() carts:', that.data.carts, 'cartIds:', that.data.cartIds)
      }
    })
  },

  /*
	readCarts: function (options) {
		var that = this
    console.log('recharge readCarts options:', options)
    var liveid = options.liveid ? options.liveid:0
    var amount = options.amount?parseFloat(options.amount):that.data.amount
    var recharge_selected = options.recharge_selected?options.recharge_selected:that.data.recharge_selected
    var payamount = that.data.payamount
    var discountpay = that.data.discountpay
    var carts = JSON.parse(options.carts)
    var cartIds = options.cartIds    
    var cartIdArray = cartIds.split(',')
    var recharge_recomment_image = carts[0].activity_image?carts[0].activity_image:''
    var recharge_note = options.recharge_note ? options.recharge_note:'勾选此选项并购买会籍资格时，即代表您已阅读、理解并接受'
    var recharge_note2 = options.recharge_note2 ? options.recharge_note2:'注意: 电子版会员卡将在购买成功后，被同时关联至您的微信账户和个人手机号，而会员卡号将作为唯一账户识别号'
    var order_type = options.order_type ? options.order_type:''
    var order_note = options.order_note ? options.order_note:''
    var order_image = options.order_image ? options.order_image:''
    var order_shape = options.order_shape ? options.order_shape: 0   //5贺卡请柬
    var order_voice = options.order_voice ? options.order_voice:''
    var order_voicetime = options.order_voicetime ? options.order_voicetime : 0   //5贺卡请柬
    var order_color = options.order_color ? options.order_color : '#333'   //5贺卡请柬文字颜色
    var is_buymyself = options.is_buymyself?options.is_buymyself:0  //自购
    var recharge_title1 = options.recharge_title1 
    var recharge_title2 = options.recharge_title2 
    var recharge_title3 = options.recharge_title3  
    var recharge_title4 = options.recharge_title4 
    var recharge_amount1 = options.recharge_amount1  
    var recharge_amount2 = options.recharge_amount2 
    var recharge_amount3 = options.recharge_amount3  
    var recharge_amount4 = options.recharge_amount4
    //payamount = (amount - discountpay).toFixed(2)

    that.setData({
      amount: amount,
      recharge_selected:recharge_selected,
      //payamount: payamount,      
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
  */

  confirmOrder: function () {
    var that = this
    var liveid = that.data.liveid ? that.data.liveid:0
    var order_num = that.data.order_num
    var selectedAgreeStatus = that.data.selectedAgreeStatus
    var amount = that.data.amount
    var dtheight = wx.getSystemInfoSync().windowHeight;
    if (!selectedAgreeStatus){
      wx.showToast({
        title: '请先勾选会籍规则和权益协议',
        icon: 'none',
        duration: 2500
      })
      that.setData({
      scrolltop: dtheight *10
      }) 
      return
    }else if(amount == 0){
      wx.showToast({
        title: '请先选择充值金额',
        icon: 'none',
        duration: 2500
      })
      return
    }
    var is_buymyself = that.data.is_buymyself //自购
    var carts = that.data.carts
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    // = that.data.selectedAgreeStatus
    var shop_type = app.globalData.shop_type;
    var amount = parseFloat(that.data.amount).toFixed(2)
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
    var shop_type = app.globalData.shop_type;
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
    var shop_type = app.globalData.shop_type;

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
            console.log('order checkout zero_pay() 该订单已购出 orderObjects:', orderObjects)
            wx.showToast({
              title: '该订单已购出',
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
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var addressList = [];
    var addressObjects = null;
    var address = [];
   
    //取送货地址
    wx.request({
      url: weburl + '/api/client/get_member_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        shop_type 
      },
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
    app.globalData.from_page = '/pages/order/recharge/recharge?recharge_options='+ JSON.stringify(that.data.recharge_options)
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
    app.globalData.from_page = '/pages/order/recharge/recharge?recharge_options='+ JSON.stringify(that.data.recharge_options)
   
    setTimeout(function () {
      wx.switchTab({
        url: '/pages/my/index'
      })
    }, 300)
  },
})