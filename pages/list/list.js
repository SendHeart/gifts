import defaultData from '../../data';
var util = require('../../utils/util.js');

//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var navList = [
  { id: "is_recommend", title: "推荐"  ,value:"1"},
]
var navList2 = [
  { id: "default", title: "最新" },
  { id: "hot", title: "人气" },
  { id: "price", title: "价格" },
];

Page({
  data: {
    title_name: '商城首页',
    title_logo: '../../images/footer-icon-05.png',
    img_discount:'../../images/discount.png',
    activeIndex: 0,
    activeIndex2: 0,
    navList: navList,
    navList2: navList2,
    images: [],
    all_rows:0,
    venuesItems: [],
    venuesItems_show:[],
    venuesItems_prev: [],
    venuesItems_next: [],
    show_max:1,
    search_goodsname: null,
    keyword:'',
    page: 1,
    pagesize: 10,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: true, // loading
    is_goodslist_loading:false,
    msgList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    tab: 'is_recommend',
    tab_value:"1",
    tab2: 'default',
    updown: 0,     //升序 降序
    shop_type:shop_type,  //商家类型 1普通
    scrollLeft: 0,
    toView:0,
    hiddenallclassify: true,
    shop_type:shop_type,
    animationData: "",
  },
  //定位数据  
  getleft: function (e) {
    var that = this
    that.setData({
      scrollLeft: that.data.scrollLeft + 10
    })
  },
  // 打开全部子分类
  openAllTapTag: function (e) {
    var that = this
    var hiddenallclassify = that.data.hiddenallclassify
    that.setData({
      hiddenallclassify: !hiddenallclassify,
      
    })
    
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
    if (direction=='right'){
      if (that.data.toView < that.data.navList.length) {
        toView--
      }  
    }else if (direction == 'left'){
      if (that.data.toView > 0) {
        toView++
      } 
    }else{
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
    var navList = that.data.navList ;
    var toView = index;
    var hiddenallclassify = that.data.hiddenallclassify;
    if (index > 2 && index < navList.length) {
      toView = index - 2
    } else {
      toView = 0
    }
    if (tab!='search_goodsname'){
      search_goodsname = '';
    }
    
    that.setData({
      activeIndex: index,
      tab: tab,
      tab_value: tab_value,
      page: 1,
      search_goodsname: search_goodsname,
      toView: toView ? toView : 0,
      scrollTop:0,
      venuesItems_show: [],
      venuesItems_prev: [],
      venuesItems_next: [],
    })
    console.log('toView:' + that.data.toView)
    that.get_goods_list()
    if (hiddenallclassify==false) {
      that.openAllTapTag()
    }
    console.log(hiddenallclassify)
    
  },
  onTapTag2: function (e) {
    var that = this;
    var id = e.currentTarget.id
    var tab = e.currentTarget.dataset.tabid
    var index = e.currentTarget.dataset.index
    var updown = that.data.updown==1?0:1 
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      updown:updown,
      venuesItems_show: [],
      venuesItems_prev: [],
      venuesItems_next: [],
    });
 
    that.get_goods_list()
  },

// 获取滚动条当前位置
  scrolltoupper:function(e){
    //console.log('scrollTop:', e.detail.scrollTop)
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      })
    }
  },
 
  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    var that = this
    that.setData({
      scrollTop: 0
    })
  },
  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.setData({
      venuesItems_show: [],
      venuesItems_prev: [],
      venuesItems_next: [],
    })
    that.get_goods_list()
  },
  
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows;
    if (page > all_rows){
      wx.showToast({
        title: '已经到底了~',
        icon: 'none',
        duration: 1000
      });
      return
    }

    that.setData({
      page: page,
    });
    that.get_goods_list()
  },

  onLoad: function (options) {
    console.log('onLoad',options)
    var that = this
    var username = options.username ? options.username : wx.getStorageSync('username')
    var token = options.token ? options.token : wx.getStorageSync('token')
    var navlist_toView = options.navlist ? options.navlist:0
    var navlist_title = options.navlist_title ? options.navlist_title : ''

    that.setData({
      username: username,
      token: token,
      navlist_toView: navlist_toView,
      navlist_title: navlist_title,
    })
    //that.setNavigation()
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
         
        })
      }
    })
    
    that.get_menubar()
  },
  onShow:function(){
    var that=this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }  
    
  },
  search_goodsnameTapTag: function (e) {
    var that = this;
    var keyword = e.detail.value;
    that.setData({
      keyword: keyword
    })

  },
  
  get_goods_list: function (event) {
    //venuesList
    var that = this;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    var username = that.data.username ;
    var token = that.data.token;
    var goods_type = that.data.tab;
    var goods_type_value = that.data.tab_value;
    var goods_sales = that.data.tab2;
    var updown = that.data.updown;
    var search_goodsname = that.data.search_goodsname;
    var keyword=that.data.keyword;
    var shop_type=that.data.shop_type
    var shape = 1
    var show_max = that.data.show_max
    var venuesItems_prev = that.data.venuesItems_prev
    var venuesItems_next = that.data.venuesItems_next
    var venuesItems_show = that.data.venuesItems_show 
    if(that.data.is_goodslist_loading){
      setTimeout(function () {
        that.get_goods_list()
      }, 300)
    }
    var venuesItems_new = []
    if (venuesItems_next.length > 0) {
      if (venuesItems_show.length >= show_max) {
        venuesItems_prev.push(venuesItems_show.shift())
      }
      venuesItems_new = venuesItems_next.pop()
      that.setData({
        ["venuesItems_show[" + (page - 1) + "]"]: venuesItems_new,
        venuesItems_prev: venuesItems_prev,
        venuesItems_next: venuesItems_next,
        scrollTop: 0,
        page: page+1,
      })
    } 
    if (venuesItems_next.length > 0) {
      return
    }
    that.setData({
      is_goodslist_loading: true,
    })
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: { 
        goods_type: goods_type, 
        goods_type_value: goods_type_value, 
        username: username, 
        access_token: token, 
        page: page, 
        pagesize: pagesize,
        search_goodsname: search_goodsname,
        goods_sales:goods_sales,
        updown:updown,
        keyword:keyword,
        shop_type:shop_type,
        shape:shape
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('get_goods_list:',res.data.result)
        var venuesItems_update = res.data.result
        var page = that.data.page;
        var all_rows = res.data.all_rows;
        if (!venuesItems_new) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
            venuesItems: [],
            all_rows: 0,
            keyword: ''
          })
          return;
        }
        var venuesItems = that.data.venuesItems
        var venuesItems_cache = []
        if (venuesItems_update){
          for (var i = 0; i < venuesItems_update.length; i++) {
            venuesItems_update[i]['short_name'] = venuesItems_update[i]['name'].substring(0, 10) + '...'
            if (!venuesItems_update[i]['act_info']) {
              venuesItems_update[i]['act_info'] = ''
            } else {
              //venuesItems_update[i]['act_info'] = venuesItems_update[i]['act_info'].substring(0, 10) + '...'
            }
            if (!venuesItems_update[i]['goods_tag']) {
              venuesItems_update[i]['goods_tag'] = ''
            } else {
              venuesItems_update[i]['goods_tag'] = venuesItems_update[i]['goods_tag'].substring(0, 10)
            }
            if (i < pagesize) {
              venuesItems_new.push(venuesItems_update[i])
            } else {
              venuesItems_cache.push(venuesItems_update[i])
            }
          }
          if (page > 1 && venuesItems_new) {
            //向后合拼
            venuesItems = that.data.venuesItems.concat(venuesItems_new);
          }
          //更新当前显示页信息
          if (venuesItems_show.length < show_max) {
            venuesItems_show.push(venuesItems_new)

          } else {
            venuesItems_prev.push(venuesItems_show.shift())
            venuesItems_show.push(venuesItems_new)

          }
          that.setData({
            venuesItems: venuesItems,
            ["venuesItems_show[" + (page - 1) + "]"]: venuesItems_new,
            ["venuesItems_next[" + (page) + "]"]: venuesItems_cache,
            venuesItems_prev: venuesItems_prev,
            page: page + 1,
            all_rows: all_rows,
            keyword: '',
            is_goodslist_loading: false,
          })
        }else{
          wx.showToast({
            title: '已经到底了',
            icon: 'loading',
            duration: 1000
          });
        }
      }
    })
  },
  get_menubar: function (event) { //获取菜单项
    var that = this
    var navlist_toView = that.data.navlist_toView
    var navlist_title = that.data.navlist_title
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
        console.log('get_menubar:',res.data.result)
        var navList_new = res.data.result;
        if (!navList_new) {
          wx.showToast({
            title: '没有菜单项',
            icon: 'loading',
            duration: 1500
          });
          return;
        }
        for (var i = 0; i < navList_new.length;i++){
          if (navList_new[i]['title'].indexOf(navlist_title)>=0){
            navlist_toView = i
            break
          }
        }
        that.setData ({
          navList: navList_new,
          index: navlist_toView,
          activeIndex: navlist_toView,
          tab: navList_new[navlist_toView]['id'],
          tab_value: navList_new[navlist_toView]['value'],
          venuesItems_show: [],
          venuesItems_prev: [],
          venuesItems_next: [],
        })
        that.get_goods_list()
        that.setData({
          loadingHidden: true,
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '送心礼物',
      desc: '开启礼物电商时代，200万人都在用的礼物小程序！',
      path: '/pages/list/list?refername='+username
    }
  }
})
