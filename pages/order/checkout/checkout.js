var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type; 
Page({
	data: {
    title_name: '确认订单',
    title_logo: '../../images/footer-icon-05.png',
    amount : 0,
    liveid:0,
		carts: [],
    cartIds: null,
		addressList: [],
    addressIndex: 0,
    address_default: null,
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
    selectedRedAllStatus: false,
    discountpay:0, //折扣差额
    payamount:0, //实际支付金额
    order_num:1,//订单份数
    
	},
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
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;

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
    var amount = parseFloat(that.data.amount).toFixed(2)
    var discountpay = that.data.discountpay ? that.data.discountpay:0
    var payamount = parseFloat(amount*order_num - discountpay).toFixed(2)
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

	onLoad: function (options) {
    var that = this  
    that.readCarts(options)
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - 160, //列表滚动高度
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
    that.loadAddress()
	},
	readCarts: function (options) {
		var that = this
    console.log('order checkout readCarts options:', options)
    var liveid = options.liveid ? options.liveid:0
		var amount = parseFloat(options.amount).toFixed(2)
    //var delivery_price = parseFloat(options.delivery_price).toFixed(2)
    var payamount = parseFloat(that.data.payamount).toFixed(2)
    var discountpay = parseFloat(that.data.discountpay).toFixed(2)
    var carts = JSON.parse(options.carts)
    var cartIds = options.cartIds
    var delivery_price = parseFloat(carts[0].delivery_price).toFixed(2)
    var cartIdArray = cartIds.split(',')
    var order_type = options.order_type ? options.order_type:''
    var order_note = options.order_note ? options.order_note:''
    var order_image = options.order_image ? options.order_image:''
    var order_shape = options.order_shape ? options.order_shape: 0   //5贺卡请柬
    var order_voice = options.order_voice ? options.order_voice:''
    var order_voicetime = options.order_voicetime ? options.order_voicetime : 0   //5贺卡请柬
    var order_color = options.order_color ? options.order_color : '#333'   //5贺卡请柬文字颜色
    var is_buymyself = options.is_buymyself?options.is_buymyself:0  //自购
    var card_register_info = options.card_register_info? JSON.parse(options.card_register_info):'' //
    var card_name_info = options.card_name_info ? JSON.parse(options.card_name_info) : '' //
    var card_cele_info = options.card_cele_info ? JSON.parse(options.card_cele_info) : '' //
    var card_love_info = options.card_love_info ? JSON.parse(options.card_love_info) : '' //
    var card_template = options.card_template ? JSON.parse(options.card_template) : '' //
    payamount = parseFloat(amount - discountpay).toFixed(2)

    that.setData({
			amount: amount,
      payamount: payamount,
      delivery_price: delivery_price,
      liveid: liveid,
      carts: carts,
      cartIds: cartIdArray,
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
      card_register_info: card_register_info,
      card_name_info: card_name_info,
      card_cele_info: card_cele_info,
      card_love_info: card_love_info,
      card_template: card_template,
		})
    console.log('checkouts readCarts() order_image:', order_image, 'order_shape:', order_shape, 'liveid:', liveid, ' card_name_info:', card_name_info, ' card_register_info:', card_register_info, ' card_love_info:', card_love_info)
	},

  confirmOrder: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var liveid = that.data.liveid ? that.data.liveid:0
    var order_num = that.data.order_num>0?that.data.order_num:1    
    var is_buymyself = that.data.is_buymyself //自购
    var carts = that.data.carts
    var cartIds = that.data.cartIds
  
    var selectedAllStatus = that.data.selectedAllStatus
    var selectedRedAllStatus = that.data.selectedRedAllStatus
    var selected_coupon_quan_index = that.data.selected_coupon_quan_index ? that.data.selected_coupon_quan_index:0
    var selected_coupon_red_index = that.data.selected_coupon_red_index ? that.data.selected_coupon_red_index:0
    console.log('confirmOrder selected_coupon_quan_index:', that.data.selected_coupon_quan_index, 'selected_coupon_red_index:', that.data.selected_coupon_red_index, ' coupons_red_list:', that.data.coupons_red_list)
    var selected_coupon_amount = selectedAllStatus ? that.data.coupons_quan_list[selected_coupon_quan_index]['amount'] : 0
    var selected_coupon_id = selectedAllStatus ? that.data.coupons_quan_list[selected_coupon_quan_index]['id']:0
    var selected_coupon_type = selectedAllStatus?that.data.coupons_quan_list[selected_coupon_quan_index]['type'] : 1
    var selected_coupon_red_amount = selectedRedAllStatus?that.data.coupons_red_list[selected_coupon_red_index]['amount'] : 0
    var selected_coupon_red_id = selectedRedAllStatus?that.data.coupons_red_list[selected_coupon_red_index]['id']:0
    var selected_coupon_red_type = selectedRedAllStatus?that.data.coupons_red_list[selected_coupon_red_index]['type']:1
    var address_id = that.data.address_default['id']
    var status = 0
   
    var amount = parseFloat(that.data.amount).toFixed(2)
    var order_type = that.data.order_type?that.data.order_type:''
    var order_image = that.data.order_image
    var order_note = that.data.order_note
    var order_shape = that.data.order_shape
    var order_voice = that.data.order_voice
    var order_voicetime = that.data.order_voicetime
    var order_color = that.data.order_color
    var order_num = that.data.order_num
    var card_register_info = JSON.stringify(that.data.card_register_info)
    var card_name_info = JSON.stringify(that.data.card_name_info)
    var card_cele_info = JSON.stringify(that.data.card_cele_info)
    var card_love_info = JSON.stringify(that.data.card_love_info)
    var card_template = JSON.stringify(that.data.card_template)
    if (!order_note) order_note = '送你一份礼物，愿你喜欢!'; //默认祝福
    console.log('order_type:', order_type, 'order_shape:', order_shape, 'card_template:', card_template, ' card_cele_info:', card_cele_info)
    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        liveid: liveid,
        sku_id: cartIds,
        buy_type: 'cart',
        order_type: order_type,
        note: order_note,
        order_image: order_image,
        order_shape: order_shape,
        order_voice: order_voice,
        order_voicetime: order_voicetime,
        order_color: order_color,
        card_register_info: card_register_info,
        card_name_info: card_name_info,
        card_cele_info: card_cele_info,
        card_love_info: card_love_info,
        card_template: card_template,
        coupon_id: selectedAllStatus?selected_coupon_id:0,
        coupon_type: selectedAllStatus?selected_coupon_type:0,
        coupon_amount: selectedAllStatus ? selected_coupon_amount:0,
        coupon_red_id: selectedRedAllStatus ? selected_coupon_red_id : 0,
        coupon_red_type: selectedRedAllStatus ? selected_coupon_red_type : 0,
        coupon_red_amount: selectedRedAllStatus ? selected_coupon_red_amount : 0,
        order_num:order_num?order_num:1,
        is_buymyself: is_buymyself ? is_buymyself : 0 , //1自购礼品
        address_id:address_id,
        amount:amount,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('提交订单:',res.data.result);
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
          let ret_info = res.data.info
          if(ret_info.indexOf("已过期") >= 0){
            wx.showModal({
              title: ret_info,
              confirmText: '好的',    
              confirmColor: '#ff952d',
              content: '所有商品需要会员才能购买，现在立即加入续费会籍?', 
              success: function (res) {         
                if (res.confirm) {         
                 /*  wx.switchTab({
                    url: '../../my/index'
                  }) */     
                  that.navigateToRecharge() 
                } else {         
                  console.log('用户点击取消')         
                }         
              }         
            })           
          }else{
            wx.showToast({
              title: res.data.info,
              icon: 'none',
              duration: 2000
            })
          }
        }
      }
    })
  },

  navigateToRecharge: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var is_recharge = 1
    var recharge_type = 1
    wx.request({
      url: weburl + '/api/client/add_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type:shop_type,
        is_recharge: is_recharge,
        recharge_type:recharge_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('My navigateToRecharge res data:', res.data);
        var result =  res.data.result
        var membercard_no = result.card_no? result.card_no:''
        if(membercard_no!=''){
          wx.showToast({
            title: '会员充值',
            icon:'loading',
            duration: 2000
          })
        }else{
          wx.showToast({
            title: '会员卡生成失败',
            icon:'loading',
            duration: 2000
          })
          return
        }       
        
        that.setData({
          recharge_skuid: result.recharge_skuid,
          recharge_price: result.recharge_price,
          recharge_image: result.recharge_image,
          recharge_title1: result.recharge_title1?result.recharge_title1:'6个月期', 
          recharge_title2: result.recharge_title2?result.recharge_title2:'1年期',
          recharge_title3: result.recharge_title3?result.recharge_title3:'3年期', 
          recharge_title4: result.recharge_title4?result.recharge_title4:'终身', 
          recharge_amount1: result.recharge_amount1?result.recharge_amount1:'88',
          recharge_amount2: result.recharge_amount2?result.recharge_amount2:'168', 
          recharge_amount3: result.recharge_amount3?result.recharge_amount3:'358', 
          recharge_amount4: result.recharge_amount4?result.recharge_amount4:'1888', 
          recharge_note: result.recharge_note?result.recharge_note:'',
          recharge_note2: result.recharge_note2?result.recharge_note2:'',
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
    var shop_type = app.globalData.shop_type;
    var order_type = 'recharge'
    var order_shape = '8'
    var order_note = '会员充值'; 
    var recharge_image = that.data.recharge_image
    var buynum = 1
    var sku_sell_price = that.data.recharge_price
    var amount = parseFloat(sku_sell_price) * buynum
    var sku_id = that.data.recharge_skuid
    var is_buymyself = 1
    var goods_shape = 7 
    var recharge_title1 = that.data.recharge_title1 
    var recharge_title2 = that.data.recharge_title2 
    var recharge_title3 = that.data.recharge_title3 
    var recharge_title4 = that.data.recharge_title4 
    var recharge_amount1 = that.data.recharge_amount1
    var recharge_amount2 = that.data.recharge_amount2
    var recharge_amount3 = that.data.recharge_amount3
    var recharge_amount4 = that.data.recharge_amount4
    var recharge_note = that.data.recharge_note
    var recharge_note2 = that.data.recharge_note2
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
        console.log('my index queryCart:', res.data);
        var carts = [];
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
            index++;
          }
        }
        /* 
        that.setData({
          carts: carts,
          all_rows: carts.length,
          is_buymyself:is_buymyself,
        })
        */

        wx.navigateTo({
          url: '/pages/order/recharge/recharge?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + order_shape + '&order_image=' + recharge_image + '&recharge=1'+'&recharge_title1='+recharge_title1+'&recharge_amount1='+recharge_amount1+'&recharge_title2='+recharge_title2+'&recharge_amount2='+recharge_amount2+'&recharge_title3='+recharge_title3+'&recharge_amount3='+recharge_amount3+'&recharge_title4='+recharge_title4+'&recharge_amount4='+recharge_amount4+'&recharge_note='+recharge_note+'&recharge_note2='+recharge_note2+'&username=' + username + '&token=' + token
        })
      }
    })
  },

  delete_cart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var sku_id = that.data.cartIds
   
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
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var addressList = [];
    var address = [];
   
    //取送货地址
    wx.request({
      url: weburl + '/api/client/get_member_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        shop_type:shop_type 
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result);
        address = res.data.result
        if(address && address.length>0){
          for (var i = 0; i < address.length; i++) {
            // find the default address
            if (address[i]['isDefault'] == 1) {
              that.setData({
                addressIndex: i
              })             
            }
            addressList[i] = address[i];
            console.log('checkout loadAddress() i:',i,' address info:',address[that.data.addressIndex]);
          }
          that.setData({
            addressList: addressList,
            address_default: address[that.data.addressIndex]
          })
        }else{
          console.log('checkout loadAddress() 没有收货地址')
          wx.navigateTo({
            url: '/pages/address/list/list'
          })
        }               
      }
    })

	},
  bindSelectRedAll: function () {
    var that = this
    // 环境中目前已选状态
    var selectedRedAllStatus = that.data.selectedRedAllStatus
    var modalHiddenCoupon = that.data.modalHiddenCoupon
    var page_red_num = that.data.page_red_num
    // 取反操作
    selectedRedAllStatus = !selectedRedAllStatus
    modalHiddenCoupon = !modalHiddenCoupon
    that.setData({
      selectedRedAllStatus: selectedRedAllStatus,
      modalHiddenCoupon: modalHiddenCoupon,
      couponType: 2,  //红包
    })
    console.log('bindSelectRedAll :', selectedRedAllStatus, 'page_red_num:', page_red_num)
 
    if (selectedRedAllStatus && page_red_num == 0) {
      that.query_coupon()
    } else {
      that.setData({
        coupons_list: that.data.coupons_red_list
      })
    }
  },
  bindSelectAll: function () {
    var that = this
    // 环境中目前已选状态
    var selectedAllStatus = that.data.selectedAllStatus
    var modalHiddenCoupon = that.data.modalHiddenCoupon
    var page_num = that.data.page_num
    // 取反操作
    selectedAllStatus = !selectedAllStatus
    modalHiddenCoupon = !modalHiddenCoupon
    that.setData({
      selectedAllStatus: selectedAllStatus,
      modalHiddenCoupon: modalHiddenCoupon,
      couponType:1, //优惠券
    })
    console.log('selectedAllStatus :', selectedAllStatus, 'page_num:', page_num)
    if (selectedAllStatus && page_num == 0) {
      that.query_coupon()
    }else{
      that.setData({
        coupons_list: that.data.coupons_quan_list
      })
    }
  },
  bindSelectCoupon: function (e) {
    var that = this
    var coupon_type = that.data.couponType
    var selected_coupon_index = e.currentTarget.dataset.couponindex ? e.currentTarget.dataset.couponindex : 0
    var selected_coupon_id = e.currentTarget.dataset.couponid ? e.currentTarget.dataset.couponid : 0
    var selected_coupon_name = e.currentTarget.dataset.couponname ? e.currentTarget.dataset.couponname : ''
    var selected_coupon_content = e.currentTarget.dataset.couponcontent?e.currentTarget.dataset.couponcontent:''
    var selected_coupon_footer = e.currentTarget.dataset.couponfooter ? e.currentTarget.dataset.couponfooter : ''
    var selected_coupon_starttime = e.currentTarget.dataset.starttime
    var selected_coupon_endtime = e.currentTarget.dataset.endtime
    var selected_coupon_type = e.currentTarget.dataset.coupontype ? e.currentTarget.dataset.coupontype : 1
    var selected_coupon_amount = e.currentTarget.dataset.couponamount ? e.currentTarget.dataset.couponamount : 0
    var selected_couponimage = e.currentTarget.dataset.couponimage

    if (coupon_type==1){
      var coupons_list = that.data.coupons_quan_list
    } else if (coupon_type == 2){
      var coupons_list = that.data.coupons_red_list
    }
    for (var i = 0; i < coupons_list.length; i++) {
      if (i == selected_coupon_index) {
        coupons_list[selected_coupon_index]['selected'] = !coupons_list[selected_coupon_index]['selected']
      } else {
        coupons_list[i]['selected'] = false
      }
    }
    
    that.setData({
      selected_coupon_id: selected_coupon_id,
      selected_coupon_name: selected_coupon_name,
      selected_coupon_content: selected_coupon_content,
      selected_coupon_footer: selected_coupon_footer,
      selected_coupon_starttime: selected_coupon_starttime,
      selected_coupon_endtime: selected_coupon_endtime,
      selected_coupon_type: selected_coupon_type,
      selected_coupon_amount: selected_coupon_amount,
      selected_coupon_index: selected_coupon_index,
      selected_couponimage: selected_couponimage,
      coupons_list: coupons_list,
    })
    if (coupon_type == 1) {
      that.setData({
        coupons_quan_list: coupons_list,
        selected_coupon_quan_index: selected_coupon_index,
        selected_coupon_quan_amount: selected_coupon_amount,
      })
    } else if (coupon_type == 2) {
      that.setData({
        coupons_red_list: coupons_list,
        selected_coupon_red_index: selected_coupon_index,
        selected_coupon_red_amount: selected_coupon_amount,
      })
    }
    console.log('bindSelectCoupon coupon_type:', coupon_type, ' index:', that.data.selected_coupon_quan_index, ' red index:', that.data.selected_coupon_red_index)
  },
  getMoreOrdersTapTag: function (e) {
    var that = this
    var coupon_type = that.data.coupon_type ? that.data.coupon_type : 1
    var page = coupon_type==1?that.data.page + 1:that.data.page;
    var page_red = coupon_type == 2 ? that.data.page_red + 1 : that.data.page_red;
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
  
    if (page > that.data.page_num && coupon_type==1) {
      wx.showToast({
        title: '没有更多了~',
        icon: 'none',
        duration: 1500
      })
      return
    } else if (page_red > that.data.page_red_num && coupon_type == 2){
      wx.showToast({
        title: '没有更多了~',
        icon: 'none',
        duration: 1500
      })
      return
    }
    that.setData({
      page: page,
      page_red:page_red,
    })
    that.query_coupon()
  },
  query_coupon: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var page = that.data.page
    var page_red = that.data.page_red
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    var page_num = that.data.page_num    
    var page_red_num = that.data.page_red_num
    
    var coupons_status = 'avaliable'
    var coupons_type = that.data.couponType
    console.log('query_coupon coupons_type:', coupons_type)
    /*
    if (page > that.data.page_num) {
      return
    }
    */
    that.setData({
      coupons_list: {},
    })
    wx.request({
      url: weburl + '/api/client/query_coupon',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        shop_type: shop_type,
        coupons_status: coupons_status,
        quan_type: coupons_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('查询优惠券:', res.data.result);
        var coupons_list = res.data.result
        var all_rows = res.data.all_rows
        if (!res.data.result) {
          wx.showToast({
            title: res.data.info ? res.data.info : '暂无优惠券~',
            icon: 'none',
            duration: 2000
          })
          if (page == 1 && coupons_type==1 ){
            that.setData({
              coupons_quan_list:{},
              page_num:0,
            })
          } else if (page_red == 1 && coupons_type == 2){
            that.setData({
              coupons_red_list: {},
              page_red_num: 0,
            })
          }
        } else {
          for (var i = 0; i < coupons_list.length; i++) {
            coupons_list[i]['start_time'] = util.getDateStr(coupons_list[i]['start_time'] * 1000, 0)
            coupons_list[i]['end_time'] = util.getDateStr(coupons_list[i]['end_time'] * 1000, 0)
            coupons_list[i]['selected'] = false
          }
          if (page > 1  && coupons_type == 1 && coupons_list) {
            //向后合拼
            coupons_list = that.data.coupons_quan_list.concat(coupons_list)
          } else if (page_red > 1 && coupons_type == 2 && coupons_list){
            coupons_list = that.data.coupons_red_list.concat(coupons_list)
          }
          if (coupons_type == 1 ){
            page_num = (all_rows / pagesize + 0.5)
            that.setData({
              coupons_list: coupons_list,
              coupons_quan_list: coupons_list,
              page_num: page_num.toFixed(0),
              page_red_num:0,
            })
          } else if(coupons_type == 2){
            page_red_num = (all_rows / pagesize + 0.5)
            that.setData({
              coupons_list: coupons_list,
              coupons_red_list: coupons_list,
              page_red_num: page_red_num.toFixed(0),
              page_num:0,
            })
          } 
        }
        console.log('query_coupon coupons_list:', coupons_list,'red:', that.data.coupons_red_list, 'quan:',that.data.coupons_quan_list)
      }
    })
  },
  //优惠券使用
  coupon_pay: function (e) {
    var that = this
    var coupon_type = that.data.couponType
    var amount = that.data.amount
    var order_num = that.data.order_num
    var payamount = that.data.payamount
    var selectedAllStatus = that.data.selectedAllStatus
    var selectedRedAllStatus = that.data.selectedRedAllStatus
    var couponSelectedId = (selectedAllStatus)?that.data.selected_coupon_id:0
    var couponSelectedType = (selectedAllStatus)?that.data.selected_coupon_type:0
    var couponSelectedAmount = (selectedAllStatus) ? parseFloat(that.data.selected_coupon_amount) : 0
    
    var couponSelectedRedId = (selectedRedAllStatus) ? that.data.selected_coupon_red_id : 0
    var couponSelectedRedType = (selectedRedAllStatus) ? that.data.selected_coupon_red_type : 0
    var couponSelectedRedAmount = (selectedRedAllStatus) ? parseFloat(that.data.selected_coupon_red_amount) : 0
    var carts = that.data.carts
    var discountpay = that.data.discountpay ? that.data.discountpay:0
    console.log('coupon_pay couponSelectedAmount:', couponSelectedAmount, 'discountpay:', discountpay)
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['discount'] < 100 && carts[i]['discount'] >0) { //打折商品判断
        if (couponSelectedType == 1 && couponSelectedId){ //打折优惠券
          discountpay = discountpay+(100-carts[i]['discount']) * carts[i]['sell_price'] * carts[i]['num']/100
          discountpay = discountpay.toFixed(2)
        }
      }
    }
    if (coupon_type==2){ //红包
      discountpay = discountpay + couponSelectedRedAmount ? couponSelectedRedAmount:0
      discountpay = discountpay.toFixed(2)
    }
   
   
    payamount = (amount * order_num - discountpay).toFixed(2)
    that.setData({
      discountpay: discountpay,
      payamount: payamount,
    })
    if (discountpay - couponSelectedRedAmount == 0 && selectedAllStatus && coupon_type==1){
      that.modalBindcancelCoupon()
      wx.showToast({
        title:'该商品无法使用优惠券',
        icon: 'none',
        duration: 1000
      })
    }
  },
	bindPickerChange: function (e) {
		this.setData({
	    	addressIndex: e.detail.value
	    })
	},
	bindCreateNew: function () {
		var addressList = this.data.addressList;
		if (addressList.length == 0) {
			wx.navigateTo({
				url: '../../address/add/add?username='+this.data.username
			});
		}
	},
  //确定按钮点击事件  优惠券
  modalBindaconfirmCoupon: function () {
    var that = this
    var coupon_type = that.data.couponType
    var selectedAllStatus = that.data.selectedAllStatus
    var selected_coupon_index = that.data.selected_coupon_index ? that.data.selected_coupon_index : 0
    var coupon_list = that.data.coupons_list
    var couponSelectedStatus = coupon_list[selected_coupon_index] ? coupon_list[selected_coupon_index]['selected']:0
    that.setData({
      modalHiddenCoupon: !this.data.modalHiddenCoupon,
    })
    if(coupon_type==1){
      that.setData({
        selectedAllStatus: couponSelectedStatus ? true : false,
      })
    } else if (coupon_type==2){
      that.setData({
        selectedRedAllStatus: couponSelectedStatus ? true : false,
      })
    }
    that.coupon_pay() //计算优惠券价格
  },
  //取消按钮点击事件  优惠券
  modalBindcancelCoupon: function () {
    var that = this
    var coupon_type = that.data.couponType
    var payamount = that.data.payamount
    var amount = that.data.amount
    var discountpay = that.data.discountpay
    that.setData({
      modalHiddenCoupon: !that.data.modalHiddenCoupon,
      payamount: amount,
    })
    if (coupon_type == 1) {
      that.setData({
        selectedAllStatus: false,
      })
    } else if (coupon_type == 2) {
      that.setData({
        selectedRedAllStatus: false,
      })
    }
    that.coupon_pay() //计算优惠券价格
  },  
})