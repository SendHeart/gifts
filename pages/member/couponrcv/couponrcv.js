var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var util = require('../../../utils/util.js');
var now = new Date().getTime();
Page({
  data: {
    title_name: '收到优惠券',
    title_logo: '../../../images/footer-icon-05.png',
    coupon_img: weburl + '/uploads/coupon_bg.png',
    coupon_footer: '', //
    coupon_content: '', //
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
    receive_status:0,
    overtime_status: 0,
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
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var order_no = that.data.orderNo
    var openid = that.data.openid
    var nickname = that.data.userInfo.nickName
    var headimg = that.data.userInfo.avatarUrl
    wx.showModal({
      title: '请确认',
      content: '确认接受吗?',
      success: function (res) {
        if (res.confirm) {
          that.band_coupon()
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
  band_coupon:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var coupons_info = that.data.coupons_info
    var coupons_json = JSON.stringify(coupons_info)
    var receive = that.data.receive
    var msg_id = that.data.msg_id
    
    console.log('接收优惠券 coupons_info:', coupons_info);
    wx.request({
      url: weburl + '/api/client/band_coupon',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        coupons: coupons_json,
        coupon_type: 'receive',
        msg_id:msg_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('接收优惠券返回:', res.data.result);
        var coupons_update = res.data.result;
        if (!res.data.result) {
          wx.showToast({
            title: res.data.info ? res.data.info : '已被领取',
            icon: 'none',
            duration: 1500
          })
          setTimeout(function () {
            //wx.navigateBack()
            wx.switchTab({
              url: '../../hall/hall'
            })

          }, 1500);

        } else {
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(function () {
            //wx.navigateBack()
            wx.switchTab({
              url: '../../hall/hall'
            })
          }, 1500);
        }
      }

    })

  },
  overtimeData: function () {
    var that = this
    var coupons_info = that.data.coupons_info
    console.log('超时处理 coupons_info:', coupons_info)
    if (!coupons_info) {
      that.setData({
        overtime_status: 1 //超时标志
      })
    }
  },
  query_pubcoupon: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''

    var shop_type = that.data.shop_type
    var coupons_id = that.data.coupons_id
    var coupons_flag = that.data.coupons_flag
    var coupons_type = that.data.coupons_type
    setTimeout(function () { //3秒超时
      that.overtimeData()
    }, 3000)

    wx.request({
      url: weburl + '/api/client/query_pubcoupon',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        coupons_flag: coupons_flag,
        coupons_id: coupons_id,
        shop_type: shop_type,
        coupons_type: coupons_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var coupons_info = res.data.result
        console.log('query_pubcoupon:', res.data)
        if (res.data.status=='n') {
          wx.showToast({
            title: res.data.info ? res.data.info : '已过期',
            icon: 'none',
            duration: 2000
          })
        } else {
          for (var i = 0; i < coupons_info.length; i++) {
            coupons_info[i]['start_time'] = util.getDateStr(coupons_info[i]['start_time'] * 1000, 0)
            coupons_info[i]['end_time'] = util.getDateStr(coupons_info[i]['end_time'] * 1000, 0)
          }
          that.setData({
            coupons_info: coupons_info,
          })
          console.log('查询优惠券发行信息 query_pubcoupon coupons_info:', coupons_info, 'coupons_info.length:', coupons_info.length)
        }
      }

    })
  },
  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    console.log('收到的优惠券:', options)
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    //var options = util.formatString(options)
    //var coupons = options.coupons ? options.coupons:''
    //coupons = util.formatString(coupons)
    var receive = options.receive
    //var coupons_info = coupons?JSON.parse(coupons):[{}]
    var coupons_id = options.coupons_id ? options.coupons_id : 0
    var msg_id = options.msg_id ? options.msg_id : 0
    var coupons_flag = options.coupons_flag ? options.coupons_flag : '999999999999'
    var coupons_type = options.coupons_type ? options.coupons_type : '1'
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    if (!username) {
      wx.navigateTo({
        url: '../login/login'
      })
    }
    that.setData({
      coupons_id: coupons_id,
      coupons_flag: coupons_flag,
      receive: receive,
      coupons_type: coupons_type,
      msg_id:msg_id,
    })
    that.query_pubcoupon()
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
  
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    console.log('showGoods')
    console.log(goods_name + ' ' + goods_id);
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
  },

  onShareAppMessage: function (options ) {
      var that = this 
      var res
      var order_no = that.data.order_no;
      var username = that.data.username;
      var token = that.data.token;
      console.log('开始分享优惠券'); 
      console.log(options);  
      var shareObj = {
      　title: "优惠券",        // 默认是小程序的名称(可以写slogan等)
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
   

  
})