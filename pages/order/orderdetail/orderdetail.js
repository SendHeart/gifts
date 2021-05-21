var app = getApp();
var weburl = app.globalData.weburl;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var shop_type = app.globalData.shop_type;
Page({
  data: {
    title_name: '订单详情',
    title_logo: '../../../images/footer-icon-05.png',
    delivery_background: weburl+'/uploads/line.png',
    share_title: '我的订单详情',
    share_desc: '黑贝会，高端会员制商店',
    orders: [],
    order_no:'',
    sendtime:'',
    orderprice:0,
    orderaddress:'',
    fullname:'',
    deliverycode:'',
    deliveryname:'',
    deliverystepinfo:'',
    deliveryinfo:[],
    delivery_status:[],
    deliveryflag:0,
    tel:'',
    rcvtime:'',
    page: 1,
    pagesize: 10,
    status: 0,
    order_id:0,
    sku_num:0,
    giftflag:0,
    shop_type:shop_type,
    scrollTop:1000,
    currentPages_length:2,
     
  },
  copyorderinfo: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var orders = that.data.orders
    var order_info_no = orders[index]['order_no'] ? '订单号:'+orders[index]['order_no']:''
    var order_info_num = orders[index]['order_sku'] ? ' 数量:' + orders[index]['order_sku'][0]['sku_num'] : ''
    var order_info_goodsname = orders[index]['order_sku'] ? ' 商品:' + orders[index]['order_sku'][0]['goods_name'] : ''
    var order_info = order_info_no + order_info_num + order_info_goodsname
    console.log('copyorderinfo data:', order_info);
    wx.setClipboardData({
      data: order_info,
      success: function () {
        console.log('copyorderinfo success data:', order_info);
      }
    });
  },
  pageScrollToBottom: function () {
    wx.createSelectorQuery().select('#j_page').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: 450
      })
    }).exec()
  },
 
  formSubmit: function (e) {
    var that = this
    //var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    var order_shape = that.data.order_shape
    console.log('formSubmit() form name:', form_name)
    if (form_name == 'express') {
      that.expressTapTag()
    } else if (form_name == 'goBack') {
      if (order_shape==5){
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=贺卡请柬'
        })
      } else if (order_shape == 4){
        wx.navigateTo({
          url: '/pages/list/list?navlist_title=互动卡'
        })
      }else{
        that.goBack()
      }
    }
    //if(formId) that.submintFromId(formId)
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
    var CurrentPages = getCurrentPages()
    if (CurrentPages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  onTapTag2: function (e) {
    var that = this;
    var tab = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
    });

    //that.reloadData()
  },
  
  expressTapTag: function () {
    var that = this
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var deliveryflag = that.data.deliveryflag ;
     
    console.log('物流详情:'+order_no+' '+username+' '+token)
    if (deliveryflag==1) return;
    //从服务器获取订单物流信息
    wx.request({
      url: weburl + '/api/client/query_delivery_info',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no:order_no,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        if (!res.data.result) {
          wx.showToast({
            title: '暂无物流信息',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            //wx.navigateBack();
          }, 500);
        } else {
          if (res.data.result['status_list'].length<2){
            wx.showToast({
              title:'暂无轨迹信息',
              icon: 'loading',
              duration: 1500
            });
            setTimeout(function () {
              //wx.navigateBack();
            }, 500);
          }
        
          var deliveryinfo = res.data.result
          var status_list = deliveryinfo['status_list']
          var delivery_status = that.data.delivery_status
          if (status_list){
            var index = status_list.length-1;
            for (var i = 0; i < status_list.length; i++){
                delivery_status[index-i] = status_list[i];
            }
          }
          
          that.setData({
            deliveryinfo: deliveryinfo,
            delivery_status: delivery_status,
            deliveryflag:1
          })

          that.pageScrollToBottom()
        }
      }
    })
     
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that =  this;
    var orders = that.data.orders;
    var order_id = options.order_id ? options.order_id:0
    var order_no = options.order_no ? options.order_no : 0
    var card_type = options.card_type ? options.card_type:0
    var giftflag = options.giftflag ? options.giftflag:0
    var send_rcv = options.send_rcv ? options.send_rcv:0
    var wx_notes = options.wx_notes ? options.wx_notes:0 //微信通知直接进入
    var order_object = options.order_object ? JSON.parse(options.order_object):''
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        let winWidth = res.windowWidth;
       
        that.setData({
          winHeight: winHeight,
          winWidth: winWidth,
        })
      }
    })

    var currentPages = getCurrentPages()
    that.setData({
      currentPages_length: currentPages.length, 
      wx_notes:wx_notes,
    })
    //that.setNavigation()
    console.log('orderdetail onload options:', options, 'order_object:', order_object,'length:',order_object.length)
    if (order_object) {
      console.log('订单详情', order_object)
      var sku_num = 0
      var status = order_object['status']
      var gift_status = order_object['gift_status']
      var order_no = order_object['order_no']
      var order_shape = order_object['shape']
      var sendtime = order_object['paytime']
      var rcvtime = order_object['rcvtime']
      var orderprice = order_object['order_price']
      var orderaddress = order_object['address']
      var fullname = order_object['full_name']
      var from_nickname = order_object['from_nickname']
      var from_headimg = order_object['from_headimg']
      var tel = order_object['tel']
      var deliverycode = order_object['deliverycode']
      var deliveryname = order_object['deliveryname']
      var deliverystepinfo = order_object['deliverystepinfo']
      var order_status = order_object['status']
      var buy_num = order_object['buy_num']
      var card_name_info = order_object['card_name_info'] ? order_object['card_name_info']:''
      var card_cele_info = order_object['card_cele_info'] ? order_object['card_cele_info'] : ''
      var card_love_info = order_object['card_love_info'] ? order_object['card_love_info'] : ''
      var card_register_info = order_object['card_register_info'] ? order_object['card_register_info']:''
      sku_num = order_object['order_sku']?order_object['order_sku'].length:1
      orders.push(order_object)
      that.setData({
        order_id: order_id ? order_id : 0,
        orders: orders,
        status: status,
        giftflag: giftflag ? giftflag : 0,
        gift_status: gift_status,
        send_rcv: send_rcv ? send_rcv : 0,
        order_status: order_status,
        order_shape: order_shape,
        sku_num: sku_num,
        buy_num: buy_num,
        order_no: order_no,
        sendtime: sendtime,
        rcvtime: rcvtime,
        orderprice: orderprice,
        orderaddress: orderaddress ? orderaddress:'',
        tel: tel ? tel:'',
        fullname: fullname ? fullname:'',
        from_nickname: from_nickname,
        from_headimg: from_headimg,
        deliverycode: deliverycode ? deliverycode : '',
        deliveryname: deliveryname ? deliveryname : '',
        deliverystepinfo: deliverystepinfo ? deliverystepinfo : '',
        card_name_info: card_name_info,
        card_love_info: card_love_info,
        card_cele_info: card_cele_info,
        card_register_info: card_register_info,
        card_type: card_type,
      })
    } else if (order_no || order_id){
      that.setData({
        order_no: order_no,
        order_id: order_id,
      })
      //that.reloadData()
    }else{
      wx.navigateBack()
    }
  },
  onShow: function () {
    this.reloadData();
    var that = this
    var CurrentPages = getCurrentPages()
    if (CurrentPages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }
    /*  
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
  },

  reloadData: function () {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : '0';
    var status = that.data.status
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no
    var order_id = that.data.order_id
    //从服务器获取订单列表
    console.log('orderdetail reloadData() 从服务器获取订单 order_no: ', order_no)
    if (order_no||order_id){
      wx.request({
        url: weburl + '/api/client/query_order',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          status: status,
          shop_type: shop_type,
          order_no: order_no,
          order_id: order_id,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('orderdetail query order:',res.data.result);
          var orderObjects = res.data.result;
          var all_rows = res.data.all_rows;
          if (!res.data.result) {
            wx.showToast({
              title: '暂无',
              icon: 'loading',
              duration: 1500
            });
            setTimeout(function () {
              wx.navigateBack();
            }, 500);
          } else {
            // 存储地址字段
            for (var i = 0; i < orderObjects.length; i++) {
              orderObjects[i]['order_price'] = orderObjects[i]['order_price'].toFixed(2)
              orderObjects[i]['amountpay'] = orderObjects[i]['amountpay'].toFixed(2)
              if (orderObjects[i]['logo'].indexOf("http") < 0) {
                orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
              }
              
              for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                  orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
                }
               
                if (orderObjects[i]['order_sku'][j]['sku_value']) {
                  for (var k = 0; k < orderObjects[i]['order_sku'][j]['sku_value'].length; k++) {
                    //orderObjects[i]['order_sku'][j]['sku_value'][k]['value'] = weburl + orderObjects[i]['order_sku'][j]['sku_value'][k]['value']
                  }
                }
              }
            }
            console.log('orderdetail reloadData() orderObjects:',orderObjects)
            var status = orderObjects[0]['status']
            var gift_status = orderObjects[0]['gift_status']
            var order_id = orderObjects[0]['id']
            var order_no = orderObjects[0]['order_no']
            var sendtime = orderObjects[0]['paytime']
            var rcvtime = orderObjects[0]['rcvtime']
            var orderprice = orderObjects[0]['order_price']
            var orderaddress = orderObjects[0]['address']
            var fullname = orderObjects[0]['full_name']
            var from_nickname = orderObjects[0]['from_nickname']
            var from_headimg = orderObjects[0]['from_headimg']
            var tel = orderObjects[0]['tel']
            var deliverycode = orderObjects[0]['deliverycode']
            var deliveryname = orderObjects[0]['deliveryname']
            var deliverystepinfo = orderObjects[0]['deliverystepinfo']
            var order_status = orderObjects[0]['status']
            var buy_num = orderObjects[0]['buy_num']
            var sku_num = orderObjects[0]['order_sku'][0]['sku_num']
            var giftflag = orderObjects[0]['m_id'] == m_id?0:1
            var send_rcv = giftflag==0?'send':'receive'
            var order_shape = orderObjects[0]['shape'] ? orderObjects[0]['shape']: 1

            that.setData({
              orders: orderObjects,
              buy_num: buy_num,
              sku_num: sku_num,
              order_id: order_id ? order_id : 0,
              status: status,
              giftflag: giftflag ? giftflag : 0,
              gift_status: gift_status,
              send_rcv: send_rcv,
              order_status: status,
              order_no: order_no,
              sendtime: sendtime,
              rcvtime: rcvtime,
              orderprice: orderprice,
              orderaddress: orderaddress,
              tel: tel,
              order_shape: order_shape,
              fullname: fullname,
              from_nickname: from_nickname,
              from_headimg: from_headimg,
              deliverycode: deliverycode ? deliverycode : '',
              deliveryname: deliveryname ? deliveryname : '',
              deliverystepinfo: deliverystepinfo ? deliverystepinfo : ''
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '订单不存在',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.navigateBack();
      }, 1500)
    }
  },
  pay: function (e) {
    var objectId = e.currentTarget.dataset.objectId
    var totalFee = e.currentTarget.dataset.totalFee
    var received = e.currentTarget.dataset.received ? e.currentTarget.dataset.received:0
    console.log('orderdetail pay() order_no:',objectId,'received:',received);
    //console.log(objectId);
    wx.navigateTo({
      url: '../payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee + '&received=' + received
    });
  },
  receive: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    wx.showModal({
      title: '请确认',
      content: '确认要收货吗',
      success: function (res) {
        if (res.confirm) {
          var objectId = e.currentTarget.dataset.objectId;

          wx.request({
            url: weburl + '/api/client/order_confirm',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              id: objectId,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log(res.data.result);
              console.log(res.data.info);
              if (!res.data.info) {
                wx.showToast({
                  title: '确认收货完成',
                  icon: 'success',
                  duration: 1000
                });
              } else {
                wx.showToast({
                  title: res.data.info,
                  icon: 'loading',
                  duration: 1500,

                });
              }
            }
          })
        }
      }
    })
  },
  showGoods: function (e) {
    var that = this
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName
    var goods_shape = e.currentTarget.dataset.goodsShape
    var order_no = that.data.order_no
    var order_id = that.data.order_id
    var order_shape = e.currentTarget.dataset.orderShape?e.currentTarget.dataset.orderShape:that.data.order_shape
    var card_type = that.data.card_type
    var receive = that.data.send_rcv
    console.log('orderdetail showGoods() 查看详情 order_no: ', order_no, ' order_id:',order_id,' order_shape:', order_shape, ' receive:', receive)
    if (order_shape==5||order_shape==4){
      wx.navigateTo({
        url: '/pages/order/receive/receive?order_no=' + order_no + '&order_id=' + order_id + '&order_shape=' + order_shape + '&card_type=' + card_type+ '&receive=' + receive
      })
    }else if(order_shape ==7 || order_shape ==8){
      return
    }else{
      wx.navigateTo({
        url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
      }) 
    }
  },

  showinteracton: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_id = e.currentTarget.dataset.orderId;
    var order_shape = e.currentTarget.dataset.orderShape
    var receive = that.data.send_rcv
    if (order_shape == 4 || order_shape == 5) {
      wx.navigateTo({
        url: '/pages/order/list/list?order_id=' + order_id + '&order_shape=' + order_shape + '&receive=' + receive
      })
    } 
  },

  
  address_update: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_no = that.data.order_no
    var order_id = that.data.order_id
    wx.navigateTo({
      url: '/pages/address/list/list?order_id=' + order_id+'&order_no='+order_no 
    })
  },

  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var order_no = that.data.order_no
    return {
      title: that.data.share_title,
      desc: that.data.share_desc,
      path: '/pages/order/orderdetail/orderdetail?order_no=' + order_no + '&refername=' + username
    }
  }
})