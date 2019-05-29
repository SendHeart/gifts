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
    giftflag:0,
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
      });
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
		var status = parseInt(options.status)
		// 存为全局变量，控制支付按钮是否显示
    if(status){
      this.setData({
        status: status
      });
    }
    this.setNavigation()
    this.reloadData()
	},
	onShow: function() {
		//
	},
  
	reloadData: function() {
		var that = this;
    var order_type= that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var status = that.data.status
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize;
    console.log('reloadData shop_type:',that.data.shop_type);
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token,
        status: status,
        shop_type: shop_type,
        order_type:order_type, 
        page:page,
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
            title: '没有该类型订单',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 500);
          that.setData({
            orders: [],
            all_rows: 0
          });
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            if (orderObjects[i]['logo'].indexOf("http") < 0) {
              orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
            }
           
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
            }
          }
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows
          });
        }

      
      }
    })
    
	},
	pay: function(e) {
		var objectId = e.currentTarget.dataset.objectId;
		var totalFee = e.currentTarget.dataset.totalFee;
    console.log('order_no');
    console.log(objectId);
		wx.navigateTo({
			url: '../payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee
		});
	},
	receive: function(e) {
		var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
		wx.showModal({
			title: '请确认',
			content: '确认要收货吗',
			success: function(res) {
				if (res.confirm) {
					var objectId = e.currentTarget.dataset.objectId;

          wx.request({
            url: weburl + '/api/client/order_confirm',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              id: objectId,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              console.log(res.data.info);
              if (!res.data.info){
                wx.showToast({
                  title: '确认收货完成',
                  icon: 'success',
                  duration: 1000
                });
              }else{
                wx.showToast({
                  title: res.data.info,
                  icon: 'loading',
                  duration: 1500,
                
                });
              }

            }
          })
					
				}
			}
		})
	},
	showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
		wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name='+ goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
		});
	}
});