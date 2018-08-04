var app = getApp();
var weburl = "https://czw.saleii.com";
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
	isDefault: false,
	formSubmit: function(e) {

    var that = this;
		// user 
    var username = this.data.username;
    var token = this.data.token;
		// detail
		var detail = e.detail.value.detail;
		// realname
		var realname = e.detail.value.realname;
		// mobile
		var mobile = e.detail.value.mobile;
		// 表单验证
		if (this.data.areaSelectedStr == '请选择省市区') {
			wx.showToast({
				title: '请输入区域'
			});
			return;
		}
		if (detail == '') {
			wx.showToast({
				title: '请填写详情地址'
			});
			return;
		}
		if (realname == '') {
			wx.showToast({
				title: '请填写收件人'
			});
			return;
		}
		if(!(/^1[34578]\d{9}$/.test(mobile))){ 
			wx.showToast({
				title: '请填写正确手机号码'
			});
			return;
		}
    var province = that.data.provinceObjects[that.data.provinceIndex];
    var city = that.data.cityObjects[that.data.cityIndex];
    var region = that.data.regionObjects[that.data.regionIndex];
    var town = that.data.townObjects[that.data.townIndex];
    var addressId = that.data.addressId;
    var username = that.data.username;

    //保存地址到服务器
    console.log(province);
    console.log(city);
    console.log(region);
    console.log(town);
    wx.request({
      url: weburl + '/api/client/update_member_address',
      method: 'POST',
      data: { 
        'username': username,
        'access_token': token,
        'id': addressId,
        'full_name': realname,
        'prov': province ? province.area_id:'',
        'city': city?  city.area_id:'',
        'area': region ? region.area_id:'',
        'town': town ? town.area_id:'',
        'address': detail,
        'tel': mobile,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        console.log(res.data.info);
        wx.showToast({
          title: '保存成功',
          duration: 500
        });
        // 等待半秒，toast消失后返回上一页
        setTimeout(function () {
          wx.navigateBack();
        }, 500);
      }, function(error) {
        console.log(error);
      }
    })
	},
	data: {
		current: 0,
    username:null,
    token:null,
    addressId:null,
		province: [],
		city: [],
		region: [],
		town: [],
    provinceId: [],
    cityId: [],
    regionId: [],
    townId: [],
		provinceObjects: [],
		cityObjects: [],
		regionObjects: [],
		townObjects: [],
		areaSelectedStr: '请选择省市区',
		maskVisual: 'hidden',
		provinceName: '请选择',
	},

	onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'BJFBZ-ZFTHW-Y2HRO-RL2UZ-M6EC3-GMF4U'
    });

    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?wechat=1'
      })
    }
    that.setData({
      username: username,
      token: token,
    });
		// load province
    wx.request({
      url: weburl + '/api/client/get_area_list',
      method: 'POST',
      data: { parent_id: 0 },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result);
        var area = res.data.result ;
        var array = [];
        for (var i = 0; i < area.length; i++) {
          array[i] = area[i]['area_name'];
        }
        that.setData({
          province: array,
          provinceObjects: area
        });
      }
    })

		// if isDefault, address is empty
		// this.setDefault();
	
		this.loadAddress(options);
    	this.cascadePopup();
		// TODO:load default city...
   
	},
  loadAddress: function (options) {
    var that = this;
    var addressId = options.objectId;
    if (addressId != undefined) {
      that.setData({
        addressId: addressId
      });
      wx.request({
        url: weburl + '/api/client/get_member_address',
        method: 'POST',
        data: { 
          address_id: addressId 
          },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          //console.log(res.data.result);
          var address = res.data.result;
          var array = [];
          for (var i = 0; i < address.length; i++) {
            array[i] = address[i]['address'];
          }
          that.setData({
            address: address[0],
            areaSelectedStr: address[0]['prov_str'] + address[0]['city_str'] + address[0]['area_str'] + address[0]['town_str']
          });
        }
      })
    }
  },
	setDefault: function () {
		var that = this;
    console.log(that.data.provinceObjects);
		// if user has no address, set the address for default
   
	},
	cascadePopup: function() {
		var animation = wx.createAnimation({
			duration: 500,
			timingFunction: 'ease-in-out',
		});
		this.animation = animation;
		animation.translateY(-285).step();
		this.setData({
			animationData: this.animation.export(),
			maskVisual: 'show'
		});
	},
	cascadeDismiss: function () {
		this.animation.translateY(285).step();
		this.setData({
			animationData: this.animation.export(),
			maskVisual: 'hidden'
		});
	},
	provinceTapped: function(e) {
    	// 标识当前点击省份，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// provinceIndex是市区数据的标识
      console.log('provinceTapped');
      console.log('');
    	this.setData({
    		provinceName: this.data.province[index],
    		regionName: '',
    		townName: '',
    		provinceIndex: index,
    		cityIndex: -1,
    		regionIndex: -1,
    		townIndex: -1,
    		region: [],
    		town: []
    	});
    	var that = this;
      // load city
      var parent_id = this.data.provinceObjects[index]['area_id']
      wx.request({
        url: weburl + '/api/client/get_area_list',
        method: 'POST',
        data: { parent_id: parent_id },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res.data.result);
          var area = res.data.result;
          var array = [];
          for (var i = 0; i < area.length; i++) {
            array[i] = area[i]['area_name'];
          }
          that.setData({
            cityName: '请选择',
            city: array,
            cityObjects: area,
          });
          // 确保生成了数组数据再移动swiper
          that.setData({
            current: 1
          });
          //console.log(that.data.cityObjects);
        }
      })
    	//provinceObjects 是一个对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    
    },
    cityTapped: function(e) {
    	// 标识当前点击县级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// cityIndex是市区数据的标识
    	this.setData({
    		cityIndex: index,
    		regionIndex: -1,
    		townIndex: -1,
    		cityName: this.data.city[index],
    		regionName: '',
    		townName: '',
    		town: []
    	});
    	var that = this;
      var parent_id = this.data.cityObjects[index]['area_id']
      wx.request({
        url: weburl + '/api/client/get_area_list',
        method: 'POST',
        data: { parent_id: parent_id },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res.data.result);
          var area = res.data.result;
          var array = [];
          for (var i = 0; i < area.length; i++) {
            array[i] = area[i]['area_name'];
          }
          that.setData({
            regionName: '请选择',
            region: array,
            regionObjects: area,
          });
          // 确保生成了数组数据再移动swiper
          that.setData({
            current: 2
          });
          //console.log(that.data.regionObjects);
        }
      })
    	//cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    	
    },
    regionTapped: function(e) {
    	// 标识当前点击镇级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// regionIndex是县级数据的标识
    	this.setData({
    		regionIndex: index,
    		townIndex: -1,
    		regionName: this.data.region[index],
    		townName: ''
    	});
    	var that = this;
      var parent_id = this.data.regionObjects[index]['area_id']
      wx.request({
        url: weburl + '/api/client/get_area_list',
        method: 'POST',
        data: { parent_id: parent_id },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res.data.result);
          var area = res.data.result;
          if (area.length == 0) {
            var areaSelectedStr = that.data.provinceName + that.data.cityName + that.data.regionName;
            that.setData({
              areaSelectedStr: areaSelectedStr
            });
            that.cascadeDismiss();
            return;
          }
          var array = [];
          for (var i = 0; i < area.length; i++) {
            array[i] = area[i]['area_name'];
          }
          that.setData({
            townName: '请选择',
            town: array,
            townObjects: area,
          });
          // 确保生成了数组数据再移动swiper
          that.setData({
            current: 3
          });
          console.log(that.data.townObjects);
        }
      })
    	//townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
  
    },
    townTapped: function (e) {
    	// 标识当前点击镇级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// townIndex是镇级数据的标识
    	this.setData({
    		townIndex: index,
    		townName: this.data.town[index]
    	});
    	var areaSelectedStr = this.data.provinceName + this.data.cityName + this.data.regionName + this.data.townName;
    	this.setData({
    		areaSelectedStr: areaSelectedStr
    	});
    	this.cascadeDismiss();
    },
    currentChanged: function (e) {
    	// swiper滚动使得current值被动变化，用于高亮标记
    	var current = e.detail.current;
    	this.setData({
    		current: current
    	});
    },
    changeCurrent: function (e) {
    	// 记录点击的标题所在的区级级别
    	var current = e.currentTarget.dataset.current;
    	this.setData({
    		current: current
    	});
    },
    fetchPOI: function () {
    	var that = this;
    	// 调用接口
    	qqmapsdk.reverseGeocoder({
    		poi_options: 'policy=2',
    		get_poi: 1,
		    success: function(res) {
				console.log(res);
				that.setData({
					areaSelectedStr: res.result.address
				});
		    },
		    fail: function(res) {
		//         console.log(res);
		    },
		    complete: function(res) {
		//         console.log(res);
		    }
    	});
    }
})