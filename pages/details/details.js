var util = require('../../utils/util.js')
var app = getApp();
var wxparse = require("../../wxParse/wxParse.js")
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var from_page = app.globalData.from_page;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid
var secret = app.globalData.secret
var uploadurl = app.globalData.uploadurl
const recorderManager = wx.getRecorderManager()
const myaudio = wx.createInnerAudioContext();
const options = {
  duration: 10000,//指定录音的时长，单位 ms
  sampleRate: 16000,//采样率
  numberOfChannels: 1,//录音通道数
  encodeBitRate: 96000,//编码码率
  format: 'mp3',//音频格式，有效值 aac/mp3
  frameSize: 50,//指定帧大小，单位 KB
}
const version = wx.getSystemInfoSync().SDKVersion;
if (compareVersion(version, '2.3.0') >= 0) {
  wx.setInnerAudioOption({
    obeyMuteSwitch: false
  })
} else {
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，静音模式下可能会导致播放音频失败。'
  })
}
// 版本对比  兼容
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])
    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

Page({
  data: {
        title_name: '详情',
        title_logo: '../../images/footer-icon-05.png',
        share_title:'这个礼物真不错，来看看吧，要是你能送我就更好了~',
        card_blessing:'送心礼物祝您:万事如意，平平安安！',
        share_desc:'送心礼物，开启礼物社交时代！',
        share_avatarUrl: weburl + '/uploads/avatar.png',
        share_goods_avatarUrl: weburl + '/uploads/avatar.png',
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        user:null,
        userInfo:{},
        username:null,
        indicatorDots: true,
        vertical: false,
        autoplay: false,
        page:1,
        interval: 3000,
        duration: 300,
        circular: true,
        goodsname:'',
        goodsshortname: '',
        goodsinfo:[],
        goodsprice: 0,
        goodssale: 0,
        goodsid: 0,
        goodsdiscount:100,
        discountinfo:'9折优惠券',
        sku_gov_price:0,
        sku_earnest_price:0,
        sku_sell_price: 0,
        sku_id:0,
        commodityAttr:[],
        attrValueList:[],
        firstIndex:0,
        cur_img_id:0,
        image:'',
        image_pic:[],
        hideviewgoodsinfo:true,
        hideviewgoodspara:true,
        dkheight: 300,
        scrollTop: 0,
        scrollTop_init:10,
        toView: 'red',
        hideviewgoodsinfoflag:true, 
        hideviewgoodsparaflag:true,
        modalHidden: true,//是否隐藏对话框  
        dkcontent:[],
        goodsPicsInfo:[],
        selectValueInfo:'',
        wishflag:0,
        goodsinfoshowflag:0,
        shop_type:shop_type,
        comm_list: [],
        image_save_count:0,
        image_save_times:0,
        is_buymyself:0,
        buynum:1,
        notehidden:true,
        has_cardpayed:0,
        openRecordingdis: "block", //显示录机图标
        shutRecordingdis: "none", //隐藏停止图标
        recordingTimeqwe: 0, //录音计时
        setInter: "",  
  },

  //录音计时器
  recordingTimer: function() {
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
    if (form_name == 'buyGift') {
      that.buyGift()
    } else if (form_name == 'buyMyself') {
      that.buyMyself()
    } else if (form_name == 'wishcart') {
      that.setData({
        is_buymyself: 0,
      })
      that.wishCart()
    } else if (form_name == 'mycommTapTag') {
      that.setData({
        is_buymyself: 0,
      })
      that.mycommTapTag()
    } else if (form_name == 'myblessing') {
      that.myblessing()  
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
       // console.log('submintFromId() update success: ', res.data)
      }
    })
  },
  goBack: function () {
    var pages = getCurrentPages();
   // console.log('details goBack pages:', pages)
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      app.globalData.from_page = '/pages/details/details'
      app.globalData.hall_gotop = 1
      wx.switchTab({
        url: '/pages/hall/hall'
      })
    }
  },
  commTapTag: function () {
    var that = this
    wx.navigateTo({
      url: '../goods/commentlist/commentlist?goods_id=' + that.data.goodsid
    })

  },
  mycommTapTag: function () {
    var that = this
    var goods_skuid = that.data.commodityAttr[0]['id']
    var goods_id = that.data.goodsid
    wx.navigateTo({
      url: '../goods/comment/comment?goods_id=' + goods_id + '&goods_skuid=' + goods_skuid +'&comm_type='+1
    })

  },
  returnTapTag: function () {
    var that = this
    wx.switchTab({
      url: '/pages/hall/hall'
    })

  },
  swiperchange: function (e) {
    var that = this
    var cur_img_id = e.detail.current
    //console.log(e)
   
    that.setData({
      cur_img_id: cur_img_id,
    })
    //console.log('detail swiperchange:', e.detail.current, 'cur_img_id:',cur_img_id)
  },

  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      card_blessing: e.detail.value
    })
  }, 
  //确定按钮点击事件 
  shareConfirm: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
      hidden_share: !that.data.hidden_share
    })
  },
  //取消按钮点击事件  
  shareCandel: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
    })
  },  
  sharegoodsTapTag: function () {
    var that = this
    var share_goods_id = that.data.goodsid
    var share_goods_org = that.data.goodsorg
    var share_goods_shape = that.data.goodsshape
    var share_goods_price = that.data.goodsprice
    var share_goods_name = that.data.goodsname
    share_goods_name = share_goods_name.replace(/\&/g, ' ')
    var cur_img_id = that.data.cur_img_id
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : that.data.share_avatarUrl
    var share_goods_title = share_goods_org=='5'?'送心礼物，祝您万事如意，平平安安！':that.data.share_title
    var share_goods_desc = that.data.share_desc
    var share_avatarUrl = that.data.share_avatarUrl
    var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
    var goods_image_cache = wx.getStorageSync('goods_image_cache_' + share_goods_id)
    var share_goods_qrcode = wx.getStorageSync('goods_qrcode_cache_' + share_goods_id)
  
    if (share_goods_shape == 5 || share_goods_shape==undefined) return
    share_goods_wx_headimg = wx_headimg_cache ? wx_headimg_cache : share_goods_wx_headimg
    if (that.data.cur_img_id==0){ 
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
      share_goods_image = goods_image_cache ? goods_image_cache : share_goods_image
    }else{
      cur_img_id = cur_img_id - that.data.image_video.length
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
    }
    //console.log('sharegoodsTapTag share_goods_qrcode:', share_goods_qrcode, 'share_goods_id:', share_goods_id, 'cur_img_id:', cur_img_id, 'image_save_count:',that.data.image_save_count)
   
    if (that.data.image_save_count < 3){
      if (that.data.image_save_times > 8) { //8次不成功返回上一级
        return
      }
      setTimeout(function () {
        wx.showToast({
          title: "开始分享" ,
          icon: 'loading',
          duration: 2000,
        })
      
        var image_save_times = that.data.image_save_times+1
         that.setData({
           image_save_times: image_save_times,
        })
        that.sharegoodsTapTag()
      }, 1500)
      return
    }
    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?share_goods_id=' + share_goods_id + '&share_goods_shape=' + share_goods_shape +'&share_goods_org=' + share_goods_org+'&share_goods_name=' + share_goods_name + '&share_goods_price=' + share_goods_price+ '&share_goods_image=' + share_goods_image + '&share_goods_wx_headimg=' + share_goods_wx_headimg + '&share_goods_title=' + share_goods_title + '&share_goods_desc=' + share_goods_desc + '&share_goods_image2=' + that.data.image_pic[cur_img_id]['url'] + '&share_goods_qrcode_cache=' + share_goods_qrcode
    })
    /*
    wx.getStorageInfo({
      success: function (res) {
        console.log('detail 缓存列表 keys:', res.keys, 'currentSize:', res.currentSize, 'limitSize:', res.limitSize)
      }
    })
    */
  },

  image_save:function(image_url,image_cache_name){
    var that = this
    console.log('imge save image url:', image_url, 'image_cache_name:', image_cache_name)
    wx.downloadFile({
      url: image_url,
      success: function (res) {
        if (res.statusCode === 200) {
          var img_tempFilePath = res.tempFilePath
         // console.log('图片下载成功' + res.tempFilePath)
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              console.log('detail image_save 图片缓存成功', image_cache_name,res.savedFilePath)  
              wx.setStorageSync(image_cache_name, res.savedFilePath)
              if (image_cache_name == 'goods_image_cache_' + that.data.goodsid || image_cache_name == 'goods_qrcode_cache_' + that.data.goodsid || image_cache_name == 'wx_headimg_cache') {
                console.log('image_save 图片缓存成功', image_cache_name, 'image_save_count', that.data.image_save_count++)
                that.setData({
                  image_save_count: that.data.image_save_count++,
                })
              }
            },
            fail(res) {
              console.log(' detail image_save 图片缓存失败', image_cache_name,res) 
              var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
              var goods_image_cache = wx.getStorageSync('goods_image_cache_' + that.data.goodsid)
              var goods_qrcode_cache = wx.getStorageSync('goods_qrcode_cache_'+that.data.goodsid)
              fs.getSavedFileList({
                success(res) {
                  console.log('detail getSavedFileList 缓存文件列表', res)
                  for (var i = 0; i < res.fileList.length;i++){
                    if (res.fileList[i]['filePath'] != wx_headimg_cache && res.fileList[i]['filePath'] != goods_image_cache && res.fileList[i]['filePath'] != goods_qrcode_cache){
                      fs.removeSavedFile({
                        filePath: res.fileList[i]['filePath'],
                        success(res) {
                          console.log('detail image_save 缓存清除成功', res)
                        },
                        fail(res) {
                          console.log('detail image_save 缓存清除失败', res)
                        }
                      })
                    }
                  }
                  fs.saveFile({
                    tempFilePath: img_tempFilePath, // 传入一个临时文件路径
                    success(res) {
                      wx.setStorageSync(image_cache_name, res.savedFilePath)
                     // console.log('image_save 图片缓存成功', image_cache_name, wx.getStorageSync(image_cache_name), 'goods id:', that.data.goodsid )
                      if (image_cache_name == 'goods_image_cache_' + that.data.goodsid || image_cache_name == 'goods_qrcode_cache_' + that.data.goodsid || image_cache_name == 'wx_headimg_cache'){
                       // console.log('image_save 图片缓存成功', image_cache_name, 'image_save_count',that.data.image_save_count)
                        that.setData({
                          image_save_count: that.data.image_save_count++,
                        })
                      }
                    },
                  })
                },
                fail(res) {
                  console.log('detail getSavedFileList 缓存文件列表查询失败', res)
                }
              })
            },
          })
        } else {
          console.log('image_save 响应失败', res.statusCode)
        }
      }
    })
  },
  //点击播放按钮，封面图片隐藏,播放视频
  bindplay: function (e) {
    console.log('detail bindplay 响应失败', e)
    this.setData({
      tab_image: "none"
    }),
      this.videoContext.play()
  },

  myblessing: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
    })
  },

  startRecode: function () {
    var that = this
    console.log("start")
    wx.showLoading({
      title: '录音中',
    })
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
    
    //开始录音计时   
    that.recordingTimer()
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {
      console.log('开始录音')
    })
    //错误回调
    recorderManager.onError((res) => {
      console.log('错误回调:',res);
    })
  },

  endRecode: function () {//结束录音 
    var that = this
    var goods_id = that.data.goods_id
    that.setData({
      shutRecordingdis: "none",
      openRecordingdis: "block"
    })
    recorderManager.stop();
    recorderManager.onStop((res) => {
      let timestamp = util.formatTime(new Date())
      console.log('停止录音', res.tempFilePath)
      wx.hideLoading()
      const {tempFilePath} = res
      //结束录音计时  
      clearInterval(that.data.setInter)
      myaudio.src = res.tempFilePath
      //myaudio.autoplay = true
      that.save_recorder(res.tempFilePath)
    })
  },

  save_recorder: function (voice) {
    var that = this
    var goods_id = that.data.goods_id
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
          wx.setStorageSync('cardvoice', new_rec_url)
          /*
          wx.showToast({
            title: '录音上传完成',
            icon: 'none',
            duration: 1000,
          })
          */
          console.log('录音上传完成', voice, new_rec_url)
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
    var new_rec_url = that.data.new_rec_url
    console.log('录音文件url:' , myaudio.src)
    if (new_rec_url) {
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
  
  onLoad:function(options) {
        var that = this
        var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
        var phonemodel = wx.getStorageSync('phonemodel') ? wx.getStorageSync('phonemodel') : 'Andriod'
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        username = options.username ? options.username : username
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var keyword = options.keyword ? options.keyword:''
        var is_satisfy = options.is_satisfy ? options.is_satisfy:0
        var has_cardpayed = options.has_cardpayed ? options.has_cardpayed : 0
        var rule_selected_info = options.rule_selected_info ? options.rule_selected_info:''
        var goodsorg = options.goods_org ? options.goods_org : 1
        var goodsshape = options.goods_shape ? options.goods_shape : 1
        var page = that.data.page
        var scene = decodeURIComponent(options.scene)
        var goodsname = options.name
        var goodsid = options.id
        var share_goods_id = options.goodsid
        goodsid = goodsid ? goodsid : share_goods_id
        var refer_mid = options.mid ? options.mid:0 //分享人id
        var goodsinfo = options.goods_info ? options.goods_info:''
        var goodsprice = options.goods_price
        var marketprice = options.goods_marketprice 
        var goodssale = options.sale
        var image = options.image
        var activity_image = options.activity_image
        var share_goods_image = activity_image ? activity_image : image
        var shop_type =  that.data.shop_type
        var qr_type = 'wishshare' 
        var image_video = []
        var image_pic = []
    
        console.log('detail options:', options,'scene:',scene)
        that.setData({
          is_apple: phonemodel.indexOf("iPhone")>= 0?1:0,
          image_save_count:0,
          keyword: keyword,
          is_satisfy:is_satisfy,
          rule_selected_info:rule_selected_info,
        })
        if(scene){
          if (scene.indexOf("goodsid=") >= 0) {
            var goodsidReg = new RegExp(/(?=goodsid=).*?(?=\&)/)
            var midReg = new RegExp(/\&mid=(.*)/)
        
            var scene_goodsid = scene.match(goodsidReg)[0]
            goodsid = scene_goodsid ? scene_goodsid.substring(8,scene_goodsid.length):goodsid
            //m_id = scene.match(/mid=(.*)/)[1] //取 mid=后面所有字符串
            var scene_mid = scene.match(midReg) ? scene.match(midReg)[0]: 0
            refer_mid = scene_mid?scene_mid.substring(5, scene_mid.length):refer_mid
            //console.log('scene_goodsid:', scene_goodsid, 'mid:', scene_mid, ' goodsid:', goodsid, 'refer_id:', refer_mid)//输出  
          }
        }
        if (image){
          if (image.indexOf("%3A%2F%2F") >= 0){
            image = decodeURIComponent(image)
            share_goods_image = activity_image ? activity_image : image
            goodsname = decodeURIComponent(goodsname)
            goodsinfo = decodeURIComponent(goodsinfo)
          }
          if (image.indexOf(".mp4") >= 0) {
            var video_init = {
              id: 0,
              url: image,
              activity_image: activity_image,
            }
            image_video.push(video_init)
            that.setData({
              image_video: image_video,
            })
          }
          var image_init = {
            id: 0,
            goods_id: goodsid,
            url: activity_image ? activity_image : image,
          }
          image_pic.push(image_init)
          that.setData({
            image_pic: image_pic,
          })
        }
       
        that.showGoodspara()
        goodsinfo = goodsinfo == 'undefined' ? '' : goodsinfo
        that.setData({
          goodsname: goodsname ? goodsname:'',
          goodsinfo: goodsinfo ? goodsinfo:'',
          goodsorg: goodsorg,
          goodsshape: goodsshape,
          goodsid: goodsid ? goodsid:0,
          refer_mid: refer_mid,
          goodsprice: goodsprice ? goodsprice:0,
          marketprice: marketprice ? marketprice : '',
          goodssale: goodssale ? goodssale:0,
          m_id:m_id,
        })
    var share_goods_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + goodsid + '&m_id=' + m_id
    that.image_save(share_goods_qrcode, 'goods_qrcode_cache_'+goodsid)
   // console.log('商品分享二维码下载缓存 goods_qrcode_cache_'+goodsid, 'share_goods_image:', share_goods_image)
  
    //console.log('detail onLoad goodsid:', goodsid, ' share_goods_image:', share_goods_image, ' goodsname:', goodsname, ' goodsinfo:', goodsinfo, 'scene:', scene);
        //that.setNavigation()
        if (goodsid>0){
          if (share_goods_image){
            that.image_save(share_goods_image, 'goods_image_cache_' + goodsid)
           // console.log('商品详情图片下载缓存 goods_image_cache_' + goodsid, share_goods_image)
          } 
          wx.request({
            url: weburl + '/api/client/get_goods_list',
            method: 'POST',
            data: { 
              username: options.username ? options.username : username, 
              access_token: token, 
              goods_id: goodsid,
              shop_type:shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var goods_info = res.data.result
              var ret_info = res.data.info
              console.log('获取单个产品信息 res.data:',res.data,' goods info:',goods_info);
              if (goods_info) {
                that.setData({
                  goodsname: goods_info[0]['name'],
                  goodsinfo: goods_info[0]['act_info'],
                  goodstag: goods_info[0]['goods_tag'],
                  goodsprice: goods_info[0]['sell_price'],
                  marketprice: goods_info[0]['market_price'],
                  goodssale: goods_info[0]['sale'],
                  goodsorg: goods_info[0]['goods_org'],
                  goodsshape: goods_info[0]['shape'],
                  //goodsshortname: goods_info[0]['name'] ? goods_info[0]['name'].trim().substring(0, 20) + '...' : '',
                  goodscoverimg: goods_info[0]['activity_image'],
                  share_title: goods_info[0]['3D_image'] ? goods_info[0]['3D_image']:that.data.share_title, 
                  share_goods_wx_headimg: goods_info[0]['share_goods_wx_headimg'],
                  goodsdiscount: goods_info[0]['discount'],
                  discountinfo: goods_info[0]['discount_info'],
                })
                //var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
                that.image_save(that.data.share_goods_wx_headimg, 'wx_headimg_cache')
               // console.log('头像图片下载缓存 wx_headimg_cache')
                
              }else{
                wx.showToast({
                  title: '商品已下架',
                  icon: 'loading',
                  duration: 3000
                })
                setTimeout(function () {
                  wx.navigateBack();
                }, 1500)
              }
            }
          })
        }else{
          console.log('单个产品名称为空',goodsid);
          return
        }

        // 商品详情图片
       // console.log('商品详情图片', image_pic)
        wx.request({
          url: weburl+'/api/client/get_goodsdesc_list',
          method: 'POST',
          data: { 
            username: username, 
            access_token: token, 
            goods_id: goodsid, 
            refer_mid: refer_mid, //分享人id
            page: page,
            shop_type: shop_type,
            keyword: keyword,
            is_satisfy: is_satisfy,
            rule_selected_info: rule_selected_info,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
           // console.log('get_goodsdesc_list:', res.data.result)
            var goodsPicsInfo = res.data.result
            var k = image?1:0
            for (var i = k; i < goodsPicsInfo.image.length;i++){
              if (goodsPicsInfo.image[i]['ext'] == 'mp4'){
                image_video.push(goodsPicsInfo.image[i])
              }else{
                image_pic.push(goodsPicsInfo.image[i])
              }
            }
            that.setData({
              goodsPicsInfo: res.data.result,
              image_video: image_video,
              image_pic: image_pic,
            })
            if (!share_goods_image) {
              that.image_save(image_pic[0]['url'], 'goods_image_cache_' + goodsid)
             // console.log('商品详情图片下载缓存 goods_image_cache_' + goodsid, image_pic[0]['url'])
            } 
           // console.log('get_goodsdesc_list image_pic:', that.data.image_pic)
            that.showGoodsinfo()
          }
         
        })
        // 商品SKU
        wx.request({
          url: weburl+'/api/client/get_goodssku_list',
          method: 'POST',
          data: { 
            username: username,
            access_token: token, 
            goods_id: goodsid, 
            shop_type:shop_type,
            page: page 
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('商品goods_sku:',res.data.result);
            var attrValueList = res.data.result.spec_select_list ? res.data.result.spec_select_list:'';
            var commodityAttr = res.data.result.sku_list ? res.data.result.sku_list:'{}';
            if (!commodityAttr) return; 
            for (var i = 0; i < commodityAttr.length; i++) {
              if (commodityAttr[i].attrValueStatus) {
                commodityAttr[i].attrValueStatus = true;
              } else {
                commodityAttr[i].attrValueStatus = false;
              }
            }
            that.setData({
              commodityAttr: commodityAttr
            })
            
            if (!attrValueList ) return
            for (var i = 0; i < attrValueList.length; i++) {
              if (!attrValueList[i].attrValueStatus) {
                attrValueList[i].attrValueStatus = true
              }
              if (attrValueList[i].type==2){
                for (var k = 0; k < attrValueList[i].value.length; k++) {
                  if (attrValueList[i].value[k].indexOf("http") < 0) {
                    attrValueList[i].value[k] = weburl + '/' + attrValueList[i].value[k]
                  }
                }
              }
            
            }
           
            that.setData({
              attrValueList: attrValueList
            })

          }
      })
  
      // 商品评价
      wx.request({
        url: weburl + '/api/client/get_order_comment',
        method: 'POST',
          data: {
          username: username,
          access_token: token,
          goods_id: goodsid,
          query_type: 1,  //1查商品所有评价 0查本人对商品的评价
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var comm_list = res.data.result
          var ret_info = res.data.info
          var all_rows = res.data.all_rows ? res.data.all_rows : 1
          
          if (comm_list) {
            
            that.setData({
              comm_list: that.data.comm_list.concat(comm_list),
              all_rows: all_rows,
            })
            console.log('获取订单评论信息:', comm_list, ' all rows:',all_rows)
          }
        }
      })
    },
  
    bindMinus: function (e) {
      var that = this
      var num = that.data.buynum
      num--
      that.setData({
        buynum: num>0?num:1
      })
    },
    bindPlus: function (e) {
      var that = this
      var num = that.data.buynum
    // 自增
      num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = num <= 1 ? 'disabled' : 'normal';
      this.setData({
        buynum: num <= 1?1:num,
      })
    },
    //事件处理函数 选择型号规格  
    goodsmodel: function () {
      var that = this
      var modalHidden = that.data.modalHidden
      if (that.data.commodityAttr.length>0){
        var sku_id = that.data.commodityAttr[0].id
        var attrValueList = that.data.attrValueList
        var sku_sell_price = that.data.commodityAttr[0].sell_price
        var sku_delivery_price = that.data.commodityAttr[0].delivery_price
        var is_buymyself = that.data.is_buymyself
        console.log('detail goodsmodel is_buymyself:', is_buymyself)
        if (attrValueList.length > 0) {
          that.setData({
            modalHidden: !modalHidden,
            sku_id: sku_id,
            sku_sell_price: sku_sell_price,
            sku_delivery_price: sku_delivery_price,
            add_cart_title: '商品名称',
            wishflag: 0,
          })
          console.log('挑选 sku_id:' + that.data.commodityAttr[0].id, 'modalHidden:', that.data.modalHidden)
        } else {
          console.log('送礼 sku_id:' + that.data.commodityAttr[0].id, 'attrValueList:', attrValueList)
          that.setData({
            modalHidden: !modalHidden,
            sku_sell_price: sku_sell_price,
            sku_delivery_price: sku_delivery_price,
            add_cart_title: that.data.goodsname,
            sku_id: sku_id,
            wishflag: 0,
          })
          //that.addCart()
        }
      }else{
        setTimeout(function () {
          wx.showToast({
            title: "加载中...",
            icon: 'loading',
            duration: 500,
          })
          that.goodsmodel()
        }, 500)
      }
      
    },
    wishCart: function () {
      var that = this
      var attrValueList = that.data.attrValueList
      if (attrValueList.length > 0) {
        that.setData({
          modalHidden: !that.data.modalHidden,
          sku_id: that.data.commodityAttr[0].id,
          add_cart_title: '商品名称',
          wishflag: 1,
        })
      } else {
        that.setData({
          sku_id: that.data.commodityAttr[0].id,
          wishflag: 1,
        })
        that.addCart()
      }
      
    },
    buyMyself: function () {
      var that = this
      that.setData({
        is_buymyself: 1,
      })
      that.goodsmodel()
    },
  buyGift: function () {
    var that = this
    that.setData({
      is_buymyself: 0,
    })
    that.goodsmodel()
  },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      var that = this
      this.setData({
        modalHidden: !this.data.modalHidden,
      })
      this.addCart()
    },
    //取消按钮点击事件  
    modalBindcancel: function () {
      this.setData({
        modalHidden: !this.data.modalHidden
      })
    },  
    addCart: function () {
      var that = this
      var is_buymyself = that.data.is_buymyself
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var keyword = that.data.keyword
      var is_satisfy = that.data.is_satisfy
      var rule_selected_info = that.data.rule_selected_info
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + that.data.goodsid
        })
      }else{
        if (that.data.sku_id){
          that.insertCart(that.data.sku_id, that.data.buynum, username, token, that.data.shop_type, that.data.wishflag, is_buymyself, keyword, is_satisfy, rule_selected_info)
        }else{
          wx.showToast({
            title: '该产品无货',
            icon: 'loading',
            duration: 1500
          })
        }
      }
    },
  insertCart: function (sku_id, buynum, username, token, shop_type, wishflag, is_buymyself,keyword,is_satisfy,rule_selected_info) {
      var that = this
      //var shop_type = that.data.shop_type
      wx.request({
        url: weburl + '/api/client/add_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          sku_id: sku_id,
          num: buynum,
          wishflag: wishflag,
          shop_type:shop_type,
          keyword: keyword,
          is_satisfy: is_satisfy,
          rule_selected_info: rule_selected_info,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('details insertCart res data:', res.data, ' wishflag：', wishflag);
          var title = wishflag == 1 ? '已加入心愿单' : '已加入礼物包'
          title = is_buymyself==1?'自购礼品':title
          wx.showToast({
            title: title,
            icon:'loading',
            duration: 2000
          })
          app.globalData.from_page = '/pages/details/details'
          if (wishflag == 1) {
            wx.navigateTo({
              url: '/pages/wish/wish'
            })
          } 
          else {
            if (is_buymyself==1){
              that.queryCart()
            }else{
              console.log('details insertCart wishflag:', wishflag)
              app.globalData.hall_gotop = 1
              wx.switchTab({
                url: '/pages/hall/hall'
              })
            }
          }
        }
      })
      
    },

    queryCart: function () {
      var that = this
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var order_type = 'gift'
      var order_note = '送你一份礼物，希望你喜欢!'; //默认祝福
      var order_image = that.data.order_image
      var buynum = that.data.buynum
      var sku_sell_price = that.data.sku_sell_price
      var amount = parseFloat(sku_sell_price) * buynum
      var sku_id = that.data.sku_id
      var is_buymyself = that.data.is_buymyself
      var cur_img_id = that.data.cur_img_id
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
      var order_voice = that.data.new_rec_url ? that.data.new_rec_url:'' //录音文件url
      var goodsshape = that.data.goodsshape
      if(goodsshape==5) {
        order_note = that.data.card_blessing
        if (cur_img_id != 0) {
          cur_img_id = cur_img_id - that.data.image_video.length
          share_goods_image = that.data.image_pic[cur_img_id]['url']
        }
      }
      wx.request({
        url: weburl + '/api/client/query_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          shop_type: shop_type,
          sku_id: sku_id,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('hall reloadData:', res.data);
          var carts = [];
          if (!res.data.result) {
            wx.showToast({
              title: '未挑选商品' + res.data.info,
              icon: 'none',
              duration: 1500
            })
            return
          }
          var cartlist = res.data.result.list;
          var index = 0;
          for (var key in cartlist) {
            for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
              if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
                cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
              } 
              cartlist[key]['sku_list'][i]['selected'] = true;
              cartlist[key]['sku_list'][i]['shop_id'] = key;
              cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
             
              carts[index] = cartlist[key]['sku_list'][i];
              index++;
            }
          }

          that.setData({
            carts: carts,
            all_rows: carts.length,
            is_buymyself:0,
          })
          var amount = parseFloat(that.data.sku_sell_price) * buynum
          wx.navigateTo({
            url: '../order/checkout/checkout?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + goodsshape + '&order_voice=' + order_voice + '&order_note=' + order_note + '&order_image=' + share_goods_image + '&username=' + username + '&token=' + token
          })
        }
      })
    },

    showGoodsinfo: function () {
      // 获得高度  
      let winPage = this;
      winPage.setData({
        //hideviewgoodsinfo: (!winPage.data.hideviewgoodsinfo),
        hideviewgoodsinfo:false,
      })
      
      if (winPage.data.hideviewgoodsinfoflag){
        if (winPage.data.goodsinfoshowflag==0){
          wxparse.wxParse('dkcontent1', 'html', winPage.data.goodsPicsInfo.desc['desc'], winPage, 1)
        }
      }
      winPage.setData({
        hideviewgoodsinfoflag: !winPage.data.hideviewgoodsinfoflag,
        goodsinfoshowflag: 1,
        scrollTop: winPage.data.scrollTop_init
      })
    },

    showGoodspara: function () {
      // 获得高度  
      var winPage = this;
      winPage.setData({
        hideviewgoodspara: (!winPage.data.hideviewgoodspara)
      })
      if (winPage.data.hideviewgoodsparaflag) {
        wx.getSystemInfo({
          success: function (res) {
            let winHeight = res.windowHeight;
            let winWidth = res.windowWidth;
            console.log('detail getSystemInfo:',res);
            winPage.setData({
              dkheight: winHeight - winHeight * 0.05 - 100,
              winHeight: winHeight,
              winWidth: winWidth,
            })
            wx.setStorageSync('systeminfo', res.system)
            wx.setStorageSync('phonemodel', res.model)
          }
        })
        if (winPage.data.goodsPicsInfo.desc){
          wxparse.wxParse('dkcontent2', 'html', winPage.data.goodsPicsInfo.desc['desc2'], winPage, 1)
        }
      }
      winPage.setData({
        hideviewgoodsparaflag: false
      })
    },

    upper: function (e) {
      //console.log(e)
    },
    lower: function (e) {
      //console.log(e)
    },
    scroll: function (e) {
      //console.log(e)
    },

    getAttrIndex: function (attrName, attrValueList) {
      // 判断数组中的attrKey是否有该属性值 
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrName == attrValueList[i].name) {
          break
        }
      }
      return i < attrValueList.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
      // 判断是否已有属性值 
      for (var i = 0; i < valueArr.length; i++) {
        if (valueArr[i] == value) {
          break
        }
      }
      return i < valueArr.length;
    },
    /* 选择属性值事件 */
    selectAttrValue: function (e) {
      /* 
      点选属性值，联动判断其他属性值是否可选 
      { 
      attrKey:'型号', 
      attrValueList:['1','2','3'], 
      selectedValue:'1', 
      attrValueStatus:[true,true,true] 
      } 
      console.log(e.currentTarget.dataset); 
      */
      var that = this
      var attrValueList = that.data.attrValueList;
      var index = e.currentTarget.dataset.index;//属性索引 
      var firstIndex = that.data.firstIndex
      var valueindex = e.currentTarget.dataset.valueindex;//属性索引 
      var key = e.currentTarget.dataset.key;
      var value = e.currentTarget.dataset.value;
      var status = e.currentTarget.dataset.status
      var selectedvalue = e.currentTarget.dataset.selectedvalue
      this.setData({
        firstIndex: index,
        secondIndex: valueindex,
      })
      if (status || valueindex == that.data.secondIndex) {
        if (attrValueList[index].type==2){
          value = attrValueList[index].note[valueindex]
        }
        if (selectedvalue == value) {
          // 取消选中 
          that.disSelectValue(index, key, value);
        } else {
          // 选中 
          that.selectValue( index, key, value);
        }

      }
      that.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        sku_sell_price: '',
        sku_delivery_price: '',
      })
      var selectValueInfo='';
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          selectValueInfo = selectValueInfo + attrValueList[i].selectedValue+';';
        }
      }
      
      for (var i = 0; i < that.data.commodityAttr.length; i++) {
        if (selectValueInfo.indexOf(that.data.commodityAttr[i].sku_key)>=0) {
          that.setData({
            sku_id: that.data.commodityAttr[i].id,
            sku_gov_price: that.data.commodityAttr[i].gov_price,
            sku_earnest_price: that.data.commodityAttr[i].earnest_price,
            sku_sell_price: that.data.commodityAttr[i].sell_price,
            sku_delivery_price: that.data.commodityAttr[i].delivery_price,
          })
          //break
        }
        
      }
     
    },
    /* 选中 */
    selectValue: function (index, key, value) {
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = value;
    
      that.setData({
        attrValueList: attrValueList,
      
      })
     // console.log('selectValueInfo 选中信息:', attrValueList,' index:',index); 
    },
    /* 取消选中 */
    disSelectValue: function (index, key, value) {
      //var commodityAttr = this.data.commodityAttr;
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = '';
      this.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        attrValueList: attrValueList
      })
     // console.log('selectValueInfo 取消选中信息:', attrValueList,' index:',index); 
    },
    
  onShow: function () {
     var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }  
      //console.log('App Show');
   // this.distachAttrValue(this.data.attrValueList);
      // 只有一个属性组合的时候默认选中 
      // console.log(this.data.attrValueList); 
      /*
      if (this.data.commodityAttr.length == 1) {
        for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
          this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        }
        this.setData({
          attrValueList: this.data.attrValueList
        });
      }
      */
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 100,
        })
      }
    })
  },

  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
   // this.videoContext.seek(1)
    this.setData({
      tab_image: "block"
    })
  },

  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var share_goods_id = that.data.goodsid
    var share_goods_image = that.data.image_pic[0]['url']
    var share_goods_title = that.data.share_title
    var share_goods_desc = that.data.share_desc
    var m_id = that.data.m_id > 0 ? that.data.m_id:0
    var scene = 'goodsid='+that.data.goodsid +'&mid='+m_id
    return {
      title: share_goods_title,
      desc: share_goods_desc,
      imageUrl: share_goods_image,  
      path: '/pages/details/details?id=' + share_goods_id + '&image=' + share_goods_image+'&refername='+username,
     // path: '/pages/details/details?scene=' + encodeURIComponent(scene)
    }
  }
})

//麦克风帧动画  
function speaking() {
  var that = this
  //话筒帧动画  
  var i = 1
  that.timer = setInterval(function () {
    i++
    i = i % 5;
    that.setData({
      j: i
    })
  }, 200)
}