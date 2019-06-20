
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;

var page = 1;
var pagesize = 10;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var navList2 = [
  { id: "activity_banner", title: "感恩节活动", value: "", img: "/uploads/activity_info/activity_banner.gif" },
  { id: "activity_footer", title: "活动说明", value: "", img: "/uploads/activity_info/activity_footer.png" },
  { id: "activity_sub1_banner", title: "活动商品列表1", value: "", img: "/uploads/activity_info/activity_1_banner.gif" },
  { id: "activity_sub2_banner", title: "活动商品列表2", value: "", img: "/uploads/activity_info/activity_2_banner.gif" },
  { id: "activity_sub3_banner", title: "活动商品列表3", value: "", img: "/uploads/activity_info/activity_3_banner.gif" },
  { id: "activity_sub4_banner", title: "活动商品列表4", value: "", img: "/uploads/activity_info/activity_4_banner.gif" },
  { id: "activity_sub5_banner", title: "活动商品列表5", value: "", img: "/uploads/activity_info/activity_5_banner.gif" },
  { id: "activity_sub6_banner", title: "活动商品列表6", value: "", img: "/uploads/activity_info/activity_6_banner.gif" },
  { id: "activity_sub7_banner", title: "活动商品列表7", value: "", img: "/uploads/activity_info/activity_7_banner.gif" },
  { id: "activity_sub8_banner", title: "活动商品列表8", value: "", img: "/uploads/activity_info/activity_8_banner.gif" },
];

Page({
  data: {
    title_name:'送心活动',
    title_logo: '../../images/footer-icon-05.png',
    img_discount: '../../images/discount.png',
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    main_title_Bg: null,  
    banner_link: null,
    gifts_rcv:0,
    gifts_snd:0,
    note:'',
    username: null,
    token: null,
    carts: [],
    recommentList: [],
    activityList: [],
    minusStatuses: [],
    selectedAllStatus: true,
    total: '',
    startX: 0,
    itemLefts: [],
    showmorehidden: true,
    rshowmorehidden: true,
    all_rows:0,
    rall_rows:0,
    windowWidth: 0,
    windowHeight: 0,
    carts: [],
    cartIds: null,
    amount:0,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    shop_type:shop_type,
    navList2: navList2,

  }, 
  /*
  setNavigation:function() {
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
  */
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../hall/hall'
      })
    }

  },
  
  bannerTapTag: function (e) {
    var that = this
    var banner_link = e.currentTarget.dataset.bannerlink
    var nav_path = banner_link.split("/")
    console.log('bannerTapTag:', nav_path)
    if (nav_path[2] == 'hall' || nav_path[2] == 'wish' || nav_path[2] == 'index' || nav_path[2] == 'my'){
      var pagelist = getCurrentPages()
      var len = pagelist.length
      var init = 0
      var index = 0;
      for (var i = 0; i < len; i++) {
        if (pagelist[i].route.indexOf("hall/hall") >= 0) {//看路由里面是否有首页
          init = 1
          index = i
        }
      }
      if (init == 1) {
        wx.navigateBack({
          delta: len - i - 1
        })
      } else {
        /*
        wx.reLaunch({
          url: "/pages/hall/hall"//这个是默认的单页
        })
        */
        wx.switchTab({
          url: '/pages/hall/hall'
        })

      }
      
    
      
    }else{
      wx.navigateTo({
        url: banner_link + '&username=' + username + '&token=' + token
      })
    }
    
  },
  
  qrcodeTapTag: function (e) {
    var that = this
    var qr_type = 'activityshare'  //
    var act_id = that.data.act_id
    var act_title = that.data.act_title ? that.data.act_title:'送心活动'
    var page_type = '4'  //
    that.setData({
      qr_type: qr_type,
    })
    //that.eventDraw()
    wx.navigateTo({
      url: '../member/share/share?qr_type=' + qr_type + '&act_id=' + act_id + '&act_title=' + act_title
    })

  },

  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
    var goods_price = e.currentTarget.dataset.goodsPrice
    var goods_info = e.currentTarget.dataset.goodsInfo
    var goods_sale = e.currentTarget.dataset.sale
    var image = e.currentTarget.dataset.image
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&image=' + image+ '&token=' + token + '&username=' + username
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
  
  reloadData: function (username, token) {
    // auto login
    var that = this;
    var minusStatuses = []
    var page=that.data.page
    var pagesize=that.data.pagesize
    var shop_type = that.data.shop_type

   
    var gifts_rcv = that.data.gifts_rcv;
    var gifts_send = that.data.gifts_send;
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    console.log("openid:" + openid + ' username:' + username)
    // 加载的使用进行网络访问，把需要的数据设置到data数据对象
    /*
    
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
   

  },
  
 
  
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  get_activity_info: function () {
    var that = this
    var activityList = that.data.activityList
    var shop_type = that.data.shop_type
    var act_id = that.data.act_id

    //活动列表
    wx.request({
      url: weburl + '/api/client/get_activity_info',
      method: 'POST',
      data: {
        type: 1,  //暂定
        shop_type: shop_type,
        act_id:act_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var activityList_new = res.data.result;
        if (!activityList_new) {
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
          activityList: activityList_new,
          act_id: activityList_new['act_id'],
          act_title: activityList_new['act_title'],
          main_title_Bg: activityList_new['activity_banner_url'], //活动页banner图
          banner_link: activityList_new['activity_banner_link'], //活动页banner图跳转链接
          main_footer_Bg: activityList_new['activity_footer_url'], //活动页banner图
          footer_link: activityList_new['activity_footer_link'], //活动页banner图跳转链接
        })
        console.log('get_activity_info:', activityList_new, 'banner_link', that.data.banner_link)
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },

 
  onLoad: function (options) {
    var that = this
    var page_type = options.page_type ? options.page_type:''
    var order_no = options.order_no ? options.order_no:''
    var act_id = options.act_id ? options.act_id:''
    var coupons = options.coupons ? options.coupons:''
    var receive = options.receive ? options.receive:''

    that.setData({
      act_id: act_id,
      page_type: page_type,
      order_no: order_no,
      coupons: coupons,
      receive: receive,
    })
    //that.setNavigation()
    console.log('activity page_type:', page_type, ' order_no:', order_no, ' receive:', receive, ' act_id:', act_id)
    if(page_type==2){ //收到礼物
      if (receive==1){
        wx.navigateTo({
          url: '../order/receive/receive?order_no=' + order_no + '&receive=1'
        })
      }
    }
    that.get_activity_info()
  },
  //事件处理函数
 
  //页面滑动到底部
  bindDownLoad: function () {
    var that = this;
    that.setData({
      page: page++
    });
   // this.loadgoods(reid,this.data.navLeftItems[this.data.curIndex]['id']);
    console.log("lower");
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
  onShow: function () {
    var that = this;
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var username = wx.getStorageSync('username');
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }  
    
    if(!username){
      wx.switchTab({
        url: '../my/index'
      })
    }
    
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

   /*
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight - 60,
          scrollTop: that.data.scrollTop + 10
        })
      }
    }) 
  */
    this.setData({
      username: username
    })
    this.reloadData(username, token);
     
  },
  onShareAppMessage: function () {
    return {
      title: '送心礼物',
      desc: '开启礼物电商时代，200万人都在用的礼物小程序！',
      path: '/pages/hall/hall?refername='+username
    }
  } 
})
