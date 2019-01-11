var app = getApp();
var weburl = app.globalData.weburl;
var util = require('../../../utils/util.js');
var now = new Date().getTime();
var shop_type = app.globalData.shop_type; 
Page({
  data: {
    title_name: '收到礼物',
    title_logo: '../../../images/footer-icon-05.png',
    shop_type:shop_type,
    orders: [],
    orderskus:[],
    openid:null,
    userInfo: {},
    page: 1,
    pagesize: 10,
    status: 0,
    all_rows: 0,
    giftflag: 0,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 2000,
    note_title:'Hi~:',
    note:'',
    headimg:'',
    nickname:'',
    receive_status:1,
    overtime_status:0,
    receive:0,
    order_no:'',
    currenttime: now ? parseInt(now / 1000) : 0,
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
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  returnTapTag: function (e) {
    /*
    wx.navigateTo({
      url: '../../order/list/list'
    });
   
   
    wx.navigateTo({
      url: '../../hall/hall'
    });
     */
    wx.switchTab({
      url: '../../hall/hall'
    })

  },

  receiveTapTag: function (e) {
   var that = this 
   var shop_type = that.data.shop_type
   var order_no = that.data.orderNo
   var openid = that.data.openid
   var nickname = that.data.userInfo.nickName
   var headimg = that.data.userInfo.avatarUrl
   var address_userName = that.data.address_userName
   var address_postalCode = that.data.address_postalCode
   var address_provinceName = that.data.address_provinceName
   var address_cityName = that.data.address_cityName
   var address_countyName = that.data.address_countyName
   var address_detailInfo = that.data.address_detailInfo
   var address_nationalCode = that.data.address_nationalCode
   var address_telNumber = that.data.address_telNumber

    wx.showModal({
      title: '请确认',
      content: '确认接受吗?',
      success: function (res) {
        if (res.confirm) {
          //通讯录权限
          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.address']) {
                wx.authorize({
                  scope: 'scope.address',
                  success() {
                    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                    //wx.startRecord()
                  }
                })
              }
            }
          })
          //收货地址选择
          wx.chooseAddress({
            success: function (res) {
              console.log('微信收货地址:')
              console.log(res)
              address_userName = res.userName
              address_postalCode = res.postalCode
              address_provinceName = res.provinceName
              address_cityName = res.cityName
              address_countyName = res.countyName
              address_detailInfo = res.detailInfo
              address_nationalCode = res.nationalCode
              address_telNumber = res.telNumber

              that.setData({
                address_userName: address_userName,
                address_postalCode: address_postalCode,
                address_provinceName: address_provinceName,
                address_cityName: address_cityName,
                address_countyName: address_countyName,
                address_detailInfo: address_detailInfo,
                address_nationalCode: address_nationalCode,
                address_telNumber: address_telNumber,
              });
              console.log('订单号:' + that.data.order_no + ' openid:' + that.data.openid)
              wx.request({ //更新收礼物状态
                url: weburl + '/api/client/update_order_status',
                method: 'POST',
                data: {
                  username: that.data.username,
                  shop_type:shop_type,
                  openid: that.data.openid,
                  nickname: that.data.nickname,
                  headimg: that.data.headimg,
                  order_no: that.data.order_no,
                  status_info: 'receive',
                  address_userName: address_userName,
                  address_postalCode: address_postalCode,
                  address_provinceName: address_provinceName,
                  address_cityName: address_cityName,
                  address_countyName: address_countyName,
                  address_detailInfo: address_detailInfo,
                  address_nationalCode: address_nationalCode,
                  address_telNumber: address_telNumber,
                },
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                },
                success: function (res) {
                  console.log('礼物已接收:',res.data.result);
                  if (res.data.result){
                    wx.showToast({
                      title: '礼物已接收',
                      icon: 'success',
                      duration: 1500
                    })
                    that.setData({
                      receive_status: 1,
                    })
                   
                  }else{
                    wx.showToast({
                      title: '礼物接收失败',
                      icon: 'success',
                      duration: 1500
                    })
                    that.setData({
                      receive_status: 0,
                    });
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  scroll: function (event) {
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  topLoad: function (event) {
    //   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
    //page = 1;
    this.setData({
      //list: [],
      scrollTop: 0
    });
    //loadMore(this);
    console.log("lower");
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var order_no = options.order_no
    var receive = options.receive
    var orders = that.data.orders
    var orderskus = that.data.orderskus
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note
    var shop_type = that.data.shop_type
    
    if (!username) {
      /*
      wx.switchTab({
        url: '/pages/my/index'
      })
      */
      wx.navigateTo({
        url: '../../login/login'
      })
    }
    if (receive != 1){
      console.log('礼品信息 order_no:',order_no + ' receive:' + receive)
      wx.switchTab({
        url: '/pages/hall/hall'
      })
      return
    }
    that.setData({
      order_no: order_no,
      receive: receive,
      openid: openid,
      username:username,

    })
    that.reloadData()
    /*
    that.setNavigation()
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      }
    })  
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */

  },

  onShow: function () {
    var that = this
    
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
   
  },

  overtimeData: function () {
    var that = this
    var headimg = that.data.headimg
    var nickname = that.data.nickname
  
    console.log(' 超时处理 headimg:', headimg, ' nickname:',nickname)
    if (!headimg){
      that.setData({
        overtime_status: 1 ,//超时标志
        orders: [],
        all_rows: 0,
      })
    }
  },

  reloadData: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var order_no = that.data.order_no
    var orders = that.data.orders
    var orderskus = that.data.orderskus
    var shop_type = that.data.shop_type
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note
    //从服务器获取订单列表
    setTimeout(function () { //3秒超时
      that.overtimeData()
    }, 3000)
    
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        order_type: 'receive',
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(' 礼物订单查询:', res.data.result)
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows ? res.data.all_rows : 0
        var receive_status = that.data.receive_status
        if (!res.data.result) {
          wx.showToast({
            title: '没有该订单',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 1500)
          that.setData({
            orders: [],
            all_rows: 0
          });
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
            }
            note = orderObjects[i]['rcv_note']
            headimg = orderObjects[i]['from_headimg']
            nickname = orderObjects[i]['from_nickname']
          }
          receive_status = orderObjects[0]['gift_status'] == 2 ? 1 : 0
          if (orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          console.log('receive status:' + receive_status);
          // order_sku 合并在一个对象中
          for (var i = 0; i < orderObjects.length; i++) {
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['goods_name'] = orderObjects[i]['order_sku'][j]['goods_name'].substring(0, 15)
              orderskus.push(orderObjects[i]['order_sku'][j])
            }
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows,
            orderskus: orderskus,
            note: note,
            note_title: note_title,
            headimg: headimg,
            nickname: nickname,
            receive_status: receive_status,
          })
          console.log('order sku list:', orderskus)
        }
      }
    })

  },
  
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
    console.log('showGoods')
    console.log(goods_name + ' ' + goods_id);
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    })
  },

  onShareAppMessage: function (options ) {
      var that = this 
      var res
      var order_no = that.data.order_no
      var username = that.data.username
      var token = that.data.token;
      console.log('开始收礼')
      console.log(options)
      var shareObj = {
      　title: "我收到的礼物",        // 默认是小程序的名称(可以写slogan等)
        path: '/pages/hall/hall',   // 默认是当前页面，必须是以‘/’开头的完整路径
      　imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      　success: function (res) {　　　
          console.log(res)
          if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
            
           
            }
      　　},
      　　fail: function () {　　
            console.log(res)
            if (res.errMsg == 'shareAppMessage:fail cancel') {// 转发失败之后的回调
          　　　　　　　　// 用户取消转发
        　　　} else if (res.errMsg == 'shareAppMessage:fail') {
          　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
        　　　}
      　　},
          complete: function() { // 转发结束之后的回调（转发成不成功都会执行）
        　　　　　　
      　　　　
  　　    },
        }
      if (options.from === 'button') {
          // 来自页面内转发按钮
            // shareBtn
          　　　　// 此处可以修改 shareObj 中的内容
        // var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况
        // shareObj.path = '/pages/order/send/send?order_no=' +'&receive=';
        
        }
        // 返回shareObj
        return shareObj;
    
  } ,
   
});