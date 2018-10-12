var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type; 
Page({
	data: {
    title_name: '送出礼品',
    title_logo: '../../images/footer-icon-05.png',
    amount : 0,
		carts: [],
    cartIds: null,
		addressList: [],
		addressIndex: 0,
    username:null,
    token:null,
    page: 1,
    pagesize: 5,
    page_num: 0,
    all_rows: 0,
    shop_type: shop_type,
    showmorehidden: false,
    modalHiddenCoupon: true,
    HiddenSelectedCoupon: 0,
    selectedAllStatus: false,
    discountpay:0, //折扣差额
    payamount:0, //实际支付金额
    
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
   // this.setNavigation()
   // console.log('from hall:', options.carts)
    that.readCarts(options)
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
		// from carts
		// amount
		var amount = parseFloat(options.amount)
    var payamount = that.data.payamount
    var discountpay = that.data.discountpay
    var carts = JSON.parse(options.carts)
    var cartIds = options.cartIds
    var cartIdArray = cartIds.split(',')
    var order_type = options.order_type
    var order_note = options.order_note

    payamount = (amount - discountpay).toFixed(2)

    console.log('from hall:',carts)
    
    that.setData({
			amount: amount,
      payamount: payamount,
      carts: carts,
      cartIds: cartIdArray,
      order_type: order_type,
      order_note: order_note,
      username: options.username,
      token: options.token,
		});
	},

  confirmOrder: function () {
    var that = this
    var carts = that.data.carts
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var selected_coupon_id = that.data.selected_coupon_id
    var selected_coupon_type = that.data.selected_coupon_type
    var selectedAllStatus = that.data.selectedAllStatus
    var status = 0
    var shop_type = that.data.shop_type
    var amount = that.data.amount
    var order_type = 'gift'
    var order_note = that.data.note
    if (!order_note) order_note = '送你一份心意，愿美好长存!'; //默认祝福
    console.log('选中优惠券类型:', selected_coupon_type)
    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        sku_id: cartIds,
        buy_type: 'cart',
        order_type: order_type,
        note: order_note,
        coupon_id:selectedAllStatus?selected_coupon_id:0,
        coupon_type:selectedAllStatus?selected_coupon_type:0,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('提交订单:',res.data.result);
        var order_data = res.data.result;
        if (!res.data.info) {
          wx.showToast({
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          })
          wx.navigateTo({
            url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
          })
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          })
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
    })
    if (selectedAllStatus && page_num == 0) that.query_coupon()
  },
  bindSelectCoupon: function (e) {
    var that = this
    var selected_coupon_index = e.currentTarget.dataset.couponindex ? e.currentTarget.dataset.couponindex : 0;
    var selected_coupon_id = e.currentTarget.dataset.couponid ? e.currentTarget.dataset.couponid : 0
    var selected_coupon_name = e.currentTarget.dataset.couponname ? e.currentTarget.dataset.couponname : ''
    var selected_coupon_content = e.currentTarget.dataset.couponcontent?e.currentTarget.dataset.couponcontent:''
    var selected_coupon_footer = e.currentTarget.dataset.couponfooter ? e.currentTarget.dataset.couponfooter : ''
    var selected_coupon_starttime = e.currentTarget.dataset.starttime
    var selected_coupon_endtime = e.currentTarget.dataset.endtime
    var selected_coupon_type = e.currentTarget.dataset.coupontype ? e.currentTarget.dataset.coupontype : 1
    var selected_couponimage = e.currentTarget.dataset.couponimage
    var coupons_list = that.data.coupons_list
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
      selected_coupon_index: selected_coupon_index,
      selected_couponimage: selected_couponimage,
      coupons_list: coupons_list,
    })
  },
  getMoreOrdersTapTag: function (e) {
    var that = this
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多记录了',
        icon: 'loading',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    })
    that.query_coupon()
  },
  query_coupon: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var page = that.data.page
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    var page_num = that.data.page_num
    var shop_type = that.data.shop_type
    var coupons_status = 'avaliable'
    /*
    if (page > that.data.page_num) {
      return
    }
    */
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
            title: res.data.info ? res.data.info : '暂无优惠券',
            icon: 'loading',
            duration: 1500
          })
          if(page == 1){
            that.setData({
              coupons_list:{},
              page_num:0,
            })
          }
        } else {
          for (var i = 0; i < coupons_list.length; i++) {
            coupons_list[i]['start_time'] = util.getDateStr(coupons_list[i]['start_time'] * 1000, 0)
            coupons_list[i]['end_time'] = util.getDateStr(coupons_list[i]['end_time'] * 1000, 0)
            coupons_list[i]['selected'] = false
          }
          if (page > 1 && coupons_list) {
            //向后合拼
            coupons_list = that.data.coupons_list.concat(coupons_list);
          }
          page_num = (all_rows / pagesize + 0.5)
          that.setData({
            coupons_list: coupons_list,
            page_num: page_num.toFixed(0),
          })
        }
      }
    })
  },
  //优惠券使用
  coupon_pay: function (e) {
    var that = this
    var amount = that.data.amount
    var payamount = that.data.payamount
    var selectedAllStatus = that.data.selectedAllStatus
    var couponSelectedId = selectedAllStatus?that.data.selected_coupon_id:0
    var couponSelectedType = selectedAllStatus?that.data.selected_coupon_type:0
    var carts = that.data.carts
    var amount = that.data.amount
    var discountpay = 0
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['discount'] < 100 && carts[i]['discount'] >0) { //打折商品判断
        if (couponSelectedType == 1 && couponSelectedId){ //打折优惠券
          discountpay = discountpay+(100-carts[i]['discount']) * carts[i]['sell_price'] * carts[i]['num']/100
        }
      }
    }
    discountpay = discountpay.toFixed(2)
    payamount = (amount - discountpay).toFixed(2)
    that.setData({
      discountpay: discountpay,
      payamount: payamount,
    })
    if (discountpay == 0 && selectedAllStatus){
      that.modalBindcancelCoupon()
      wx.showToast({
        title:'无需优惠券',
        icon: 'loading',
        duration: 1500
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
    var selectedAllStatus = that.data.selectedAllStatus
    var selected_coupon_index = that.data.selected_coupon_index ? that.data.selected_coupon_index : 0
    var coupon_list = that.data.coupons_list
    var couponSelectedStatus = coupon_list[selected_coupon_index] ? coupon_list[selected_coupon_index]['selected']:0
    that.setData({
      modalHiddenCoupon: !this.data.modalHiddenCoupon,
      selectedAllStatus: couponSelectedStatus ? true : false,
      HiddenSelectedCoupon: couponSelectedStatus ? 1 : 0,
    })
    that.coupon_pay() //计算优惠券价格
  },
  //取消按钮点击事件  优惠券
  modalBindcancelCoupon: function () {
    var that = this
    var payamount = that.data.payamount
    var amount = that.data.amount
    var discountpay = that.data.discountpay
    that.setData({
      modalHiddenCoupon: !that.data.modalHiddenCoupon,
      selectedAllStatus: false,
      HiddenSelectedCoupon: 0,
      payamount: amount,
      discountpay:0,
    })
   
  },  
})