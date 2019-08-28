var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl; 
var shop_type = app.globalData.shop_type; 
var navList_order = [
  { id: "send", title: "我送出的" },
  { id: "receive", title: "我收到的" },
];

Page({
	data: {
		orders: [],
    page:1,
    pagesize:10,
    status:0,
    navList_order: navList_order,
    tab2: 'send',
    activeIndex2:0,
    all_rows:0,
    hiddenmore:false,
    shop_type:shop_type,
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
    wx.switchTab({
      url: '../hall/hall'
    })
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag =  that.data.giftflag;
    if(tab=='send') {
      giftflag = 0;
    }else{
      giftflag = 1;
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
    })
    console.log('tab:' + tab)
    that.reloadData()
  },
  getMoreOrdersTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows;
    if (page > all_rows) {
      wx.showToast({
        title: '没有更多的数据',
        icon: 'loading',
        duration: 1000
      })
      that.setData({
        hiddenmore: true,
      })
      return
    }
    that.setData({
      page: page,
    });
    that.reloadData()
  },
  
  sendAginTapTag: function (e) {
    var that = this;
   
    wx.navigateTo({
      url: '../../list/list'
    });
  },
  detailTapTag: function (e) {
    var that = this;
    var order_object = e.currentTarget.dataset.orderObject;
    var order_id = order_object['id'];
    console.log('订单ID:'+order_id)
    wx.navigateTo({
      url: '../orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object)
    });
  },
  
	onLoad: function (options) {
		// 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
	 var that = this
    that.reloadData(options)
	},
	onShow: function() {
		//
	},
  
  reloadData: function (options) {
		var that = this;
    //var order_type= that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0;
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var receive = options.receive ? options.receive : 0
    var order_shape = options.order_shape ? options.order_shape:4
    var order_id = options.order_id ? options.order_id : ''
    var page = that.data.page
    var pagesize = that.data.pagesize;
    console.log('reloadData shop_type:',that.data.shop_type);
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_interaction',
      method: 'POST',
      data: { 
        username: username ? username:openid, 
        m_id:m_id,
        access_token: token,
        order_id: order_id,
        shop_type: shop_type,
        order_shape: order_shape, 
        receive: receive,
        page:page,
        pagesize: pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows;
        if (!res.data.result) {
          wx.showToast({
            title: '没有查到信息',
            icon: 'none',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack()
          }, 500);
          that.setData({
            orders: [],
            all_rows: 0
          });
        } else {
          for (var i = 0; i < orderObjects.length;i++){
            if (orderObjects[i]['from_headimg'].indexOf("https://wx.qlogo.cn") >= 0) {
              orderObjects[i]['from_headimg'] = orderObjects[i]['from_headimg'].replace('https://wx.qlogo.cn', weburl + '/qlogo')
              orderObjects[i]['register_time'] = util.getDateDiff(orderObjects[i]['addtime'] * 1000)
            }
          }
        
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows
          })
        }
      }
    })
	},
	
	showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
		wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name='+ goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
		});
	}
})