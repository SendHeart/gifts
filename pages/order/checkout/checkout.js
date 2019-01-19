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
  order_num: function (e) {
    var that = this
    var order_num = parseInt(e.detail.value) == 0 ?1:parseInt(e.detail.value);
    var amount = that.data.amount
    var discountpay = that.data.discountpay ? that.data.discountpay:0
    var payamount = (amount*order_num - discountpay).toFixed(2)
    console.log('order_num amount:', amount, ' discountpay:', discountpay,' order_num:',order_num,' payamount:',payamount)
    that.setData({
      order_num: order_num==0?1:order_num,
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
    //that.loadAddress()
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

    var status = 0
    var shop_type = that.data.shop_type
    var amount = that.data.amount
    var order_type = 'gift'
    var order_note = that.data.note
    var order_num = that.data.order_num
    if (!order_note) order_note = '送你一份礼物，愿你喜欢!'; //默认祝福
    console.log('选中 优惠券 类型:', selected_coupon_type, 'coupon_id:', selected_coupon_id, ' 红包 red coupon_type:', selected_coupon_red_type, ' red coupon_id:', selected_coupon_red_id, 'red amount:', selected_coupon_red_amount)
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
        coupon_id: selectedAllStatus?selected_coupon_id:0,
        coupon_type: selectedAllStatus?selected_coupon_type:0,
        coupon_amount: selectedAllStatus ? selected_coupon_amount:0,
        coupon_red_id: selectedRedAllStatus ? selected_coupon_red_id : 0,
        coupon_red_type: selectedRedAllStatus ? selected_coupon_red_type : 0,
        coupon_red_amount: selectedRedAllStatus ? selected_coupon_red_amount : 0,
        buy_num:order_num?order_num:1
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
          wx.navigateTo({
            url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
          })
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
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var page = that.data.page
    var page_red = that.data.page_red
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    var page_num = that.data.page_num    
    var page_red_num = that.data.page_red_num
    var shop_type = that.data.shop_type
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