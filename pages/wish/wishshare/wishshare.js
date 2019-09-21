import defaultData from '../../../data';
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid;
var secret = app.globalData.secret;
var uploadurl = app.globalData.uploadurl;
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "/uploads/songxin_banner.png" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_share", title: "背景", value: "", img: "/uploads/wechat_share.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
const recorderManager = wx.getRecorderManager()
const myaudio = wx.createInnerAudioContext()
const options = {
  duration: 180 * 1000,//指定录音的时长，单位 ms
  sampleRate: 16000,//采样率
  numberOfChannels: 1,//录音通道数
  encodeBitRate: 96000,//编码码率
  format: 'mp3',//音频格式，有效值 aac/mp3
  frameSize: 50,//指定帧大小，单位 KB
}
Page({
  data: {
    title_name: '分享',
    title_logo: '../../../images/footer-icon-05.png',
    share_goods_bg: weburl+'/uploads/share_goods_bg.png',
    activity_share_image: weburl+'/uploads/activity_share.jpg',
    activity_avatarUrl: weburl + '/uploads/avatar.png',
    share_goods_avatarUrl: '../../../images/my.png',
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
    windowHeight:900,
    windowWidth:500,
    background:'#f2f2f2',
  },

  //录音计时器
  recordingTimer: function () {
    var that = this
    //将计时器赋值给setInter
    that.data.setInter = setInterval(
      function () {
        var time = that.data.recordingTimeqwe + 1
        that.setData({
          recordingTimeqwe: time,
        })
      }, 1000)
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
    var that = this
    var pages = getCurrentPages();
    if (pages.length > 1 && that.data.share_order_shape != 5 && that.data.share_order_shape != 4) {
      wx.navigateBack({ changed: true });//返回上一页
    } else if (that.data.share_order_shape == 5 || that.data.share_order_shape == 4){
      wx.switchTab({
        url: '../../index/index'
      })
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }
   
  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    console.log('wishshare get_project_gift_para navList2:', navList2)
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

  startRecode: function () {
    var that = this
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        var length = Object.keys(authMap).length;
        console.log("authMap info 长度:" + length, authMap)
        if (authMap.hasOwnProperty('scope.record')) {
          if (!res.authSetting['scope.record']) {
            wx.showModal({
              title: '用户未授权',
              content: '请授权录音权限',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定授权录音权限')
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
    that.setData({
      shutRecordingdis: "block",
      openRecordingdis: "none",
    })
    wx.showLoading({
      title: '录音中',
    })
    //开始录音计时   
    that.recordingTimer()
    //开始录音
    recorderManager.start(options)
    recorderManager.onStart(() => {
      console.log('开始录音')
    })
    //错误回调
    recorderManager.onError((res) => {
      console.log('错误回调:', res);
    })
  },

  endRecode: function () {//结束录音 
    var that = this
    var goods_id = that.data.share_goods_id
    
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('停止录音', res.tempFilePath)
      that.setData({
        shutRecordingdis: "none",
        openRecordingdis: "block",
      })
      that.current_voice = res.tempFilePath,
      wx.hideLoading()
      //结束录音计时  
      clearInterval(that.data.setInter)
      myaudio.src = res.tempFilePath
      myaudio.autoplay = true
      that.save_recorder(res.tempFilePath)
    })
  },
  
  save_recorder: function (voice) {
    var that = this
    var goods_id = that.data.share_goods_id
    var urls = uploadurl
    wx.uploadFile({
      url: uploadurl,
      filePath: voice,
      name: 'wechat_upimg',
      formData: {
        latitude: encodeURI(0.0),
        longitude: encodeURI(0.0),
        restaurant_id: encodeURI(0),
        city: encodeURI('杭州'),
        prov: encodeURI('浙江'),
        name: encodeURI(goods_id), // 名称
      },
      success: function (res) {
        var retinfo = JSON.parse(res.data.trim())
        var new_rec_url = ''
        if (retinfo['status'] == "y") {
          new_rec_url = retinfo['result']['img_url']
          that.setData({
            new_rec_url: new_rec_url,
          })
          //wx.setStorageSync('cardvoice', new_rec_url)
          //wx.setStorageSync('cardvoicetime', that.data.recordingTimeqwe)
          
          /*
          wx.showToast({
            title: '录音上传完成',
            icon: 'none',
            duration: 1000,
          })
          */
          console.log('录音上传完成', voice, new_rec_url)
          that.update_order_note()
        } else {
          wx.showToast({
            title: '录音上传返回失败',
            icon: 'none',
            duration: 1000
          })
          console.log('录音上传返回失败', voice, new_rec_url)
        }
      }
    })
  },

  play_rec: function () {
    var that = this
    var goods_id = that.data.share_goods_id
    var order_voice = that.data.order_voice  
    var voice_url = that.data.voice_url
    if (that.current_voice) {
      myaudio.src = that.current_voice
      myaudio.play()
    } else if (order_voice) {
      myaudio.src = order_voice
      myaudio.play()
    } else if (voice_url) {
      wx.downloadFile({
        url: new_rec_url, //音频文件url                  
        success: res => {
          if (res.statusCode === 200) {
            myaudio.src = res.tempFilePath
            myaudio.play()
            console.log('录音播放完成', res.tempFilePath)
          }
        }
      })
    } else {
      wx.showToast({
        title: '暂无录音',
        icon: 'none',
        duration: 1000
      })
    }
  },
  
  update_order_note:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var share_order_id = that.data.share_order_id
    var share_order_note = that.data.share_order_note
    var share_order_shape = that.data.share_order_shape 
    var new_rec_url = that.data.new_rec_url ? that.data.new_rec_url : that.data.voice_url
    var cardvoicetime = that.data.recordingTimeqwe ? that.data.recordingTimeqwe:that.data.cardvoicetime
    wx.request({
      url: weburl + '/api/client/update_order_note',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        order_id: share_order_id,
        rcv_note: share_order_note,
        order_shape: share_order_shape,
        order_voice: new_rec_url,
        order_voicetime: cardvoicetime,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('wishshare 修改订单信息完成:', res.data.result);
        var order_data = res.data.result;
        if (res.data.status=='n') {
          wx.showToast({
            title: res.data.info,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  onLoad (options) {
    var that = this
    var share_order_id = options.share_order_id ? options.share_order_id : 0
    var share_order_shape = options.share_order_shape ? options.share_order_shape : 1
    var card_type = options.card_type ? options.card_type:0
    that.get_project_gift_para()
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        avatarUrl: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        card_type: card_type,
      })
      console.log('wishshare onShow get userInfo：', userInfo)
    })
    if (share_order_id > 0 && (parseInt(share_order_shape) == 5 || parseInt(share_order_shape) == 4)){
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
      wx.request({
        url: weburl + '/api/client/query_order',
        method: 'POST',
        data: {
          username: username ? username : openid,
          access_token: token,
          order_id: share_order_id,
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          //console.log(' wishshare onload() 订单查询:', res.data.result)
          var orderObjects = res.data.result
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            if (orderObjects[i]['logo'].indexOf("http") < 0) {
              orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
            }
            orderObjects[i]['logo'] = orderObjects[i]['logo'].replace('http:','https:')
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
              orderObjects[i]['order_sku'][j]['sku_image'] = orderObjects[i]['order_sku'][j]['sku_image'].replace('http:', 'https:')
            }
          }
        
          if ((orderObjects[0]['shape'] == 5 || orderObjects[0]['shape'] == 4) && orderObjects[0]['m_desc']) {
            //console.log(' wishshare onload() 互动卡订单 m_desc:', orderObjects[0]['m_desc'])
            var m_desc = JSON.parse(orderObjects[0]['m_desc'])
            var voice_url = m_desc['voice']
            if (voice_url) {
              wx.downloadFile({
                url: voice_url, //音频文件url                  
                success: res => {
                  if (res.statusCode === 200) {
                    console.log('录音文件下载完成', res.tempFilePath)
                    that.setData({
                      order_voice: res.tempFilePath,
                      voice_url: voice_url,
                    })
                  }
                }
              })
            }
            //var card_register_info = m_desc['card_register_info']
            
            that.setData({
              card_register_info: m_desc['card_register_info'] ? m_desc['card_register_info']:'',
              card_name_info: m_desc['card_name_info'] ? m_desc['card_name_info'] : '',
              card_cele_info: m_desc['card_cele_info'] ? m_desc['card_cele_info'] : '',
              card_template: m_desc['card_template'] ? m_desc['card_template'] : '',
              card_color: m_desc['color'] ? m_desc['color']:'#333',
              card_type: m_desc['card_template']? m_desc['card_template'][0]['type']:0,
            })
            console.log('card card_template:', that.data.card_template)
            wx.setNavigationBarTitle({
              title: '互动卡分享',
            })
          }
        }
      })
    }
    
    wx.getSystemInfo({
      success: function (res) {
        console.log('wishshare getSystemInfo:',res)
        that.setData({
          windowHeight: res.windowHeight ? res.windowHeight:that.data.windowHeight,
          windowWidth: res.windowWidth ? res.windowWidth : that.data.windowWidth,
          dkheight: res.windowHeight - 10,
        })
        if (res.platform == "ios") {
          var version = res.SDKVersion;
          if (util.compareVersion(version, '2.3.0') >= 0) {
            wx.setInnerAudioOption({
              obeyMuteSwitch: false
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，静音模式下可能会导致播放音频失败。'
            })
          }
        }
      }
    })
   
    setTimeout(function () {
      that.reloadData(options)
    }, 1000)
    
  },
  onShow:function(){
   var that = this
  
  },

  reloadData: function (options){
    var that = this
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var task = options.task ? options.task : 0
    var task_image = options.image ? options.image : ''
    var msg_id = options.msg_id ? options.msg_id : ''
    var activity_id = options.activity_id ? options.activity_id : 0
    var activity_name = options.activity_name ? options.activity_name : 0
    var activity_image = options.activity_image ? options.activity_image : ''
    var activity_headimg = options.activity_headimg ? options.activity_headimg : that.data.activity_avatarUrl
    var share_activity_title = options.share_activity_title ? options.share_activity_title : '这个地方真不错~'
    var share_goods_id = options.share_goods_id ? options.share_goods_id : 0
    var share_goods_name = options.share_goods_name ? options.share_goods_name : ''
    var share_goods_org = options.share_goods_org ? options.share_goods_org : '1' //5虚拟商品 1自营商品
    var share_goods_shape = options.share_goods_shape ? options.share_goods_shape : '1' //5贺卡请柬 4互动卡 1普通商品
    var share_goods_price = options.share_goods_price ? options.share_goods_price : 0
    var share_goods_image = options.share_goods_image ? options.share_goods_image : ''
    var share_goods_image2 = options.share_goods_image2 ? options.share_goods_image2 : ''
    var share_goods_qrcode_cache = options.share_goods_qrcode_cache ? options.share_goods_qrcode_cache : ''
    var share_goods_wx_headimg = options.share_goods_wx_headimg ? options.share_goods_wx_headimg : that.data.share_goods_avatarUrl
   
    var share_goods_default_title = ''
    if (share_goods_shape == 5) {
      share_goods_default_title = '平安是福'
    } else if (share_goods_shape == 4) {
      share_goods_default_title = '一起来吧'
    } else {
      share_goods_default_title = '这个礼物真不错，来看看吧，要是你能送我就更好了~'
    }
    var share_goods_title = options.share_goods_title ? options.share_goods_title : share_goods_default_title
    var share_goods_desc = options.share_goods_desc ? options.share_goods_desc : '送礼就是送心~'
    var share_art_id = options.share_art_id ? options.share_art_id : 0
    var share_art_cat_id = options.share_art_cat_id ? options.share_art_cat_id : 0
    var share_art_title = options.share_art_title ? options.share_art_title : ''
    var share_art_image = options.share_art_image ? options.share_art_image : ''
    var share_art_wx_headimg = options.share_art_wx_headimg ? options.share_art_wx_headimg : ''
    var share_order_id = options.share_order_id ? options.share_order_id : 0
    var share_order_note = options.share_order_note ? options.share_order_note : ''
    var share_order_shape = options.share_order_shape ? options.share_order_shape : '1'
    var share_order_bg = options.share_order_bg ? options.share_order_bg : ''
    var share_order_image = options.share_order_image ? options.share_order_image : ''
    var share_order_wx_headimg = options.share_order_wx_headimg ? options.share_order_wx_headimg : that.data.avatarUrl
    console.log('wishshare reloadData options:', options, 'share_order_wx_headimg:', share_order_wx_headimg, ' avatarUrl:', that.data.avatarUrl, 'share_goods_id:', share_goods_id,'')
    if (share_order_wx_headimg.indexOf("https://wx.qlogo.cn") >= 0) {
      share_order_wx_headimg = share_order_wx_headimg.replace('https://wx.qlogo.cn', weburl + '/qlogo')
    }
    //var cardvoice = wx.getStorageSync('cardvoice')
    //var cardvoicetime = wx.getStorageSync('cardvoicetime')

    that.setData({
      m_id: m_id,
      task: task,
      task_image: task_image,
      msg_id: msg_id,
      activity_id: activity_id,
      activity_image: activity_image,
      activity_name: activity_name,
      activity_headimg: activity_headimg,
      share_art_id: share_art_id,
      share_art_cat_id: share_art_cat_id,
      share_art_title: share_art_title,
      share_art_image: share_art_image,
      share_art_wx_headimg: share_art_wx_headimg,
      share_goods_id: share_goods_id,
      share_goods_price: share_goods_price,
      share_goods_name: share_goods_name,
      share_goods_org: share_goods_org,
      share_goods_shape: share_goods_shape,
      share_goods_image: share_goods_image,
      share_goods_image2: share_goods_image2,
      share_goods_wx_headimg: share_goods_wx_headimg,
      share_goods_title: activity_id > 0 ? share_activity_title : share_goods_title,
      share_goods_desc: share_goods_desc,
      share_goods_qrcode_cache: share_goods_qrcode_cache,
      share_order_shape: share_order_shape,
      share_order_id: share_order_id,
      share_order_note: share_order_note,
      share_order_bg: share_order_bg,
      share_order_image: share_order_image,
      share_order_wx_headimg: share_order_wx_headimg,
      //cardvoice: cardvoice,
      //cardvoicetime: cardvoicetime,
    })
    
    if (activity_name) {
      var title_len = activity_name.length
      if (title_len > 13) {
        wx.setNavigationBarTitle({
          title: activity_name.substring(0, 10) + '...'
        })
      } else {
        wx.setNavigationBarTitle({
          title: activity_name
        })
      }
    }
    that.share_image_creat()

  },
  bindTextAreaBlur: function (e) {
    var that = this
    var share_order_shape = that.data.share_order_shape
    if (share_order_shape == 5 || share_order_shape == 4){
       that.setData({
         share_order_note: e.detail.value
    })
    }else{
      that.setData({
        share_goods_title: e.detail.value
      })
    }
   
  }, 

  sharegoods: function () {
    var that = this
    var share_order_shape = that.data.share_order_shape
    if (share_order_shape==4) return
    that.setData({
      notehidden: !that.data.notehidden,
    })
  },

  share_image_creat:function(){
    var that = this
    var share_order_shape = that.data.share_order_shape + 0
    var activity_id = that.data.activity_id + 0
    var share_goods_id = that.data.share_goods_id + 0
    wx.showToast({
      title: (share_order_shape == 5 || share_order_shape == 4)?"加载中":"开始生成海报",
      icon: 'loading',
      duration: 1500,
    })
    console.log('share_image_creat share_goods_id:', share_goods_id, ' share_order_shape:', share_order_shape)
    if (share_goods_id>0 || activity_id>0 || share_order_shape>0){
      that.eventDraw()
      that.setData({
        loadingHidden: false,
      })
    }else{
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
        that.share_image_creat()
      }, 1200)
    }
   
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
   
    var share_goods_id = that.data.share_goods_id ? that.data.share_goods_id : 0
    var share_goods_bg = that.data.share_goods_bg
    var share_goods_name = that.data.share_goods_name ? that.data.share_goods_name : ''
    var share_goods_price = that.data.share_goods_price ? that.data.share_goods_price : 0
    var share_goods_image = that.data.share_goods_image ? that.data.share_goods_image : ''
    var share_goods_qrcode = that.data.share_goods_qrcode_cache ? that.data.share_goods_qrcode_cache : weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + share_goods_id+'&m_id='+m_id
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg :      that.data.share_goods_avatarUrl
    var share_goods_title = that.data.share_goods_title
    var share_goods_desc = that.data.share_goods_desc
    var nickname = that.data.nickname
    var share_art_id = that.data.share_art_id ? that.data.share_art_id : 0
    var share_art_cat_id = that.data.share_art_cat_id ? that.data.share_art_cat_id : 0
    var share_art_title = that.data.share_art_title ? that.data.share_art_title : ''
    var share_art_image = that.data.share_art_image ? that.data.share_art_image : ''
    var share_art_wx_headimg = that.data.share_art_wx_headimg ? that.data.share_art_wx_headimg : that.data.avatarUrl
    var share_art_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_art_id=' + share_art_id + '&share_art_cat_id=' + share_art_cat_id + '&m_id=' + m_id
    var share_order_id = that.data.share_order_id ? that.data.share_order_id : 0
    var share_order_note = that.data.share_order_note
    var share_order_shape = that.data.share_order_shape
    var share_order_bg = that.data.share_order_bg
    var card_register_info = that.data.card_register_info //shape:4 互动卡 
    var card_name_info = that.data.card_name_info //shape:4 互动卡 名片内容
    var card_cele_info = that.data.card_cele_info //shape:5 贺卡请柬 
    var card_template = that.data.card_template //shape:4 互动卡 名片模板
    //var card_type = that.data.card_type ? that.data.card_type:0
    //var card_color = that.data.card_color //贺卡请柬文字颜色
    var share_order_wx_headimg = that.data.share_order_wx_headimg
    var share_order_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_order_id=' + share_order_id + '&share_order_shape=' + share_order_shape + '&m_id=' + m_id
    wx.showLoading({
      title: '生成中',
      //mask: true
    })
    console.log('wishshare eventDraw share_order_shape:', share_order_shape, 'card_cele_info:', card_cele_info)
    
    if (activity_id>0){
      console.log('activity_id:', activity_id)
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
      console.log('share_goods_id:', share_goods_id)
      that.setData({
        painting: {
          width: 520,
          height: 900,
          windowHeight: 550,
          windowWidth: 1000,
          clear: true,
          background: '#fff',
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
              height: share_goods_price>0?350:480
            },
            {
              type: 'text',
              content: share_goods_name,
              fontSize: 20,
              color: '#333',
              textAlign: 'left',
              top: share_goods_price>0?490:620,
              left: 85,
              bolder: true,
              lineHeight: 25,
              MaxLineNumber: 2,
              breakWord: true,
              width: 350,
            },
            {
              type: 'text',
              content: share_goods_price>0?'￥' + share_goods_price:'',
              fontSize: 20,
              color: '#444444',
              textAlign: 'left',
              top: share_goods_price > 0 ? 550 : 670,
              left: 85,
              lineHeight: 25,
            },
            {
              type: 'text',
              content: 'Ta说:',
              fontSize: 20,
              color: '#444',
              textAlign: 'left',
              top: share_goods_price>0?630:695,
              left: 85,
              bolder: true,
            },
            {
              type: 'text',
              content: share_goods_title,
              fontSize: 18,
              color: '#666',
              textAlign: 'left',
              top: share_goods_price > 0 ? 660 :720 ,
              left: 85,
              lineHeight: 25,
              MaxLineNumber: 2,
              breakWord: true,
              width:350,
            },
            {
              type: 'rect',
              top: 770,
              left: 85,
              background: '#eeeeee',
              width: 360,
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
    } else if (share_order_shape == 4 && card_register_info && share_goods_id == 0) { //互动卡
      console.log('share_order_shape:', share_order_shape)
      var views_width = 500
      var views_height = 700 

      var views = [
        {
          type: 'image',
          url: share_order_bg,
          top: 5,
          left: 5,
          width: views_width ,
          height: views_height,
        }
      ]

      for (var i = 0; i < card_template.length; i++) {
        var view_item = {}
        view_item['top'] = card_template[i]['y'] * views_height
        view_item['left'] = card_template[i]['x'] * views_width
        view_item['width'] = card_template[i]['width'] * views_width
        view_item['height'] = card_template[i]['height'] * views_height
        view_item['lineHeight'] = card_template[i]['height'] * views_height
        if (card_template[i]['viewType'] == 1) {
          if (card_template[i]['typeId'] == 'card_register_adv') {
            view_item['type'] = 'image'
            view_item['url'] = card_register_info['card_register_adv'] ? card_register_info['card_register_adv'] : ''
            view_item['roundedRect'] = 10
          }
          if (card_template[i]['typeId'] == 'card_register_logo' && card_register_info['has_shlogo']) {
            view_item['type'] = 'image'
            view_item['url'] = share_order_qrcode ? share_order_qrcode : ''
            view_item['width'] = 70
            view_item['height'] = 70
            view_item['borderRadius'] = 35
          }
        } else {
          view_item['type'] = 'text'
          view_item['fontSize'] = card_template[i]['styleSheet']['fontSize'] 
          view_item['fontSize'] = parseInt(view_item['fontSize']) + 8
          view_item['color'] = card_template[i]['color'] ? card_template[i]['color'] : '#333'
          view_item['textAlign'] = 'left'
          view_item['breakWord'] = false
          if (card_template[i]['typeId'] == 'card_register_title') {
            view_item['content'] = card_register_info['card_register_title'] ? card_register_info['card_register_title'].trim() : ''
            view_item['left'] = view_item['left'] 
          } else if (card_template[i]['typeId'] == 'card_register_content') {
            //console.log('share_order_shape', share_order_shape,' card_register_content:',card_register_info)
            view_item['MaxLineNumber'] = 6 
            view_item['breakWord'] = true
            view_item['lineHeight'] = 25
            //view_item['width'] = views_width
            view_item['content'] = card_register_info['card_register_content'] ? card_register_info['card_register_content'] : ''
          } else if (card_template[i]['typeId'] == 'card_register_ownername') {
            view_item['content'] = card_register_info['card_register_ownername'] ? '发起人:'+card_register_info['card_register_ownername'] : ''
          } else if (card_template[i]['typeId'] == 'card_register_ownerwechat') {
            view_item['content'] = card_register_info['card_register_ownerwechat'] ? '微信:'+card_register_info['card_register_ownerwechat'] : ''
          } else if (card_template[i]['typeId'] == 'card_register_addr') {
            view_item['content'] = card_register_info['card_register_addr'] ? '地址:'+card_register_info['card_register_addr'] : ''
          } else if (card_template[i]['typeId'] == 'card_register_lim') {
            view_item['content'] = card_register_info['card_register_lim']>0 ? '人数:'+card_register_info['card_register_lim'] : '人数:不限制'
          } else if (card_template[i]['typeId'] == 'card_register_fee') {
            view_item['content'] = card_register_info['card_register_fee']>0 ? '费用:￥'+card_register_info['card_register_fee'] : '费用:免费'
          } else if (card_template[i]['typeId'] == 'register_start_date' && card_register_info['has_registerdue']) {
            view_item['content'] = card_register_info['register_start_date'] ? '注册：'+card_register_info['register_start_date'] +' ': ''
          } else if (card_template[i]['typeId'] == 'register_start_time' && card_register_info['has_registerdue']) {
            view_item['content'] = card_register_info['register_start_time'] ? card_register_info['register_start_time'] : ''
          } else if (card_template[i]['typeId'] == 'register_end_date' && card_register_info['has_registerdue']) {
            view_item['content'] = card_register_info['register_end_date'] ? card_register_info['register_end_date'] : ''
          } else if (card_template[i]['typeId'] == 'register_end_time' && card_register_info['has_registerdue']) {
            view_item['content'] = card_register_info['register_end_time'] ? card_register_info['register_end_time'] : ''
          } else if (card_template[i]['typeId'] == 'action_start_date' && card_register_info['has_actiondue']) {
            view_item['content'] = card_register_info['action_start_date'] ? '活动：'+card_register_info['action_start_date']+' ' : ''
          } else if (card_template[i]['typeId'] == 'action_start_time' && card_register_info['has_actiondue']) {
            view_item['content'] = card_register_info['action_start_time'] ? card_register_info['action_start_time'] : ''
          } else if (card_template[i]['typeId'] == 'action_end_date' && card_register_info['has_actiondue']) {
            view_item['content'] = card_register_info['action_end_date'] ? card_register_info['action_end_date'] : ''
          } else if (card_template[i]['typeId'] == 'action_end_time' && card_register_info['has_actiondue']) {
            view_item['content'] = card_register_info['action_end_time'] ? card_register_info['action_end_time'] : ''
          }
          //view_item['fontSize'] = view_item['fontSize'] < 15 ? 15 : view_item['fontSize']
        }

        views = views.concat(view_item)
      }
      that.setData({
        painting: {
          width: views_width,
          height: views_height,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: views
        }
      })
    } else if (share_order_shape == 4 && card_name_info && share_goods_id == 0) { //互动卡 名片
      var views_width = that.data.windowWidth
      var views_height = 250 
      /*
      wx.getImageInfo({
        src: share_order_bg,
        success: function (res) {
          views_width = res.width
          views_height = res.height  
        }
      })  
      */
      var views = [
        {
          type: 'image',
          url: share_goods_bg,
          top: 0,
          left: 0,
          width: views_width,
          height: views_height,
        },
        {
          type: 'image',
          url: share_order_bg,
          top: 5,
          left: 5,
          width: views_width - 10,
          height: views_height - 10,
        }
      ]
     
      for (var i = 0; i < card_template.length; i++) {
        var view_item = {}
        view_item['top'] = card_template[i]['y'] * views_height
        view_item['left'] = card_template[i]['x'] * views_width
        view_item['width'] = card_template[i]['width'] * views_width
        view_item['height'] = card_template[i]['height'] * views_height
        view_item['lineHeight'] = card_template[i]['height'] * views_height
        if (card_template[i]['viewType'] == 1) {  
          if (card_template[i]['typeId'] == 'card_logo') {
            view_item['type'] = 'image'
            view_item['url'] = card_name_info['card_name_logo_image'] ? card_name_info['card_name_logo_image'] : ''
            view_item['width'] = 50
            view_item['height'] = 50
          } 
          if (card_template[i]['typeId'] == 'card_qrcode' && card_name_info['has_shlogo'] ) {
            view_item['type'] = 'image'
            view_item['url'] = share_order_qrcode ? share_order_qrcode : ''
            view_item['width'] = 36
            view_item['height'] = 36
            view_item['borderRadius'] = 18
          }
        } else {
          view_item['type'] = 'text'
          view_item['fontSize'] = card_template[i]['styleSheet']['fontSize']
          view_item['fontSize'] = parseInt(view_item['fontSize']) + 8
          view_item['color'] = card_template[i]['color'] ? card_template[i]['color'] : '#333'
          view_item['textAlign'] = 'left'
          view_item['breakWord'] = false
          if (card_template[i]['typeId'] == 'card_name') {
            view_item['content'] = card_name_info['card_name_name'] ? card_name_info['card_name_name'].trim() : ''
            view_item['left'] = view_item['left']  //+ 5 * (10 - view_item['content'].length)
            console.log('share_order_shape length:', )
          } else if (card_template[i]['typeId'] == 'card_title') {
            view_item['content'] = card_name_info['card_name_title'] ? card_name_info['card_name_title'] : ''
          } else if (card_template[i]['typeId'] == 'card_phone') {
            view_item['content'] = card_name_info['card_name_phone'] ? card_name_info['card_name_phone'] : ''
          } else if (card_template[i]['typeId'] == 'card_tel') {
            view_item['content'] = card_name_info['card_name_tel'] ? card_name_info['card_name_tel'] : ''
          } else if (card_template[i]['typeId'] == 'card_email') {
            view_item['content'] = card_name_info['card_name_email'] ? card_name_info['card_name_email'] : ''
          } else if (card_template[i]['typeId'] == 'card_weburl') {
            view_item['content'] = card_name_info['card_name_website'] ? card_name_info['card_name_website'] : ''
          } else if (card_template[i]['typeId'] == 'card_publicwechat') {
            view_item['content'] = card_name_info['card_name_publicwechat'] ? card_name_info['card_name_publicwechat'] : ''
          } else if (card_template[i]['typeId'] == 'card_companyname') {
            view_item['content'] = card_name_info['card_name_company'] ? card_name_info['card_name_company'] : ''
          } else if (card_template[i]['typeId'] == 'card_addr') {
            view_item['content'] = card_name_info['card_name_addr'] ? card_name_info['card_name_addr'] : ''
          }
         
        }
        views = views.concat(view_item)
      }
      that.setData({
        painting: {
          width: views_width,
          height: views_height,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: views
        }
      })
    } else if ((share_order_shape == 5 || card_type == 10) && share_goods_id == 0) { //贺卡请柬
      console.log('share_order_shape:', share_order_shape, ' card_template:', card_template)
      //var views_width = that.data.windowWidth
      var views_width = 500
      var views_height = 700 
      /*
      wx.getImageInfo({
        src: share_order_bg,
        success: function (res) {
          views_width = res.width
          views_height = res.height  
        }
      })  
      */
      var views = [
        {
          type: 'image',
          url: share_order_bg,
          top: 5,
          left: 5,
          width: views_width ,
          height: views_height,
        }
      ]

      for (var i = 0; i < card_template.length; i++) {
        var view_item = {}
        view_item['top'] = card_template[i]['y'] * views_height
        view_item['left'] = card_template[i]['x'] * views_width
        view_item['width'] = card_template[i]['width'] * views_width
        view_item['height'] = card_template[i]['height'] * views_height
        view_item['lineHeight'] = card_template[i]['height'] * views_height
        
        if (card_template[i]['viewType'] == 1) {
          if (card_template[i]['typeId'] == 'card_cele_logo') {
            view_item['type'] = 'image'
            view_item['url'] = card_cele_info['card_cele_logo'] ? card_cele_info['card_cele_logo'] : ''
            view_item['roundedRect'] = 10
          }
          if (card_template[i]['typeId'] == 'card_cele_qrcode' && card_cele_info['has_shlogo']) {
            view_item['type'] = 'image'
            view_item['url'] = share_order_qrcode ? share_order_qrcode : ''
            view_item['width'] = 80
            view_item['height'] = 80
            view_item['borderRadius'] = 40
          }
        } else {
          view_item['type'] = 'text'
          view_item['textAlign'] = 'left'
          view_item['fontSize'] = card_template[i]['styleSheet']['fontSize']
          view_item['fontSize'] = parseInt(view_item['fontSize']) + 8
          view_item['color'] = card_template[i]['color'] ? card_template[i]['color'] : '#333'
          view_item['breakWord'] = false
          if (card_template[i]['typeId'] == 'card_cele_title') {
            view_item['textAlign'] = 'right'
            view_item['content'] = card_cele_info['card_cele_title'] ? card_cele_info['card_cele_title'].trim() : ''
            //view_item['left'] = view_item['left']  //+ 5 * (10 - view_item['content'].length)
            
          } else if (card_template[i]['typeId'] == 'card_cele_content') {
            view_item['MaxLineNumber'] = 6
            view_item['breakWord'] = true
            view_item['lineHeight'] = 25
            view_item['content'] = card_cele_info['card_cele_content'] ? card_cele_info['card_cele_content'] : ''
          }
        
          console.log('share_order_shape card cele card_template:', card_template[i])
        }

        views = views.concat(view_item)
      }
      that.setData({
        painting: {
          width: views_width,
          height: views_height,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          clear: true,
          background: 'white',
          views: views
        }
      })  
    } else if (share_art_id > 0) {
      console.log('share_art_id:', share_art_id)
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
      console.log('其他 else' )
      that.setData({
        painting: {
          width: 375,
          height: 667,
          windowHeight: that.data.windowHeight,
          windowWidth: that.data.windowWidth,
          background: 'white',
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
    console.log('二维码 paint:', that.data.painting)
    that.setData({
      loadingHidden: false,
    })
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
    var share_goods_shape = that.data.share_goods_shape ? that.data.share_goods_shape : '1'
    var share_goods_org = that.data.share_goods_org ? that.data.share_goods_org : '1' //5虚拟商品 1自营商品
    var share_goods_default_title = ''
    if (share_goods_shape==5){
      share_goods_default_title = '平安是福' 
    } else if (share_goods_shape==4){
      share_goods_default_title = '一起来吧' 
    }else{
      share_goods_default_title = '这个礼物真不错，来看看吧，要是你能送我就更好了~' 
    }
    var share_goods_title = that.data.share_goods_title ? that.data.share_goods_title : share_goods_default_title
    
    var share_goods_desc = that.data.share_goods_desc ? that.data.share_goods_desc : '送礼就是送心~'
    var share_art_id = that.data.share_art_id
    var share_art_cat_id = that.data.share_art_cat_id
    var share_art_image = that.data.share_art_image
    var share_art_title = that.data.share_art_title
    var share_order_id = that.data.share_order_id
    var share_order_image = that.data.share_order_image
    var share_order_shape = that.data.share_order_shape
    var share_order_note = that.data.share_order_note
   
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
      if (share_order_shape == 4 ) {
        if (that.data.card_register_info){
          shareObj['title'] = that.data.card_register_info['card_register_title'] ? that.data.card_register_info['card_register_title'] : ''  
        } else if (that.data.card_name_info){
          shareObj['title'] = that.data.card_name_info['card_name_name'] ? that.data.card_name_info['card_name_name']+'的名片' : '' 
        }
        shareObj['imageUrl'] = that.data.shareImage //share_order_image
        shareObj['path'] = '/pages/order/receive/receive?receive=1&order_id=' + share_order_id + '&order_shape=' + share_order_shape + '&mid=' + m_id
      }
      if (share_order_shape == 5) {
        shareObj['title'] = share_order_note  
        shareObj['imageUrl'] = that.data.shareImage //share_order_image
        shareObj['path'] = '/pages/order/receive/receive?receive=1&order_id=' + share_order_id + '&order_shape=' + share_order_shape + '&mid=' + m_id
      }
      console.log('送心分享', shareObj)
    }
    // 返回shareObj
    return shareObj;

  },

})
