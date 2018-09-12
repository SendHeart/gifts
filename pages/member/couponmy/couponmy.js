var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var util = require('../../../utils/util.js');
var now = new Date().getTime();
var navList2 = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },

];
var navList_order = [
  { id: "avaliable", title: "未使用" },
  { id: "used", title: "已使用" },
  { id: "overdue", title: "已过期" },
];
Page({
  data: {
    title_name: '收到优惠券',
    title_logo: '../../../images/footer-icon-05.png',
    coupon_img: weburl+'/uploads/coupon_bg.jpg',
    shop_type:shop_type,
    navList_order:navList_order,
    tab2: 'avaliable',
    activeIndex2: 0,
    orders: [],
    orderskus:[],
    openid:null,
    userInfo: {},
    page: 1,
    pagesize: 10,
    status: 0,
    all_rows: 0,
    page_num: 0,
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
  onOrderTapTag: function (e) {
    var that = this
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag = that.data.giftflag;
    if (tab == 'avaliable') {
      giftflag = 0
    } else if(tab == 'used') {
      giftflag = 1
    } else if(tab == 'overdue') {
      giftflag = 2
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
    })
    console.log('tab:' + tab, ' giftflag:', giftflag)
    that.query_coupon()
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
  couponTapTag: function (e) {
    /*
    wx.navigateTo({
      url: '../../order/list/list'
    });
   
   wx.switchTab({
      url: '../../hall/hall'
    })
    
     */
    wx.navigateTo({
      url: '../../list/list'
    });

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
  getMoreOrdersTapTag: function (e) {
    var that = this
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
    that.query_coupon()
  },
  get_project_gift_para: function () {
    var that = this
    var navList2 = that.data.navList2
    var page = that.data.page
    var pagesize = that.data.pagesize

    //项目列表
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        type: 1,  //暂定
        shop_type: shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('get_project_gift_para:', res.data.result)
        var navList_new = res.data.result;
        if (!navList_new) {
          /*
           wx.showToast({
             title: '没有菜单项2',
             icon: 'loading',
             duration: 1500
           });
           */
          return;
        }

        that.setData({
          navList2: navList_new,
          //coupon_img: navList_new[7]['img'],
        })

        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },
  query_coupon:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var coupons_status = that.data.tab2;
    var page = that.data.page
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    var page_num = that.data.page_num
    var shop_type = that.data.shop_type
     
    wx.request({
      url: weburl + '/api/client/query_coupon',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        page:page,
        pagesize:pagesize,
        shop_type:shop_type,
        coupons_status: coupons_status,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('查询优惠券:', res.data.result);
        var coupons_list = res.data.result
        if (!res.data.result) {
          wx.showToast({
            title: res.data.info ? res.data.info : '暂无优惠券',
            icon: 'loading',
            duration: 1500
          })
          setTimeout(function () {
            //wx.navigateBack()
            wx.switchTab({
              url: '../../my/index'
            })

          }, 1500);

        } else {
      
          for (var i=0; i < coupons_list.length; i++){
            coupons_list[i]['start_time'] = util.getDateStr(coupons_list[i]['start_time']*1000,0)
            coupons_list[i]['end_time'] = util.getDateStr(coupons_list[i]['end_time']*1000, 0)
          }
          if (page > 1 && coupons_list) {
            //向后合拼
            coupons_list = that.data.coupons_list.concat(coupons_list);
          }
          page_num = (all_rows / pagesize + 0.5)
          that.setData({
            coupons_list: coupons_list,
            page_num: page_num.toFixed(0),
          })
        }
      }

    })

  },
  onLoad: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
  
    console.log('查询我的优惠券')
    that.query_coupon()
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
   

  
});