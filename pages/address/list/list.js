var app = getApp();
var weburl = app.globalData.weburl; 
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var shop_type = app.globalData.shop_type;

Page({
  data: {
    username:null,
    token:null,
    addressIndex:null,
  },
	add: function () {
		wx.navigateTo({
			url: '../add/add'
		});
  },
  onLoad: function (options) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_id = options.order_id? options.order_id:0
    var order_no = options.order_no? options.order_no:''
    that.setData({
      order_id: order_id,
      order_no: order_no
    });
  },
  
	onShow: function () {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
  
    if(username){
      that.loadData(username, token);
    }else{
      wx.navigateTo({
        url: '../../login/login?'
      })
    }	
	},
	setDefault: function (e) {
		// 设置为默认地址
		var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_id = that.data.order_id>0?that.data.order_id:0
    var order_no = that.data.order_no!=''?that.data.order_no:''
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 遍历所有地址对象设为非默认
    var addressObjects = that.data.addressObjects;
    var addressOrder ;
  
		for (var i = 0; i < addressObjects.length; i++) {
			// 判断是否为当前地址，是则传true
      if (i == index){
        addressObjects[i]['is_default'] = 1;
        addressOrder = addressObjects[i]
      }else{
        addressObjects[i]['is_default'] = 0;
      }
		}
    that.setData({
      addressObjects: addressObjects
    })
		// 提交网络更新该用户所有的地址
    //保存地址到服务器
    wx.request({
      url: weburl + '/api/client/update_member_address',
      method: 'POST',
      data: {
        'username': username,
        'id': addressObjects[index]['id'],
        'access_token': token,
        'full_name': addressObjects[index]['full_name'],
        'prov': addressObjects[index]['prov'],
        'city': addressObjects[index]['city'],
        'area': addressObjects[index]['area'],
        'town': addressObjects[index]['town'],
        'address': addressObjects[index]['address'],
        'tel': addressObjects[index]['tel'],
        'is_default': addressObjects[index]['is_default'],
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('address/list/list setDefault()',res.data.result);     
        
        if(order_id>0||order_no!=''){
          that.updateOrderAddress(addressOrder,order_id,order_no)
        }else{
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },
  
  updateOrderAddress: function (addressOrder=null,order_id=0,order_no='') {
		// 修改订单地址
		var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_info = order_id>0?' 订单ID'+order_id:''
    order_info = order_info+order_no!=''?' 订单号:'+order_no:''
    if(!addressOrder || (order_id>0 && order_no=='')){
      return
    }
    console.log('address/list/list updateOrderAddress()',addressOrder,' order id:',order_id);     
        
    wx.showModal({
			title: '确认',
			content: '更新'+order_info+'的地址吗？',
			success: function(res) {
				if (res.confirm) {
          wx.request({
            url: weburl + '/api/client/update_order_address',
            method: 'POST',
            data: {
              'username': username,       
              'access_token': token,
              'shop_type': shop_type,
              'order_id': order_id,
              'order_no': order_no,
              'full_name': addressOrder['full_name'],
              'prov': addressOrder['prov'],
              'city': addressOrder['city'],
              'area': addressOrder['area'],
              'town': addressOrder['town'],
              'address': addressOrder['address'],
              'tel': addressOrder['tel'],       
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);        
              wx.showToast({
                title: '订单地址修改完成',
                icon: 'success',
                duration: 2000
              });
            }
          })          
				}
			}
		})    
  },

	edit: function (e) {
		var that = this;
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 取出id值
		var objectId = this.data.addressObjects[index]['id'];

		wx.navigateTo({
			url: '../add/add?objectId='+objectId
		});
	},
	delete: function (e) {
		var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
  
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 找到当前地址AVObject对象
		var address = that.data.addressObjects[index];
		// 给出确认提示框
		wx.showModal({
			title: '确认',
			content: '要删除这个地址吗？',
			success: function(res) {
				if (res.confirm) {
					// 真正删除对象
          wx.request({
            url: weburl + '/api/client/delete_member_address',
            method: 'POST',
            data: {
              'username': username,
              'address_id': address['id'],
              'access_token': token,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var address = that.data.addressObjects;
              var new_address=[];
              var j=0;
              for (var i = 0; i < address.length; i++) {
                // find the default address
                if (i != index) {
                  new_address[j++] = address[i];
                }
              }
              that.setData({
                addressObjects: new_address,
              });
              // 成功同时更新本地数据源
              // 设置成功提示
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
            }
          })
				}
			}
		})
		
	},
	loadData: function (username,token) {
		// 加载网络数据，获取地址列表
		var that = this;
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
        var address = res.data.result;
        for (var i = 0; i < address.length; i++) {
          // find the default address
          if (address[i]['is_default'] == 1) {
            that.setData({
              addressIndex: i
            });
          }
        }
        that.setData({
          addressObjects: address,
        });
      }
    })
	}
})