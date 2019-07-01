import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var appid = app.globalData.appid;
var secret = app.globalData.secret;
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "/uploads/songxin_banner.png" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_share", title: "背景", value: "", img: "/uploads/wechat_share.png" },

]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []

Page({
  data: {
    title_name: '分享',
    title_logo: '../../../images/footer-icon-05.png',
    share_goods_bg: weburl+'/uploads/share_goods_bg.png',
    activity_share_image: weburl+'/uploads/activity_share.jpg',
    activity_avatarUrl: weburl + '/uploads/avatar.png',
    share_goods_avatarUrl: weburl + '/uploads/avatar.png',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    painting: {},
    shareImage: '',
    shop_type:shop_type,
    wechat_share: '',

    start_time: util.getDateStr(new Date, 0),
    overtime_status: 0, 
    notehidden:true,
    hidden_share:true,
  },

  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'eventSave') {
      that.eventSave()
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
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length >1) {
      wx.navigateBack({ changed: true });//返回上一页
    }else{
      wx.switchTab({
        url: '../../hall/hall'
      })
    }
   
  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    //console.log('wishshare get_project_gift_para navList2:', navList2)
    if (navList2.length == 0) {
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
          var navList_new = res.data.result;
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
              navList2: navList_new,
              wechat_share: navList_new[5]['img'],
            })
          }
        }
      })
    }else{
      that.setData({
        navList2: navList_new,
        wechat_share: navList_new[5]['img']
      })
    }  
  },

  onLoad (options) {
    var that = this
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var task = options.task ? options.task:0
    var task_image = options.image ?options.image: ''
    var msg_id = options.msg_id ? options.msg_id : ''
    var activity_id = options.activity_id ? options.activity_id : 0
    var activity_name = options.activity_name ? options.activity_name : 0
    var activity_image = options.activity_image ? options.activity_image : ''
    var activity_headimg = options.activity_headimg ? options.activity_headimg : that.data.activity_avatarUrl
    var share_activity_title = options.share_activity_title ? options.share_activity_title : '这个地方真不错~'
    var share_goods_id = options.share_goods_id ? options.share_goods_id : 0
    var share_goods_name = options.share_goods_name ? options.share_goods_name : ''
    var share_goods_price = options.share_goods_price ? options.share_goods_price : 0
    var share_goods_image = options.share_goods_image ? options.share_goods_image : ''
    var share_goods_image2 = options.share_goods_image2 ? options.share_goods_image2 : ''
    var share_goods_qrcode_cache = options.share_goods_qrcode_cache ? options.share_goods_qrcode_cache : ''
    var share_goods_wx_headimg = options.share_goods_wx_headimg ? options.share_goods_wx_headimg : that.data.share_goods_avatarUrl
    var share_goods_title = options.share_goods_title ? options.share_goods_title : '这个礼物真不错，来看看吧，要是你能送我就更好了~'
    var share_goods_desc = options.share_goods_desc ? options.share_goods_desc : '送礼就是送心~'
    var share_art_id = options.share_art_id ? options.share_art_id : 0
    var share_art_cat_id = options.share_art_cat_id ? options.share_art_cat_id : 0
    var share_art_title = options.share_art_title ? options.share_art_title : ''
    var share_art_image = options.share_art_image ? options.share_art_image : ''
    var share_art_wx_headimg = options.share_art_wx_headimg ? options.share_art_wx_headimg:''
    share_goods_title = activity_id > 0 ? share_activity_title : share_goods_title
    console.log('onload wishshare options:',options)
    that.setData({
      m_id:m_id,
      task: task,
      task_image: task_image,
      msg_id: msg_id,
      activity_id: activity_id,
      activity_image: activity_image,
      activity_name: activity_name,
      activity_headimg: activity_headimg,
      share_goods_id: share_goods_id,
      share_goods_price: share_goods_price,
      share_goods_name: share_goods_name,
      share_goods_image: share_goods_image,
      share_goods_image2: share_goods_image2,
      share_goods_wx_headimg: share_goods_wx_headimg,
      share_goods_title: share_goods_title,
      share_goods_desc: share_goods_desc,
      share_goods_qrcode_cache: share_goods_qrcode_cache,
      share_art_id: share_art_id,
      share_art_cat_id: share_art_cat_id,
      share_art_title: share_art_title,
      share_art_image: share_art_image,
      share_art_wx_headimg: share_art_wx_headimg,
    })
    if (activity_name){
      var title_len = activity_name.length
      if (title_len>13){
        wx.setNavigationBarTitle({
          title: activity_name.substring(0, 10) + '...'
        })
      }else{
        wx.setNavigationBarTitle({
          title: activity_name
        })
      }
    }
  
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          dkheight: res.windowHeight-10,
        })
      }
    })
    that.get_project_gift_para()
    that.share_image_creat()
  },
  onShow:function(){
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
        that.setData({
          title_logo: '../../../images/back.png'
      })
    }  
  },
  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      share_goods_title: e.detail.value
    })

  }, 
  sharegoods: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
    })
  },
  share_image_creat:function(){
    var that = this
    wx.showToast({
      title: "开始生成海报",
      icon: 'loading',
      duration: 1500,
    })
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
      that.eventDraw()
    }, 1300)
  },

  //确定按钮点击事件 
  shareConfirm: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
      hidden_share: !that.data.hidden_share
    })
    that.share_image_creat()
    that.get_project_gift_para()
  },
  //取消按钮点击事件  
  shareCandel: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
    })

  },  
  eventDraw: function () {
    var that = this
    var m_id = that.data.m_id
    var wechat_share = that.data.wechat_share ? that.data.wechat_share:that.data.task_image 
    var shop_type = that.data.shop_type
    var qr_type = 'wishshare' 
    var task = that.data.task
    var msg_id = that.data.msg_id
    var activity_id = that.data.activity_id?that.data.activity_id:0
    var activity_image = that.data.activity_image ? that.data.activity_image : that.data.activity_share_image
    var activity_name = that.data.activity_name
    var share_activity_title = that.data.share_activity_title
    //console.log('wishshare eventDraw activity_image:', activity_image, 'activity_name:', activity_name)
    var share_goods_id = that.data.share_goods_id ? that.data.share_goods_id : 0
    var share_goods_name = that.data.share_goods_name ? that.data.share_goods_name : ''
    var share_goods_price = that.data.share_goods_price ? that.data.share_goods_price : 0
    var share_goods_image = that.data.share_goods_image ? that.data.share_goods_image : ''
    var share_goods_qrcode = that.data.share_goods_qrcode_cache ? that.data.share_goods_qrcode_cache : weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + share_goods_id+'&m_id='+m_id
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : share_goods_avatarUrl
    var share_goods_title = that.data.share_goods_title
    var share_goods_desc = that.data.share_goods_desc
    var nickname = that.data.nickname
    var share_goods_bg = that.data.share_goods_bg
    var share_art_id = that.data.share_art_id ? that.data.share_art_id : 0
    var share_art_cat_id = that.data.share_art_cat_id ? that.data.share_art_cat_id : 0
    var share_art_title = that.data.share_art_title ? that.data.share_art_title : ''
    var share_art_image = that.data.share_art_image ? that.data.share_art_image : ''
    var share_art_wx_headimg = that.data.share_art_wx_headimg ? that.data.share_art_wx_headimg : that.data.avatarUrl
    var share_art_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_art_id=' + share_art_id + '&share_art_cat_id=' + share_art_cat_id + '&m_id=' + m_id
    wx.showLoading({
      title: '生成中',
      mask: true
    })
    
    if (activity_id>0){
      that.setData({
        painting: {
          width: 500,
          height: 700,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true, 
          background: 'white',
          views: [
            {
              type: 'image',
              url: that.data.activity_headimg,
              top: 8,
              left: 10,
              width: 50,
              height: 50,
              borderRadius: 25,
            },
            {
             type: 'text',
             content: nickname+'在'+activity_name,
             fontSize: 16,
             color: '#999',
             textAlign: 'left',
             top: 20,
             left: 70,
             bolder: true
            },
            {
              type: 'image',
              url: activity_image,
              top: 70,
              left: 0,
              width: 700,
              height: 400
            },
            {
              type: 'text',
              content: '长按识别二维码查看具体位置',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 480,
              left: 125,
              //lineHeight: 20,
              //MaxLineNumber: 2,
              //breakWord: true,
              //width: 700
            },
            {
              type: 'image',
              url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&activity_id=' + activity_id,
              top: 520,
              left: 180,
              width: 125,
              height: 125,
            },
          ]
        }
      })
    } else if (share_goods_id > 0) {
      that.setData({
        painting: {
          width: 520,
          height: 900,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: [
            {
              type: 'image',
              url: share_goods_bg, // weburl + '/uploads/share_goods_bg.png'
              top: 10,
              left: 0,
              width: 520,
              height: 900,
            },
            
            {
              type: 'image',
              url: that.data.share_goods_wx_headimg,
              top: 45,
              left: 30,
              width: 50,
              height: 50,
              borderRadius: 25,
            },
            {
              type: 'text',
              content: '来自'+nickname+'的分享',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 60,
              left: 90,
              bolder: false
            },
            {
              type: 'image',
              url: share_goods_image,
              top: 120,
              left: 85,
              width: 350,
              height: 350
            },
            {
              type: 'text',
              content: share_goods_name,
              fontSize: 20,
              color: '#333',
              textAlign: 'left',
              top: 490,
              left: 85,
              bolder: true,
              lineHeight: 25,
              MaxLineNumber: 2,
              breakWord: true,
              width: 350,
            },
            {
              type: 'text',
              content: '￥' + share_goods_price,
              fontSize: 20,
              color: '#444444',
              textAlign: 'left',
              top: 550,
              left: 85,
           
            },
            {
              type: 'text',
              content: 'Ta说:',
              fontSize: 20,
              color: '#444',
              textAlign: 'left',
              top: 630,
              left: 85,
              bolder: true,
            },
            {
              type: 'text',
              content: share_goods_title,
              fontSize: 18,
              color: '#666',
              textAlign: 'left',
              top: 660,
              left: 85,
              lineHeight: 25,
              MaxLineNumber: 4,
              breakWord: true,
              width:350,
            },
            {
              type: 'rect',
              top: 770,
              left: 85,
              background: '#eeeeee',
              width: 350,
              height: 1,
            },
            {
              type: 'text',
              content: '长按识别二维码查看详情',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 790,
              left: 85,
              breakWord: false,
              bolder: true,
            },
            {
              type: 'text',
              content: '送心礼物，开启礼物社交时代!',
              fontSize: 18,
              color: '#999',
              textAlign: 'left',
              top: 820,
              left: 85,
              breakWord: false,
            },
            {
              type: 'image',
              url: share_goods_qrcode,
              top: 780,
              left: 360,
              width: 90,
              height: 90,
            }
          ]
        }
      })
    } else if (share_art_id > 0) {
      that.setData({
        painting: {
          width: 520,
          height: 680,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: [
            {
              type: 'image',
              url: share_art_wx_headimg,
              top: 45,
              left: 30,
              width: 50,
              height: 50,
              borderRadius: 25,
            },
            {
              type: 'text',
              content: '来自' + nickname + '的分享',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 60,
              left: 90,
              bolder: false
            },
            {
              type: 'image',
              url: share_art_image,
              top: 120,
              left: 85,
              width: 350,
              height: 350
            },
            {
              type: 'text',
              content: share_art_title,
              fontSize: 20,
              color: '#999',
              textAlign: 'left',
              top: 500,
              left: 85,
              bolder: true,
              lineHeight: 25,
              MaxLineNumber: 2,
              breakWord: true,
              width: 350,
            },
            {
              type: 'rect',
              top: 540,
              left: 85,
              background: '#eeeeee',
              width: 350,
              height: 1,
            },
            {
              type: 'text',
              content: '长按识别二维码查看详情',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 590,
              left: 85,
              breakWord: false,
              bolder: true,
            },
            {
              type: 'image',
              url: share_art_qrcode,
              top: 550,
              left: 330,
              width: 90,
              height: 90,
            }
          ]
        }
      })  
    }else{
      that.setData({
        painting: {
          width: 375,
          height: 667,
          clear: true,
          views: [
            {
              type: 'image',
              url: wechat_share,
              top: 0,
              left: 0,
              width: 375,
              height: 667
            },
            /*
           {
             type: 'image',
             url: weburl+'/uploads/gift_logo.png',
             top: 27.5,
             left: 29,
             width: 55,
             height: 55
           },
          
           {
             type: 'text',
             content: '您的好友【kuckboy】',
             fontSize: 16,
             color: '#402D16',
             textAlign: 'left',
             top: 33,
             left: 96,
             bolder: true
           },
           */
            {
              type: 'image',
              url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&task=' + task + '&msg_id=' + msg_id,
              top: 480,
              left: 130,
              width: 110,
              height: 125,

            },
            {
              type: 'text',
              content: '长按识别二维码，进入送心小程序',
              fontSize: 12,
              color: '#FFF',
              textAlign: 'left',
              top: 620,
              left: 95,
              lineHeight: 30,
              MaxLineNumber: 2,
              breakWord: true,
              //width: 150
            }
          ]
        }
      })
    }
  },
  eventSave: function () {
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        var length = Object.keys(authMap).length;
        console.log("authMap info 长度:" + length, authMap)
        if (authMap.hasOwnProperty('scope.writePhotosAlbum')) {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.showModal({
              title: '用户未授权',
              content: '请授权保存相册权限',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定授权保存相册权限')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('openSetting success', res.authSetting);
                    }
                  })
                }
              }
            })
          }
        }
      }
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '图片已保存到相册，赶紧晒一下吧~',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },
  eventGetImage: function (event) {
    //console.log(event)
    console.log('wishshare eventGetImage:', event)
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
      wx.hideLoading()
    }
  },
 
  onShareAppMessage: function (options) {
    var that = this
    var res
    var m_id = that.data.m_id
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var nickname = that.data.nickname
    var msg_id = that.data.msg_id
    var task = that.data.task
    var start_time = that.data.start_time
    var activity_id = that.data.activity_id ? that.data.activity_id : 0
    var activity_image = that.data.activity_image ? that.data.activity_image : that.data.activity_share_image
    var activity_name = that.data.activity_name ? that.data.activity_name : '我的位置'
    var title = '收到' + nickname + '的送礼分享~';
    var imageUrl = that.data.task_image ? that.data.task_image : that.data.wechat_share
    var desc = '送心礼物分享'
    var share_goods_id = that.data.share_goods_id ? that.data.share_goods_id : 0
    var share_goods_image = that.data.share_goods_image2 ? that.data.share_goods_image2 : ''
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : that.data.share_goods_avatarUrl
    var share_goods_title = that.data.share_goods_title ? that.data.share_goods_title : '这个礼物真不错，来看看吧，要是你能送我就更好了~'
    var share_goods_desc = that.data.share_goods_desc ? that.data.share_goods_desc : '送礼就是送心~'
    var share_art_id = that.data.share_art_id
    var share_art_cat_id = that.data.share_art_cat_id
    var share_art_image = that.data.share_art_image
    var share_art_title = that.data.share_art_title
    console.log('开始分享送礼任务', options)

    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: desc,
      path: '/pages/hall/hall?task=' + task + '&msg_id=' + msg_id + '&refername=' + username + '&sharetime=' + start_time,   // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: activity_id > 0 ?activity_image:imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        console.log(res)
        if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
          that.setData({
            send_status: 1,
          })
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
      if (activity_id > 0) {
        shareObj['desc'] = '我的位置'
        shareObj['title'] = nickname + ':' + share_goods_title ?share_goods_title:activity_name + '~'
        shareObj['imageUrl'] = activity_image
        shareObj['path'] = '/pages/member/mylocation/mylocation?username=' + username + '&activity_id=' + activity_id 
      } 
      if (share_goods_id > 0) {
        shareObj['desc'] = share_goods_desc
        shareObj['title'] = share_goods_title
        shareObj['imageUrl'] = share_goods_image
        shareObj['path'] = '/pages/details/details?id=' + share_goods_id + '&image=' + share_goods_image + '&mid=' + m_id
      } 
      if (share_art_id > 0) {
        shareObj['title'] = share_art_title
        shareObj['imageUrl'] = share_art_image
        shareObj['path'] = '/pages/my/index?art_id=' + share_art_id + '&art_cat_id=' + share_art_cat_id + '&mid=' + m_id
      } 
      console.log('送心分享', shareObj)
    }
    // 返回shareObj
    return shareObj;

  },

})
