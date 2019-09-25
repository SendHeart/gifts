var app = getApp()
var weburl = app.globalData.weburl
var appid = app.globalData.appid
var appsecret = app.globalData.secret
var shop_type = app.globalData.shop_type
var navList_order = [
  { id: "send", title: "我送出的" },
  { id: "receive", title: "我收到的" },
]
var now = new Date().getTime()
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
Page({
  data: {
    title_name: '礼物袋',
    title_logo: '../../images/history_s.png',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    orders: [],
    orders_show: [],
    orders_prev: [],
    orders_next: [],
    colors: [],
    keyword: '',
    user_name:'',
    shop_type:shop_type,
    page: 1,
    pagesize: 20,
    show_max:1,  //最多显示页数
    status: 0,
    navList_order: navList_order,
    tab2: 'send',
    activeIndex2: 0,
    all_rows: 0,
    giftflag: 0,
    gift_send:0,
    gift_rcv:0,
    page_num: 0, 
    hiddenmodalput: true,
    hidddensearch: true,
    hiddenmore:true,
    modalHiddenUserName:true,
    modalHiddenPhone:true,
    currenttime:now?parseInt(now/1000):0,
    navList2: navList2,
    buyin_rate:90,  //礼物折现率
    loadingHidden: true, // loading
    scrollTop: 0,
    is_loading:false,
    lastX: 0,          //滑动开始x轴位置
    lastY: 0,          //滑动开始y轴位置
    text: "没有滑动",
    currentGesture: 0, //标识手势
    current_scrollTop:0,
    needPhoneNumber: '微信授权',
    needUserName: '微信授权',
    inputShowed: false,
  },
  /*
  //监听屏幕滚动 判断上下滚动  
  onPageScroll: function (ev) {
    var that = this
    //当滚动的top值最大或者最小时，为什么要做这一步是由于在手机实测小程序的时候会发生滚动条回弹，所以为了解决回弹，设置默认最大最小值   
    if (ev.scrollTop <= 0) {
      ev.scrollTop = 0
    } else if (ev.scrollTop > that.data.dkheight) {
      ev.scrollTop = that.data.dkheight
    }
    //判断浏览器滚动条上下滚动   
    if (ev.scrollTop > that.data.scrollTop || ev.scrollTop == that.data.dkheight) {
      console.log('向下滚动')
    } else {
      console.log('向上滚动');
    }
    console.log('当前scrollTop:', ev.scrollTop, ' 当前屏幕高:', that.data.dkheight);
    //给scrollTop重新赋值    
    
    setTimeout(function () {
      that.setData({
        scrollTop: ev.scrollTop
      })
    }, 0)
     
  },
  */
 
  //滑动移动事件
 /*
  handletouchmove: function (event) {
    var that = this
    var currentX = event.touches[0].pageX
    var currentY = event.touches[0].pageY
    var tx = currentX - that.data.lastX
    var ty = currentY - that.data.lastY
    var screenHeight = that.data.dkheight
    var text = ""
    //左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {//text = "向左滑动"

      } else if (tx > 0) {//text = "向右滑动"

      }
    }else{
      //上下方向滑动
      if (ty < 0) {
        text = "向上滑动"
        if (that.data.current_scrollTop >30)  that.getMoreOrdersTapTag()
      } else if (ty > 0) {
        text = "向下滑动"
        //if (that.data.current_scrollTop<10) that.getPrevOrdersTapTag()
      }
    }  
   
    //将当前坐标进行保存以进行下一次计算
    that.data.lastX = currentX
    that.data.lastY = currentY
    that.setData({
      text: text,
    })
    //console.log('handletouchmove:', text, 'ty:', ty, 'tx:', tx, ' currentY:', currentY, 'current_scrollTop:', that.data.current_scrollTop, ' screenHeight:', screenHeight, 'page:', that.data.page)
  },

  //滑动开始事件
  handletouchtart: function (event) {
    var that = this
    that.data.lastX = event.touches[0].pageX
    that.data.lastY = event.touches[0].pageY
  },
  //滑动结束事件
  handletouchend: function (event) {
    var that = this
    that.data.currentGesture = 0;
    that.setData({
      text: "没有滑动",
      is_longtap : false,
    });
  },
 
  onPageScroll: function (e) {
    var that = this
    //console.log(e);//{scrollTop:99}
    that.setData({
      current_scrollTop: e.scrollTop,
    })
  },
*/
  goBack: function () {
    wx.switchTab({
      url: '../hall/hall'
    })
  },

  orderSearch: function () {
    var that = this
    that.setData({
      page: 0,
    })
    that.reloadData()
  },

  searchTagTap: function(){
    var that = this
    var hidddensearch = that.data.hidddensearch
    that.setData({
      hidddensearch: !hidddensearch,
    })
  },
  search_goodsnameTapTag: function (e) {
    var that = this
    var keyword = e.detail.value
    that.setData({
      keyword: keyword
    })
  },

  getPhoneNumber: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var session_key = wx.getStorageSync('session_key') ? wx.getStorageSync('session_key') : ''

    console.log('index getPhoneNumber:',e.detail.errMsg == "getPhoneNumber:ok");
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.request({
        url: weburl + '/api/client/update_name',
        method: 'POST',
        data: {
          username: username ? username : openid,
          access_token: token,
          appid: appid,
          session_key: session_key,
          type: '1', //需要后台解密 encryptedData
          shop_type: shop_type,
          encryptedData: encodeURIComponent(e.detail.encryptedData),
          iv: e.detail.iv,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var result = res.data.result
          var phoneNumber = result.phoneNumber
          wx.setStorageSync('user_phone', phoneNumber)
          that.setData({
            modalHiddenPhone: !that.data.modalHiddenPhone
          })
          that.reloadData()
        }
      })
    } else { //授权失败，具体进入‘我的’页面
      wx.switchTab({
        url: '../hall/hall'
      })
    }
  },
  //按钮点击事件  获取手机号
  modalBindconfirmPhone: function () {
    var that = this
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    if (user_phone) {
      that.setData({
        modalHiddenPhone: !that.data.modalHiddenPhone
      })
    } else {
      var needPhoneNumber = '需要您的手机号授权'
      that.setData({
        needPhoneNumber: needPhoneNumber
      })
    }
  },  

  getUserName: function (user_name, user_gender) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    if(!user_name || !user_gender){
        return
    }
    wx.request({
      url: weburl + '/api/client/update_name',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        full_name: user_name,
        sex: user_gender,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status='y'){
          wx.setStorageSync('user_name', user_name)
          that.reloadData()
        }else{
          wx.showToast({
            title: '姓名更新失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },

  user_nameTapTag: function (e) {
    var that = this
    var user_name = e.detail.value
    that.setData({
      user_name: user_name
    })
  },
  //按钮点击事件  获取姓名
  modalBindconfirmUsername: function () {
    var that = this
    var user_name = that.data.user_name
    var user_gender = that.data.user_gender
    if (user_name && user_gender) {
      that.setData({
        modalHiddenUserName: !that.data.modalHiddenUserName
      })
      that.getUserName(user_name, user_gender)
    } else {
      var needUserName = '请填写您的姓名和性别'
      that.setData({
        needUserName: needUserName
      })
    }
  },  

  radiochange: function (e) {
    var that = this
    var user_gender = e.detail.value
    //console.log('radio发生change事件，携带的value值为：', e.detail.value)
    that.setData({
      user_gender: user_gender
    })
    wx.setStorageSync('user_gender', user_gender)
  },

  //点击按钮指定的hiddenmodalput弹出框  
  modalinput_buyin: function (e) {
    var that = this
    var sku_index = e.currentTarget.dataset.skuIndex
    var order_index = e.currentTarget.dataset.orderIndex
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_skuid = e.currentTarget.dataset.goodsSkuid
    var order_skuid = e.currentTarget.dataset.skuId
    var sku_price = e.currentTarget.dataset.orderSkuPrice;
    var sku_num = e.currentTarget.dataset.orderSkuNum;
    var buyin_rate = that.data.buyin_rate
    var buyin_price = (sku_price * sku_num * buyin_rate/100).toFixed(2)
    console.log('order_index:' + order_index, ' sku_index:', sku_index)
    that.setData({
        hiddenmodalput: !that.data.hiddenmodalput,
        goods_id: goods_id,
        goods_skuid: goods_skuid,
        order_skuid: order_skuid,
        buyin_price: buyin_price,
        order_index: order_index,
        sku_index: sku_index,
    })

  },
  //取消按钮  
  cancel_buyin: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },
  //确认  
  confirm_buyin: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
    that.buyin()
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag = that.data.giftflag;
    if (tab == 'send') {
      giftflag = 0;
    } else {
      giftflag = 1; //receive
    }
    
    that.setData({
      activeIndex2: index,
      tab2: tab,
      orders: [],
      orders_show: [],
      orders_prev:[],
      orders_next:[],
      loadingHidden: true,
      hiddenmore: true,
      giftflag: giftflag,
      all_rows:0,
      page:0,
      page_num:1,
    })
    console.log('tab:' + tab, ' giftflag:', giftflag)
    that.reloadData()
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true,
        hidddensearch:false
      })
    } else {
      this.setData({
        floorstatus: false,
        hidddensearch: true,
      })
    }
    this.setData({
      current_scrollTop: e.detail.scrollTop
    })
  
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    var that = this
    that.setData({
      scrollTop: 0,
    })
    console.log('goTop:',that.data.scrollTop)
    that.getPrevOrdersTapTag()
  },

  getMoreOrdersTapTag: function () {
    var that = this
    if(that.data.is_loading) return
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows
    if (page + 1 > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
        duration: 1500
      })
      that.setData({
        hiddenmore: true,
      })
      return
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 2000
    })
    that.setData({
      page: page+1,
    })
    console.log('get More Orders page:',page,'current scrollTop:',that.data.current_scrollTop)
    that.reloadData()
  },

  sendAginTapTag: function (e) {
    var that = this;
    var username = wx.getStorageSync('username')
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.navigateTo({
       url: '../list/list?username=' + username + '&token=' + token
    })
  },
  send: function (e) {
    var that = this
    var page = that.data.page
    var order_no = e.currentTarget.dataset.objectId
    var index = e.currentTarget.dataset.index
    var orders = that.data.orders
    var index = 0
    var order_send=[]
    for (var i = 0; i < orders.length;i++){
      if (orders[i]['order_no'] == order_no){
        index = i
        order_send.push(orders[i])
        break
      }
    }
    if (order_send[0]['shape'] == 4 || order_send[0]['shape'] == 5){
      wx.navigateTo({
        url: '/pages/wish/wishshare/wishshare?share_order_id=' + order_send[0]['id'] + '&share_order_shape=' + order_send[0]['shape'] + '&share_order_note=' + order_send[0]['rcv_note'] + '&share_order_bg=' + order_send[0]['order_sku'][0]['sku_image'] + '&share_order_image=' + order_send[0]['order_sku'][0]['sku_share_image']
      })
      console.log('贺卡请柬互动卡 送出 order no:', order_no, 'order_send:', order_send)
    }else{
      console.log('送出 order no:', order_no, ' order info:', order_send, 'index:', index)
      wx.navigateTo({
        url: '../order/send/send?order_no=' + order_no + '&orders=' + JSON.stringify(order_send)
      })
    }
   
  },
  sendOtherTapTag: function (e) {
    var that = this
    var page = that.data.page
    var order_no = e.currentTarget.dataset.orderNo
    //var index = e.currentTarget.dataset.index
    var orders = that.data.orders
    var index = 0
    var order_send = []
    for (var i = 0; i < orders.length; i++) {
      if (orders[i]['order_no'] == order_no) {
        index = i
        order_send.push(orders[i])
        break
      }
    }
    wx.navigateTo({
      url: '../order/transfer/transfer?receive=-1&order_no=' + order_no + '&orders=' + JSON.stringify(order_send)
    })
  },
  refundTapTag: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.orderNo
    var index = e.currentTarget.dataset.index
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var shop_type = that.data.shop_type

    //提交退款申请
    wx.request({
      url: weburl + '/api/client/refund',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        if (res.data.status!='y') {
          wx.showToast({
            title: res.data.info ? res.data.info:'退款申请失败',
            icon: 'loading',
            duration: 1500
          })
          
        } else {
          wx.showToast({
            title: '退款申请完成',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })

  },
  detailTapTag: function (e) {
    var that = this;
    var order_object = e.currentTarget.dataset.orderObject
    var order_id = order_object['id']
    var card_type = that.data.card_type ? that.data.card_type:0
    var tab2 = that.data.tab2
    
    console.log('index detail 订单ID:' + order_id)
    wx.navigateTo({
      url: '../order/orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object) + '&giftflag=' + that.data.giftflag + '&card_type=' + card_type + '&send_rcv=' + tab2  
    });
  },

  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    console.log('index get_project_gift_para navList2:', navList_new)
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
          }else{
            wx.setStorageSync('navList2', navList_new)
            that.setData({
              navList2: navList_new,
              buyin_rate: navList_new[7]['value'] ? navList_new[7]['value'] : buyin_rate,
            })
          }
        }
      })
    }else{
      that.setData({
        navList2: navList_new,
        buyin_rate: navList_new ? navList_new[7]['value'] : buyin_rate,
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
    var status = parseInt(options.status ? options.status:0)
    var username = wx.getStorageSync('username')
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    
    that.get_project_gift_para()
    //that.reloadData()
    // 存为全局变量，控制支付按钮是否显示
    if (status) {
      that.setData({
        status: status,
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight,
          //scrollTop: that.data.scrollTop + 10
        })
      }
    })
   
  },
  onShow: function () {
    var that = this
     var username = wx.getStorageSync('username')
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
    var modalHiddenPhone = that.data.modalHiddenPhone
    var modalHiddenUserName = that.data.modalHiddenUserName
    var userInfo = wx.getStorageSync('userInfo') 
    console.log('index onShow() userInfo:', userInfo)
    if (!username || !userInfo) {//登录
      /*
       wx.switchTab({
         url: '/pages/my/index'
       })
       */
      wx.navigateTo({
        url: '/pages/login/login?frompage=/pages/index/index'
      })
      return
    }
    if (!user_phone || user_phone == '') { //必须获取手机号
      modalHiddenPhone = !modalHiddenPhone
      that.setData({
        modalHiddenPhone: modalHiddenPhone,
      })
    } else if (!user_name || user_name == '') {
      modalHiddenUserName = !modalHiddenUserName
      that.setData({
        modalHiddenUserName: modalHiddenUserName,
      })
    } else {
      that.reloadData()
    }
  },

  reloadData: function () {
    var that = this
    var scrollTop = that.data.scrollTop //保留当前位置
    var current_scrollTop = that.data.current_scrollTop ? that.data.current_scrollTop:0//保留当前位置
    var order_type = that.data.tab2
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var status = that.data.status
    var shop_type = that.data.shop_type
    var page = that.data.page //从服务器获取页面序号
    var show_max = that.data.show_max
    var orders_prev = that.data.orders_prev
    var orders_next = that.data.orders_next
    var pagesize = that.data.pagesize
    var now = new Date().getTime()
    var currenttime = now ? parseInt(now / 1000) : 0
    var tips = "查看第" + (page==0?1:page) + "页"
    var hidddensearch = that.data.hidddensearch
    var keyword = hidddensearch?'':that.data.keyword
    var userInfo = wx.getStorageSync('userInfo') 
    console.log('reloadData userInfo:' , userInfo)
    if (!username || !userInfo) {//登录
      /*
        wx.switchTab({
          url: '/pages/my/index'
        })
        */
      wx.navigateTo({
        url: '/pages/login/login?frompage=/pages/index/index'
      })
      return
    }
    that.setData({
      is_loading:true,
    })
    //wx.showLoading({
      //title: tips,
    //})
    var page_show = orders_next.length 
    var orders_show = [] 
   
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username ? username:openid,
        access_token: token,
        status: status,
        shop_type:shop_type,
        openid:openid,
        order_type: order_type,
        keyword: keyword,
        page: page,
        pagesize:pagesize
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows
        if (!res.data.result && page==1) {
          wx.showToast({
            title:"空空如也,快去送礼吧！",
            icon: 'none',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 500)
          that.setData({
            orders: [],
            orders_show: [],
            all_rows: 0,
            hiddenmore:true,
          })
        } else {
          // 存储地址字段
          var orders = that.data.orders
          if (orderObjects){
            for (var i = 0; i < orderObjects.length; i++) {
              if (orderObjects[i]['logo'].indexOf("http") < 0) {
                orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
              }
              if (orderObjects[i]['order_sku']){
                for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                  if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                    orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
                  }
                  orderObjects[i]['order_sku_num'] = orderObjects[i]['order_sku'] ? orderObjects[i]['order_sku'].length : 1
                }
              }
              var duetime = orderObjects[i]['duetime'] - currenttime
              orderObjects[i]['hour'] = parseInt(duetime / 3600)
              orderObjects[i]['minus'] = parseInt((duetime - orderObjects[i]['hour'] * 3600) / 60)
              orderObjects[i]['sec'] = duetime - orderObjects[i]['hour'] * 3600 - orderObjects[i]['minus'] * 60
              //orders.push(orderObjects[i])
             
              if ((orderObjects[i]['shape'] == 5 || orderObjects[i]['shape'] == 4) && orderObjects[i]['m_desc']) {
                var m_desc = JSON.parse(orderObjects[i]['m_desc'])
                var card_register_info = m_desc['card_register_info'] ? m_desc['card_register_info'] : ''
                var card_name_info = m_desc['card_name_info'] ? m_desc['card_name_info'] : ''
                var card_love_info = m_desc['card_love_info'] ? m_desc['card_love_info'] : ''
                var card_cele_info = m_desc['card_cele_info'] ? m_desc['card_cele_info'] : ''
                var card_template = m_desc['card_template'] ? m_desc['card_template'] : ''
                var card_type = m_desc['card_register_info'] ? 1 : 0
                card_type = m_desc['card_template'] ? m_desc['card_template'][0]['type'] : card_type    
                orderObjects[i]['card_type']  = card_type
                orderObjects[i]['card_name_info'] = card_name_info
                orderObjects[i]['card_love_info'] = card_love_info
                orderObjects[i]['card_cele_info'] = card_cele_info
                orderObjects[i]['card_register_info'] = card_register_info
              }
            }
            //if (page > 1 && orderObjects) {
              //向后合拼
            //}
            orders = orders.concat(orderObjects)
            var gift_send = that.data.gift_send
            var gift_rcv = that.data.gift_rcv
            var page_num = that.data.page_num
            page_num = (all_rows / pagesize + 0.5)
            if (order_type == 'send') {
              gift_send = all_rows
            } else {
              gift_rcv = all_rows
            }
            //更新当前显示页信息
            if(orders_show.length<show_max){
              orders_show.push(orderObjects)
              page_show =  page_show +1
            }else{
              orders_prev.push(orders_show.shift())
              orders_show.push(orderObjects)
              page_show = show_max
            }
            
            that.setData({
              orders: orders,
              ["orders_show[" + (page_show-1) + "]"]: orderObjects,
              all_rows: all_rows,
              gift_send: gift_send,
              gift_rcv: gift_rcv,
              page_num: page_num.toFixed(0),
             
            },function(){
              that.setData({
                hiddenmore: false,
                scrollTop: 0,
                is_loading: false,
                loadingHidden: false,
              })
              wx.hideLoading()
              wx.pageScrollTo({
                scrollTop: 0
              })
            })
          
            console.log('reloadData page:' + page + ' pagesize:' + pagesize, ' current time:', currenttime, 'current scrollTop', scrollTop, ' orders', that.data.orders)
          }
          if (order_type=='send'){
            setTimeout(function () {
              that.duetime_update()
            }, 500)
          }
        }
      }
    })
  },
  duetime_update: function () {
    var that = this
    var page = that.data.page
    var now = new Date().getTime()
    var currenttime = now ? parseInt(now / 1000) : 0
    if (!that.data.orders_show[page-1]) return
    var orderObjects = that.data.orders_show[page-1]
    //console.log('duetime page:',page,' orders[page]',that.data.orders[page-1])
    for (var i = 0; i < orderObjects.length; i++) {
      var duetime = orderObjects[i]['duetime'] - currenttime
      orderObjects[i]['hour'] = parseInt(duetime / 3600)
      orderObjects[i]['minus'] = parseInt((duetime - orderObjects[i]['hour'] * 3600) / 60)
      orderObjects[i]['sec'] = duetime - orderObjects[i]['hour'] * 3600 - orderObjects[i]['minus'] * 60
    }
    that.setData({
     // orders: orderObjects,
      ["orders_show[" + (page - 1) + "]"]: orderObjects,
    })
    setTimeout(function () {
      that.duetime_update()
    }, 500);
  },

  buyin: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = that.data.goods_id //e.currentTarget.dataset.goodsId
    var goods_skuid = that.data.goods_skuid //e.currentTarget.dataset.goodsSkuid
    var order_skuid = that.data.order_skuid //e.currentTarget.dataset.skuId
    var shop_type = that.data.shop_type
    var order_index = that.data.order_index
    var sku_index = that.data.sku_index
    console.log('礼物回收 goods_id:', goods_id, 'goods skuid:', goods_skuid, 'order skuid:', order_skuid, ' order_index:', order_index)
    //礼物折现
    wx.request({
      url: weburl + '/api/client/buyin',
      method: 'POST',
      data: {
        username: username,
        m_id: m_id,
        access_token: token,
        order_skuid: order_skuid,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        if (res.data.status != 'y') {
          wx.showToast({
            title: res.data.info ? res.data.info : '回收失败',
            icon: 'loading',
            duration: 1500
          })

        } else {
          wx.showToast({
            title: '回收完成',
            icon: 'success',
            duration: 1500
          })
          var orders = that.data.orders_show[page-1]
          orders[order_index]['order_sku'][sku_index]['status'] = 1
          that.setData({
            //orders: orders,
            ["orders_show[" + (page - 1) + "]"]: orders,
          })
        }
      }
    })
  },
  comment: function (e) {
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_skuid = e.currentTarget.dataset.goodsSkuid;
    var order_skuid = e.currentTarget.dataset.skuId;
    console.log('礼物评价 goods_id:', goods_id, 'goods skuid:', goods_skuid, 'order skuid:', order_skuid);

    wx.navigateTo({
      url: '../goods/comment/comment?goods_id=' + goods_id + '&goods_skuid=' + goods_skuid + '&order_skuid=' + order_skuid
    });
  },
  accept: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.objectId
    var totalFee = e.currentTarget.dataset.totalFee
    var order_id = e.currentTarget.dataset.orderId
    var orders = that.data.orders
    var order_accept = []
    console.log('接受礼物order_no:', order_no);
    var index  = 0 
    for (var i = 0; i < orders.length; i++) {
      if (orders[i]['order_no'] == order_no) {
        index = i
        order_accept.push(orders[i])
        break
      }
    }
    wx.navigateTo({
      url: '../order/receive/receive?order_no=' + order_no + '&order_id=' + order_id + '&receive=1' + '&order_shape=' + order_accept[0]['shape'] + '&goods_flag=0'
    });
  },
  pay: function (e) {
    var order_no = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('pay order_no:',order_no);
  
    wx.navigateTo({
      url: '../order/payment/payment?orderNo=' + order_no + '&totalFee=' + totalFee + '&received=1'
    })
  },
  cancel_order: function (e) {
    var that = this
    var page = that.data.page
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_no = e.currentTarget.dataset.objectId;
    var order_index = e.currentTarget.dataset.index;
    var shop_type = that.data.shop_type
    wx.showModal({
      title: '请确认',
      content: '确认要取消吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: weburl + '/api/client/update_order_status',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              order_no: order_no,
              status_info: 'cancel',
              shop_type: shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              console.log(res.data.info);
              if (!res.data.info) {
                wx.showToast({
                  title: '取消完成',
                  icon: 'success',
                  duration: 1000
                })
                var orders = that.data.orders[page -1]
                orders[order_index]['status'] = 8  // 8 订单取消
                that.setData({
                  //orders: orders,
                  ["orders[" + (page - 1) + "]"]: orders,
                })

              } else {
                wx.showToast({
                  title: res.data.info,
                  icon: 'loading',
                  duration: 1500,

                });
              }

            }
          })

        }
      }
    })
  },
  receive: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var shop_type = that.data.shop_type
    wx.showModal({
      title: '请确认',
      content: '确认要收货吗',
      success: function (res) {
        if (res.confirm) {
          var objectId = e.currentTarget.dataset.objectId;
          wx.request({
            url: weburl + '/api/client/order_confirm',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              id: objectId,
              shop_type:shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              console.log(res.data.info);
              if (!res.data.info) {
                wx.showToast({
                  title: '确认收货完成',
                  icon: 'success',
                  duration: 1000
                });
              } else {
                wx.showToast({
                  title: res.data.info,
                  icon: 'loading',
                  duration: 1500,

                });
              }

            }
          })

        }
      }
    })
  },
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    wx.navigateTo({
      url: '../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
  },

  getPrevOrdersTapTag() {
    var that = this 
    var page = that.data.page
    var last_page = page - 1 > 0 ? page - 1 : 1
    var is_loading = that.data.is_loading
    console.log('getPrevOrdersTapTag:下拉刷新 page:', page, ' is loading:', is_loading, ' last_page:',last_page,'current scrollTop:', that.data.current_scrollTop)
    if (page == 1 || is_loading){
      return
    }
    that.setData({
      page: last_page,
    })
    that.reloadData()
  },

  onReady: function () {
    
  },
});