var app = getApp();
var weburl = app.globalData.weburl;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var shop_type = app.globalData.shop_type; 
var util = require('../../../utils/util.js');
var now = new Date().getTime();
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "心愿单logo", value: "", img: "/uploads/gift_logo.png" },

];
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
Page({
  data: {
    title_name: '礼物转送',
    title_logo: '../../../images/footer-icon-05.png',
    img_gift:weburl+'/uploads/gift.gif?rand='+Math.random()*100,
    shop_type:shop_type,
    orders: [],
    orderskus:[],
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
    nickname: userInfo.nickName,
    send_status:1,
    hiddenmodalput:false,
    overtime_status: 0,
    currenttime: now ? parseInt(now / 1000) : 0,
    navList2: navList2,
    shop_type:shop_type,
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
    wx.switchTab({
      url: '../../index/index'
    });
  },
  //点击按钮痰喘指定的hiddenmodalput弹出框  
  modalinput: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
  },
  //取消按钮  
  cancel: function () {
    var that = this
    that.setData({
      hiddenmodalput: true
    });
  },
  //确认  
  confirm: function () {
    var that = this
    that.setData({
      hiddenmodalput: true
    })
  },
  bindChange: function (e) {
    var that = this
    var note = e.detail.value
    that.setData({
      note:note
    })
    console.log('note:'+that.data.note)

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
  get_project_gift_para: function () {
    var that = this
    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
   
    console.log('transfer get_project_gift_para navList2:', navList2)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
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
        }
      })
    }
    that.setData({
      navList2: navList_new
    })

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },

  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    console.log('transfer get_project_gift_para navList2:', navList_new)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定 1首页单图片 2首页轮播  
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return
          } else {
            wx.setStorageSync('navList2', navList_new)
            that.setData({
              navList2: navList_new,
              buyin_rate: navList2 ? navList2[7]['value'] : buyin_rate,
            })
          }
        }
      })
    } else {
      that.setData({
        navList2: navList_new,
        buyin_rate: navList2 ? navList2[7]['value'] : buyin_rate,
      })
    }

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },

  onLoad: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var order_no = options.order_no
    var receive = options.receive
    var orders = options.orders
    console.log(' 转赠 order_no:', order_no, ' orders:', orders)
    if (!username) {//登录
      wx.navigateTo({
        url: '../../login/login'
      })
    }
    that.setData({
      order_no: order_no,
      receive: receive,
      orders: orders,
    })
    that.reloadData()

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      }
    })  
  },

  overtimeData: function () {
    var that = this
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    console.log(' 超时处理 headimg:', headimg, ' nickname:', nickname)
    if (!headimg) {
      that.setData({
        overtime_status: 1 //超时标志
      })
    }
  },
  // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
  reloadData: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var order_no = that.data.order_no
    var receive = that.data.receive
    var orders = that.data.orders
    var now = new Date().getTime()
    var currenttime = now ? parseInt(now / 1000) : 0
    var shop_type = that.data.shop_type
    username = username?username:openid
    //that.setNavigation()
    console.log('礼品信息:', order_no)
   
    if (receive == 1) {
      console.log('礼品接受处理 order_no:', order_no,' receive:',receive)
      return
    }
    setTimeout(function () { //3秒超时
      that.overtimeData()
    }, 3000)
    //再次确认订单状态
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        order_type: 'send',
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        if (!orderObjects) {
          wx.showToast({
            title: '没有该订单',
            icon: 'loading',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 1500);
          return
        } else {
          if (orderObjects[0]['gift_status'] != 1 || currenttime < orderObjects[0]['duetime']) {
            wx.showToast({
              title: '不满足转增条件',
              icon: 'loading',
              duration: 1500
            })
            setTimeout(function () {
              wx.navigateBack()
            }, 1500)
            return
          }
        }
        that.setData({
          send_status: 0,
        })
        console.log('满足转增条件 send_status:', that.data.send_status,' over time status:',that.data.overtime_status)
      }
    })
    var orders = JSON.parse(orders);
    var orderskus = that.data.orderskus;
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note;
    note = orders[0]['rcv_note'];
    headimg = orders[0]['from_headimg'];
    nickname = orders[0]['from_nickname'];

    // order_sku 合并在一个对象中
    for (var i = 0; i < orders.length; i++) {
      for (var j = 0; j < orders[i]['order_sku'].length; j++) {
        orders[i]['order_sku'][j]['goods_name'] = orders[i]['order_sku'][j]['goods_name'].substring(0, 15)
        orderskus.push(orders[i]['order_sku'][j])
      }
    }
    console.log('order sku list:');
    console.log(orderskus);
    that.setData({
      order_no: order_no,
      orders: orders,
      orderskus: orderskus,
      note: note,
      note_title: note_title,
      headimg: headimg,
      nickname: nickname,
      username: username,
      token: token,
    })

  },

  onShow: function () {
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    that.get_project_gift_para()
  },

  
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
    
    console.log('showGoods')
    console.log(goods_name + ' ' + goods_id)
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
  },

  onShareAppMessage: function (e) {
      var that = this 
      var shop_type = that.data.shop_type
      var res
      var order_no = that.data.order_no;
      var username = that.data.username;
      var token = that.data.token;
      var title = '收到一份来自' + that.data.nickname + '的大礼,快打开看看吧~';
      var note = e.target.dataset.note ? e.target.dataset.note:that.data.note
      var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : title_logo
      var imageUrl = navList2?navList2[2]['img'] : title_logo
      note = note ? note :'送你一份礼物，愿你喜欢!'
      console.log('开始转增礼物'); 
      console.log(note);  
      if (!order_no) {
        console.log('礼品订单号为空 trans')
        return
      }
    wx.request({ //更新发送状态
      url: weburl + '/api/client/update_order_status',
      method: 'POST',
      data: {
        username: username,
        shop_type: shop_type,
        access_token: token,
        status_info: 'transfer',
        rcv_note: note,
        order_no: order_no,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('礼物转赠完成:',res.data)
        /*
        if (res.data.result) {
          wx.showToast({
            title: '礼物转赠成功',
            icon: 'success',
            duration: 1500
          })
          that.setData({
            send_status: 1,
          });
        } else {
          wx.showToast({
            title: '礼物转赠失败',
            icon: 'success',
            duration: 1500
          })
        }
        */
        wx.switchTab({
          url: '../../index/index'
        })
      }
    })
      var shareObj = {
        title: title,        // 默认是小程序的名称(可以写slogan等)
        desc:"礼物代表我的心意",
        path: '/pages/order/receive/receive?order_no=' + order_no + '&receive=1',   // 默认是当前页面，必须是以‘/’开头的完整路径
        //path : '/pages/hall/hall?page_type=2&order_no=' + order_no + '&receive=1',
        imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      　success: function (res) {　　　
          console.log(res)
          if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
          
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
          complete: function() { // 转发结束之后的回调（转发成不成功都会执行）
        　　　　　　
      　　　　
  　　    },
        }
      if (e.from === 'button') {
          // 来自页面内转发按钮
            // shareBtn
          　　　　// 此处可以修改 shareObj 中的内容
        //var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况
        wx.showToast({
          title: '转赠中...',
          icon: 'loading',
          duration: 1500
        })  
        shareObj.path = '/pages/order/receive/receive?order_no=' + order_no+'&receive=1'
        //shareObj.path = '/pages/hall/hall?page_type=2&order_no=' + order_no + '&receive=1'
        shareObj.imageUrl = imageUrl
        console.log('礼物分享:')
        console.log(shareObj)
        
        }
        // 返回shareObj
        return shareObj;
    
  } ,
   

  
});