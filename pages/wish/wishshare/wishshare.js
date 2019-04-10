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
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          //startBarHeight = 44
        }
        that.setData({
          //startBarHeight: startBarHeight,
          //navgationHeight: navgationHeight,
          //dkheight: winHeight,
        })
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
    wx.showToast({
      title: "分享图生成中",
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

  //确定按钮点击事件 
  shareConfirm: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
      hidden_share: !that.data.hidden_share
    })
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
   
    wx.showLoading({
      title: '生成图片',
      mask: true
    })
    
    if (activity_id>0){
      that.setData({
        painting: {
          width: 700,
          height: 600,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          views: [
            {
              type: 'image',
              url: activity_image,
              top: 0,
              left: 0,
              width: 700,
              height: 400
            },
          /*
            {
             type: 'text',
             content: activity_name,
             fontSize: 28,
             color: '#f2f2f2',
             textAlign: 'left',
             top: 33,
             left: 20,
             bolder: true
            },
           */
            {
              type: 'image',
              url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&activity_id=' + activity_id,
              top: 410,
              left: 215,
              width: 125,
              height: 125,
            },
             
            {
              type: 'image',
              url: that.data.activity_headimg,
              top: 410,
              left: 375,
              width: 125,
              height: 125,
              borderRadius: 62,
            },
             
            {
              type: 'text',
              content: '长按识别二维码，查看具体地图位置',
              fontSize: 18,
              color: '#fff',
              textAlign: 'left',
              top: 365,
              left: 215,
              lineHeight: 30,
              MaxLineNumber: 2,
              breakWord: true,
              //width: 700
            }
          ]
        }
      })
    } else if (share_goods_id > 0) {
      that.setData({
        painting: {
          width: 375,
          height: 850,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: [
            /*
            {
              type: 'rect',
              top: 0,
              left: 0,
              width: 375,
              height: 850,
              background: 'white',
            },
            */
            {
              type: 'image',
              url: that.data.share_goods_wx_headimg,
              top: 10,
              left: 10,
              width: 80,
              height: 80,
              borderRadius: 40,
            },
            {
              type: 'text',
              content: '来自'+nickname+'的分享',
              fontSize: 13,
              color: '#333',
              textAlign: 'left',
              top: 35,
              left: 110,
              bolder: false
            },
            {
              type: 'image',
              url: share_goods_image,
              top: 100,
              left: 0,
              width: 375,
              height: 400
            },
            {
              type: 'text',
              content: share_goods_name,
              fontSize: 20,
              color: '#333',
              textAlign: 'left',
              top: 510,
              left: 10,
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
              color: '#e34c55',
              textAlign: 'left',
              top: 565,
              left: 10,
              bolder: true,
           
            },
            {
              type: 'text',
              content: 'Ta说:',
              fontSize: 20,
              color: '#333',
              textAlign: 'left',
              top: 620,
              left: 10,
              bolder: true,
            },
            {
              type: 'text',
              content: share_goods_title,
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 650,
              left: 10,
              lineHeight: 25,
              MaxLineNumber: 2,
              breakWord: true,
              width:350,
            },
            {
              type: 'text',
              content: '长按识别二维码查看详情',
              fontSize: 18,
              color: '#333',
              textAlign: 'left',
              top: 720,
              left: 10,
              breakWord: false,
              bolder: true,
            },
            {
              type: 'text',
              content: '送心礼物，开启礼物社交时代!',
              fontSize: 18,
              color: '#999',
              textAlign: 'left',
              top: 750,
              left: 10,
              breakWord: false,
            },
            {
              type: 'image',
              url: share_goods_qrcode,
              top: 700,
              left: 260,
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
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
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
      console.log('送心分享', shareObj)
    }
    // 返回shareObj
    return shareObj;

  },

})
