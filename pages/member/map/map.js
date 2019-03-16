var util = require('../../../utils/util.js')
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js')
const defaultScale = 14;
var consoleUtil = require('../../../utils/consoleUtil.js');
var constant = require('../../../utils/constant.js');
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
var mapId = 'myMap'
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
Page({
  data: {
    //可能我标识的地点和你所在区域比较远，缩放比例建议5;
    markers: [],
    scale: defaultScale,
    showTopTip: true,
    warningText: '顶部提示',
    showUpload: true,
    showConfirm: false,
    controls: [{
      id: 1,
      iconPath: '../../../images/center-location.png',
      position: {
        left: 0,
        top: 10,
        width: 40,
        height: 40
      },
      clickable: true
    }],
    location_list:[{
      "id": 1,
      "name": "永州市中心医院",
      "longitude": "118.51116",
      "latitude": "28.90141"
    },
    {
      "id": 2,
      "name": "永州市中医院",
      "longitude": "118.51118",
      "latitude": "28.90142"
    }]
  },
  onReady: function (e) {
  
  },

  onShow: function () {
    consoleUtil.log('onShow--------------------->');
    var that = this;
    that.changeMapHeight();
    //that.setHomeActionLeftDistance();
    //如果刚从选择地址页面带数据回调回来，则显示选择的地址
    consoleUtil.log(that.data.callbackAddressInfo)
    if (that.data.callbackAddressInfo == null) {
      that.getCenterLocation();
      //正在上传的话，不去请求地理位置信息
      if (that.data.showUpload) {
        that.requestLocation();
      }
    } else {
      that.setData({
        selectAddress: that.data.callbackAddressInfo.title,
        callbackLocation: that.data.callbackAddressInfo.location
      })
      //置空回调数据，即只使用一次，下次中心点变化后就不再使用
      that.setData({
        callbackAddressInfo: null
      })
    }
  },

  onLoad: function (options) {
    console.log('地图定位！')
    let that = this
    var title = options.title ? options.title : ''
    var lat = options.lat
    var lng = options.lng
    var center_location = {
      'latitude':lat,
      'longitude':lng,

    }
    if (title) {
      var title_len = title.length
      if (title_len > 13) {
        wx.setNavigationBarTitle({
          title: title.substring(0, 10) + '...'
        })
      } else {
        wx.setNavigationBarTitle({
          title: title
        })
      }

    }
    this.setData({
      mylat: lat,
      mylng:lng,
    })
    console.log('map onLoad center location:',center_location)
    that.checkUpdate();
    that.scopeSetting();
    
    // 使用 wx.createMapContext 获取 map 上下文 
    //this.mapCtx = wx.createMapContext('myMap')

  
    /*
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: (res) => {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var marker = this.createMarker(res);
        this.setData({
          centerX: longitude,
          centerY: latitude,
          markers: this.getHospitalMarkers()
        })
        console.log('map onload getLocation res:', res, 'markers:', that.data.markers)
      }
    })  
     */
  },

  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        consoleUtil.log(res);
         windowHeight = res.windowHeight;
         windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();

        var query = wx.createSelectorQuery();
        query.select('#bottom-layout').boundingClientRect()
        query.exec(function (res) {
          consoleUtil.log(res);
          bottomHeight = res[0].height;
          that.setMapHeight();
        })
      },
    })
  },

  setMapHeight: function (params) {
    var that = this;
    that.setData({
      mapHeight: (windowHeight - bottomHeight) + 'px'
    })
    var controlsWidth = 40;
    var controlsHeight = 48;
    //设置中间部分指针
    that.setData({
      controls: [{
        id: 1,
        iconPath: '../../../images/center-location.png',
        position: {
          left: (windowWidth - controlsWidth) / 2,
          top: (windowHeight - bottomHeight) / 2 - controlsHeight * 3 / 4,
          width: controlsWidth,
          height: controlsHeight
        },
        clickable: true
      }]
    })
  },

  scopeSetting: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        //地理位置
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              that.initMap();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '定位失败，你未开启定位权限，点击开启定位权限',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.userLocation']) {
                          that.initMap();
                        } else {
                          consoleUtil.log('用户未同意地理位置权限')
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          that.initMap();
        }
      }
    })
  },

  /**
     * 拖动地图回调
     */
  regionChange: function (res) {
    var that = this;
    // 改变中心点位置  
    if (res.type == "end") {
      that.getCenterLocation();
    }
  },

  /**
     * 版本更新
     */
  checkUpdate: function () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        consoleUtil.log('onCheckForUpdate----------------->');
        consoleUtil.log(res.hasUpdate);
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，即刻体验？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          }
        })
      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      })
    }
  },
  /** 
     * 初始化地图
     */
  initMap: function () {
    var that = this;
    qqmapsdk = new QQMapWX({
      key: constant.tencentAk
    })
    that.getCenterLocation();
  },
  /**
  * 移动到自己位置
  */
  mymoveToLocation:function() {
    let mpCtx = wx.createMapContext("mapId")
    mpCtx.moveToLocation();
  },
  //请求地理位置
  requestLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          //latitude: res.latitude,
          //longitude: res.longitude,
          latitude: that.data.mylat,
          longitude: that.data.mylng
        })
        that.mymoveToLocation();
      },
    })
  },
  /**
   * 点击marker
   */
  bindMakertap: function (e) {
    var that = this;
    //设置当前点击的id
    that.setData({
      currentMarkerId: e.markerId
    })
    //重新设置点击marker为中心点
    for (var key in that.data.markers) {
      var marker = that.data.markers[key];
      if (e.markerId == marker.id) {
        that.setData({
          longitude: marker.longitude,
          latitude: marker.latitude,
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: '你点击了marker',
      showCancel: false,
    })
  },

  /**
   * 得到中心点坐标
   */
  getCenterLocation: function () {
    var that = this
    var mapCtx = wx.createMapContext(mapId);
    console.log('getCenterLocation mapId:', mapId, 'mapCtx:', mapCtx);
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('mapCtx.getCenterLocation return:',res);
        //that.updateCenterLocation(res.latitude, res.longitude);
        that.updateCenterLocation(that.data.mylat, that.data.mylng);
        that.regeocodingAddress();
        that.queryMarkerInfo();
      }
    })
    //this.createMarker(that.data.location_list);
  },
  /**
    * 更新上传坐标点
    */
  updateCenterLocation: function (latitude, longitude) {
    var that = this;
    that.setData({
      centerLatitude: latitude,
      centerLongitude: longitude
    })
  },

  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    //不在发布页面，不进行逆地址解析，节省调用次数，腾讯未申请额度前一天只有10000次
    if (!that.data.showConfirm) {
      return;
    }
    //通过经纬度解析地址
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      success: function (res) {
        console.log(res);
        that.setData({
          centerAddressBean: res.result,
          selectAddress: res.result.formatted_addresses.recommend,
          currentProvince: res.result.address_component.province,
          currentCity: res.result.address_component.city,
          currentDistrict: res.result.address_component.district,
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 查询 marker 信息
   */
  queryMarkerInfo: function () {
    var that = this;
    console.log('查询当前坐标 marker 点信息')
    //调用请求 marker 点的接口就好了
  },

  /**
   * 创建marker
   */
  createMarker: function (dataList) {
    var that = this;
    var currentMarker = [];
    var markerList = dataList.data;
    for (var key in markerList) {
      var marker = markerList[key];
      marker.id = marker.info_id;
      marker.latitude = marker.lat;
      marker.longitude = marker.lng;
      marker.width = 40;
      marker.height = 40;
      if (marker.image) {
        marker.iconPath = '../../img/dog-select.png';
      } else {
        marker.iconPath = '../../img/dog-yellow.png';
      }
    }
    currentMarker = currentMarker.concat(markerList);
    console.log('-----------------------');
    console.log(currentMarker);
    that.setData({
      markers: currentMarker
    })
  },

 
  /**
    * 点击地图时触发
    */
  bindMapTap: function () {
    //恢复到原始页
    this.adjustViewStatus(true, false, false);
  },

  adjustViewStatus: function (uploadStatus, confirmStatus, commentStatus) {
    var that = this;
    that.setData({
      //显示上传情报按钮
      showUpload: uploadStatus,
      //开始上传情报
      showConfirm: confirmStatus,
      //显示情报详情
      showComment: commentStatus,
    })
    that.changeMapHeight();
  },

  onShareAppMessage: function (res) {

  },

})