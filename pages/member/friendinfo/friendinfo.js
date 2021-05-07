var wxparse = require("../../../wxParse/wxParse.js");
var app = getApp();
var weburl = app.globalData.weburl
var appid = app.globalData.appid
var app_secret = app.globalData.secret
var user_type = app.globalData.user_type ? app.globalData.user_type:0;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var userauth = wx.getStorageSync('userauth') ? wx.getStorageSync('userauth') : '';
var navList2 = wx .getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
var page = 1
var pagesize = 20
Page({
  data:{
    title_name: '我的',
    title_logo: '/images/footer-icon-05.png',
    share_art_image: weburl+'/uploads/share_art_image.jpg',
    nickname: userInfo.nickName ? userInfo.nickName:'登录',
    avatarUrl: userInfo.avatarUrl,
    userauth: userauth,
    default_avatar: weburl + '/uploads/avatar.png',
    all_rows: 0,
    page:page,
    pagesize:pagesize,
    toViewY:0,
    friendinfo:'',
    friend_id:0,
    infoid:0,
    friendinfo_list:[],
    friendinfo_show:[],
    show_max: 1,
    scrollTop: 0,
    shop_type:shop_type,
    index: 0,
    art_index:0,
    web_url:'',
    web_id: '',
    inputShowed: false,
    hiddenmore: true,
  },
  pickgift: function (e) {
    var that = this;
    
    wx.navigateTo({
      url: '/pages/list/list?navlist=1'
    })
  }, 
  friendinfoedit: function (e) {
    var that = this
    var friendinfo = that.data.friendinfo
    var infoid = e.currentTarget.dataset.infoid
    infoid = infoid ? infoid:that.data.infoid
    wx.navigateTo({
      url: '/pages/member/friendinfoedit/friendinfoedit?friendinfo=' + JSON.stringify(friendinfo)+'&infoid='+infoid
    })
  }, 

  get_member_note: function () {
    var that = this
    var show_max = that.data.show_max
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var friendinfo = that.data.friendinfo  
    var friend_id = that.data.friend_id ? that.data.friend_id : friendinfo['f_id']
    var friendinfo_show = that.data.friendinfo_show
    wx.request({
      url: weburl + '/api/client/get_member_friendinfo',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        f_id: friend_id,
        shop_type: shop_type,
        type: 0, //0提醒
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
       
        var friendinfo = res.data.result 
       // console.log('friendinfo get_member_note:', friendinfo)
        if (!friendinfo) {
          //wx.showToast({
            //title: '没有搜到记录',
           // icon: 'loading',
           // duration: 1000
         // });
          if(page == 1){
            that.setData({
              friendinfo_show: [],
              all_rows: 0,
              hiddenmore: false,
            })
          }
          return;
        }
        if (res.data.status == 'y') {
          var all_rows  = res.data.all_rows
          if (friendinfo) {
            for (var i = 0; i < friendinfo.length; i++) {
              if (friendinfo[i]['content']){
                  friendinfo[i]['info'] = JSON.parse(friendinfo[i]['content'])
              }
            }
          }
          var friendinfo_list = that.data.friendinfo_list
          if (friendinfo_show.length >= show_max) {
            friendinfo_show.shift()
          }
          that.setData({
            friendinfo_list: friendinfo_list.concat(friendinfo),
            ["friendinfo_show[" + (page - 1) + "]"]: friendinfo,
            all_rows: all_rows,
          })
          console.log('friendinfo get_member_note:', friendinfo)
        }  
      }
    })

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
  
  getMoreFriendinfoTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var all_rows = that.data.all_rows;
    if (page > all_rows) {
      wx.showToast({
        title: '没有更多的数据',
        icon: 'loading',
        duration: 1000
      })
      that.setData({
        hiddenmore: true,
      })
      return
    }
    that.setData({
      page: page,
    })
    that.get_member_note()
  },

  onLoad: function (options) {
    var that = this
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var friendinfo = options.friendinfo ?JSON.parse(options.friendinfo):''
    var friend_id = friendinfo ? friendinfo['f_id'] : 0
  
    that.setData({
      friendinfo: friendinfo,
      friend_id: friend_id,
    })
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
    console.log("friendinfo onload options:", options)
    

  },
  onShow: function () {
    var that = this
    that.get_member_note()
  },
 
  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
  }
})