var wxparse = require("../../../wxParse/wxParse.js");
var util = require('../../../utils/util.js')
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
    friendinfo_show: [],
    scrollTop: 0,
    shop_type:shop_type,
    index: 0,
    art_index:0,
    web_url:'',
    web_id: '',
    inputShowed: false,
    sendheartappHidden: false,
    member_note_start_date: util.getDateStr(new Date, 0),
    member_note_content:'',
    note_reminder_picker :['每天', '每周', '每月', '每年'],
    member_note_reminder_id:0,
    member_note_reminder_str:'',
    infoid:0,
  },
  pickgift: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/list/list?navlist=1'
    })
  }, 

  bindChangeStartDate: function (e) {
    var that = this;
    var start_date = e.detail.value
    that.setData({
      member_note_start_date: start_date
    })
    console.log('member_note_start_date:' + that.data.member_note_start_date)
  },
  note_contentTapTag: function (e) {
    var that = this
    var note_content = util.filterEmoji(e.detail.value)
    that.setData({
      member_note_content: note_content,
    })
    console.log('member_note_content:' + that.data.member_note_content)
  },
  bindChangeReminder: function (e) {
    var that = this;
    var member_note_reminder_id = e.detail.value
    var note_reminder_picker = that.data.note_reminder_picker
    that.setData({
      member_note_reminder_id: member_note_reminder_id,
      member_note_reminder_str: note_reminder_picker[member_note_reminder_id],
    })
    console.log('member_note_reminder_str:' + that.data.member_note_reminder_str)
  },
  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'savenote') {
      that.save_member_note()
    }
    if (formId) that.submintFromId(formId)
  },

  //提交formId，让服务器保存到数据库里
  submintFromId: function (formId) {
    var that = this
    var formId = formId
    var shop_type = that.data.shop_type
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.request({
      url: weburl + '/api/client/save_member_formid',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        formId: formId,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('submintFromId() update success: ', res.data)
      }
    })
  },

  get_member_note: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var friend_id = that.data.friend_id ? that.data.friend_id : friendinfo['f_id']
    var infoid = that.data.infoid
    if(infoid==0) return 
    wx.request({
      url: weburl + '/api/client/get_member_friendinfo',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        f_id: friend_id,
        shop_type: shop_type,
        type: 0, //0提醒
        infoid:infoid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var friendinfo_show = res.data.result
        // console.log('friendinfo get_member_note:', friendinfo)
        if (!friendinfo_show) {
          /*
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 1000
          });
          */
          if (page == 1) {
            that.setData({
              friendinfo_show: [],
              all_rows: 0,
            })
          }
          return
        }
        if (res.data.status == 'y') {
          var all_rows = res.data.all_rows
          if (friendinfo_show) {
            for (var i = 0; i < friendinfo_show.length; i++) {
              if (friendinfo_show[i]['content']) {
                friendinfo_show[i]['info'] = JSON.parse(friendinfo_show[i]['content'])
              }
            }
            that.setData({
              member_note_content: friendinfo_show[0]['info']['info'],
              member_note_start_date: friendinfo_show[0]['info']['note_date'],
              member_note_reminder_id: friendinfo_show[0]['info']['act_type'],
              all_rows: all_rows,
            })
          }
          console.log('friendinfo get_member_note:', friendinfo_show)
        }
      }
    })

  },

  save_member_note:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var friendinfo = that.data.friendinfo
    var note_reminder_picker = that.data.note_reminder_picker
    var member_note_reminder_id = that.data.member_note_reminder_id
    var member_note_reminder_str = note_reminder_picker[member_note_reminder_id]
    var member_note_start_date = that.data.member_note_start_date
    var member_note_content = that.data.member_note_content
    var friend_id = that.data.friend_id ? that.data.friend_id : friendinfo['f_id']
    var infoid =that.data.infoid
    if (!member_note_content){
      wx.showToast({
        title: '记录内容不能为空!',
        icon: 'none',
        duration: 1500
      })
      return 
    }
    wx.request({
      url: weburl + '/api/client/update_member_friendinfo',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        f_id: friend_id,
        info_id: infoid,
        shop_type: shop_type,
        type:0, //0提醒
        member_note_content: member_note_content,
        member_note_start_date: member_note_start_date,
        member_note_reminder_id: member_note_reminder_id,
        member_note_reminder_str: member_note_reminder_str,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('friendinfoedit save_member_note:', res.data)
        if(res.data.status=='y'){
          wx.showToast({
            title: '保存成功',
            icon: 'succcess',
            duration: 1500
          });
          that.setData({
            infoid: res.data.result.infoid ? res.data.result.infoid:that.data.infoid,
          })
        }else{
          wx.showToast({
            title: res.data.info ? res.data.info:'保存失败',
            icon: 'none',
            duration: 1500
          });
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
  
  onLoad: function (options) {
    var that = this
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var friendinfo = options.friendinfo ?JSON.parse(options.friendinfo):''
    var friend_id = friendinfo ? friendinfo['f_id']:0
    var infoid = options.infoid ? options.infoid : 0
    
    that.setData({
      friendinfo: friendinfo,
      friend_id: friend_id,
      infoid: infoid ? infoid:0,
    })
    if (infoid>0) that.get_member_note()
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
    console.log("friendinfoedit onload options:", options)
  },
  onShow: function () {
    var that = this
   
  },
 
  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
  }
})