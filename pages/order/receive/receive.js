var app = getApp();
var weburl = app.globalData.weburl;
var util = require('../../../utils/util.js');
var now = new Date().getTime();
var shop_type = app.globalData.shop_type
const myaudio = wx.createInnerAudioContext();

Page({
  data: {
    title_name: '收到礼物',
    title_logo: '../../../images/footer-icon-05.png',
    shop_type:shop_type,
    orders: [],
    orderskus:[],
    openid:null,
    userInfo: {},
    page: 1,
    pagesize: 10,
    status: 0,
    all_rows: 0,
    giftflag: 0,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 2000,
    note_title:'Hi~:',
    note:'',
    headimg:'',
    nickname:'',
    receive_status:9,
    overtime_status:0,
    receive:0,
    order_no:'',
    currenttime: now ? parseInt(now / 1000) : 0,
    is_buymyself:0,
    messageHidden: true,
    cardregisterHidden: true,
    needCardRegisterName:'请提供相关信息',
    card_register_note:'',
    card_register_name: '',
    card_register_phone: '',
    card_register_gender: '',
    card_register_req: ['无需证件', '身份证号', '微信号', 'QQ号', '电子邮箱','学号', '工号'],
    card_register_reqid_index: 0,
    card_register_reqid_value : '',
    is_showable:0,

  },

  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    var order_shape = that.data.order_shape
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'receivegift') {
      if(order_shape==4){
        that.setData({
          cardregisterHidden: !that.data.cardregisterHidden
        })
      }else{
        that.receiveTapTag()
      }
     
    } else if (form_name == 'refresh') {
      var isreload = e.currentTarget.dataset.isreload ? e.currentTarget.dataset.isreload : 0
      that.setData({
        isreload: isreload,
        all_rows: 0,
      })
    } else if (form_name == 'resendgift') {
      if (order_shape == 4 || order_shape==5) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      } else {
        that.returnTapTag()
      }
     
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
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  returnTapTag: function (e) {
    var that = this
    var type = e.currentTarget.dataset.type
    var order_id = e.currentTarget.dataset.orderId
    var order_shape = that.data.order_shape
    if(type==1){ //转商城
      if (order_shape == 5) {
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=贺卡请柬'
        })
      } else if (order_shape == 4) {
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=互动卡'
        })
      }  
    }else if(type==2){ //转互动详情
      wx.navigateTo({
        url: '/pages/order/list/list?order_id='+order_id+'&order_shape='+order_shape
      })
    }else{
      wx.switchTab({
        url: '../../hall/hall'
      })
    }
  },

  radiochange: function (e) {
    var that = this
    var card_register_gender = e.detail.value
    //console.log('radio发生change事件，携带的value值为：', e.detail.value)
    that.setData({
      card_register_gender: card_register_gender
    })
  },
  textPaste:function(e) {
    var that = this
    var content = e.currentTarget.dataset.content
    wx.showToast({
      title: '复制成功',
    })
    wx.setClipboardData({
      data: content,
      success: function (res) {
        wx.getClipboardData({
          success: function(res) {
            console.log('点击复制微信号:',res.data)  
          }
        })
      }
    })
  },
  shareorderTapTag:function(){
    var that = this
    var order_id = that.data.order_id
    var order_shape = that.data.order_shape
    var order_bg = that.data.order_bg
    var order_image = that.data.order_image
    var share_order_image = that.data.share_order_image

    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?share_order_id=' + order_id + '&share_order_shape=' + order_shape + '&share_order_bg=' + order_image + '&share_order_image=' + share_order_image
    })

  },

  card_register_req: function (e) {
    var that = this
    var card_register_reqid_value = e.detail.value
    that.setData({
      card_register_reqid_value: card_register_reqid_value
    })
  },

  card_register_phone: function (e) {
    var that = this
    var card_register_phone = e.detail.value
    that.setData({
      card_register_phone: card_register_phone
    })
  },

  card_register_name: function (e) {
    var that = this
    var card_register_name = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_name: card_register_name
    })
  },

  card_register_note: function (e) {
    var that = this
    var card_register_note = util.filterEmoji(e.detail.value)
    that.setData({
      card_register_note: card_register_note
    })
  },

  //按钮点击事件  获取姓名
  confirmCardRegisterInfo: function () {
    var that = this
    var card_register_name = that.data.card_register_name
    var card_register_phone = that.data.card_register_phone
    var card_register_gender = that.data.card_register_gender
    if (!util.checkPhoneNumber(card_register_phone)) {
      wx.showToast({
        title: '手机号码无效',
        icon: 'none',
        duration: 1500
      })    
      return 
    }
    if (card_register_name && card_register_gender && card_register_phone) {
      that.receiveTapTag()
      that.setData({
        cardregisterHidden: !that.data.cardregisterHidden
      })

    } else {
      var needCardRegisterName = '需要提供姓名、性别和手机号'
      that.setData({
        needCardRegisterName: needCardRegisterName
      })
    }
  },

  //按钮点击事件  取消
  cancelCardRegisterInfo: function () {
    var that = this
    that.setData({
      cardregisterHidden: !that.data.cardregisterHidden
    })
  },

  receiveTapTag: function () {
    var that = this 
    var order_shape = that.data.order_shape //5贺卡请柬 4互动卡
    var is_buymyself = that.data.is_buymyself
    var title = is_buymyself == 1 ? '收货地址' :'请确认'
    var content = is_buymyself == 1 ? '详细地址' : '确认接受吗'
    
    if (order_shape == 5 || order_shape == 4 ) { //贺卡请柬 或 互动卡 不需要设置接收地址
      that.confirm_card()
    }else{
      if (is_buymyself == 1) {
        that.set_address()
      } else {
        wx.showModal({
          title: title,
          content: content,
          success: function (res) {
            if (res.confirm) {
              that.set_address()
            }
          }
        })
      }
    }
  },

  set_address: function () {
    var that = this
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no
    var order_price = that.data.order_price
    var goods_flag = that.data.goods_flag ? that.data.goods_flag:0
    var openid = that.data.openid
    var nickname = that.data.userInfo.nickName
    var headimg = that.data.userInfo.avatarUrl
    var address_userName = that.data.address_userName
    var address_postalCode = that.data.address_postalCode
    var address_provinceName = that.data.address_provinceName
    var address_cityName = that.data.address_cityName
    var address_countyName = that.data.address_countyName
    var address_detailInfo = that.data.address_detailInfo
    var address_nationalCode = that.data.address_nationalCode
    var address_telNumber = that.data.address_telNumber
    var is_buymyself = that.data.is_buymyself
    //通讯录权限检查
    wx.getSetting({
      success(res) {
        var authMap = res.authSetting;
        var length = Object.keys(authMap).length;
        console.log("authMap info 长度:" + length, authMap)
        if (authMap.hasOwnProperty('scope.address')) {
          if (!authMap['scope.address']) { //授权拒绝
            wx.showModal({
              title: '用户未授权',
              content: '请授权通讯地址权限',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定授权通讯地址权限')
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
    //收货地址选择
    wx.chooseAddress({
      success: function (res) {
        console.log('微信收货地址:')
        console.log(res)
        address_userName = res.userName
        address_postalCode = res.postalCode
        address_provinceName = res.provinceName
        address_cityName = res.cityName
        address_countyName = res.countyName
        address_detailInfo = res.detailInfo
        address_nationalCode = res.nationalCode
        address_telNumber = res.telNumber
        that.setData({
          address_userName: address_userName,
          address_postalCode: address_postalCode,
          address_provinceName: address_provinceName,
          address_cityName: address_cityName,
          address_countyName: address_countyName,
          address_detailInfo: address_detailInfo,
          address_nationalCode: address_nationalCode,
          address_telNumber: address_telNumber,
        })
        console.log('收货地址选择 订单号 order receive chooseAddress:' + that.data.order_no + ' openid:' + that.data.openid)
        wx.request({ //更新收礼物状态
          url: weburl + '/api/client/update_order_status',
          method: 'POST',
          data: {
            username: that.data.username,
            shop_type: shop_type,
            openid: that.data.openid,
            nickname: that.data.nickname,
            headimg: that.data.headimg,
            order_no: that.data.order_no,
            status_info: 'receive',
            goods_flag: goods_flag,
            address_userName: address_userName,
            address_postalCode: address_postalCode,
            address_provinceName: address_provinceName,
            address_cityName: address_cityName,
            address_countyName: address_countyName,
            address_detailInfo: address_detailInfo,
            address_nationalCode: address_nationalCode,
            address_telNumber: address_telNumber,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('order receive set_address()礼物已接收:', res.data);
            if (res.data.status == 'y') {
              wx.showToast({
                title: '礼物已接收',
                icon: 'success',
                duration: 1500
              })
              that.setData({
                receive_status: 1,
              })
              if (goods_flag == 3) { //虚拟商品订单
                setTimeout(function () {
                  wx.navigateTo({
                    url: '/pages/member/task/task',
                  })
                }, 200)
              }
              if(is_buymyself == 1 && order_price>0){ //自购礼物订单抽奖
                console.log('自购礼物订单抽奖 to lottery order_no:', order_no)
                wx.navigateTo({
                  url: '/pages/lottery/lottery?lottery_type=0' + '&order_no=' + that.data.order_no,
                })
              }else{
                that.goBack()
              }
            } else {
              console.log('礼物接收失败 order_no:', that.data.order_no)
              wx.showToast({
                title: res.data.info ? res.data.info:'礼物接收失败',
                icon: 'loading',
                duration: 1500
              })
              that.setData({
                receive_status: 0,
              })
            }
          }
        })
      }
    })
  },

  //贺卡请柬 互动卡 接受处理
  confirm_card:function(){
    var that = this
    var shop_type = that.data.shop_type
    var order_id = that.data.order_id
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('openid') ? wx.getStorageSync('m_id') : ''
    var order_m_id = that.data.order_m_id
    var nickname = that.data.userInfo.nickName
    var headimg = that.data.userInfo.avatarUrl
    var order_shape = that.data.order_shape
    var card_register_name = that.data.card_register_name ? that.data.card_register_name:''
    var card_register_phone = that.data.card_register_phone ? that.data.card_register_phone:''
    var card_register_gender = that.data.card_register_gender ? that.data.card_register_gender:''
    var card_register_reqid_value = that.data.card_register_reqid_value ? that.data.card_register_reqid_value : ''
    var card_register_reqid_index = that.data.card_register_reqid_index ? that.data.card_register_reqid_index:0
    var card_register_note = that.data.card_register_note ? that.data.card_register_note:''
    if ((order_shape == 5 || order_shape == 4) && order_m_id==m_id) { //贺卡请柬 互动卡 不能自己接受
      if (order_shape == 5) {
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=贺卡请柬'
        })
      } else if (order_shape == 4) {
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=互动卡'
        })
      }
      return
    }
    var card_register_info = [
      { 
        card_register_name: card_register_name, 
        card_register_phone: card_register_phone, 
        card_register_gender: card_register_gender, 
        card_register_note: card_register_note, 
        card_register_reqid_value: card_register_reqid_value,
        card_register_reqid_index: card_register_reqid_index,
      },
    ]

    wx.request({ //更新收礼物状态
      url: weburl + '/api/client/update_order_status',
      method: 'POST',
      data: {
        username: username,
        shop_type: shop_type,
        openid:openid,
        nickname: nickname,
        headimg: headimg,
        order_id: order_id,
        status_info: 'receive',
        order_shape: order_shape,
        card_register_info: JSON.stringify(card_register_info[0]),
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('order receive set_address()礼物已接收:', res.data)
        var title = ''
        if (order_shape==5){
          title = '已接收'
        } else if (order_shape==4){
          title = '提交完成'
        }else{
          title ='礼物已接收'
        }
        if (res.data.status == 'y') {
          wx.showToast({
            title: title,
            icon: 'none',
            duration: 1500
          })
          that.setData({
            receive_status: 1,
          })
          if (goods_flag == 3) { //虚拟商品订单
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/member/task/task',
              })
            }, 200)
          }
          if (is_buymyself == 1 && order_price > 0) { //自购礼物订单抽奖
            console.log('自购礼物订单抽奖 to lottery order_no:', order_no)
            wx.navigateTo({
              url: '/pages/lottery/lottery?lottery_type=0' + '&order_no=' + that.data.order_no,
            })
          } else {
            that.goBack()
          }
        } else {
          console.log('礼物接收失败 order_no:', that.data.order_no)
          wx.showToast({
            title: res.data.info ? res.data.info : '系统错误',
            icon: 'loading',
            duration: 1500
          })
          that.setData({
            receive_status: 0,
          })
        }
      }
    })
  },
  
  scroll: function (event) {
    //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  topLoad: function (event) {
    //   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
    //page = 1;
    this.setData({
      //list: [],
      scrollTop: 0
    });
    //loadMore(this);
    console.log("lower");
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var ordno = options.ordno ? options.ordno : '' //APP 送礼订单
    var order_no = options.order_no ? options.order_no : ordno
    var order_id = options.order_id ? options.order_id:0
    var order_shape = options.order_shape ? options.order_shape : 0
    var receive = options.receive ? options.receive:0
    var is_buymyself = options.is_buymyself ? options.is_buymyself : 0
    var goods_flag = options.goods_flag ? options.goods_flag:0
    var orders = that.data.orders
    var orderskus = that.data.orderskus
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note
    var shop_type = that.data.shop_type
    var scene = decodeURIComponent(options.scene)
    if (scene.indexOf("ordno=") >= 0) {
      var ordnoReg = new RegExp(/(?=ordno=).*?(?=\&)/)
      var scene_ordno = scene.match(ordnoReg)[0]
      order_no = order_no ? order_no : scene_ordno
    } else if (scene.indexOf("ordid=") >= 0) {
      var ordidReg = new RegExp(/(?=ordid=).*?(?=\&)/)
      var scene_ordid = scene.match(ordidReg)[0]
      var tyReg = new RegExp(/\&ty=(.*)/)
      var scene_order_shape = scene.match(tydReg)[0]
      order_id = order_id > 0 ? order_id : scene_ordid
      order_shape = scene_order_shape
    }
    app.globalData.is_receive = receive
    app.globalData.order_no = order_no
    app.globalData.order_id = order_id
    app.globalData.goods_flag = goods_flag
    that.setData({
      order_no: order_no,
      order_id: order_id,
      order_shape: order_shape,
      receive: app.globalData.is_receive,
      openid: openid,
      username: username,
      goods_flag: goods_flag,
      is_buymyself: is_buymyself,
    })
   
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log('getSystemInfo:', winHeight);
        if(res.platform == "ios"){
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
        that.setData({
          dkheight: winHeight,
        })
      }
    })
   
    if (app.globalData.is_receive != 1 && that.data.is_buymyself != 1 && that.data.order_shape != 5 && that.data.order_shape != 4) {
      console.log('礼品信息 order receive onLoad() order_no:', order_no + ' is_receive:' + app.globalData.is_receive, ' order shape:', order_shape,'order id:',order_id)
      wx.switchTab({
        url: '/pages/hall/hall'
      })
      return
    }
    that.reloadData()
  },

  onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var order_no = app.globalData.order_no
    var order_id = app.globalData.order_id
    var goods_flag = app.globalData.goods_flag
    //var is_buymyself = that.data.is_buymyself
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    if (!username) {
      /*
      wx.switchTab({
        url: '/pages/my/index'
      })
      */
      wx.navigateTo({
        url: '../../login/login'
      })
    } else {
      //调用应用实例的方法获取全局数据
      app.getUserInfo(function (userInfo) {
        //更新数据
        that.setData({
          userInfo: userInfo
        })
      })
    }
  },

  overtimeData: function () {
    var that = this
    var headimg = that.data.headimg
    var nickname = that.data.nickname
  
    console.log(' receive overtimeData() 超时处理 headimg:', headimg, ' nickname:',nickname)
    if (!headimg){
      that.setData({
        overtime_status: 1 ,//超时标志
        orders: [],
        all_rows: 0,
      })
    }
  },

  play_rec: function () {
    var that = this
    var order_voice = that.data.order_voice
    var new_rec_url = that.data.voice_url
    console.log('录音文件url:', myaudio.src)
     
    if (order_voice) {
      myaudio.src = order_voice
      myaudio.play()
    } else if (new_rec_url){
      wx.downloadFile({
        url: new_rec_url, //音频文件url                  
        success: res => {
          if (res.statusCode === 200) {
            console.log('音频文件下载完成:', res.tempFilePath)
            
            myaudio.src = res.tempFilePath
            myaudio.play()
            console.log('录音播放完成')
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

  reloadData: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var order_no = that.data.order_no
    var order_id = that.data.order_id
    var goods_flag = that.data.goods_flag
    var orders = that.data.orders
    var orderskus = that.data.orderskus
    var shop_type = that.data.shop_type
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note
    var is_buymyself = that.data.is_buymyself
    var isreload = that.data.isreload
    var order_price = 0
    var card_register_info = ''
    var card_type = 0
    var button_name = ''
    var card_register_reqid_index = that.data.card_register_reqid_index ? that.data.card_register_reqid_index:0
    //从服务器获取订单列表
    if (is_buymyself!=1){
      setTimeout(function () { //3秒超时
        that.overtimeData()
      }, 3000)
    }

    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username ? username: openid,
        access_token: token,
        order_no: order_no,
        order_id: order_id,
        order_type: 'receive',
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(' order receive reloadData() 礼物订单查询:', res.data.result)
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows ? res.data.all_rows : 0
        var receive_status = that.data.receive_status
        var order_m_id = 0
        if (!res.data.result) {
          wx.showToast({
            title: '没有该订单',
            icon: 'loading',
            duration: 1500
          })
          if (goods_flag == 3 && username){ //虚拟商品订单
            setTimeout(function () {
              wx.navigateTo({
                url: 'pages/member/task/task'
              });
            }, 500)
          }else{
            setTimeout(function () {
              wx.navigateBack();
            }, 1500)
          }
          that.setData({
            orders: [],
            all_rows: 0
          })
        } else {
          if(isreload==1){ //超时刷新
            that.setData({
              orders: [],
              all_rows: 0
            })
          }
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            if (orderObjects[i]['logo'].indexOf("http") < 0) {
              orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
            }
            
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
              if (orderObjects[i]['order_sku'][j]['sku_share_image'].indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_share_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_share_image']
              }
            }
            note = orderObjects[i]['rcv_note']
            headimg = orderObjects[i]['from_headimg']
            nickname = orderObjects[i]['from_nickname']
            order_price = order_price + orderObjects[i]['order_price']
          }
          receive_status = orderObjects[0]['gift_status'] == 2 ? 1 : 0
          order_m_id = orderObjects[0]['m_id'] ? orderObjects[0]['m_id'] : 0
          if (receive_status==1 && goods_flag == 3) { //虚拟商品订单
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/member/task/task',
              })
            }, 100)
          } 
          if (orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          console.log('receive status:' + receive_status);
          // order_sku 合并在一个对象中
          for (var i = 0; i < orderObjects.length; i++) {
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['goods_name'] = orderObjects[i]['order_sku'][j]['goods_name'].substring(0, 15)
              orderskus.push(orderObjects[i]['order_sku'][j])
            }
          }
          button_name = orderObjects[0]['button_name'] //按钮提示 后端提供
          if ((orderObjects[0]['shape'] == 5 || orderObjects[0]['shape'] == 4) && orderObjects[0]['m_desc']){
            var m_desc = JSON.parse(orderObjects[0]['m_desc'])
            var voice_url = m_desc['voice']
            card_register_info = m_desc['card_register_info'] ? m_desc['card_register_info'] : ''
            card_type = m_desc['card_register_info'] ? 1 : 0 
            card_register_reqid_index = card_register_info['card_register_reqid_index']
            if (voice_url) {
              wx.downloadFile({
                url: voice_url, //音频文件url                  
                success: res => {
                  if (res.statusCode === 200) {
                    //myaudio.src = res.tempFilePath
                    //myaudio.play()
                    console.log('录音文件下载完成', res.tempFilePath)
                    
                    that.setData({
                      order_voice: res.tempFilePath,
                      voice_url: voice_url,
                    })
                  }
                }
              })
            }
          }

          that.setData({
            orders: orderObjects,
            order_price: order_price,
            all_rows: all_rows,
            orderskus: orderskus,
            note: note,
            note_title: note_title,
            headimg: headimg,
            nickname: nickname,
            order_image: orderskus[0]['sku_image'],
            share_order_image: orderskus[0]['sku_share_image'],
            receive_status: receive_status,
            order_m_id: order_m_id,
            card_register_info: card_register_info,
            card_type: card_type,
            button_name: button_name,
            card_register_reqid_index: card_register_reqid_index,
            is_showable: orderObjects[0]['is_showable'],
          })
          console.log('order sku list:', orderskus, ' card_type:', that.data.card_type,' card_register_info:', that.data.card_register_info)
          app.globalData.is_receive = 0 
          var order_price = orderObjects[0]
          if(is_buymyself==1){ //自购礼品 直接接收
            that.receiveTapTag()
          }
        }
      }
    })
  },
  
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_name = e.currentTarget.dataset.goodsName
    console.log('showGoods')
    console.log(goods_name + ' ' + goods_id);
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    })
  },


  onShareAppMessage: function (options ) {
      var that = this 
      var res
      var order_no = that.data.order_no
      var order_id = that.data.order_id
      var username = that.data.username
      var token = that.data.token;
      console.log('开始收礼')
      console.log(options)
      var shareObj = {
      　title: "我收到的礼物",        // 默认是小程序的名称(可以写slogan等)
        path: '/pages/hall/hall',   // 默认是当前页面，必须是以‘/’开头的完整路径
      　imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      　success: function (res) {　　　
          console.log(res)
          if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
            
           
            }
      　　},
      　　fail: function () {　　
            console.log(res)
            if (res.errMsg == 'shareAppMessage:fail cancel') {// 转发失败之后的回调
          　　　　　　　　// 用户取消转发
        　　　} else if (res.errMsg == 'shareAppMessage:fail') {
          　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
        　　　}
      　　},
          complete: function() { // 转发结束之后的回调（转发成不成功都会执行）
        　　　　　　
      　　　　
  　　    },
        }
      if (options.from === 'button') {
          // 来自页面内转发按钮
            // shareBtn
          　　　　// 此处可以修改 shareObj 中的内容
        // var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况
        // shareObj.path = '/pages/order/send/send?order_no=' +'&receive=';
        
        }
        // 返回shareObj
        return shareObj;
  } ,
   
});