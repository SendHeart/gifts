import defaultData from '../../data';
var util = require('../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var from_page = app.globalData.from_page;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "/uploads/songxin_banner.png" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_gb", title: "背景", value: "", img: "/uploads/wechat_share.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []

Page({
  data: {
    title_name: '心愿单',
    title_logo: '../../images/footer-icon-05.png',
    this_page:'/pages/wish/wish',
    all_rows:0,
    venuesItems: [],
    search_goodsname: null,
    userInfo:userInfo,
    keyword:'',
    page: 1,
    pagesize: 20,
    page_num:0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: true, // loading
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    showmorehidden: true,
    rshowmorehidden: true,
    shareflag:true,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    wish_id:'',
    wish_nickname:null,
    wish_headimg:null,
    navList2: navList2,
    painting: {},
    shareImage: '',
    showSharePic:true,
    shop_type:shop_type,
    wish_banner:'',
  
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
    var that = this
    var from_page = that.data.from_page
    var pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      if (from_page){
        wx.navigateTo({
          url: from_page,
        }) 
      }else{
        wx.switchTab({
          url: '../hall/hall'
        })
      }
    
    }

  },
  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
  },
  //事件处理函数
  login: function () {
    /*
    wx.switchTab({
      url: '../my/index'
    })
    */
    wx.navigateTo({
      url: '../login/login'
    })
  },
  // 点击获取对应分类的数据

  shareTapTag: function () {
    var that = this
    var shareflag = false
    that.setData({
     shareflag: shareflag,
   
    })
    console.log('share wish:', shareflag)
  },

  addWishTapTag: function (e) {
    var that = this;
    wx.navigateTo({
      url: '../list/list'
    })

  },
  searchTapTag: function (e) {
    var that = this;
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.query_wish_cart()
  },
  
  sendGoodsTapTag: function (e) {
    var that = this;
    var username = wx.getStorageSync('username');
    var index = parseInt(e.currentTarget.dataset.index);
    var sku_id = that.data.carts[index]['id'];
    if (sku_id) {
      that.insertCart(sku_id, username, 0);
    } else {
      wx.showToast({
        title: '该礼物无货',
        icon: 'loading',
        duration: 1500
      })
    }
  },

  insertCart: function (sku_id, username, wishflag) {
    var that = this
    var shop_type = that.data.shop_type

    // 加入购物车
    var title = wishflag == 1 ? '确认要加入心愿单吗' : '确认要购买送出吗'
    wx.showModal({
      title: '提示',
      content: title,
      success: function (res) {
        if (res.confirm) {
          // 加入购物车
          var that = this
          wx.request({
            url: weburl + '/api/client/add_cart',
            method: 'POST',
            data: {
              username: username,
              access_token: "1",
              sku_id: sku_id,
              wishflag: wishflag,
              shop_type:shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var title = wishflag == 1 ? '加入心愿单完成' : '加入购物车完成'
              wx.showToast({
                title: title,
                duration: 1500
              })
              if (wishflag == 1) {
                wx.navigateTo({
                  url: '../wish/wish'
                })
              } else {
                wx.switchTab({
                  url: '../hall/hall'
                })
              }

            }

          })

        }
      }
    })
  },

  deleteTapTag: function (e) {
    var that = this
    var shop_type = that.data.shop_type
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var index = parseInt(e.currentTarget.dataset.index);
    var carts = that.data.carts;
    var sku_id = that.data.carts[index]['id'];

    // 购物车单个删除
    var objectId = e.currentTarget.dataset.objectId;
    console.log(objectId);
    
    wx.showModal({
      title: '确定移除心愿单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          // 从网络上将它删除
          // 购物车单个删除
          
          wx.request({
            url: weburl + '/api/client/delete_cart',
            method: 'POST',
            data: { 
              username: username, 
              access_token: token, 
              sku_id: sku_id,
              wishflag:1, 
              shop_type:shop_type,
              },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              var new_carts = [];
              var j = 0;
              for (var i = 0; i < carts.length; i++) {
                if (i != index) {
                  //剔除删除产品
                  new_carts[j++] = carts[i];
                }
              }
              if (new_carts.length == 0) {
                var all_rows = 0;
                var showmorehidden = true;
              } else {
                var all_rows = new_carts.length;
                var showmorehidden = false;
              }
              that.setData({
                carts: new_carts,
                all_rows: all_rows,
                showmorehidden: showmorehidden
              })
            }
          })
 
        }
      }
    })
  },
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
   

  },
  get_project_gift_para: function () {
    var that = this

    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    console.log('wish get_project_gift_para navList2:', navList2)
    if (!navList_new) {
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
      navList2: navList_new,
      wish_banner: navList_new[4]['img']
    })

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },
  onLoad: function (options) {
    var that = this
    var wish_id = options.wish_id ? options.wish_id:''
    var from_page = options.from_page
    that.setNavigation()
    that.setData({
      wish_id:wish_id,
    })
    if (from_page){
      that.setData({
        from_page: from_page,
        title_logo: '../../../images/back.png'
      })
    }
    
    console.log('onLoad', that.data.wish_id,' from_page:',from_page)
    
   /*
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight - 60,
          scrollTop: that.data.scrollTop + 10
        })
      }
    })
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              //wx.startRecord()
            }
          })
        }
      }
    })
    that.get_project_gift_para()
   
    
  },


  // 定位数据  
  scroll: function (event) {
    var that = this;
    that.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  query_wish_cart: function () {
    var that = this
    var shop_type = that.data.shop_type
    var minusStatuses = []
    var page = that.data.page
    var pagesize = that.data.pagesize
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var wish_id = that.data.wish_id
    console.log('query_wish_cart:', wish_id)
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: { 
        username: wish_id ? wish_id : username, 
        access_token: token,
        page:page,
        pagesize:pagesize, 
        wishflag:1,
        shop_type:shop_type,
        },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var carts = []
        console.log('share wish id:', wish_id, ' result:', res.data)
        if (!res.data.result) return
        var cartlist = res.data.result.list
        var showmorehidden = that.data.showmorehidden

        var index = 0;
        for (var key in cartlist) {
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
            cartlist[key]['sku_list'][i]['short_name'] = cartlist[key]['sku_list'][i]['name'].substr(0, 10) + '...';
            cartlist[key]['sku_list'][i]['selected'] = '';
            cartlist[key]['sku_list'][i]['shop_id'] = key;
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
            if (index > 1) {
              cartlist[key]['sku_list'][i]['hidden'] = 1;
            }
            carts[index] = cartlist[key]['sku_list'][i];
            minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'disabled' : 'normal';
            index++;
          }
        }
        var page_num = that.data.page_num
        var pagesize = that.data.pagesize
        page_num = (carts.length/pagesize+0.5)
        that.setData({
          carts: carts,
          minusStatuses: minusStatuses,
          showmorehidden: showmorehidden,
          all_rows: carts.length,
          page_num:page_num.toFixed(0),
         
        })
       
        if (wish_id){
          wx.request({
            url: weburl + '/api/client/get_name',
            method: 'POST',
            data: {
              username: wish_id,
              shop_type:shop_type,
              access_token: token,
            },
            
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var user_info = res.data.result
              that.setData({
                wish_nickname: user_info['wx_nickname'],
                wish_headimg: user_info['wx_headimg'],
                wish_id: null,
              })
              that.shareTapTag()
            },

          })
        }else{
          that.setData({
            shareflag: true,
          })
        }
      }
    })
  },
  onShow:function(){
    //调用应用实例的方法获取全局数据
    var that=this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    console.log('onShow', that.data.wish_id)
    that.query_wish_cart()
    
  },
  ShareWechat: function() {
    var that = this
    wx.navigateTo({
      url: '../wish/wishshare/wishshare'
    })
  },
  
 
  onShareAppMessage: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
    var title = userInfo.nickName + '的心愿单,快打开看看吧~'
    var imageUrl = that.data.navList2[1]['img']
    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: "我的心愿单",
      path: '/pages/wish/wish?wish_id=' + username,   // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        console.log(res)
        if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
         // that.shareTapTag()
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
      complete: function () { // 转发结束之后的回调（转发成不成功都会执行）


      },
    }
    if (options.from === 'button') {
      // 来自页面内转发按钮
      // shareBtn
      // 此处可以修改 shareObj 中的内容
      //var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况
       
      console.log('心愿单分享:')
      console.log(shareObj)

    }
    // 返回shareObj
    return shareObj;
  }
})
