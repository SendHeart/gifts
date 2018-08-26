var app = getApp();
var weburl = app.globalData.weburl;

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
    token:null
	},
  setNavigation: function () {
    let startBarHeight = 24
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        var model = res.model
        if (model.search('iPhone X') != -1) {
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
    this.setNavigation()
    this.readCarts(options)

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
		var that = this;
		// from carts
		// amount
		var amount = parseFloat(options.amount);
    var cartIds = options.cartIds;
    var cartIdArray = cartIds.split(',');

		this.setData({
			amount: amount,
      carts: options.carts,
      cartIds: cartIdArray,
      username: options.username,
      token: options.token,
		});
	},
	confirmOrder: function () {
		// submit order
		var carts = this.data.carts;
		var that = this;
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
		var status = 0;
    var amount = that.data.amount;
    var address = that.addressObjects[that.data.addressIndex];

    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        sku_id: cartIds,
        buy_type: 'cart', 
        address_id: address['id'],
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('订单提交完成');
        console.log(res.data.result);
        var order_data = res.data.result;
        
        if (!res.data.info) {
          wx.showToast({
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          });
        }
        wx.navigateTo({
          url: '../../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
        });
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

})