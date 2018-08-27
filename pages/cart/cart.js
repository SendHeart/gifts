var app = getApp();
var weburl = app.globalData.weburl;

Page({
	data:{
		username:null,
    token:null,
    carts: [],
		minusStatuses: [],
		selectedAllStatus: false,
		total: '',
		startX: 0,
		itemLefts: []
	},
  
	bindMinus: function(e) {
		// loading提示
		wx.showLoading({
			title: '操作中',
			mask: true
		});
		var index = parseInt(e.currentTarget.dataset.index);
		var num = this.data.carts[index]['num'];
		// 如果只有1件了，就不允许再减了
		if (num > 1) {
			num --;
		}
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num <= 1 ? 'disabled' : 'normal';
		// 购物车数据
		var carts = this.data.carts;
		carts[index]['num'] = num;
		// 按钮可用状态
		var minusStatuses = this.data.minusStatuses;
		minusStatuses[index] = minusStatus;
		// 将数值与状态写回
		this.setData({
			carts: carts,
			minusStatuses: minusStatuses
		});

		// update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id'];
    this.updateCart(username, sku_id, num, token);
    wx.hideLoading();
		this.sum();
	},
	bindPlus: function(e) {
		wx.showLoading({
			title: '操作中',
			mask: true
		});
		var index = parseInt(e.currentTarget.dataset.index);
		var num = this.data.carts[index]['num'];
		// 自增
		num ++;
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num <= 1 ? 'disabled' : 'normal';
		// 购物车数据
		var carts = this.data.carts;
		carts[index]['num'] = num;
		// 按钮可用状态
		var minusStatuses = this.data.minusStatuses;
		minusStatuses[index] = minusStatus;
		// 将数值与状态写回
		this.setData({
			carts: carts,
			minusStatuses: minusStatuses
		});
		// update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id']
    this.updateCart(username, sku_id, num, token);
    wx.hideLoading();
		this.sum();
	},
	bindManual: function(e) {
		wx.showLoading({
			title: '操作中',
			mask: true
		});
		var index = parseInt(e.currentTarget.dataset.index);
		var carts = this.data.carts;
		var num = parseInt(e.detail.value);
		carts[index]['num'] = num;
		// 将数值与状态写回
		this.setData({
			carts: carts
		});
    wx.hideLoading();
		this.sum();
	},
	bindManualTapped: function() {
		// 什么都不做，只为打断跳转
	},
	bindCheckbox: function(e) {
		wx.showLoading({
			title: '操作中',
			mask: true
		});
		/*绑定点击事件，将checkbox样式改变为选中与非选中*/
		//拿到下标值，以在carts作遍历指示用
		var index = parseInt(e.currentTarget.dataset.index);
		//原始的icon状态
		var selected = this.data.carts[index]['selected'];
		var carts = this.data.carts;
		// 对勾选状态取反
		carts[index]['selected'] =  !selected;
		// 写回经点击修改后的数组
		this.setData({
			carts: carts,
		});
		// update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id'];
    var buy_num = carts[index]['num'];
    this.updateCart(username, sku_id, buy_num, token);
    wx.hideLoading();
		this.sum();
	},
	bindSelectAll: function() {
		wx.showLoading({
			title: '操作中',
			mask: true
		});
		// 环境中目前已选状态
		var selectedAllStatus = this.data.selectedAllStatus;
		// 取反操作
		selectedAllStatus = !selectedAllStatus;
		// 购物车数据，关键是处理selected值
		var carts = this.data.carts;
		// 遍历
		for (var i = 0; i < carts.length; i++) {
			carts[i]['selected']= selectedAllStatus;
			// update selected status to db
		}
	
		this.setData({
			selectedAllStatus: selectedAllStatus,
			carts: carts,
		});
    wx.hideLoading();
		this.sum();

	},
	bindCheckout: function() {
		var cartIds = this.calcIds();
		cartIds = cartIds.join(',');
  
    var carts = this.data.carts;
    var cartselected= [];
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    // 遍历selected 
    var index = 0 ;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['selected']){
        cartselected[index++] = carts[i];
      }
    }
		wx.navigateTo({
      url: '../order/checkout/checkout?cartIds=' + cartIds + '&amount=' + this.data.total + '&carts=' + cartselected + '&username=' + username +'&token=' + token
		});
	},
	delete: function (e) {
		var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var index = parseInt(e.currentTarget.dataset.index);
    var carts = this.data.carts;
    var sku_id = this.data.carts[index]['id'];
     
		// 购物车单个删除
		var objectId = e.currentTarget.dataset.objectId;
		console.log(objectId);
		wx.showModal({
			title: '提示',
			content: '确认要删除吗',
			success: function(res) {
				if (res.confirm) {
					// 从网络上将它删除
          // 购物车单个删除
          wx.request({
            url: weburl + '/api/client/delete_cart',
            method: 'POST',
            data: { username: username, access_token: token, sku_id: sku_id },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var new_carts = [];
              var j = 0;
              for (var i = 0; i < carts.length; i++) {
                if (i!=index) {
                  //剔除删除产品
                  new_carts[j++] = carts[i];
                }
              }
              that.setData({
                carts: new_carts
              })
            }
          })
          
        }	
			}
		})

	},
	calcIds: function () {
		// 遍历取出已勾选的cid
		// var buys = [];
		var cartIds = [];
		for (var i = 0; i < this.data.carts.length; i++) {
			if (this.data.carts[i]['selected']) {
				// 移动到Buy对象里去
				// cartIds += ',';
				cartIds.push(this.data.carts[i]['objectId']);
			}
		}
		if (cartIds.length <= 0) {
			wx.showToast({
				title: '请勾选商品',
				icon: 'success',
				duration: 1000
			})
		}
		return cartIds;
	},
  sum: function () {
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['selected']) {
        total += carts[i]['num'] * carts[i]['earnest_price'];
      }
    }
    total = total.toFixed(2);
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: total
    });
  },
  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../details/index?sku_id=' + objectId+'&id='+goods_id+'&token='+token+'&username='+username
    });
  },
  touchStart: function (e) {
    var startX = e.touches[0].clientX;
    this.setData({
      startX: startX,
      itemLefts: []
    });
  },
  touchMove: function (e) {
    var index = e.currentTarget.dataset.index;
    var movedX = e.touches[0].clientX;
    var distance = this.data.startX - movedX;
    var itemLefts = this.data.itemLefts;
    itemLefts[index] = -distance;
    this.setData({
      itemLefts: itemLefts
    });
  },
  touchEnd: function (e) {
    var index = e.currentTarget.dataset.index;
    var endX = e.changedTouches[0].clientX;
    var distance = this.data.startX - endX;
    // button width is 60
    var buttonWidth = 60;
    if (distance <= 0) {
      distance = 0;
    } else {
      if (distance >= buttonWidth) {
        distance = buttonWidth;
      } else if (distance >= buttonWidth / 2) {
        distance = buttonWidth;
      } else {
        distance = 0;
      }
    }
    var itemLefts = this.data.itemLefts;
    itemLefts[index] = -distance;
    this.setData({
      itemLefts: itemLefts
    });
  },
  updateCart: function (username, sku_id,buy_num,token) {
    var that = this;
    var token = that.data.token;

    // 加入购物车
    wx.request({
      url: weburl + '/api/client/update_cart',
      method: 'POST',
      data: { username: username, access_token: token, sku_id: sku_id, buy_num: buy_num },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
      }
    })
  },
  reloadData: function (username, token) {
		// auto login
		var that = this;
		var minusStatuses = [];

    // cart info
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: { username: username, access_token: token },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var carts = [];
        var cartlist = res.data.result.list;
        var index = 0;

        for (var key in cartlist) {
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
            cartlist[key]['sku_list'][i]['name'] = cartlist[key]['sku_list'][i]['name'].substr(0,13)+'...';
            cartlist[key]['sku_list'][i]['selected'] = '';
            cartlist[key]['sku_list'][i]['shop_id'] = key;
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
            carts[index]=cartlist[key]['sku_list'][i];
            minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'disabled' : 'normal';
            index++;
          }
        }
        console.log(carts);
        that.setData({
          carts: carts,
          minusStatuses: minusStatuses
        });
      }
    })

	},
  showCart: function () {
    wx.switchTab({
      url: '../cart/cart'
    });
  },

  showCartToast: function (message) {
    wx.showToast({
      title: message ? message : '已加入购物车',
      icon: 'success',
      duration: 1000
    });
  },
  onLoad: function (options) {
    
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username'):'';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token'):'1';
    this.setData({
      username: username,
      token: token
    })
    this.reloadData(username,token);
    
  },

	onShow: function() {
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    this.reloadData(username,token);
    // sum
    this.sum();
	},
	
})