import defaultData from '../../data';
var util = require('../../utils/util.js');

//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var navList = [
  { id: "live_type", title: "推荐"  ,value:"0"},
]
 

Page({
  data: {
    title_name: '送心视频',
    title_logo: '../../images/footer-icon-05.png',
    img_discount:'../../images/discount.png',
    default_img: weburl + '/uploads/default_goods_image.png',
    poster_image: weburl + '/uploads/video_poster_image.png',
    logo_image: weburl + '/uploads/video_logo_image.png',
    activeIndex: 0,
    navList: navList,
    images: [],
    all_rows:0,
    venuesItems_show: [],
    show_max:1,
    page: 1,
    pagesize: 20,
    loadingHidden: true, // loading
    is_goodslist_loading:false,
    msgList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    tab: 'is_recommend',
    tab_value:"1",
  
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
      toView: toView ? toView : 0,
      scrollTop:0,
      venuesItems_show: [],
    })
    console.log('toView:' + that.data.toView)
    that.get_liveroom_list()
    if (hiddenallclassify==false) {
      that.openAllTapTag()
    }
    console.log(hiddenallclassify)
    
  },

// 获取滚动条当前位置
  scrolltoupper:function(e){
    var that = this
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      })
      if (that.data.platform == 'ios') {
        //that.getMoreGoodsTapTag() //苹果手机渲染更快，多给记录
        //console.log('list scrolltoupper():', e.detail.scrollTop, that.data.platform)
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
      scrollTop: 0,
      venuesItems_show: [],
      page: 1,
      pageoffset: 0,
    })
    that.get_liveroom_list()
  },
  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.setData({
      venuesItems_show: [],
    })
    that.get_liveroom_list()
  },
  
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows
    var is_goodslist_loading = that.data.is_goodslist_loading
    if (is_goodslist_loading) return
    if (page > all_rows){
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
    that.get_liveroom_list()
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
          platform: res.platform,
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
  
  get_liveroom_list: function (event) {
    var that = this
    var page = that.data.page
    var pagesize = that.data.pagesize
    var username = that.data.username 
    var token = that.data.token
    var shop_type=that.data.shop_type
    var live_type = that.data.tab
    var live_type_value = that.data.tab_value
    var show_max = that.data.show_max
    that.setData({
      is_goodslist_loading: true,
      loadingHidden:false,
    })
    wx.request({
      url: weburl + '/api/client/get_liveroom_list',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        page: page, 
        pagesize: pagesize,
        live_type: live_type,
        live_type_value: live_type_value,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        var venuesItems_show = that.data.venuesItems_show
        console.log('get_liveroom_list:',res.data,'page:',page)
        var venuesItems_new = res.data.result
        var all_rows = res.data.all_rows
        var pageoffset = res.data.pageoffset
        if (!venuesItems_new) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          that.setData({
            venuesItems_show: [],
            all_rows: 0,
            is_goodslist_loading: false,
            keyword: ''
          })
          return;
        }
        //var venuesItems = that.data.venuesItems
        if (venuesItems_new){
          for (var i = 0; i < venuesItems_new.length; i++) {
            venuesItems_new[i]['live_poster'] = venuesItems_new[i]['live_poster'] ? venuesItems_new[i]['live_poster']:that.data.poster_image
            if (venuesItems_new[i]['live_poster'].indexOf("http") < 0) {
              venuesItems_new[i]['live_poster'] = weburl + '/' + venuesItems_new[i]['live_poster'];
            }
            venuesItems_new[i]['logo'] = venuesItems_new[i]['logo'] ? venuesItems_new[i]['logo']:that.data.logo_image
            if (venuesItems_new[i]['logo'].indexOf("http") < 0) {
              venuesItems_new[i]['logo'] = weburl + '/' + venuesItems_new[i]['logo'];
            }
          }
          if (page > 1 && venuesItems_new) {
            //向后合拼
            //venuesItems = that.data.venuesItems.concat(venuesItems_new);
          }
          //更新当前显示页信息
          if (venuesItems_show.length>=show_max) {
            venuesItems_show.shift()
          }
          that.setData({
            //venuesItems: venuesItems,
            ["venuesItems_show[" + (page - 1) + "]"]: venuesItems_new,
            page: page ,
            all_rows: all_rows,
            pageoffset:pageoffset,
            keyword: '',
          },function(){
            that.setData({
              is_goodslist_loading: false,
            })
          })
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
        menu_type: 2,
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
        },function(){
          that.setData({
            loadingHidden: true,
          })
          that.get_liveroom_list()
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
