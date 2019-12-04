var app = getApp();
var weburl = app.globalData.weburl; 
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk
var qqmapkey = app.globalData.mapkey
var util = require('../../../utils/util.js')
var now = new Date().getTime()
var shop_type = app.globalData.shop_type;
var uploadurl = app.globalData.uploadurl;
Page({
  isDefault: false,
	formSubmit: function(e) {
    var that = this
		// user 
    var username = this.data.username;
    var token = this.data.token
    var areaSelectedStr = that.data.areaSelectedStr
		// detail
		var detail = e.detail.value.detail;
		// activity_name
    var activity_name = e.detail.value.activity_name;
		// mobile
		var mobile = e.detail.value.mobile;
   
    // endtime
    var waitting = e.detail.value.waitting
    var endtime = that.data.currenttime +  waitting*60*60   //秒
		// 表单验证
    if (areaSelectedStr == '请选择省市区' || areaSelectedStr =='') {
			wx.showToast({
				title: '请输入区域'
			});
			return
		}
    
		if (detail == '') {
			wx.showToast({
				title: '请填写详情地址'
			})
			return
		}
    if (activity_name == '') {
			wx.showToast({
				title: '请填写备注'
			})
			return
		}
    
		if(!(/^1[34578]\d{9}$/.test(mobile))){ 
			wx.showToast({
				title: '请填写正确手机号码'
			})
			return
		}
    that.setData({
      username: username,
      token: token,
      endtime:endtime,
      //activity_image: activity_image,
      activity_name: activity_name,
      detail: detail,
      mobile: mobile,

    })
    that.upload()
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
    shop_type: shop_type,
    uploadurl: uploadurl,
    img_arr: [],
    new_img_arr: [],
    upimg_url: [],
    formdata: '',
    currenttime: now ? parseInt(now / 1000) : 0,
    qqmapkey:qqmapkey, 
	},

	onLoad: function (options) {
    var that = this
    var qqmapkey = that.data.qqmapkey
    qqmapsdk = new QQMapWX({
      key: qqmapkey, //'BJFBZ-ZFTHW-Y2HRO-RL2UZ-M6EC3-GMF4U'
    })

    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?is_permission=1'
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
        })
      }
    })

		// if isDefault, address is empty
		// this.setDefault();
	
		that.loadAddress(options)
    	that.cascadePopup();
		// TODO:load default city...
   
	},
  upload: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = that.data.goods_id;
    var new_img_addr = that.data.new_img_arr //本次上传图片的手机端文件地址
    var new_img_url = [] //本次上传图片的服务端url
    var province = that.data.provinceObjects[that.data.provinceIndex];
    var city = that.data.cityObjects[that.data.cityIndex];
    var region = that.data.regionObjects[that.data.regionIndex];
    var town = that.data.townObjects[that.data.townIndex];
    var addressId = that.data.addressId;
    var endtime = that.data.endtime
    var activity_image = that.data.activity_image
    var activity_name  = that.data.activity_name
    var address_name = that.data.detail
    var detail = that.data.areaSelectedStr + that.data.detail
    var mobile = that.data.mobile
    var latitude = that.data.latitude
    var longitude = that.data.longitude
    var upload_type = 'xcx_address_add'
    //保存地址到服务器
    
    for (var i = 0; i < new_img_addr.length; i++) {
      var count = new_img_addr.length
      wx.uploadFile({
        url: uploadurl,
        filePath: new_img_addr[i],
        name: 'wechat_upimg',
        //formData: adds,
        formData: {
          latitude: encodeURI(0.0),
          longitude: encodeURI(0.0),
          type: encodeURI(upload_type),
          city: encodeURI('杭州'),
          prov: encodeURI('浙江'),
          name: encodeURI(goods_id), // 名称
        }, // HTTP 请求中其他额外的 form data
        success: function (res) {
          var retinfo = JSON.parse(res.data.trim());
          if (retinfo['status'] == "y") {
            new_img_url.push(retinfo['result']['img_url'])
            that.setData({
              new_img_url: new_img_url,
            })
            count--
            console.log('图片上传完成:', that.data.new_img_url, ' count:', count)
            if (count == 0) {
              wx.request({
                url: weburl + '/api/client/update_activity_address',
                method: 'POST',
                data: {
                  'username': username,
                  'access_token': token,
                  'id': addressId,
                  'activity_name': activity_name,
                  'prov': province ? province.area_id : '',
                  'city': city ? city.area_id : '',
                  'area': region ? region.area_id : '',
                  'town': town ? town.area_id : '',
                  'address': detail,
                  'address_name': address_name,
                  'tel': mobile,
                  'image': new_img_url[0] ? new_img_url[0]:'',
                  'image2': new_img_url[1] ? new_img_url[1] : '',
                  'image3': new_img_url[2] ? new_img_url[2] : '',
                  'endtime': endtime,
                  'latitude': that.data.latitude,
                  'longitude' : that.data.longitude,
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
            }
          }
        },
      })
    }
  },
  upimg: function () {
    var that = this
    var new_img_arr = that.data.new_img_arr
    var img_arr = that.data.img_arr
    console.log('upimg img_arr:', img_arr)
    if ((img_arr.length + new_img_arr.length) < 3) {
      wx.chooseImage({
        sizeType: ['original', 'compressed'],
        success: function (res) {
          that.setData({
            //img_arr: all_img_arr.concat(res.tempFilePaths),
            new_img_arr: new_img_arr.concat(res.tempFilePaths)
          })
          console.log('本次上传图片:', that.data.new_img_arr)
        }
      })
    } else {
      wx.showToast({
        title: '最多上传三张图片',
        icon: 'loading',
        duration: 3000
      });
    }
  }, 
  
  cancel_upimg: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    var img_tmp = []
    var old_img_arr = that.data.img_arr
    var j = 0
    console.log('cancel_upimg:', old_img_arr.length, 'id:', id)
    for (var i = 0; i < old_img_arr.length; i++) {
      if (i != id) {
        img_tmp[j++] = old_img_arr[i]
      }
    }
    that.setData({
      img_arr: img_tmp
    })

  },

  cancel_new_upimg: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    var img_tmp = []
    var all_img_arr = that.data.img_arr
    var new_img_arr = that.data.new_img_arr
    var j = 0
    console.log('cancel_upimg:', new_img_arr.length, 'id:', id)
    for (var i = 0; i < new_img_arr.length; i++) {
      if (i != id) {
        img_tmp[j++] = new_img_arr[i]
      }
    }
    that.setData({
      new_img_arr: img_tmp
    })

  },
  loadAddress: function (options) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var addressId = options.objectId;
    var img_arr = that.data.img_arr
    console.log('loadAddress addressId:', addressId)
    if (addressId != undefined) {
      that.setData({
        addressId: addressId
      })
      wx.request({
        url: weburl + '/api/client/get_activity_address',
        method: 'POST',
        data: { 
          username: options.username ? options.username : username,
          access_token: token,
          shop_type: shop_type,
          address_id: addressId 
          },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('loadAddress:',res.data.result);
          var address = res.data.result;
          var array = [];
          for (var i = 0; i < address.length; i++) {
            array[i] = address[i]['address']
            if (address['img'] != 'undefined' && address['img'] != '') img_arr[0] = address['img']
            if (address['img2'] != 'undefined' && address['img2'] != '') img_arr[1] = address['img2']
            if (address['img3'] != 'undefined' && address['img3'] != '') img_arr[2] = address['img3']
          }
          that.setData({
            address: address[0],
            img_arr:img_arr,
            areaSelectedStr: address[0]['prov_str'] + address[0]['city_str'] + address[0]['area_str'] + address[0]['town_str']
          })
          console.log(that.data.img_arr)
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
    	})
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
          console.log('获取当前位置 fetchPOI:',res);
				that.setData({
					areaSelectedStr: res.result.address+res.result.formatted_addresses.recommend,
          latitude: res.result.location.lat,
          longitude: res.result.location.lng,
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