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
    friends: [],
    friends_show: [],
    friends_latest: [],
    friends_next: [],
    colors: [],
    keyword: '',
    user_name:'',
    shop_type:shop_type,
    page: 1,
    pagesize: 10,
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
    toViewX:0,
    toViewY:0,
    scrollLeft:0,
  },
  
  goBack: function () {
    wx.switchTab({
      url: '../hall/hall'
    })
  },

  orderSearch: function () {
    var that = this
    console.log('orderSearch keyword:', that.data.keyword)
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

  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var rpage_num = that.data.rpage_num
    var is_reloading = that.data.is_reloading
    console.log('getMoreGoodsTapTag 加载更多中，请稍等 page:', page, 'is_reloading:', is_reloading, that.data.scrollHeight)
    if (is_reloading) {

      return
    }
    if (page > rpage_num) {
      wx.showToast({
        title: '已经到底了~',
        icon: 'none',
        duration: 1000
      })

      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了~'
      })
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
      }, 1000)
      return
    }
    /*
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 500
    })
    */
    that.setData({
      page: page,
      loadingHidden: false,
      loading_note: '加载中'
    })
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
    }else{
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 2000
      })
      that.setData({
        page: page + 1,
      })
      console.log('get More Orders page:', page, 'current scrollTop:', that.data.current_scrollTop)
      that.reloadData()
    }
  
  },
  friendinfo: function (e) {
    var that = this;
    var friends = that.data.friends
    var index = e.currentTarget.dataset.friendinfo

    wx.navigateTo({
      url: '/pages/member/friendinfo/friendinfo?friendinfo=' + JSON.stringify(friends[index])
    })
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

  //定位数据
  getleft: function (e) {
    var that = this;
    var scrollLeft = that.data.scrollLeft
    that.setData({
      scrollLeft: scrollLeft + 10,
    })
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this
    var status = parseInt(options.status ? options.status:0)
    var username = wx.getStorageSync('username')
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    //that.query_friends()
    that.get_project_gift_para()
    that.reloadData()
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
        })
      }
    })
   
  },
  onShow: function () {
    var that = this
    var friends_show = that.data.friends_show
    var username = wx.getStorageSync('username')
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
    var modalHiddenPhone = that.data.modalHiddenPhone
    var modalHiddenUserName = that.data.modalHiddenUserName
    var userInfo = wx.getStorageSync('userInfo') 
    console.log('index onShow() userInfo:', userInfo)
    if (!username || !userInfo) {//登录
      wx.navigateTo({
        url: '/pages/login/login?frompage=/pages/index/index'
      })
      return
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
    var page_num = that.data.page_num //从服务器获取页面数
    var show_max = that.data.show_max
    var friends_latest = []
    var friends_next = that.data.friends_next
    var pagesize = that.data.pagesize
    var now = new Date().getTime()
    var currenttime = now ? parseInt(now / 1000) : 0
    var tips = "查看第" + (page==0?1:page) + "页"
    var hidddensearch = that.data.hidddensearch
    var keyword = hidddensearch?'':that.data.keyword
    var userInfo = wx.getStorageSync('userInfo') 
    console.log('reloadData userInfo:', userInfo, ' keyword:', keyword)
    if (!username || !userInfo) {//登录
      wx.navigateTo({
        url: '/pages/login/login?frompage=/pages/index/index'
      })
      return
    }
    if (page > page_num && page_num>0) return
    that.setData({
      is_loading:true,
    })
    //wx.showLoading({
      //title: tips,
    //})
    var page_show = friends_next.length 
    var friends_show = that.data.friends_show
   
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/get_member_friends',
      method: 'POST',
      data: {
        username: username ? username:openid,
        access_token: token,
        status: status,
        shop_type:shop_type,
        type: 3,  // 3送心礼物好友
        keyword: keyword,
        page: page > page_num ? page_num:page,
        pagesize:pagesize
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var friends_list = res.data.result;
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
            friends: [],
            friends_show: [],
            all_rows: 0,
            hiddenmore:true,
          })
        } else {
          if (friends_list) {
            for (var i = 0; i < friends_list.length; i++) {
              if (friends_list[i]['wx_headimg'].indexOf("http") < 0) {
                friends_list[i]['wx_headimg'] = weburl + '/' + friends_list[i]['wx_headimg'];
              }
              if(i<10){
                friends_latest = friends_latest.concat(friends_list[i])
              }
            }
          } 
          
          var page_num = that.data.page_num
          page_num = (all_rows / pagesize + 0.5)
          var friends = that.data.friends
          friends = friends.concat(friends_list)
          that.setData({
            friends: friends,
            ["friends_show[" + (page < 1 ? 0 : page - 1) + "]"]: friends_list,
            friends_latest: friends_latest,
            all_rows: all_rows,
            page_num: page_num.toFixed(0),

          }, function () {
            that.setData({
              hiddenmore: false,
              is_loading: false,
              loadingHidden: false,
            })
          })

          console.log('送心礼物好友 hall reloadData friends:', that.data.friends);
        }
      }
    })
  },

  onReady: function () {
    
  },
});