import defaultData from '../../../data';
var util = require('../../../utils/util.js');
var app = getApp()
var appid = app.globalData.appid
var secret = app.globalData.secret
var weburl = app.globalData.weburl
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var shop_type = app.globalData.shop_type
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
Page({
  data: {
    title_name: '礼物送出',
    title_logo: '../../../images/footer-icon-05.png',
    gift_logo: weburl + "/uploads/gift_logo1.png", //默认
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
    headimg: userInfo.avatarUrl,
    nickname: userInfo.nickName,
    goods_flag:1,
    send_status:1,
    navList2: navList2,
    is_buymyself:0, //1自购礼品
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
  returnForm:function(e){
    var that = this
    var formID = e.detail.formId
    that.setData({
      formID: formID,
    })
    console.log('send returnTapTag() fromID:', formID)
     //微信消息通知
    that.remindMessage()
    that.returnTapTag()
  },
  returnTapTag: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_flag= that.data.goods_flag
    var order_no = that.data.order_no
    var order_id = that.data.order_id
    var order_note = that.data.note
    var is_buymyself = that.data.is_buymyself
    var goodsshape = that.data.goodsshape   //5贺卡请柬
    var order_bg = that.data.sku_image
    var order_share_image = that.data.sku_share_image
    var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
    var headimg = wx_headimg_cache ?wx_headimg_cache:that.data.headimg
    wx.request({ //更新发送状态
      url: weburl + '/api/client/update_order_status',
      method: 'POST',
      data: {
        username: username,
        shop_type, shop_type,
        access_token: token,
        status_info: 'send',
        order_no: order_no,
        goods_flag:goods_flag,
        is_buymyself: is_buymyself,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('礼物发送状态更新完成:', res.data, ' is_buymyself:', is_buymyself)
        //自购礼品 接收处理
        if (is_buymyself == 1 && goodsshape!=5){
          console.log('order send returnTapTag() 自购礼品 自动接收处理')
          wx.navigateTo({
            url: '/pages/order/receive/receive?order_no=' + order_no + '&receive=1' + '&is_buymyself=' + is_buymyself
          })
        } else if (is_buymyself == 1 || goodsshape == 5){
          //wx.hideLoading()
          console.log('order send returnTapTag() 贺卡请柬 转分享页面')
          wx.navigateTo({
            url: '/pages/wish/wishshare/wishshare?share_order_id=' + order_id + '&share_order_shape=' + goodsshape + '&share_order_note=' + order_note + '&share_order_bg=' + order_bg + '&share_order_image=' + order_share_image
          })
        } else {
          wx.switchTab({
            url: '../../index/index'
          })
        }
      }
    }) 
  },

  /**
* 触发微信提醒
*/
  remindMessage: function () {
    var that = this
    var formID = that.data.formID
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var order_no = that.data.order_no
    var shop_type = that.data.shop_type
    var msg_type = 1 //礼物接收通知
    wx.request({
      url: weburl+'/api/WXPay/sendMessage2Openid',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',  
        'Accept': 'application/json'
      },
      data: {
        m_id: m_id,
        openid: openid,
        from_username: username,
        access_token: token,
        formid: formID,
        order_no: order_no,
        appid: app.globalData.appid,
        appsecret: app.globalData.secret,
        shop_type: shop_type,
        msg_type: msg_type,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log('send remindMessage() 微信通知礼物接收:',res.data)
      },
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

  get_project_gift_para: function () {
    var that = this
    var navList_new = navList2
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize

    console.log('send get_project_gift_para navList2:', navList2,'length:',navList2.length)
    if (navList2.length==0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type
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
          }else{
            that.setData({
              navList2: navList_new
            })
            console.log('send get_project_gift_para navList_new:', navList_new)
          }
        }
      })
    } 
    
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var order_no = options.order_no;
    var receive = options.receive
    var is_buymyself = options.is_buymyself ? options.is_buymyself:0
    var shop_type = that.data.shop_type
    var share_order_wx_headimg = options.share_order_wx_headimg ? options.share_order_wx_headimg : ''
    that.setData({
      order_no: order_no,
      is_buymyself: is_buymyself,
    })
    //that.setNavigation()
    console.log('礼品信息 options:', options,'orders:',JSON.parse(options.orders))
    that.get_project_gift_para()
    if (receive == 1){
      console.log('礼品接受处理:', options)
      wx.navigateBack()
      return
    }
    if (!order_no) {
      console.log('礼品订单号为空:', options)
      wx.showToast({
        title: '礼品订单号为空' + options,
        icon: 'none',
        duration: 1500
      })
      setTimeout(function () {
        wx.navigateBack()
      }, 1500);
      return
    }

    //再次确认订单状态
    /*
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        order_type: 'send',
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('再次确认订单状态:',res.data)
        var orderObjects = res.data.result;
        if (!orderObjects) {
          console.log('没有该订单 orderObjects:', orderObjects)
          wx.showToast({
            title: '没有该订单',
            icon: 'none',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1500);
          
          return
        } else {
          if (orderObjects[0]['rcv_openid']) { //已经有接收人
            console.log('该订单已送出 orderObjects:', orderObjects)
            wx.showToast({
              title: '该订单已送出',
              icon: 'none',
              duration: 1500
            })
            setTimeout(function () {
              wx.navigateBack();
            }, 1500)
            return
          }else{
            that.setData({
              send_status: 0,
              //orders: orderObjects,
              //goods_flag: orderObjects[0]['order_sku'][0]['goods_flag'],
              //order_price: orderObjects[0]['order_price'],
            })
          }
        }
      }
    })
    */
    var orders = options.orders ? JSON.parse(options.orders) : that.data.orders
    var orderskus = that.data.orderskus
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note
    var goodsshape = orders[0]['shape']
    var order_id = orders[0]['id']
    note = orders[0]['rcv_note']
    
    //headimg = orders[0]['from_headimg']
    //nickname = orders[0]['from_nickname']
    console.log(orders);
    // order_sku 合并在一个对象中
    for (var i = 0; i < orders.length; i++) {
      for (var j = 0; j < orders[i]['order_sku'].length; j++) {
        orders[i]['order_sku'][j]['goods_name'] = orders[i]['order_sku'][j]['goods_name'].substring(0,15)
        orderskus.push(orders[i]['order_sku'][j])
        if (orders[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
          orders[i]['order_sku'][j]['sku_image'] = weburl + '/' + orders[i]['order_sku'][j]['sku_image'];
        } 
        if (goodsshape==5){
          if (orders[i]['order_sku'][j]['sku_share_image'].indexOf("http") < 0) {
            orders[i]['order_sku'][j]['sku_share_image'] = weburl + '/' + orders[i]['order_sku'][j]['sku_share_image'];
          } 
        }
      }
    }
    console.log('order send onload() order sku list:', orderskus);
    //console.log(orderskus);
    that.setData({
      order_no: order_no,
      order_id: order_id,
      orders: orders,
      orderskus:orderskus,
      goodsshape: goodsshape,
      goodsname: orders[0]['order_sku'][0]['goods_name'],
      note:note,
      note_title:note_title,
      headimg:headimg,
      nickname:nickname,
      username:username,
      token:token,
      send_status: 0,
      goods_flag: orders[0]['order_sku'][0]['goods_flag'],
      order_price: orders[0]['order_price'],
      sku_image: orders[0]['order_sku'][0]['sku_image'],
      sku_share_image: orders[0]['order_sku'][0]['sku_share_image'],
    })

    if (orders[0]['shape'] != 5) { // 贺卡请柬
      //获取带价格的分享图片  
      var navList2 = that.data.navList2
      var imageUrl = navList2.length > 0 ? navList2[0]['img'] : that.data.gift_logo
      console.log('获取带价格的分享图片 ')
      wx.request({
        url: weburl + '/api/client/get_text_watermark',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          order_no: order_no,
          text: that.data.order_price,
          image: imageUrl,
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('order send onload() image with watermark:', res.data)
          var watermark_info = res.data.result
          if (watermark_info) {
            that.setData({
              'shareimage_url': watermark_info.image,
            })
          }
        }
      })
    }
    if (is_buymyself == 1 || goodsshape==5) { //自购礼品
      console.log('自购礼品无需分享到微信 ' )
      that.returnTapTag()
    } 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      }
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

  onShareAppMessage: function (options ) {
    var that = this 
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no
    var username = that.data.username;
    var goods_flag = that.data.goods_flag
    var token = that.data.token
    var goodsshape = that.data.goodsshape
    var sku_share_image = that.data.orderskus[0]['sku_share_image']
    var goods_name = that.data.orderskus[0]['goods_name']
    var navList2 = that.data.navList2
    var title = goodsshape == 5 ? '您收到一份来自' + that.data.nickname + '的'+goods_name+',点击立即打开。' : '您收到一份来自' + that.data.nickname + '的礼物,点击立即打开。'
    var shareimage_url = that.data.shareimage_url //带价格水印的图片
    var imageUrl = navList2.length>0?navList2[0]['img'] : that.data.gift_logo
    imageUrl = shareimage_url ? shareimage_url : imageUrl
    if (goodsshape==5){
      imageUrl = sku_share_image
    }
    console.log('开始送礼 options:', options, 'order_no:', order_no, 'sku_share_image:', sku_share_image, ' navList2:', navList2); 
    //console.log(options);  
    if (!order_no){
      console.log('礼品单号为空 send')
      return
    }
    that.setData({
      send_status: 1,
    })

    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: "开启礼物电商时代，200万人都在用的礼物小程序！",
      //path: '/pages/hall/hall?page_type=2&order_no=' + order_no + '&receive=1' + '&random=' + Math.random().toString(36).substr(2, 15),   // 默认是当前页面，必须是以‘/’开头的完整路径
      path: '/pages/order/receive/receive?page_type=2&order_no=' + order_no + '&receive=1' + '&goods_shape=' + goodsshape + '&goods_flag=' + goods_flag,  
      imageUrl: imageUrl,     
      success: function (res) {
        console.log('更新发送状态:', res)
        if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
        //微信已经取消回调服务
        }
      },
      fail: function (res) {
        console.log('转发失败之后', res)
        if (res.errMsg == 'shareAppMessage:fail cancel') {// 转发失败之后的回调
          wx.showToast({
            title: '用户取消转发',
            icon: 'success',
            duration: 1500
          })  　// 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          wx.showToast({
            title: '礼物发送失败',
            icon: 'loading',
            duration: 1500
          }) 　　　　　// 转发失败，其中 detail message 为详细失败信息
        }
      },
      complete: function (res) { // 转发结束之后的回调（转发成不成功都会执行）
        console.log('转发结束:', res)
        wx.showToast({
          title: '礼物发送完成',
          icon: 'loading',
          duration: 1500
        })

      },
    }
    if (options.from === 'button') {
          // 来自页面内转发按钮
        console.log('礼物分享:', shareObj)
        //console.log(shareObj)
        
    }
        // 返回shareObj
    return shareObj
  } ,
   
})