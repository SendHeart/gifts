//index.js
//获取应用实例
const app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var qqmapkey = app.globalData.mapkey;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
const defaultScale = 14;
var mapInterval = app.globalData.mapInterval;
var consoleUtil = require('../../../utils/consoleUtil.js');
var constant = require('../../../utils/constant.js');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
//定义全局变量
var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var wxMarkerData = [];
var bottomHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'myMap';
var qqmapsdk;
var sourceType = [
  ['camera'],
  ['album'],
  ['camera', 'album']
]
var sizeType = [
  ['compressed'],
  ['original'],
  ['compressed', 'original']
]

Page({
  data: {
    userInfo: userInfo,
    m_id: m_id,
    username: username,
    token:token,
    hasUserInfo: false,
    longitude: '',
    latitude: '',
    interval: mapInterval ? mapInterval:20000,
    //地图缩放级别
    scale: defaultScale,
    markers: [],
    showTopTip: true,
    warningText: '顶部提示',
    showUpload: true,
    showConfirm: false,
    showComment: false,
    //地图高度
    mapHeight: 0,
    infoAddress: '',
    commentCount: 0,
    praiseCount: 0,
    commentList: [],
    selectAddress: '',
    centerLongitude: '',
    centerLatitude: '',
    uploadImagePath: '',
    currentMarkerId: 0,
    praiseSrc: '../../../images/bottom-unpraise.png',
    warningIconUrl: '',
    infoMessage: '',
    isUp: false,
    //中心指针，不随着地图拖动而移动
    controls: [],
    //搜索到的中心区域地址信息,用于携带到选择地址页面
    centerAddressBean: null,
    //选择地址后回调的实体类
    callbackAddressInfo: null,
    //将回调地址保存
    callbackLocation: null,
    //当前省份
    currentProvince: '',
    //当前城市
    currentCity: '',
    //当前区县
    currentDistrict: '',
    showHomeActionIcon: true,
    homeActionLeftDistance: '0rpx',
    //单个 marker
    currentTipInfo: '',
    //显示位置评论输入框
    showCommentInput: false,
    //位置评论文字
    commentMessage: '',
    //分享携带经度
    shareLongitude: '',
    //分享携带纬度
    shareLatitude: '',
    //是否是分享点击进入小程序
    showShare: false,
    //上传者用户信息
    userAvatar: userInfo.avatarUrl,
    userNickname: userInfo.nickName,
    uploadTime: '',
  },

  onLoad: function (options) {
    var that = this
    var activity_lat = options.lat 
    var activity_lng = options.lng
    var activity_title = options.title ? options.title:''
    var activity_id = options.activity_id ? options.activity_id:0
    var activity_address = options.activity_address ? options.activity_address:''
    var activity_omid = options.activity_omid ? options.activity_omid:0
    this.setData({
      activity_lat: activity_lat,
      activity_lng: activity_lng,
      activity_title: activity_title,
      activity_address: activity_address,
      activity_id: activity_id,
      activity_omid: activity_omid,
    })
    console.log('map onlod activity_lat:', activity_lat, ' activity_lng:', activity_lng, ' activity_title:', activity_title, ' activity_id:', activity_id);
    //检测更新
    that.checkUpdate();
    if (that.data.userInfo) {
      consoleUtil.log(1);
      this.setData({
        hasUserInfo: true
      })
    } else {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      consoleUtil.log(2);
      app.getUserInfo(function (userInfo) {
        //更新数据
        that.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      })
    }
   
    setTimeout(function () {
      that.reportLocation()
    }, that.data.interval)
   
     /*
    setInterval(function () {
      that.reportLocation()
    }, that.data.interval)
    */
    that.requestLocation()
    that.scopeSetting()
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
        that.requestLocation()
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

  /**
   * 页面不可见时
   */
  onHide: function () {

  },

  /**
   * 点击顶部横幅提示
   */
  showNewMarkerClick: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你点击了顶部提示框',
      showCancel: false
    })
  },

  /**
   * 设置上传情报按钮的左边距
   */
  setHomeActionLeftDistance: function () {
    var that = this;
    if (!that.data.showUpload) {
      return;
    }
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#home-action-wrapper').boundingClientRect()
        query.exec(function (res) {
          //res就是 所有标签为mjltest的元素的信息 的数组
          consoleUtil.log(res);
          /*
          that.setData({
            homeActionLeftDistance: ((windowWidth - res[0].width) / 2) + 'px'
          })
          */
        })
      }
    })
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
   * 初始化地图
   */
  initMap: function () {
    var that = this;
    qqmapsdk = new QQMapWX({
      key: constant.tencentAk
    })
    that.getCenterLocation()
    if (that.data.activity_omid == that.data.m_id && that.data.markersMy) {
      that.getMemberLocation()
    }
  },

  //请求地理位置
  requestLocation: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
        that.moveTolocation()
        //that.reportLocation()
        that.queryMarkerInfo()
      },
    })
  },

  //上报地理位置
  reportLocation: function () {
    var that = this
    wx.request({
      url: weburl + '/api/client/update_member_loc',
      method: 'POST',
      data: {
        'username': that.data.username ? that.data.username : wx.getStorageSync('username') ,
        'access_token': that.data.token ? that.data.token : wx.getStorageSync('token') ,
        'm_id': that.data.m_id ? that.data.m_id:0,
        'latitude': that.data.latitude,
        'longitude': that.data.longitude,
        'shop_type': that.data.shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('reportLocation:',res)
        var mapDisplayInfo = res.data.result
        if (mapDisplayInfo){
          that.setData({
            interval: mapDisplayInfo['interval'],
          })
          app.globalData.mapInterval = mapDisplayInfo['interval']
        }
      }
    })
    setTimeout(function () {
      that.reportLocation()
    }, that.data.interval)
  },

  //获取成员地理位置
  getMemberLocation: function () {
    var that = this
    
    //console.log('map getMemberLocation activity_id:',that.data.activity_id)
    wx.request({
      url: weburl + '/api/client/get_member_loc',
      method: 'POST',
      data: {
        'username': that.data.username ? that.data.username : wx.getStorageSync('username'),
        'access_token': that.data.token ? that.data.token : wx.getStorageSync('token'),
        'm_id': that.data.m_id ? that.data.m_id : 0,
        'activity_id':that.data.activity_id,
        'shop_type': that.data.shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var loc_list = res.data.result ? res.data.result:''
        var member_loc=[]
        console.log('map getMemberLocation success:', res, 'markersMy:', that.data.markersMy)
        if (loc_list){
          for (var i = 0; i < loc_list.length;i++){
            var new_loc={
              id: i+2,
              name: loc_list[i]['wx_nickname'],
              latitude: loc_list[i]['latitude'],
              longitude: loc_list[i]['longitude'],
              width: 25,
              height: 25,
              iconPath: loc_list[i]['wx_headimg'] ? loc_list[i]['wx_headimg'] : '../../../images/ai.png',
              callout: {
                content: loc_list[i]['wx_nickname'],
                color: "#2c8df6",
                fontSize: 12,
                borderRadius: 10,
                bgColor: "#fff",
                display: "ALWAYS",
                boxShadow: "5px 5px 10px #aaa"
              }
            }
            member_loc.push(new_loc)
          }
          that.setData({
            markers: that.data.markersMy.concat(member_loc),
          })
        }
      }
    })
    /*
    setTimeout(function () {
      that.getMemberLocation()
    }, that.data.interval)
    */
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
    console.log('currentMarkerId:', that.data.currentMarkerId)
    //重新设置点击marker为中心点
    for (var key in that.data.markers) {
      var marker = that.data.markers[key];
      if (e.markerId == marker.id) {
        that.setData({
          //longitude: marker.longitude,
          //latitude: marker.latitude,
          loc_name: e.markerId==1?that.data.activity_address:marker.name,
        })
      }
    }
    wx.showModal({
      title: '这里是',
      content: that.data.loc_name ? that.data.loc_name:'位置',
      showCancel: false,
    })
  },

  /**
   * 上传情报
   */
  uploadInfoClick: function () {
    var that = this;
    that.adjustViewStatus(false, true, false);
    that.updateCenterLocation(that.data.latitude, that.data.longitude);
    that.regeocodingAddress();
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
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    //还原默认缩放级别
    that.setData({
      scale: defaultScale
    })
    //必须请求定位，改变中心点坐标
    that.requestLocation();
  },

  /**
   * 移动到中心点
   */
  moveTolocation: function () {
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.moveToLocation();
  },

  cancelClick: function () {
    var that = this;
    that.resetPhoto();
    that.adjustViewStatus(true, false, false);
  },

  /**
   * 确认上传情报，忽略此处逻辑
   */
  confirmClick: function (res) {
    var that = this;
    consoleUtil.log(res);
    var message = res.detail.value.message.trim();
    if (!that.data.centerLatitude || !that.data.centerLongitude) {
      that.showModal('请选择上传地点~');
      return;
    }
    if (!message) {
      that.showModal('请说点什么吧~');
      return;
    }
  },

  /**
   * 点击控件时触发
   */
  controlTap: function () {

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

  /**
   * 预览图片
   */
  previewImage: function () {
    var that = this;
    wx.previewImage({
      urls: [that.data.warningIconUrl],
    })
  },

  /**
   * 选择照片
   */
  takePhoto: function () {
    var that = this;
    wx.chooseImage({
      sizeType: sizeType[1],
      count: 1,
      success: function (res) {
        that.setData({
          uploadImagePath: res.tempFilePaths[0],
        })
        that.adjustViewStatus(false, true, false);
      },
    })
  },

  /**
   * 删除已选照片
   */
  deleteSelectImage: function () {
    this.resetPhoto();
  },

  /**
   * 重置照片
   */
  resetPhoto: function () {
    var that = this;
    that.setData({
      uploadImagePath: '',
    })
  },

  previewSelectImage: function () {
    var that = this;
    wx.previewImage({
      urls: [that.data.uploadImagePath],
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
   * 得到中心点坐标
   */
  getCenterLocation: function () {
    var that = this;
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('getCenterLocation----------------------->');
        console.log(res);
        that.updateCenterLocation(res.latitude, res.longitude);
        that.regeocodingAddress();
        that.queryMarkerInfo();
      }
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
    var that = this
    var markersMy = []
    
    //调用请求 marker 点的接口就好了
    var destLocation = 
      {
        id:1,
        name:that.data.activity_title,
        latitude: parseFloat(that.data.activity_lat),
        longitude: parseFloat(that.data.activity_lng),
        width:50,
        height:50,
        iconPath: '../../../images/ai_s.png', //dog-select.png
        callout: {
          content: that.data.activity_title,
          color: "#2c8df6",
          fontSize: 13,
          borderRadius: 10,
          bgColor: "#fff",
          display: "ALWAYS",
          boxShadow: "5px 5px 10px #aaa"
        },
        /*
        label: {
          color: "#ff6600",
          fontSize: 12,
          content: "目的地",
          x: parseFloat(that.data.activity_lat),
          y: parseFloat(that.data.activity_lng),
        } 
        */
    }
    if (destLocation) markersMy.push(destLocation)
    var myLocation={}
    if (that.data.longitude && that.data.longitude){
      myLocation =
      {
        id: 2,
        name: '我的位置',
        latitude: that.data.latitude ,
        longitude: that.data.longitude,
        width: 35,
        height: 35,
        iconPath: that.data.userAvatar ? that.data.userAvatar : '../../../images/ai.png',
        callout: {
          content: that.data.userNickname,
          color: "#2c8df6",
          fontSize: 12,
          borderRadius: 10,
          bgColor: "#fff",
          display: "ALWAYS",
          boxShadow: "5px 5px 10px #aaa"
        },
      }
    }
    if (myLocation) markersMy.push(myLocation)
    var polyline = [{
      points: [{
        latitude: parseFloat(that.data.activity_lat),
        longitude: parseFloat(that.data.activity_lng),
      },
      {
        latitude: that.data.latitude ? that.data.latitude : parseFloat(that.data.activity_lat),
        longitude: that.data.longitude ? that.data.longitude : parseFloat(that.data.activity_lng),
      }],
      color: "#ff6600",
      width: 2,
      dottedLine: false,
      arrowLine: true,
      borderColor: "#000",
      borderWidth: 2
    }]
    if(!that.data.markersMy){
      that.setData({
        markers: markersMy,
        markersMy: markersMy,
      })
    }
    that.setData({
      polyline: polyline,
    })
    
    console.log('queryMarkerInfo markersMy:', that.data.markersMy)
    /*
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.includePoints({
      padding: [20],
      points: currentMarker
    })
    */
  },

  /**
   * 创建marker
   */
  createMarker: function () {
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
        marker.iconPath = '../../../images/dog-select.png';
      } else {
        marker.iconPath = '../../../images/dog-yellow.png';
      }
    }
    currentMarker = currentMarker.concat(markerList);
    consoleUtil.log('-----------------------');
    consoleUtil.log(currentMarker);
    that.setData({
      markers: currentMarker
    })
  },

  /**
   * 选择地址
   */
  chooseAddress: function () {
    var that = this;
    wx.navigateTo({
      url: '../chooseAddress/chooseAddress?city=' + that.data.centerAddressBean.address_component.city + '&street=' + that.data.centerAddressBean.address_component.street,
    })
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

/*
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
  */
})
