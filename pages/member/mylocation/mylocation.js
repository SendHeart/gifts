var util = require('../../../utils/util.js')
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js')
var qqmapsdk
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var qqmapkey = app.globalData.mapkey;
var current_activity_info = wx.getStorageSync('current_activity_info') ? wx.getStorageSync('current_activity_info') : ''
var shop_id = app.globalData.shop_id;
var shop_type = app.globalData.shop_type;
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
var now = new Date().getTime()
Page({
  data: {
    is_myself:9,
    qqmapkey: qqmapkey,
    addressIndex:[],
    prov:[],
    city:[],
    area:[],
    town:[],
    curIndex:0,
    shop_type:shop_type,
    page: 1,
    pagesize: 10,
    all_rows:0,
    page_num: 0,
    shop_id:shop_id,
    shop_type: shop_type,
    navList2: navList2,
    currenttime: now ? parseInt(now / 1000) : 0,
    modalHidden: true,//是否隐藏对话框  
    gotoHidden:false,
  },
  addActivity: function () {
		wx.navigateTo({
			url: '/pages/address/add/add'
		});
	},
  gotoMap: function (e) {
    var that = this 
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var address = e.currentTarget.dataset.address
    var addrname = e.currentTarget.dataset.addrname
    var selected_activity_index = e.currentTarget.dataset.activityindex ? e.currentTarget.dataset.activityindex : 0;
    var activity_name = that.data.addressObjects[selected_activity_index]['name']
    var activity_id = that.data.addressObjects[selected_activity_index]['id']
    var activity_omid = that.data.addressObjects[selected_activity_index]['m_id']
    var qqmapkey = that.data.qqmapkey

    qqmapsdk = new QQMapWX({
      key: qqmapkey, //'BJFBZ-ZFTHW-Y2HRO-RL2UZ-M6EC3-GMF4U'
    })
    qqmapsdk.geocoder({
      address: address,
      success: res => {
        that.setData({
          lat: res.result.location.lat,
          lng: res.result.location.lng,
        })
        console.log('mylocation gotoMap:', res);
        wx.navigateTo({
          url: '/pages/member/map/map?lat=' + that.data.lat + '&lng=' + that.data.lng + '&title=' + activity_name + '&activity_address=' + address + '&activity_id=' + activity_id + '&activity_omid=' + activity_omid,
        })
        /*
        wx.openLocation({
          latitude: res.result.location.lat,
          longitude: res.result.location.lng,
          scale: 14
        })
        */
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })

    /*
    wx.request({
      url: weburl + '/api/client/get_chineseaddr_area',
      method: 'POST',
      data: { 
        username: username,
        token: token,
        address: address,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        var location = res.data.result
        that.setData({
          lat: location[1],
          lng:location[0],
        })
        wx.openLocation({
          latitude: Number(that.data.lat),
          longitude: Number(that.data.lng),
          scale: 14,
          name: address,
          address: address,
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          }
        })

      },
      fail: function (res) {
        console.log('fail',res)
      },
      complete: function () {
        console.log('complete')
      }
    })
    */
  },
  image_save: function (image_url, image_cache_name) {
    var that = this
    wx.downloadFile({
      url: image_url,
      success: function (res) {
        if (res.statusCode === 200) {
          console.log('图片下载成功' + res.tempFilePath)
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              console.log('image_save 图片缓存成功', res.savedFilePath) // res.savedFilePath 为一个本地缓存文件路径  
              wx.setStorageSync(image_cache_name, res.savedFilePath)
            }
          })
        } else {
          console.log('image_save 响应失败', res.statusCode)
        }
      }
    })
  },
  bindSelectAct: function (e) {
    var that = this
    var selected_activity_index = e.currentTarget.dataset.activityindex ? e.currentTarget.dataset.activityindex : 0;
    var selected_activity_id = e.currentTarget.dataset.activityid ? e.currentTarget.dataset.activityid : 0
    var selected_activity_prov = e.currentTarget.dataset.activityprov ? e.currentTarget.dataset.activityprov : 0
    var selected_activity_city = e.currentTarget.dataset.activitycity ? e.currentTarget.dataset.activitycity : 0
    var selected_activity_area = e.currentTarget.dataset.activityarea ? e.currentTarget.dataset.activityarea : 0
    var selected_activity_town = e.currentTarget.dataset.activitytown ? e.currentTarget.dataset.activitytown : 0
    
    var activity_list = that.data.addressObjects
    for (var i = 0; i < activity_list.length; i++) {
      if (i == selected_activity_index) {
        activity_list[selected_activity_index]['selected'] = !activity_list[selected_activity_index]['selected']
        wx.setStorageSync('current_activity_info', activity_list[selected_activity_index]) //当前选中
        var current_activity_info = wx.getStorageSync('current_activity_info')
        
        that.setData({
          activity_name: current_activity_info['name'],
          activity_image: current_activity_info['img'],
          activity_headimg: current_activity_info['activity_headimg'],
          activity_id: selected_activity_id,
        })
        /*
        that.image_save(that.data.activity_image, 'activity_image_cache')
        console.log('位置图片下载缓存 activity_image_cache')
        that.image_save(that.data.activity_headimg, 'wx_headimg_cache')
        console.log('头像图片下载缓存 wx_headimg_cache')
        */
      } else {
        activity_list[i]['selected'] = false
      }
    }
    that.setData({
      addressObjects: activity_list,
    })
    console.log('bindSelectAct activity_id:', selected_activity_id)
    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?activity_id=' + that.data.activity_id + '&activity_image=' + that.data.activity_image + '&activity_name=' + that.data.activity_name + '&activity_headimg=' + that.data.activity_headimg
    })
  },
  bindDeleteAct: function (e) {
    var that = this
    var selected_activity_id = e.currentTarget.dataset.activityid ? e.currentTarget.dataset.activityid : 0
    that.setData({
      modalHidden: !that.data.modalHidden, 
      selected_activity_id: selected_activity_id,
    })
  },

  //确定按钮点击事件  
  modalBindaconfirm: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var selected_activity_id = that.data.selected_activity_id
    //保存地址到服务器
    wx.request({
      url: weburl + '/api/client/delete_activity_address',
      method: 'POST',
      data: {
        'username': username,
        'address_id': selected_activity_id,
        'access_token': token,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log(res.data.result)
        that.loadData()
        that.setData({
          modalHidden: !that.data.modalHidden,
        })
      }
    })
  },
  //取消按钮点击事件  
  modalBindcancel: function () {
    var that = this
    that.setData({
      modalHidden: !that.data.modalHidden
    })
  },  
  goBack: function () {
    var pages = getCurrentPages();
    console.log('details goBack pages:', pages)
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      app.globalData.from_page = '/pages/member/mylocation/mylocation'
      app.globalData.hall_gotop = 1
      wx.switchTab({  
        url: '/pages/hall/hall'
      })
    }
  },
  getMore: function (e) {
    var that = this;
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
    that.loadData()
  },
  onLoad: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var cur_city = wx.getStorageSync('city') 
    var refer_username = options.username ? options.username:''
    var activity_id = options.activity_id ? options.activity_id : ''
    var activity = options.activity ? options.activity : ''
    activity_id = activity_id ? activity_id : activity
    that.setData({
      activity_id: activity_id,
    })
    that.location()
    that.loadData()
    if (activity_id > 0 ){
      wx.showModal({
        title: '',
        content: '我要去？',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              is_myself: activity_id ? 0 : 1,
            })
          }else{
            that.goBack()
          }
        }
      })
    }else{
      that.setData({
        is_myself: activity_id ? 0 : 1,
      })
    } 
   
    console.log('onload mylocation shared address id:', options.activity_id, 'refer username:', options.username)
  },
	onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
        })
      }
    })
   
    if(!username){
      wx.navigateTo({
        url: '../../login/login'
      })
    }
    that.location()
	},
	setDefault: function (e) {
		// 设置为默认地址
		var that = this;
    var username = that.data.username;
    var token =  that.data.token;
		// 取得下标
		var index = parseInt(e.currentTarget.dataset.index);
		// 遍历所有地址对象设为非默认
		var addressObjects = that.data.addressObjects;
  
		for (var i = 0; i < addressObjects.length; i++) {
			// 判断是否为当前地址，是则传true
      if (i == index){
        addressObjects[i]['is_default'] = 1;
      }else{
        addressObjects[i]['is_default'] = 0;
      }
		}
    that.setData({
      addressObjects: addressObjects
    })

 
    wx.request({
      url: weburl + '/api/client/update_activity_address',
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
        console.log(res.data.result);
        // 成功同时更新本地数据源
        // 设置成功提示
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
	},
	
	loadData: function () {
		//获取地址列表
		var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var addressObjects = that.data.addressObjects
    var activity_id = that.data.activity_id
    var is_myself = that.data.is_myself
    var page = that.data.page
    var pagesize = that.data.pagesize
    var page_num = that.data.page_num
    var shop_type = that.data.shop_type
    wx.request({
      url: weburl + '/api/client/get_activity_address',
      method: 'POST',
      data: { 
        username: username, 
        token: token,
        page:page,
        pagesize:pagesize,
        shop_type:shop_type,
        address_id: is_myself==1?0:activity_id,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('get_activity_address:', res.data.result, res.data.all_rows);
        var address = res.data.result
        var all_rows = res.data.all_rows
        if(address){
          for (var i = 0; i < address.length; i++) {
            address[i]['selected'] = false
            
          }
          if (page > 1) {
            //向后合拼
            address = addressObjects.concat(address);
          }
          
          page_num = (all_rows / pagesize + 0.5)
          that.setData({
            addressObjects: address,
            all_rows:all_rows,
            page_num: page_num.toFixed(0),
          })
        }
        if (res.data.all_rows==0){
          wx.setStorageSync('city', '') //情况位置重新获取
        }
      }
    })
	},

  location: function () {
    var that = this
    //获取当前位置
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              console.log('位置授权成功' + res.errMsg)
              that.get_mylocation()
            }
          })
        }else{
          that.get_mylocation()
        }
      }
    })
  },

  get_mylocation:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var refer_username =that.data.refer_username
    var activity_id = that.data.activity_id
    var shop_type = that.data.shop_type
    var cur_city = wx.getStorageSync('city')  //默认杭州市 1213
    var cur_area = wx.getStorageSync('district') //默认老余杭 50142
    var cur_prov = wx.getStorageSync('province')  //默认浙江省15
    var prov = that.data.prov
    var city = that.data.city
    var area = that.data.area
    var qqmapkey = that.data.qqmapkey
    console.log('location cur_city:', cur_city)
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: qqmapkey // 必填
    })
    wx.getLocation({
      type: 'gcj02', //gcj02  wgs84
      success: function (res) {
        console.log('mylocation wx.getLocation:',res)
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        wx.setStorageSync('latitude', latitude);
        wx.setStorageSync('longitude', longitude);
        wx.setStorageSync('speed', speed);
        wx.setStorageSync('accuracy', accuracy)
        qqmapsdk.reverseGeocoder({
          poi_options: 'policy=2',
          get_poi: 1,
          success: function (res) {
            console.log('qqmapsdk:', res);
            that.setData({
              address: res.result.address
            })
            wx.setStorageSync('mylocation', res.result.address)
            wx.setStorageSync('city', res.result.address_component.city)
            wx.setStorageSync('district', res.result.address_component.district)
            wx.setStorageSync('province', res.result.address_component.province)
            wx.setStorageSync('street', res.result.address_component.street)
            wx.setStorageSync('street_number', res.result.address_component.street_number)
            console.log('位置获取成功:' + res.result.address)
            prov.push(res.result.address_component.province)
            city.push(res.result.address_component.city)
            area.push(res.result.address_component.district)
            that.setData({
              prov: prov,
              city: city,
              area: area,
              latitude: latitude, 
              longitude: longitude,
            })
            //上传参与信息
            if (!that.data.is_myself){
              wx.request({
                url: weburl + '/api/client/update_activity_addr_member',
                method: 'POST',
                data: {
                  'username': username,
                  'access_token': token,
                  'activity_id': activity_id,
                  'shop_type': shop_type,
                  'latitude': latitude ? latitude : that.data.latitude,
                  'longitude': longitude ? longitude : that.data.longitude
                },
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                },
                success: function (res) {
                  console.log('mlocation onload update_activity_addr_member:', res)
                }
              })
            }
          },
          fail: function (res) {
            console.log('mylocation get_mylocation()位置获取失败',res)
          },
          complete: function (res) {
            console.log('mylocation get_mylocation()位置获取完成', res)
            
          }
        })
      }
    })
  },

  onShareAppMessage: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
    var title = that.data.activity_name
    var imageUrl = that.data.activity_image
    var activity_id = that.data.activity_id
    if (!imageUrl) {
      imageUrl = that.data.addressObjects[0]['img']
    }
    if (!title) {
      title = that.data.addressObjects[0]['name']
    }
    if (!activity_id) {
      activity_id = that.data.addressObjects[0]['id']
    }
    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: "活动位置",
      path: '/pages/member/mylocation/mylocation?username=' + username + '&activity_id=' + activity_id,   // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        console.log(res)
        if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
          // that.shareTapTag()
        }
      },
      fail: function (res) {
        console.log(res)
        if (res.errMsg == 'shareAppMessage:fail cancel') {// 转发失败之后的回调
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function () { // 转发结束之后的回调（转发成不成功都会执行）
      },
    }
    if (options.from === 'button') {
      // 来自页面内转发按钮
      // shareBtn
      // 此处可以修改 shareObj 中的内容
      //var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况

      console.log('活动位置分享:')
      console.log(shareObj)

    }
    // 返回shareObj
    return shareObj;
  },
})