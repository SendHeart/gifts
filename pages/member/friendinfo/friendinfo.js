var wxparse = require("../../../wxParse/wxParse.js");
var app = getApp();
var weburl = app.globalData.weburl
var appid = app.globalData.appid
var appsecret = app.globalData.secret
var user_type = app.globalData.user_type ? app.globalData.user_type:0;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var userauth = wx.getStorageSync('userauth') ? wx.getStorageSync('userauth') : '';
var navList2 = wx .getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
Page({
  data:{
    title_name: '我的',
    title_logo: '/images/footer-icon-05.png',
    share_art_image: weburl+'/uploads/share_art_image.jpg',
    nickname: userInfo.nickName ? userInfo.nickName:'登录',
    avatarUrl: userInfo.avatarUrl,
    userauth: userauth,
    default_avatar: weburl + '/uploads/avatar.png',
    friendinfo:'',
    scrollTop: 0,
    shop_type:shop_type,
    index: 0,
    art_index:0,
    web_url:'',
    web_id: '',
    inputShowed: false,
    sendheartappHidden: false,
  },
  
  goBack: function () {
    var that = this
    var pages = getCurrentPages()
    var userInfo = wx.getStorageSync('userInfo') 
    var frompage = that.data.frompage
    if (userInfo){
      if (pages.length > 1) {
        if (frompage) {
          wx.switchTab({
            url: frompage
          })
        } else {
          wx.navigateBack({ changed: true });//返回上一页
        }
       
      } else {
        wx.switchTab({
          url: '../hall/hall'
        })
      }
    }
  },
  
  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    var hall_banner = that.data.hall_banner
    console.log('hall get_project_gift_para navList2:', navList_new)
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
              hall_banner: navList_new[3] ? navList_new[3] : hall_banner, //首页banner图
              middle1_img: navList_new[11]['img'],
              middle2_img: navList_new[12]['img'],
              middle3_img: navList_new[13]['img'],
              middle4_img: navList_new[14]['img'],
              middle1_title: navList_new[11]['title'],
              middle2_title: navList_new[12]['title'],
              middle3_title: navList_new[13]['title'],
              middle4_title: navList_new[14]['title'],
              middle1_note: navList_new[11]['note'],
              middle2_note: navList_new[12]['note'],
              middle3_note: navList_new[13]['note'],
              middle4_note: navList_new[14]['note'],
            })
          }
        }
      })
    } else {
      that.setData({
        navList2: navList_new,
        hall_banner: navList_new[3] ? navList_new[3] : hall_banner, //首页banner图
        middle1_img: navList_new[11]['img'],
        middle2_img: navList_new[12]['img'],
        middle3_img: navList_new[13]['img'],
        middle4_img: navList_new[14]['img'],
        middle1_title: navList_new[11]['title'],
        middle2_title: navList_new[12]['title'],
        middle3_title: navList_new[13]['title'],
        middle4_title: navList_new[14]['title'],
        middle1_note: navList_new[11]['note'],
        middle2_note: navList_new[12]['note'],
        middle3_note: navList_new[13]['note'],
        middle4_note: navList_new[14]['note'],
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
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var friendinfo = options.friendinfo ?JSON.parse(options.friendinfo):''
    
    that.get_project_gift_para()
    that.setData({
      friendinfo: friendinfo,
    })
    console.log("friendinfo onload options:", options)
    

  },
  onShow: function () {
    var that = this
   
  },
 
  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
  }
})