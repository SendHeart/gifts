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
const myaudio = wx.createInnerAudioContext()
const options = {
  duration: 180*1000,//指定录音的时长，单位 ms
  sampleRate: 16000,//采样率
  numberOfChannels: 1,//录音通道数
  encodeBitRate: 96000,//编码码率
  format: 'mp3',//音频格式，有效值 aac/mp3
  frameSize: 50,//指定帧大小，单位 KB
}
var card_color = [
  { id: "gray", title: "灰色", value: "#f2f2f2" },
  { id: "red", title: "红色", value: "#e34c55" },
  { id: "white", title: "白色", value: "#fff"},
  { id: "black", title: "黑色", value: "#333" },
  { id: "blue", title: "蓝色", value: "#6495ED" },
  { id: "yellow", title: "黄色", value: "#FFFF00" },
]

Page({
  data: {
    title_name: '详情',
    title_logo: '../../images/footer-icon-05.png',
    share_title: '这个礼物真不错，来看看吧，要是你能送我就更好了~',
    card_blessing: '',
    card_content: '',
    share_desc: '送心礼物，开启礼物社交时代！',
    share_avatarUrl: weburl + '/uploads/avatar.png',
    share_goods_avatarUrl: weburl + '/uploads/avatar.png',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    user: null,
    userInfo: {},
    username: null,
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    page: 1,
    interval: 3000,
    duration: 300,
    circular: true,
    goodsname: '',
    goodsinfo: [],
    goodsprice: 0,
    goodssale: 0,
    goodsid: 0,
    goodsshape:0,
    goodsdiscount: 100,
    discountinfo: '9折优惠券',
    sku_gov_price: 0,
    sku_earnest_price: 0,
    sku_sell_price: 0,
    sku_id: 0,
    commodityAttr: [],
    attrValueList: [],
    firstIndex: 0,
    cur_img_id: 0,
    image: '',
    image_pic: [],
    hideviewgoodsinfo: true,
    hideviewgoodspara: true,
    dkheight: 300,
    scrollTop: 0,
    scrollTop_init: 10,
    toView: 'red',
    hideviewgoodsinfoflag: true,
    hideviewgoodsparaflag: true,
    modalHidden: true,//是否隐藏对话框  
    dkcontent: [],
    goodsPicsInfo: [],
    selectValueInfo: '',
    wishflag: 0,
    goodsinfoshowflag: 0,
    shop_type: shop_type,
    comm_list: [],
    image_save_count: 0,
    image_save_times: 0,
    is_buymyself: 0,
    buynum: 1,
    notehidden: true,
    cardregisterhidden: true,
    card_image_height:'1055;',
    has_cardpayed: 0,
    cardnamehidden:true,
    openRecordingdis: "block", //显示录机图标
    shutRecordingdis: "none", //隐藏停止图标
    recordingTimeqwe: 0, //录音计时
    goodsmodel_count:0, //商品属性加载计次数
    setInter: "",
    card_color: card_color,
    current_card_color: '#333',
    card_color_index: 0,
    card_register_img: weburl + '/uploads/card_register_share.png',
    card_register_title: '',
    card_register_content: '',
    register_start_date: util.getDateStr(new Date, 0),
    register_end_date: util.getDateStr(new Date, 3),
    register_start_time: util.getDateStr(new Date, 0, 1),
    register_end_time: util.getDateStr(new Date, 3, 1),
    action_start_date: util.getDateStr(new Date, 3),
    action_end_date: util.getDateStr(new Date, 6),
    action_start_time: util.getDateStr(new Date, 3, 1),
    action_end_time: util.getDateStr(new Date, 6, 1),
    card_register_lim: 0,
    card_register_fee: 0,
    card_register_addr: '',
    card_register_ownername: '',
    card_register_ownerwechat: '',
    card_register_right_str: '',
    card_register_right_picker: ['参与者可看', '管理者可看', '公开'],
    card_register_right_index: 0,  
    card_register_reqid_picker: ['0无需证件', '1身份证', '2微信号', '3QQ号', '4邮箱','5学号','6工号'],
    card_register_reqid_index: 0, 
    card_name_modal_title:'名片内容',
    card_name_logo_image: '/images/img_upload_field.png'
  },

  bindPickerChange_card_color: function (e) {
    var that = this
    var card_color = that.data.card_color
    var card_color_index = e.detail.value
    console.log('picker发送选择改变，携带值为', e.detail.value, card_color[card_color_index]['value']);
    that.setData({   //给变量赋值
      current_card_color: card_color[card_color_index]['value'],  
      card_color_index: card_color_index,
    })
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
    } else if (form_name == 'mycardregister') {
      that.upimg()   
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
    } else if (form_name == 'card_register') {
      that.card_register()  
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
  upimg: function (e) {
    var that = this
    var is_logo = e.currentTarget.dataset.logo ? e.currentTarget.dataset.logo:0
    var new_img_arr = ''
    that.setData({
      is_logo: is_logo
    })
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      success: function (res) {
        that.setData({
          new_img_arr: res.tempFilePaths
        })
        console.log('本次上传图片:', that.data.new_img_arr, res.tempFilePaths)
        that.upload()
      }
    }) 
   
  },

  upload: function () {
    var that = this;
    var goods_id = that.data.goodsid
    var new_img_arr = that.data.new_img_arr[0] //本次上传图片的手机端文件地址
    var image_pic = that.data.image_pic
    var is_logo = that.data.is_logo
    if (new_img_arr) {
      wx.uploadFile({
        url: uploadurl,
        filePath: new_img_arr,
        name: 'wechat_upimg',
        formData: {
          latitude: encodeURI(0.0),
          longitude: encodeURI(0.0),
          restaurant_id: encodeURI(0),
          city: encodeURI('杭州'),
          prov: encodeURI('浙江'),
          name: encodeURI(goods_id), // 名称
        }, // HTTP 请求中其他额外的 form data
        success: function (res) {
          var retinfo = JSON.parse(res.data.trim())
          
          //console.log('upimg upload url:', retinfo['result']['img_url'])
          if (retinfo['status'] == "y") {
            if(is_logo==1){ //logo 处理
              that.image_save(retinfo['result']['img_url'], 'card_name_logo_image')
              that.setData({
                card_name_logo_image: retinfo['result']['img_url'],
              })
            }else{
              var new_image_pic = []
              that.image_save(retinfo['result']['img_url'], 'myregistercard_image')
              var myregistercard_image = wx.getStorageSync('myregistercard_image')
              var new_image_pic = {
                id: goods_id,
                goods_id: goods_id,
                url: retinfo['result']['img_url'],
              }
              image_pic.push(new_image_pic)
              setTimeout(function () {
                that.setData({
                  image_pic: image_pic,
                })
              }, 3000) 
              console.log('图片上传完成:', new_image_pic, image_pic)
            }
          }else{
            wx.showToast({
              title: '图片加载失败，请再试一次',
              icon:none,
              duration: 2000
            })
          }
        },
      })
    }
    wx.showToast({
      title: '已提交！',
      duration: 2000
    })
    var content = that.data.content
    if (!content) {
      that.setData({
        content: '图片:'
      })
    }

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
    that.swiperchange_cardname(cur_img_id)
    //console.log('detail swiperchange:', e.detail.current, 'cur_img_id:',cur_img_id)
  },

  swiperchange_share: function (e) {
    var that = this
    var cur_img_share_id = e.detail.current
    //console.log(e)

    that.setData({
      cur_img_share_id: cur_img_share_id,
    })
    //console.log('detail swiperchange_share:', e.detail.current, 'cur_img_share_id:',cur_img_share_id)
  },

  swiperchange_cardname: function (cur_img_id) {
    var that = this
    var image_pic = that.data.image_pic
    var template_config = image_pic[cur_img_id] ? image_pic[cur_img_id]['template_config']:''
    var is_card_name_name = false
    var is_card_name_title = false
    var is_card_name_phone = false
    var is_card_name_tel = false
    var is_card_name_email = false
    var is_card_name_website = false
    var is_card_name_publicwechat = false
    var is_card_name_addr = false
    var is_card_name_company = false
    var is_card_name_logo_image = false
    var is_card_name_qrcode = false
    console.log('detail swiperchange_cardname template_config:', template_config)
    if (template_config){
      for (var i = 0; i < template_config.length;i++){
        //console.log('detail swiperchange_cardname template_config i:', template_config[i])
        if(template_config[i]['typeId'] == 'card_name'){
          is_card_name_name = true
        } else if (template_config[i]['typeId'] == 'card_title'){
          is_card_name_title = true
        } else if (template_config[i]['typeId'] == 'card_phone') {
          is_card_name_phone = true
        } else if (template_config[i]['typeId'] == 'card_tel') {
          is_card_name_tel = true
        } else if (template_config[i]['typeId'] == 'card_email') {
          is_card_name_email = true
        } else if (template_config[i]['typeId'] == 'card_weburl') {
          is_card_name_website = true
        } else if (template_config[i]['typeId'] == 'card_publicwechat') {
          is_card_name_publicwechat = true
        } else if (template_config[i]['typeId'] == 'card_addr') {
          is_card_name_addr = true
        } else if (template_config[i]['typeId'] == 'card_companyname') {
          is_card_name_company = true
        } else if (template_config[i]['typeId'] == 'card_logo') {
          is_card_name_logo_image = true
        } else if (template_config[i]['typeId'] == 'card_qrcode') {
          is_card_name_qrcode = true
        }
      }
   
      that.setData({
        is_card_name_name: is_card_name_name,
        is_card_name_title: is_card_name_title,
        is_card_name_phone: is_card_name_phone,
        is_card_name_tel: is_card_name_tel,
        is_card_name_email: is_card_name_email,
        is_card_name_website: is_card_name_website,
        is_card_name_publicwechat: is_card_name_publicwechat,
        is_card_name_addr: is_card_name_addr,
        is_card_name_company: is_card_name_company,
        is_card_name_logo_image: is_card_name_logo_image,
        is_card_name_qrcode: is_card_name_qrcode,
      })
    }
  },
  card_name_nameTapTag: function (e) {
    var that = this
    var card_name_name = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_name: card_name_name
    })
  },
  card_name_titleTapTag: function (e) {
    var that = this
    var card_name_title = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_title: card_name_title
    })
  },
  card_name_phoneTapTag: function (e) {
    var that = this
    var card_name_phone = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_phone: card_name_phone
    })
  },
  card_name_telTapTag: function (e) {
    var that = this
    var card_name_tel = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_tel: card_name_tel
    })
  },
  card_name_emailTapTag: function (e) {
    var that = this
    var card_name_email = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_email: card_name_email
    })
  },
  card_name_websiteTapTag: function (e) {
    var that = this
    var card_name_website = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_website: card_name_website
    })
  },
  card_name_publicwechatTapTag: function (e) {
    var that = this
    var card_name_publicwechat = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_publicwechat: card_name_publicwechat
    })
  },
  card_name_addrTapTag: function (e) {
    var that = this
    var card_name_addr = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_addr: card_name_addr
    })
  },
  card_name_companyTapTag: function (e) {
    var that = this
    var card_name_company = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_company: card_name_company
    })
  },
  cardnameNoteTextAreaBlur: function (e) {
    var that = this
    var card_name_note = util.filterEmoji(e.detail.value)
    that.setData({
      card_name_note: card_name_note,
    })
  }, 
  bindCardTextAreaBlur: function (e) {
    var that = this
    var card_blessing = util.filterEmoji(e.detail.value)
    that.setData({
      card_blessing: card_blessing,
      card_content: card_blessing,
    })
  }, 
  cardRegisterTextAreaBlur: function (e) {
    var that = this
    var card_register_content = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_content: card_register_content
    })
  }, 
  cardregistertitleTapTag: function (e) {
    var that = this
    var card_register_title = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_title: card_register_title
    })
  },
  cardregisterLimTapTag: function (e) {
    var that = this
    var card_register_lim = e.detail.value
    card_register_lim.replace('不限', '')
    that.setData({
      card_register_lim: card_register_lim
    })
    console.log('card_register_lim:', that.data.card_register_lim)
  }, 
  cardregisterFeeTapTag: function (e) {
    var that = this;
    that.setData({
      card_register_fee: e.detail.value
    })
  }, 
  cardregisterAddrTapTag: function (e) {
    var that = this;
    var card_register_addr = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_addr: card_register_addr
    })
  }, 
  cardregisterOwnerNameTapTag: function (e) {
    var that = this
    var card_register_ownername = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_ownername: card_register_ownername
    })
  }, 
  cardregisterOwnerWechatTapTag: function (e) {
    var that = this
    var card_register_ownerwechat = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_ownerwechat: card_register_ownerwechat
    })
  }, 
  //确定按钮点击事件 
  shareConfirmCard: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
      hidden_share: !that.data.hidden_share
    })
  },
  //取消按钮点击事件  
  shareCandelCard: function () {
    var that = this
    that.setData({
      notehidden: !that.data.notehidden,
    })
  },  
  //确定按钮点击事件 
  confirmcardinput: function () {
    var that = this
    var card_type = that.data.card_type
    var is_buymyself = that.data.is_buymyself
    if(card_type==1){
      var card_register_info = [
        {
          card_color: that.data.current_card_color,
          card_register_title: that.data.card_register_title,
          card_register_content: that.data.card_register_content,
          image: that.data.card_register_img,
          register_start_date: that.data.register_start_date,
          register_end_date: that.data.register_end_date,
          register_end_date: that.data.register_end_date,
          register_start_time: that.data.register_start_time,
          register_end_time: that.data.register_end_time,
          action_start_date: that.data.action_start_date,
          action_end_date: that.data.action_end_date,
          action_start_time: that.data.action_start_time,
          action_end_time: that.data.action_end_time,
          card_register_lim: that.data.card_register_lim,
          card_register_fee: that.data.card_register_fee,
          card_register_addr: that.data.card_register_addr,
          card_register_ownername: that.data.card_register_ownername,
          card_register_ownerwechat: that.data.card_register_ownerwechat,
          card_register_right_index: that.data.card_register_right_index,
          card_register_reqid_index: that.data.card_register_reqid_index,
        }
      ]
      wx.setStorageSync('card_register_info', JSON.stringify(card_register_info[0]))
      console.log('card_register_info:', wx.getStorageSync('card_register_info'))
      
    }else if(card_type==2){
      var card_name_info = [
        {
          card_name_name: that.data.card_name_name,
          card_name_title: that.data.card_name_title,
          card_name_phone: that.data.card_name_phone,
          card_name_tel: that.data.card_name_tel,
          card_name_email: that.data.card_name_email,
          card_name_website: that.data.card_name_website,
          card_name_publicwechat: that.data.card_name_publicwechat,
          card_name_addr: that.data.card_name_addr,
          card_name_company: that.data.card_name_company,
          card_name_logo_image: that.data.card_name_logo_image,
          card_name_note: that.data.card_name_note,
        }
      ]
      wx.setStorageSync('card_name_info', JSON.stringify(card_name_info[0]))
      console.log('card_name_info:', wx.getStorageSync('card_name_info'))

    }
    that.setData({
      inputShowed:true,
      goodsmodel_count: 0,
    })
    if(is_buymyself == 1) {
      that.goodsmodel()
    }
  },
  
  bindChangeStartDate: function (e) {
    var that = this;
    var start_date = e.detail.value
    that.setData({
      register_start_date: start_date
    })
    console.log('register_start_date:' + that.data.register_start_date)
  },
  bindChangeStartTime: function (e) {
    var that = this;
    var start_time = e.detail.value
    that.setData({
      register_start_time: start_time
    })
    console.log('register_start_time:' + that.data.register_start_time)
  },
  bindChangeEndDate: function (e) {
    var that = this
    var end_date = e.detail.value
    var end_time = that.data.register_end_time+":00"
    var diff_start_time = that.data.register_start_date + ' ' + that.data.register_start_time+':00'
    var diff_end_time = end_date + ' ' + end_time
    var diff = util.calDateDiff(diff_start_time, diff_end_time) 
    if(diff > 0){
      that.setData({
        register_end_date: end_date
      })
    }else{
      wx.showToast({
        title: "结束时间小于开始时间",
        icon: 'none',
        duration: 1500,
      })
    }
   
    console.log('register_end_date:', that.data.register_end_date, diff_start_time, diff_end_time)
  },  
  bindChangeEndTime: function (e) {
    var that = this
    var end_time = e.detail.value
    var end_date = that.data.register_end_date
    var diff_start_time = that.data.register_start_date + ' ' + that.data.register_start_time + ':00'
    var diff_end_time = end_date + ' ' + end_time +':00'
    var diff = util.calDateDiff(diff_start_time, diff_end_time)
    if (diff > 0) {
      that.setData({
        register_end_time: end_time
      })
    } else {
      wx.showToast({
        title: "结束时间小于开始时间",
        icon: 'none',
        duration: 1500,
      })
    }
    console.log('register_end_time:' + that.data.register_end_time, diff_start_time, diff_end_time)
  },  
  bindChangeActStartDate: function (e) {
    var that = this;
    var start_date = e.detail.value
    that.setData({
      action_start_date: start_date
    })
    console.log('action_start_date:' + that.data.action_start_date)
  },
  bindChangeActStartTime: function (e) {
    var that = this;
    var start_time = e.detail.value
    that.setData({
      action_start_time: start_time
    })
    console.log('action_start_time:' + that.data.action_start_time)
  },
  bindChangeActEndDate: function (e) {
    var that = this
    var end_date = e.detail.value
    var end_time = that.data.action_end_time + ":00"
    var diff_start_time = that.data.action_start_date + ' ' + that.data.action_start_time + ':00'
    var diff_end_time = end_date + ' ' + end_time
    var diff = util.calDateDiff(diff_start_time, diff_end_time)
    if (diff > 0) {
      that.setData({
        action_end_date: end_date
      })
    } else {
      wx.showToast({
        title: "结束时间小于开始时间",
        icon: 'none',
        duration: 1500,
      })
    }
   
    console.log('action_end_date:' + that.data.action_end_date, diff_start_time, diff_end_time)
  },  
  bindChangeActEndTime: function (e) {
    var that = this
    var end_time = e.detail.value
    var end_date = that.data.action_end_date
    var diff_start_time = that.data.action_start_date + ' ' + that.data.action_start_time + ':00'
    var diff_end_time = end_date + ' ' + end_time + ':00'
    var diff = util.calDateDiff(diff_start_time, diff_end_time)
    if (diff > 0) {
      that.setData({
        action_end_time: end_time
      })
    } else {
      wx.showToast({
        title: "结束时间小于开始时间",
        icon: 'none',
        duration: 1500,
      })
    }
   
    console.log('action_end_time:' + that.data.action_end_time, diff_start_time,diff_end_time)
  },  

  bindChangeRegisterRight: function (e) {
    var that = this;
    var card_register_right_index = e.detail.value
    that.setData({
      card_register_right_index: card_register_right_index,
    })
    console.log('card_register_right:' + that.data.card_register_right_index)
  },
  bindChangeRegisterReqid: function (e) {
    var that = this;
    var card_register_reqid_index = e.detail.value
    that.setData({
      card_register_reqid_index: card_register_reqid_index,
    })
    console.log('card_register_reqid_index:' + that.data.card_register_reqid_index)
  },
  sharegoodsTapTag: function () {
    var that = this
    var share_goods_id = that.data.goodsid
    var share_goods_org = that.data.goodsorg
    var share_goods_shape = that.data.goodsshape ? that.data.goodsshape:1
    var share_goods_price = that.data.goodsprice
    var share_goods_name = that.data.goodsname
    share_goods_name = share_goods_name.replace(/\&/g, ' ')
    var cur_img_id = that.data.cur_img_id
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : that.data.share_avatarUrl
    var share_goods_title = ''
    if (share_goods_shape == 5 || share_goods_shape==4){
      share_goods_title = that.data.card_content 
    }else{
      share_goods_title = that.data.share_title
    }
    var share_goods_desc = that.data.share_desc
    var share_avatarUrl = that.data.share_avatarUrl
    var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
    var goods_image_cache = wx.getStorageSync('goods_image_cache_' + share_goods_id)
    var share_goods_qrcode = wx.getStorageSync('goods_qrcode_cache_' + share_goods_id)
    var card_type = that.data.card_type
   
    share_goods_wx_headimg = wx_headimg_cache ? wx_headimg_cache : share_goods_wx_headimg
    if (that.data.cur_img_id==0){ 
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
      share_goods_image = goods_image_cache ? goods_image_cache : share_goods_image
    }else{
      cur_img_id = cur_img_id - that.data.image_video.length
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
    }
    console.log('sharegoodsTapTag share_goods_qrcode:', share_goods_qrcode, 'share_goods_id:', share_goods_id, 'cur_img_id:', cur_img_id, 'image_save_count:',that.data.image_save_count)
   
    if (that.data.image_save_count < 3){
      if (that.data.image_save_times > 8) { //8次不成功返回上一级
        return
      }
      setTimeout(function () {
        wx.showToast({
          title: "开始求赠" ,
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
    if (share_goods_shape == 5 || share_goods_shape == 4) {
      var contentText = "<p style='font-size:20px color:#333;'></p><br/><img src='https://ss1.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=77d1cd475d43fbf2da2ca023807fca1e/9825bc315c6034a8ef5250cec5134954082376c9.jpg' width=345 /><br/><p style='font-size:20px color:#333;'></p>"
      var encode = encodeURIComponent(contentText)
      wx.navigateTo({
        url: '/pages/graphic/graphic?contentText=' +encode
      })
    }else{
      wx.navigateTo({
        url: '/pages/wish/wishshare/wishshare?share_goods_id=' + share_goods_id + '&share_goods_shape=' + share_goods_shape + '&share_goods_org=' + share_goods_org + '&share_goods_name=' + share_goods_name + '&share_goods_price=' + share_goods_price + '&share_goods_image=' + share_goods_image + '&share_goods_wx_headimg=' + share_goods_wx_headimg + '&share_goods_title=' + share_goods_title + '&share_goods_desc=' + share_goods_desc + '&share_goods_image2=' + that.data.image_pic[cur_img_id]['url'] + '&share_goods_qrcode_cache=' + share_goods_qrcode + '&card_type=' + card_type
      })
    }
   
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

  cardnameEditTapTag: function (is_buymyself=0) {
    var that = this
    that.setData({
      cardnamehidden: !that.data.cardnamehidden,
      is_buymyself: is_buymyself ? is_buymyself:0,
    })
  },

  //确定按钮点击事件 
  shareConfirmCardName: function () {
    var that = this
    that.setData({
      cardnamehidden: !that.data.cardnamehidden,
    })
    that.confirmcardinput()
  },
  //取消按钮点击事件  
  shareCandelCardName: function () {
    var that = this
    that.setData({
      cardnamehidden: !that.data.cardnamehidden,
    })
  },  

  card_register: function () {
    var that = this
    that.setData({
      cardregisterhidden: !that.data.cardregisterhidden,
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
   
    recorderManager.stop();
    recorderManager.onStop((res) => {
      console.log('停止录音', res.tempFilePath)
      wx.hideLoading()
      that.setData({
        shutRecordingdis: "none",
        openRecordingdis: "block",
      })
      that.current_voice = res.tempFilePath,
      //结束录音计时  
      clearInterval(that.data.setInter)
      myaudio.src = res.tempFilePath
      myaudio.autoplay = true
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
          wx.setStorageSync('cardvoicetime', that.data.recordingTimeqwe)
          /*
          wx.showToast({
            title: '录音上传完成',
            icon: 'none',
            duration: 1000,
          })
          */
          console.log('录音上传完成', voice, new_rec_url, that.data.recordingTimeqwe)
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
    if (that.current_voice){
      myaudio.src = that.current_voice
      myaudio.play()
    } else if(new_rec_url) {
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
        var goodsshape = options.goods_shape ? options.goods_shape : 0
        var goodstag = options.goods_tag ? options.goods_tag : ''
        var goodsorg = options.goods_org ? options.goods_org : ''
        var card_type = options.card_type ? options.card_type:0
        var card_register_title = ''
        var card_register_content = ''
        var card_register_addr = ''
        var card_register_lim = 0
        var card_register_fee = 0
        var card_register_right_index = 0
        var card_register_reqid_index = 0
        var card_register_ownername = ''
        var card_register_ownerwechat = ''
        var card_content = ''
        var card_name_name = ''
        var card_name_title = ''
        var card_name_phone = ''
        var card_name_tel = ''
        var card_name_email = ''
        var card_name_website = ''
        var card_name_publicwechat = ''
        var card_name_addr = ''
        var card_name_company = ''
        var card_name_note = ''
        var card_name_logo_image = ''
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
        var card_image_height = that.data.card_image_height ? that.data.card_image_height:'750'
        var card_register_prev = wx.getStorageSync('card_register_info')
        var card_name_prev = wx.getStorageSync('card_name_info')
   
        if (card_register_prev){  
          var card_register_info = JSON.parse(card_register_prev) 
          card_register_content = card_register_info['card_register_content']
          card_register_title = card_register_info['card_register_title']
          card_register_addr = card_register_info['card_register_addr']
          card_register_lim = card_register_info['card_register_lim']
          card_register_fee = card_register_info['card_register_fee']
          card_register_right_index = card_register_info['card_register_right_index']
          card_register_reqid_index = card_register_info['card_register_reqid_index']
          card_register_ownername = card_register_info['card_register_ownername']
          card_register_ownerwechat = card_register_info['card_register_ownerwechat']
        }
        if (card_name_prev) {
          var card_name_info = JSON.parse(card_name_prev)
          card_name_name = card_name_info['card_name_name']
          card_name_title = card_name_info['card_name_title']
          card_name_phone = card_name_info['card_name_phone']
          card_name_tel = card_name_info['card_name_tel']
          card_name_email = card_name_info['card_name_email']
          card_name_website = card_name_info['card_name_website']
          card_name_publicwechat = card_name_info['card_name_publicwechat']
          card_name_addr = card_name_info['card_name_addr']
          card_name_company = card_name_info['card_name_company']
          card_name_note = card_name_info['card_name_note'],
          card_name_logo_image = card_name_info['card_name_logo_image']
        }
        console.log('detail options:', options, 'scene:', scene, 'card_type:', card_type, 'card_name_prev:', card_name_prev)
        that.setData({
          is_apple: phonemodel.indexOf("iPhone")>= 0?1:0,
          image_save_count:0,
          keyword: keyword,
          is_satisfy:is_satisfy,
          rule_selected_info:rule_selected_info,
          card_register_content: card_register_content ? card_register_content:'',
          card_register_title: card_register_title ? card_register_title:'',
          card_register_addr: card_register_addr ? card_register_addr:'',
          card_register_lim: card_register_lim ? card_register_lim:0,
          card_register_fee: card_register_fee ? card_register_fee:0,
          card_register_right_index: card_register_right_index ? card_register_right_index:0,
          card_register_reqid_index: card_register_reqid_index ? card_register_reqid_index : 0,
          card_register_ownername: card_register_ownername ? card_register_ownername : '',
          card_register_ownerwechat: card_register_ownerwechat ? card_register_ownerwechat : '',
          card_content: card_content,
          card_image_height: card_image_height,
          card_name_name: card_name_name ? card_name_name:'',
          card_name_title: card_name_title ? card_name_title:'',
          card_name_phone: card_name_phone ? card_name_phone:'',
          card_name_tel: card_name_tel ? card_name_tel : '',
          card_name_email: card_name_email ? card_name_email:'',
          card_name_website: card_name_website ? card_name_website:'',
          card_name_publicwechat: card_name_publicwechat ? card_name_publicwechat:'',
          card_name_addr: card_name_addr ? card_name_addr:'',
          card_name_company: card_name_company ? card_name_company:'',
          card_name_note: card_name_note ? card_name_note:'',
          card_name_logo_image: card_name_logo_image ? card_name_logo_image:'',
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
          image_init['url'] = image_init['url'].replace('/n11/','/n12/') // n12京东高清图片
          image_init['url'] = image_init['url'].replace('/n1/', '/n12/') // n12京东高清图片
          image_pic.push(image_init)
          that.setData({
            image_pic: image_pic,
          })
        }
       
        that.showGoodspara()
        goodsinfo = goodsinfo == 'undefined' ? '' : goodsinfo
        var share_goods_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + goodsid + '&m_id=' + m_id
   
        that.setData({
          goodsname: goodsname ? goodsname:'',
          goodsinfo: goodsinfo ? goodsinfo:'',
          goodsorg: goodsorg,
          goodsshape: goodsshape,
          goodstag: goodstag,
          card_type: card_type,
          goodsid: goodsid ? goodsid:0,
          refer_mid: refer_mid,
          goodsprice: goodsprice ? goodsprice:0,
          marketprice: marketprice ? marketprice : '',
          goodssale: goodssale ? goodssale:0,
          m_id:m_id,
          share_goods_qrcode: share_goods_qrcode,
        })
        that.image_save(share_goods_qrcode, 'goods_qrcode_cache_' + goodsid)
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
                if (goods_info[0]['shape'] == 5) {
                  card_content = that.data.card_blessing
                } else if (goods_info[0]['shape'] == 4) {
                  card_register_content = that.data.card_register_content
                  card_register_title = that.data.card_register_title
                }
                var goodstag = goods_info[0]['goods_tag']
                var card_type = goods_info[0]['card_type'] ? goods_info[0]['card_type'] : 0
                if (card_type == 1 || goods_info[0]['shape'] == 5) {
                  card_image_height = '1055'
                } else if (card_type == 2) {
                  card_image_height = '470'
                } else {
                  card_image_height = '750'
                }
                that.setData({
                  goodsname: goods_info[0]['name'],
                  goodsinfo: goods_info[0]['act_info'],
                  goodstag: goods_info[0]['goods_tag'],
                  goodsprice: goods_info[0]['sell_price'],
                  marketprice: goods_info[0]['market_price'],
                  goodssale: goods_info[0]['sale'],
                  goodsorg: goods_info[0]['goods_org'],
                  goodsshape: goods_info[0]['shape'],
                  goodstag: goods_info[0]['goods_tag'],
                  card_type: card_type,
                  goodscoverimg: goods_info[0]['activity_image'],
                  share_title: goods_info[0]['3D_image'] ? goods_info[0]['3D_image']:that.data.share_title, 
                  share_goods_wx_headimg: goods_info[0]['share_goods_wx_headimg'],
                  goodsdiscount: goods_info[0]['discount'],
                  discountinfo: goods_info[0]['discount_info'],
                  evalrate: parseInt(goods_info[0]['evalrate']),
                  card_content: card_content, 
                  card_register_content: card_register_content,
                  card_register_title: card_register_title,
                  card_image_height: card_image_height,
                })
                //var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
                that.image_save(that.data.share_goods_wx_headimg, 'wx_headimg_cache')
                console.log('头像图片下载缓存 card_type:', card_type)
              
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
            var goodsPicsInfo = res.data.result
            console.log('get_goodsdesc_list goodsPicsInfo:', goodsPicsInfo, ' template id:', goodsPicsInfo.image[0]['template_id'])
            var k = image?1:0
            for (var i = k; i < goodsPicsInfo.image.length;i++){
              if (goodsPicsInfo.image[i]['ext'] == 'mp4'){
                image_video.push(goodsPicsInfo.image[i])
              }else{
                if (goodsPicsInfo.image[i]['url'].indexOf("http") < 0) {
                  goodsPicsInfo.image[i]['url'] = weburl + '/' + goodsPicsInfo.image[i]['url']
                }
                goodsPicsInfo.image[i]['url'] = goodsPicsInfo.image[i]['url'].replace("http:", "https:")
                image_pic.push(goodsPicsInfo.image[i])
              }
            }
            image_pic[0]['template_config'] = goodsPicsInfo.image[0]['template_config']
          
            that.setData({
              goodsPicsInfo: res.data.result,
              image_video: image_video,
              image_pic: image_pic,
              image_share: goodsPicsInfo.share_image
            })
            if (goodsPicsInfo.image[0]['template_id'] != 0) {  //互动卡需要获取 图片模板信息
              that.swiperchange_cardname(0)
            }
            if (!share_goods_image) {
              that.image_save(image_pic[0]['url'], 'goods_image_cache_' + goodsid)
             // console.log('商品详情图片下载缓存 goods_image_cache_' + goodsid, image_pic[0]['url'])
            } 
            //console.log('get_goodsdesc_list image_share:', that.data.image_share, ' image_pic:', image_pic)
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
  
  imgYu: function (event) {
    var src = event.currentTarget.dataset.src //获取data-src
    var list = event.currentTarget.dataset.list //获取data-list
    var imgList = []
    for (var i = 0; i < list.length;i++){
      imgList.push(list[i]['url'])
    }
    console.log('image Yu imgList:', imgList)
     //图片预览
     wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: imgList // 需要预览的图片http链接列表
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
      var goodsmodel_count = that.data.goodsmodel_count
      if (that.data.commodityAttr.length>0){
        var sku_id = that.data.commodityAttr[0].id
        var attrValueList = that.data.attrValueList
        var sku_sell_price = that.data.commodityAttr[0].sell_price
        var sku_delivery_price = that.data.commodityAttr[0].delivery_price
        var is_buymyself = that.data.is_buymyself
        var goodsshape = that.data.goodsshape
        var card_type = that.data.card_type
        var card_register_title = that.data.card_register_title
        var card_register_content = that.data.card_register_content
        var card_register_addr = that.data.card_register_addr
        
        console.log('detail goodsmodel is_buymyself:', is_buymyself, 'goodsshape:', goodsshape, ' card_type:', card_type)
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
          if (card_type > 0) {
            that.setData({
              sku_sell_price: sku_sell_price,
              sku_delivery_price: sku_delivery_price,
              add_cart_title: that.data.goodsname,
              sku_id: sku_id,
              wishflag: 0,
            })
            that.addCart()
          }else{
            that.setData({
              modalHidden: !modalHidden,
              sku_sell_price: sku_sell_price,
              sku_delivery_price: sku_delivery_price,
              add_cart_title: that.data.goodsname,
              sku_id: sku_id,
              wishflag: 0,
            })
          }
         
        }

      }else{
        setTimeout(function () {
          goodsmodel_count = goodsmodel_count +1
          if (goodsmodel_count<5){
            wx.showToast({
              title: "加载中...",
              icon: 'loading',
              duration: 500,
            })
            that.setData({
              goodsmodel_count: goodsmodel_count,
            })
            that.goodsmodel()
          }else{
            that.setData({
              goodsmodel_count: 0,
            })
            wx.showToast({
              title: "系统繁忙!",
              icon: 'loading',
              duration: 1500,
            })
            that.goBack()
          }
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
      var goodsshape = that.data.goodsshape
      var refer_mid = that.data.refer_mid
      var card_type = that.data.card_type
      
      console.log('buyMyself card_type:', card_type, 'goodsshape:', goodsshape)
      that.setData({
        is_buymyself: 1,
        goodsmodel_count:0,
      })
      /*
      if (goodsshape==4) {
        //that.confirmcardinput()
        //that.cardnameEditTapTag(that.data.is_buymyself)
      }else{
        
      }
      */
      that.goodsmodel()
  },
  buyGift: function () {
    var that = this
    that.setData({
      is_buymyself: 0,
      goodsmodel_count: 0,
    })
    that.goodsmodel()
  },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      var that = this
      //var card_type = that.data.card_type
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
      var order_shape = that.data.order_shape
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
          title = that.data.card_type>0?'加载中':title
          title = (order_shape == 5 || order_shape==4) ? '处理中' : title
          wx.showToast({
            title: title,
            icon:'loading',
            duration: 2000
          })
          app.globalData.from_page = '/pages/details/details'
          if (wishflag == 1) {
            wx.switchTab({
              url: '/pages/wish/wish'
            })
            /*
            wx.navigateTo({
              url: '/pages/wish/wish'
            })
            */
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
      var share_goods_template = that.data.image_pic[cur_img_id]['template_config']
      var order_voice = that.data.new_rec_url ? that.data.new_rec_url:'' //录音文件url
      var order_voicetime = that.data.recordingTimeqwe ? that.data.recordingTimeqwe : 0 //录音文件url
      var goodsshape = that.data.goodsshape
      var current_card_color = that.data.current_card_color
      if (goodsshape == 5 || goodsshape == 4) {
        order_note = that.data.card_content
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
          //console.log('details queryCart:', res.data, 'cur_img_id:',cur_img_id);
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
            cartlist[key]['sku_list'][0]['image'] = share_goods_image
            for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
              if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
                cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image']
              } 
              cartlist[key]['sku_list'][i]['selected'] = true
              cartlist[key]['sku_list'][i]['shop_id'] = key
              cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id']
              carts[index] = cartlist[key]['sku_list'][i]
              index++;
            }
          }

          that.setData({
            carts: carts,
            all_rows: carts.length,
            is_buymyself:0,
          })
          var amount = parseFloat(that.data.sku_sell_price) * buynum
          if(goodsshape!=5 && goodsshape!=4){
            wx.navigateTo({
              url: '../order/checkout/checkout?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + goodsshape + '&order_image=' + share_goods_image + '&username=' + username + '&token=' + token
            })
          }else{
            if(that.data.card_type==1){
              var card_register_info = wx.getStorageSync('card_register_info')  //从缓存中读取
              console.log('detail checkout 贺卡请柬互动卡  order_image:', share_goods_image, 'card_register_info', card_register_info)
              wx.navigateTo({
                url: '../order/checkout/checkout?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + goodsshape + '&order_voice=' + order_voice + '&order_voicetiime=' + order_voicetime + '&order_note=' + order_note + '&order_color=' + current_card_color + '&order_image=' + share_goods_image + '&card_register_info=' + card_register_info + '&username=' + username + '&token=' + token
              })
            } else if (that.data.card_type == 2){
              var card_name_info = wx.getStorageSync('card_name_info')  //从缓存中读取
              console.log('detail checkout 名片互动卡  order_image:', share_goods_image, 'card_name_info', card_name_info)
              wx.navigateTo({
                url: '../order/checkout/checkout?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + goodsshape + '&order_voice=' + order_voice + '&order_voicetiime=' + order_voicetime + '&order_note=' + order_note + '&order_color=' + share_goods_template[0]['color'] + '&order_image=' + share_goods_image + '&card_name_info=' + card_name_info + '&card_name_template=' + JSON.stringify(share_goods_template) +'&username=' + username + '&token=' + token
              })
            }
           
          }
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