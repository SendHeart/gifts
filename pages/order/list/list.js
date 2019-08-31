var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl; 
var shop_type = app.globalData.shop_type; 
var navList_order = [
  { id: "send", title: "我送出的" },
  { id: "receive", title: "我收到的" },
];

Page({
	data: {
		orders: [],
    page:1,
    pagesize:20,
    status:0,
    navList_order: navList_order,
    tab2: 'send',
    activeIndex2:0,
    all_rows:0,
    hiddenmore:true,
    shop_type:shop_type,
    modalHiddenMember:true,
	},

  callphone: function (e) {
    var that = this
    var phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  memberinfo:function(e){
    var that = this
    var name = e.currentTarget.dataset.name
    var phone = e.currentTarget.dataset.phone
    var sex = e.currentTarget.dataset.sex
    var note = e.currentTarget.dataset.note
    that.setData({
      modalHiddenMember: !that.data.modalHiddenMember,
      name: name,
      phone: phone,
      sex: sex,
      note:note,
    })
  },
  modalBindconfirmMember: function () {
    var that = this
    that.setData({
      modalHiddenMember: !that.data.modalHiddenMember,
      
    })
  },

  goBack: function () {
    wx.switchTab({
      url: '../hall/hall'
    })
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag =  that.data.giftflag;
    if(tab=='send') {
      giftflag = 0;
    }else{
      giftflag = 1;
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
    })
    console.log('tab:' + tab)
    that.reloadData()
  },
  getMoreOrdersTapTag: function (e) {
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
    that.reloadData()
  },
  
  sendAginTapTag: function (e) {
    var that = this;
   
    wx.navigateTo({
      url: '../../list/list'
    });
  },
  detailTapTag: function (e) {
    var that = this;
    var order_object = e.currentTarget.dataset.orderObject;
    var order_id = order_object['id'];
    console.log('订单ID:'+order_id)
    wx.navigateTo({
      url: '../orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object)
    });
  },
  
	onLoad: function (options) {
		// 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
	  var that = this
    var order_id = options.order_id ? options.order_id : ''
    var receive = options.receive ? options.receive : 0
    var order_shape = options.order_shape ? options.order_shape : 4
    that.setData({
      order_id: order_id,
      receive: receive,
      order_shape: order_shape,
    })
    that.reloadData(options)
    that.query_interaction_info(order_id)
	},
	onShow: function() {
		//
	},
  
  reloadData: function () {
		var that = this;
    //var order_type= that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0;
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var receive = that.data.receive ? that.data.receive : 0
    var order_shape = that.data.order_shape ? that.data.order_shape:4
    var order_id = that.data.order_id ? that.data.order_id : ''
    var page = that.data.page
    var pagesize = that.data.pagesize
    console.log('reloadData shop_type:',that.data.shop_type)
    
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_interaction',
      method: 'POST',
      data: { 
        username: username ? username:openid, 
        m_id:m_id,
        access_token: token,
        order_id: order_id,
        shop_type: shop_type,
        order_shape: order_shape, 
        receive: receive,
        page:page,
        pagesize: pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows;
        if (!res.data.result) {
          wx.showToast({
            title: '没有查到信息',
            icon: 'none',
            duration: 2000
          })
          if(page==1){
            that.setData({
              orders: [],
              all_rows: 0,
              hiddenmore: true,
            })
          }else{
            that.setData({
              hiddenmore: true,
            })
          }
        } else {
          for (var i = 0; i < orderObjects.length;i++){
            var m_desc = orderObjects[i]['m_desc']
            if (orderObjects[i]['from_headimg'].indexOf("https://wx.qlogo.cn") >= 0) {
              orderObjects[i]['from_headimg'] = orderObjects[i]['from_headimg'].replace('https://wx.qlogo.cn', weburl + '/qlogo')
              orderObjects[i]['register_time'] = util.getDateDiff(orderObjects[i]['addtime'] * 1000)
            }
            orderObjects[i]['phone_enc'] = orderObjects[i]['phone'].substring(0, 3) + '****' + orderObjects[i]['phone'].substring(7,11)
            if (m_desc){
              var desc_note = JSON.parse(m_desc)
              orderObjects[i]['note'] = desc_note['note'] 
            }
          }
        
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows,
            hiddenmore: false,
          })
        }
      }
    })
	},
	
  query_interaction_info: function (order_id) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    //var order_id = that.data.order_id
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var shop_type = that.data.shop_type
    var card_register_info = ''
    var is_register = 0
    var card_register_ownername = ''
    var card_register_ownerwechat = ''
    //从服务器获取互动订单详情
   
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        order_id: order_id,
        order_type: 'receive',
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(' order receive reloadData() 互动订单查询:', res.data.result, ' order_id:', order_id)
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows ? res.data.all_rows : 0
        var receive_status = that.data.receive_status
        var order_m_id = 0
        if (!res.data.result) {
          wx.showToast({
            title: '暂无信息',
            icon: 'loading',
            duration: 1500
          })
          that.setData({
            orders: [],
            all_rows: 0,
            hiddenmore:true,
          })
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            if (orderObjects[i]['logo'].indexOf("http") < 0) {
              orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
            }

            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
            }
            var owner_headimg = orderObjects[i]['from_headimg']
            var owner_nickname = orderObjects[i]['from_nickname']
           
          }
          receive_status = orderObjects[0]['gift_status'] == 2 ? 1 : 0
          order_m_id = orderObjects[0]['m_id'] ? orderObjects[0]['m_id'] : 0
           
          if ((orderObjects[0]['shape'] == 5 || orderObjects[0]['shape'] == 4) && orderObjects[0]['m_desc']) {
            var m_desc = JSON.parse(orderObjects[0]['m_desc'])
            var voice_url = m_desc['voice']
            card_register_info = m_desc['card_register_info'] ? m_desc['card_register_info'] : ''
            is_register = m_desc['card_register_info'] ? 1 : 0
            card_register_ownerwechat = card_register_info['card_register_ownerwechat'] ? card_register_info['card_register_ownerwechat']:''
            card_register_ownername = card_register_info['card_register_ownername'] ? card_register_info['card_register_ownername'] : ''
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
          }

          that.setData({
            inter_order: orderObjects,
            owner_headimg: owner_headimg,
            owner_nickname: owner_nickname,
            receive_status: receive_status,
            order_m_id: order_m_id,
            card_register_info: card_register_info,
            is_register: is_register,
          })
          console.log('order list inter order  is_register:', that.data.is_register, ' card_register_info:', that.data.card_register_info)
        }
      }
    })
  },

})