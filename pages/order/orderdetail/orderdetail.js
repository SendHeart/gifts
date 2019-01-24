var app = getApp();
var weburl = app.globalData.weburl;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var shop_type = app.globalData.shop_type;
Page({
  data: {
    title_name: '记录详情',
    title_logo: '../../../images/footer-icon-05.png',
    delivery_background: weburl+'/uploads/line.png',
    share_title: '我的礼物详情单',
    share_desc: '送礼就是送心',
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
     
  },
  pageScrollToBottom: function () {
    wx.createSelectorQuery().select('#j_page').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: 450
      })
    }).exec()
  },
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
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
  
  expressTapTag: function (e) {
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
    var giftflag = options.giftflag ? options.giftflag:0
    var send_rcv = options.send_rcv ? options.send_rcv:0
    
    //that.setNavigation()
    console.log('订单 order_no:', order_no)
    if (options.order_object) {
      var order_object = options.order_object ? JSON.parse(options.order_object) : []
      console.log('订单详情', order_object)
      var sku_num = 0
      var status = order_object['status']
      var gift_status = order_object['gift_status']
      var order_no = order_object['order_no']
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
      sku_num = order_object['order_sku'].length
      orders.push(order_object)
      that.setData({
        order_id: order_id ? order_id : 0,
        orders: orders,
        status: status,
        giftflag: giftflag ? giftflag : 0,
        gift_status: gift_status,
        send_rcv: send_rcv ? send_rcv : 0,
        order_status: order_status,
        sku_num: sku_num,
        buy_num: buy_num,
        order_no: order_no,
        sendtime: sendtime,
        rcvtime: rcvtime,
        orderprice: orderprice,
        orderaddress: orderaddress,
        tel: tel,
        fullname: fullname,
        from_nickname: from_nickname,
        from_headimg: from_headimg,
        deliverycode: deliverycode ? deliverycode : '',
        deliveryname: deliveryname ? deliveryname : '',
        deliverystepinfo: deliverystepinfo ? deliverystepinfo : ''
      })
    } else if (order_no){
      that.setData({
        order_no: order_no,
      })
      that.reloadData()
    }else{
      wx.navigateBack()
    }
  
    
   
  },
  onShow: function () {
    //this.reloadData();
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },

  reloadData: function () {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var status = that.data.status
    var shop_type = that.data.shop_type
    var order_no = that.data.order_no;
    //从服务器获取订单列表
    console.log('orderdetail reloadData() 从服务器获取订单 order_no: ', order_no)
    if (order_no){
      wx.request({
        url: weburl + '/api/client/query_order',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          status: status,
          shop_type: shop_type,
          order_no: order_no,
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
              orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
              for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image'];
                if (orderObjects[i]['order_sku'][j]['sku_value']) {
                  for (var k = 0; k < orderObjects[i]['order_sku'][j]['sku_value'].length; k++) {
                    orderObjects[i]['order_sku'][j]['sku_value'][k]['value'] = weburl + orderObjects[i]['order_sku'][j]['sku_value'][k]['value']
                  }
                }
              }
            }
            console.log(orderObjects);
            that.setData({
              orders: orderObjects,
              buy_num: orderObjects[0]['buy_num'],
              order_status: orderObjects[0]['status'],
              all_rows: all_rows ? all_rows:0
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '订单不存在',
        icon: 'loading',
        duration: 1500
      });
      setTimeout(function () {
        wx.navigateBack();
      }, 1500);
    }
  },
  pay: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('order_no');
    console.log(objectId);
    wx.navigateTo({
      url: '../payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee
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
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
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