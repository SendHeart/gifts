var app = getApp();
var weburl = app.globalData.weburl; 

Page({
	data: {
		orderNo: '',
    orders: [],
    totalFee:0,
    sku_id:'',
	},
	onLoad: function (options) {
    var that = this;
    var orderNo = options.orderNo;
    var totalFee = options.totalFee ? options.totalFee:0;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
   
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: orderNo,
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
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              if (sku_id!=''){
                sku_id = sku_id + ','+orderObjects[i]['order_sku'][j]['sku_id']
              }else{
                sku_id = orderObjects[i]['order_sku'][j]['sku_id']
              }
              
            }
            order_price = order_price + orderObjects[i]['order_price']
          }
          totalFee = totalFee > 0 ? totalFee : order_price*100
          console.log('order_price:'+order_price)
          that.setData({
            orders: orderObjects,
            orderNo: orderNo,
            username: username,
            token: token,
            totalFee: totalFee ? totalFee:order_price,
            sku_id:sku_id,
          })
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          });
        }
      }
    })
	},
  pay: function (e) {
		var that = this;
    var openId = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var totalFee = that.data.totalFee;
    var orderNo = that.data.orderNo;
    console.log('payment openId');
    console.log('openid:'+openId);
    console.log('totalFee:' + totalFee);
		//统一下单接口对接
		wx.request({
      url: weburl+'/api/WXPay',
			data: {
				openid: openId,
				body: '商城',
        tradeNo: that.data.orderNo,
        totalFee: that.data.totalFee,
			},
			method: 'POST',
			header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
			},
			success: function (response) {
				// 发起支付
        if (response.data.timeStamp){
          wx.requestPayment({
            'timeStamp': response.data.timeStamp,
            'nonceStr': response.data.nonceStr,
            'package': response.data.package,
            'signType': 'MD5',
            'paySign': response.data.paySign,
            'success': function (res) {
              wx.showToast({
                title: '支付成功'
              })
              that.delete_cart()
              // update order
              wx.navigateTo({
                url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders)
              })
            }
          })
        }else{
          wx.showToast({
            title: response.data,
            icon: 'loading',
            duration: 2000,
          })
        }
        //测试
        /*
        console.log('支付完成准备送礼');
        console.log(that.data.order_no);
        wx.navigateTo({
          url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders)
        })
        */
        
			},
      fail: function (response) {
        console.log('发起支付失败');
        console.log(response);
      }

		})
	},
  delete_cart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var sku_id = that.data.sku_id
    console.log('payment delete_cart sku_id:', sku_id);
    // 购物车单个删除
    wx.request({
      url: weburl + '/api/client/delete_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        sku_id: sku_id 
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