var util = require('../../../utils/util.js');

//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var navList2 = [
  { id: "default", title: "最新" },
  { id: "hot", title: "人气" },
  { id: "price", title: "价格" },
];

Page({
  data: {
    title_name: '搜索商品',
    title_logo: '../../../images/footer-icon-05.png',
    img_discount: '../../../images/discount.png',
    default_img: weburl + '/uploads/default_goods_image.png',
    activeIndex: 0,
    activeIndex2: 0,
    navList2: navList2,
    images: [],
    all_rows: 0,
    venuesItems: [],
    hidddensearch: false,
    search_goodsname: null,
    keyword: '',
    satisfy:true,
    is_satiify:0,
    page: 1,
    pagesize: 20,
    pageoffset:0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: true, // loading
    is_loading:false,
    msgList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    tab: 'is_recommend',
    tab_value: "1",
    tab2: 'default',
    updown: 0,     //升序 降序
    shop_type: shop_type,  //商家类型 1普通
    scrollLeft: 0,
    toView: 0,
    shop_type: shop_type,
    inputShowed: true,  // 搜索框值

  },

  satisfyTagTap: function (e) {
    var that = this
    var satisfy = e.currentTarget.dataset.satisfy
    that.setData({
      satisfy: satisfy,
      is_satisfy: satisfy?1:2,
    })

  },
 
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
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
  },

  touchStart(e) {
    var that = this
    // console.log(e)
    that.setData({
      "startX": e.changedTouches[0].clientX,
      "startY": e.changedTouches[0].clientY
    })
  },
  touchEnd(e) {
    var that = this
    let endX = e.changedTouches[0].clientX
    let endY = e.changedTouches[0].clientY
    let direction = util.getTouchData(endX, endY, that.data.startX, that.data.startY)
    var toView = that.data.toView
    if (direction == 'right') {
      if (that.data.toView < that.data.navList.length) {
        toView--
      }
    } else if (direction == 'left') {
      if (that.data.toView > 0) {
        toView++
      }
    } else {
      //that.scrolltoupper(e)
    }
    that.setData({
      toView: toView,
    })
  },

  // 点击获取对应分类的数据
  onTapTag: function (e) {
    var that = this;
    //var tab = e.currentTarget.id;
    var tab = e.currentTarget.dataset.id;
    var tab_value = e.currentTarget.dataset.value;
    var index = e.currentTarget.dataset.index;
    var search_goodsname = e.currentTarget.dataset.title;
    var navList = that.data.navList;
    var toView = index
    if (index > 2 && index < navList.length) {
      toView = index - 2
    } else {
      toView = 0
    }

    if (tab != 'search_goodsname') {
      search_goodsname = '';
    }

    that.setData({
      activeIndex: index,
      tab: tab,
      tab_value: tab_value,
      page: 1,
      search_goodsname: search_goodsname,
      toView: toView ? toView : 0,
      scrollTop: 0,
    })
    console.log('toView:' + that.data.toView)
    that.get_goods_list()
  },
  onTapTag2: function (e) {
    var that = this;
    var id = e.currentTarget.id
    var tab = e.currentTarget.dataset.tabid
    var index = e.currentTarget.dataset.index
    var updown = that.data.updown == 1 ? 0 : 1
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      updown: updown,
      venuesItems: [],
    })
    that.get_goods_list()
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    var that = this
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      })
      if (that.data.platform == 'ios') {
        //that.getMoreGoodsTapTag() //苹果手机渲染更快，多给记录
        //console.log('list scrolltoupper():', e.detail.scrollTop,that.data.platform)
      }
    } else {
      this.setData({
        floorstatus: false
      })
    }
    //console.log('list scrolltoupper():', e.detail.scrollTop)
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    var that = this
    that.setData({
      scrollTop: 0
    })
  },
  clearInput: function (e) {
    var that = this
    that.setData({
      keyword: '',
    })
  },

  searchTapTag: function (e) {
    var that = this
    console.log('搜索关键字：' + that.data.keyword)
    that.setData({
      page: 1,
    })
    that.get_goods_list()
  },

  search_goodsnameTapTag: function (e) {
    var that = this;
    var keyword = e.detail.value
    that.setData({
      keyword: keyword
    })
  },
  
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows
    var is_loading = that.data.is_loading
    if(is_loading) return
    if (page > all_rows) {
      /*
      wx.showToast({
        title: '已经到底了~',
        icon: 'none',
        duration: 1000
      })
      */
      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了'
      })
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
      }, 1000)
      return
    }
    
    that.setData({
      page: page,
    });
    that.get_goods_list()
  },

  onLoad: function (options) {
    console.log('onLoad', options)
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var middle_title = options.middle_title ? options.middle_title : '特色礼物'
    var navlist_toView = options.navlist ? options.navlist : 0
    var goods_type_value = options.goods_type_value ? options.goods_type_value:0
    var goods_type = 'goods_middle_search'
    var hidddensearch = options.search==1?false:true
    var live_goods = options.live_goods ? options.live_goods:''
    middle_title = options.search == 1 ? '搜索商品' : middle_title
     
    //自定义头部方法
     that.setData({
      navH: app.globalData.navHeight,
      startBarHeight:0,//app.globalData.navHeight,
      startBarHeight2:0,//app.globalData.navHeight
    });

    that.setData({
      username: username,
      token: token,
      navlist_toView: navlist_toView,
      goods_type: goods_type,
      goods_type_value: goods_type_value,
      hidddensearch: hidddensearch,
      live_goods: live_goods,
    })

    wx.setNavigationBarTitle({
      title: middle_title
    })
    
    /*
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          platform: res.platform,
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
        })
      }
    })
    if(hidddensearch) that.get_goods_list()
  },
  onShow: function () {
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '/images/back.png'
      })
    }

  },

  gotoAITagTap: function (e) {
    var that = this
    app.globalData.messageflag =2
    wx.switchTab({
      url: '/pages/member/message/message'
    })

  },
  /*
  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字:', that.data.keyword, that.data.search_goodsname, that.data.defaultkeyword)
    that.get_goods_list()
  },
*/
  get_goods_list: function (event) {
    //venuesList
    var that = this;
    var page = that.data.page
    var pagesize = that.data.pagesize
    var pageoffset = that.data.pageoffset
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_type = that.data.goods_type;
    var goods_type_value = that.data.goods_type_value;
    var goods_sales = that.data.tab2;
    var updown = that.data.updown;
    var search_goodsname = that.data.search_goodsname;
    var keyword = that.data.keyword;
    var shop_type = that.data.shop_type
    var shape = 1
    var live_goods = that.data.live_goods  //视频推广商品
    if (!search_goodsname && !keyword && !goods_type_value && !live_goods){
      wx.showToast({
        title: '暂时没有搜到您要的商品',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    that.setData({
      loadingHidden: false,
      is_loading:true,
    })
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        goods_type: goods_type,
        goods_type_value: goods_type_value,
        live_goods: live_goods,
        username: username,
        access_token: token,
        page: page,
        pagesize: pagesize,
        pageoffset: pageoffset,
        search_goodsname: search_goodsname,
        goods_sales: goods_sales,
        updown: updown,
        keyword: keyword,
        shop_type: shop_type,
        shape: shape
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('get_goods_list:', res.data)
        var venuesItems = res.data.result
        var page = that.data.page
        var all_rows = res.data.all_rows
        var pageoffset = res.data.pageoffset
        if (!venuesItems) {
          wx.showToast({
            title: '暂时没有搜到您要的商品',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            loadingHidden: true,
            is_loading: false,
            venuesItems: [],
            all_rows: 0,
            //keyword: ''
          })
          return
        }
      
        for (var i = 0; i < venuesItems.length; i++) {
          venuesItems[i]['short_name'] = venuesItems[i]['name'].substring(0, 10) + '...'
          if (!venuesItems[i]['act_info']) {
            venuesItems[i]['act_info'] = ''
          } else {
            //venuesItems[i]['act_info'] = venuesItems[i]['act_info'].substring(0, 10) + '...'
          }
          if (!venuesItems[i]['goods_tag']) {
            venuesItems[i]['goods_tag'] = ''
          } else {
            venuesItems[i]['goods_tag'] = venuesItems[i]['goods_tag'].substring(0, 10)
          }
          venuesItems[i]['image'] = venuesItems[i]['activity_image'] ? venuesItems[i]['activity_image'] : venuesItems[i]['image']
        }
        if (page > 1 && venuesItems) {
          //向后合拼
          venuesItems = that.data.venuesItems.concat(venuesItems);
        }
        that.setData({
          venuesItems: venuesItems,
          all_rows: all_rows,
          pageoffset:pageoffset,
          loadingHidden: true,
          is_loading: false,
          //keyword: ''
        })
      }
    })
  },
  get_menubar: function (event) { //获取菜单项
    var that = this
    var navlist_toView = that.data.navlist_toView
    wx.request({
      url: weburl + '/api/client/get_menubar',
      method: 'POST',
      data: {
        menu_type: 1,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('get_menubar:', res.data.result)
        var navList_new = res.data.result;
        if (!navList_new) {
          wx.showToast({
            title: '没有菜单项',
            icon: 'loading',
            duration: 1500
          });
          return;
        }
        that.setData({
          navList: navList_new,
          index: navlist_toView,
          activeIndex: navlist_toView,
          tab: navList_new[navlist_toView]['id'],
          tab_value: navList_new[navlist_toView]['value'],
        })
        that.get_goods_list()
        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '黑贝会',
      desc: '开启礼物电商时代，200万人都在用的礼物小程序！',
      path: '/pages/list/list?refername=' + username
    }
  }
})
