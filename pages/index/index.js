var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var navList_order = [
  { id: "send", title: "我送出的" },
  { id: "receive", title: "我收到的" },
];
var now = new Date().getTime();
Page({
  data: {
    orders: [],
    page: 1,
    pagesize: 10,
    status: 0,
    navList_order: navList_order,
    tab2: 'send',
    activeIndex2: 0,
    all_rows: 0,
    giftflag: 0,
    gift_send:0,
    gift_rcv:0,
    page_num:0,
    currenttime:now?parseInt(now/1000):0,
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag = that.data.giftflag;
    if (tab == 'send') {
      giftflag = 0;
    } else {
      giftflag = 1; //receive
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
    });
    console.log('tab:' + tab, ' giftflag:', giftflag)
    that.reloadData()
  },
  getMoreOrdersTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有该更多订单',
        icon: 'loading',
        duration: 1000
      });
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
      url: '../list/list'
    });
  },
  send: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.objectId
    var index = e.currentTarget.dataset.index
    var orders = []
    orders[0] = that.data.orders[index]
    console.log('送出:', order_no,' order info:',orders)
    wx.navigateTo({
      url: '../order/send/send?order_no=' + order_no+'&orders=' + JSON.stringify(orders)
    })
  },
  sendOtherTapTag: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.orderNo
    var index = e.currentTarget.dataset.index
    var orders = []
     orders[0] = that.data.orders[index]
    wx.navigateTo({
      url: '../order/transfer/transfer?receive=-1&order_no=' + order_no + '&orders=' + JSON.stringify(orders)
    })
    orders = that.data.orders
    orders[index]['duetime'] = that.data.currenttime
    that.setData({
      orders: orders,
    });
  },
  refundTapTag: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.orderNo
    var index = e.currentTarget.dataset.index
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';

    //提交退款申请
    wx.request({
      url: weburl + '/api/client/refund',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        if (res.data.status!='y') {
          wx.showToast({
            title: res.data.info ? res.data.info:'退款申请失败',
            icon: 'loading',
            duration: 1500
          })
          
        } else {
          wx.showToast({
            title: '退款申请完成',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })

  },
  detailTapTag: function (e) {
    var that = this;
    var order_object = e.currentTarget.dataset.orderObject;
    var order_id = order_object['id'];
    var tab2 = that.data.tab2
    console.log('订单ID:' + order_id)
    wx.navigateTo({
      url: '../order/orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object) + '&giftflag=' + that.data.giftflag + '&send_rcv=' + tab2
    });
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this
    var status = parseInt(options.status ? options.status:0)
    var username = wx.getStorageSync('username')
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login'
      })
    }
    // 存为全局变量，控制支付按钮是否显示
    if (status) {
      that.setData({
        status: status
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight - 200,
          scrollTop: that.data.scrollTop + 10
        })
      }
    }) 
    that.reloadData();
  },
  onShow: function () {
    //
  },

  reloadData: function () {
    var that = this;
    var order_type = that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var status = that.data.status;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    console.log('page:'+page+' pagesize:'+pagesize);
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        status: status,
        openid:openid,
        order_type: order_type,
        page: page,
        pagesize:pagesize
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        var all_rows = res.data.all_rows;
        if (!res.data.result) {
          wx.showToast({
            title: '没有该更多订单',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 500)
          /*
          that.setData({
            orders: [],
            all_rows: 0
          })
          */
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              orderObjects[i]['order_sku_num'] = orderObjects[i]['order_sku'] ? orderObjects[i]['order_sku'].length:1
            }

          }
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          var gift_send  = that.data.gift_send
          var gift_rcv = that.data.gift_rcv
          var page_num = that.data.page_num
          page_num = (all_rows/pagesize+0.5)
          if (order_type=='send'){
            gift_send = all_rows 
          }else{
            gift_rcv = all_rows 
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows,
            gift_send: gift_send,
            gift_rcv: gift_rcv,
            page_num: page_num.toFixed(0),
          });
          console.log('gift_send:'+gift_send+' gift_rcv:'+gift_rcv);
        }
      }
    })

  },
  accept: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('接受礼物order_no:');
    console.log(objectId);
    wx.navigateTo({
      url: '../order/receive/receive?order_no=' + objectId + '&receive=1'
    });
  },
  pay: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    var totalFee = e.currentTarget.dataset.totalFee;
    console.log('order_no');
    console.log(objectId);
    wx.navigateTo({
      url: '../order/payment/payment?orderNo=' + objectId + '&totalFee=' + totalFee
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
      url: '../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
  }
});