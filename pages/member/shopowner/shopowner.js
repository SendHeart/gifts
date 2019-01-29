var app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var navList_order = [
  { id: "order_manager", title: "订单管理" },
  { id: "goods_manager", title: "商品管理" },
];
var now = new Date().getTime()
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]

Page({
  data: {
    title_name: '店铺管理',
    title_logo: '/images/history_s.png',
    orders: [],
    goods: [],
    shop_type:shop_type,
    page: 1,
    pagesize: 10,
    status: 0,
    navList_order: navList_order,
    tab2: 'order_manager',
    activeIndex2: 0,
    all_rows: 0,
    giftflag: 0,
    gift_send:0,
    gift_rcv:0,
    page_num: 0, 
    hiddenmodalput: true,
    currenttime:now?parseInt(now/1000):0,
    navList2: navList2,
    buyin_rate:90,  //礼物折现率
  },
  
  goBack: function () {
    wx.switchTab({
      url: '/pages/hall/hall'
    })
  },
 
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var giftflag = that.data.giftflag;
    if (tab == 'order_manager') {
      giftflag = 0;
    } else {
      giftflag = 1; //goods manager
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      giftflag: giftflag,
      all_rows:0,
      page:1,
      page_num:1
    });
    console.log('tab:' + tab, ' giftflag:', giftflag)
    that.reloadData()
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      })
    }
  },

  //回到顶部
  goTop: function (e) {  // 一键回到顶部
    var that = this
    that.setData({
      scrollTop: 0
    })
  },
  getMoreOrdersTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
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
    var username = wx.getStorageSync('username')
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.navigateTo({
       url: '../list/list?username=' + username + '&token=' + token
    })
  },
  send: function (e) {
    var that = this
    var order_no = e.currentTarget.dataset.objectId
    var index = e.currentTarget.dataset.index
    var orders = []
    orders[0] = that.data.orders[index]
    console.log('送出:', order_no, ' order info:', orders, 'index:', index)
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
      url: '/pages/order/orderdetail/orderdetail?order_id=' + order_id + '&order_object=' + JSON.stringify(order_object) + '&giftflag=' + that.data.giftflag + '&send_rcv=' + tab2
    });
  },

  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    console.log('index get_project_gift_para navList2:', navList_new)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定 1首页单图片 2首页轮播  
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return
          }else{
            wx.setStorageSync('navList2', navList_new)
            that.setData({
              navList2: navList_new,
              buyin_rate: navList_new[7]['value'] ? navList_new[7]['value'] : buyin_rate,
            })
          }
        }
      })
    }else{
      that.setData({
        navList2: navList_new,
        buyin_rate: navList_new ? navList_new[7]['value'] : buyin_rate,
      })
    }
   
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
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
    that.get_project_gift_para()
    // 存为全局变量，控制支付按钮是否显示
    if (status) {
      that.setData({
        status: status,
      })
    }
    that.setData({
      username: username,
    })
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
    that.reloadData()
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
    var status = that.data.status
    var shop_type = that.data.shop_type
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    console.log('reloadData shop_type:' + shop_type + ' order_type:' + order_type)
    if (order_type=='order_manager'){
      //从服务器获取订单列表
      wx.request({
        url: weburl + '/api/client/query_order_list',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          status: status,
          shop_type: shop_type,
          openid: openid,
          order_type: order_type,
          page: page,
          pagesize: pagesize
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res.data);
          var orderObjects = res.data.result;
          var all_rows = res.data.all_rows;
          if (!res.data.result && page == 1) {
            wx.showToast({
              title: "空空如也",
              icon: 'none',
              duration: 1500
            });
            setTimeout(function () {
              wx.navigateBack();
            }, 500)

            that.setData({
              orders: [],
              all_rows: 0
            })

          } else {
            // 存储地址字段
            if (orderObjects) {
              for (var i = 0; i < orderObjects.length; i++) {
                orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
                for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                  orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
                  orderObjects[i]['order_sku_num'] = orderObjects[i]['order_sku'] ? orderObjects[i]['order_sku'].length : 1
                }
              }
              if (page > 1 && orderObjects) {
                //向后合拼
                orderObjects = that.data.orders.concat(orderObjects);
              }
              var gift_send = that.data.gift_send
              var gift_rcv = that.data.gift_rcv
              var page_num = that.data.page_num
              page_num = (all_rows / pagesize + 0.5)
              if (order_type == 'send') {
                gift_send = all_rows
              } else {
                gift_rcv = all_rows
              }
              that.setData({
                orders: orderObjects,
                all_rows: all_rows,
                gift_send: gift_send,
                gift_rcv: gift_rcv,
                page_num: page_num.toFixed(0),
              });
              console.log('gift_send:' + gift_send + ' gift_rcv:' + gift_rcv);
            }
          }
        }
      })
    }else{
      //从服务器获取商品列表
      var goods_type = that.data.goods_type;
      var goods_type_value = that.data.goods_type_value;
      var goods_sales = that.data.tab2;
      var updown = that.data.updown;
      var search_goodsname = that.data.search_goodsname;
      var keyword = that.data.keyword;
      var shop_type = that.data.shop_type
      var shape = 1
      wx.request({
        url: weburl + '/api/client/get_goods_list',
        method: 'POST',
        data: {
          goods_type: goods_type,
          goods_type_value: goods_type_value,
          username: username,
          access_token: token,
          page: page,
          pagesize: pagesize,
          search_goodsname: search_goodsname,
          goods_sales: goods_sales,
          updown: updown,
          keyword: keyword,
          shop_type: shop_type,
          shape: shape
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'

        },
        success: function (res) {
          console.log('get_goods_list:', res.data.result)
          var venuesItems = res.data.result;
          var page = that.data.page;
          var all_rows = res.data.all_rows;
          if (!venuesItems) {
            wx.showToast({
              title: '没有搜到记录',
              icon: 'loading',
              duration: 1000
            });
            that.setData({
              venuesItems: [],
              all_rows: 0,
              keyword: ''
            })
            return;
          }
          for (var i = 0; i < venuesItems.length; i++) {
            venuesItems[i]['short_name'] = venuesItems[i]['name'].substring(0, 10) + '...'
            if (!venuesItems[i]['act_info']) {
              venuesItems[i]['act_info'] = ''
            } else {
              //venuesItems[i]['act_info'] = venuesItems[i]['act_info'].substring(0, 10) + '...'
            }
            if (!venuesItems[i]['goods_tag']) {
              venuesItems[i]['goods_tag'] = ''
            } else {
              venuesItems[i]['goods_tag'] = venuesItems[i]['goods_tag'].substring(0, 10)
            }
          }
          if (page > 1 && venuesItems) {
            //向后合拼
            venuesItems = that.data.venuesItems.concat(venuesItems);
          }
          that.setData({
            venuesItems: venuesItems,
            all_rows: all_rows,
            keyword: ''
          })
          setTimeout(function () {
            that.setData({
              loadingHidden: true,
            })
          }, 1500)
        }
      })
    }
    

  },
  buyin: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = that.data.goods_id //e.currentTarget.dataset.goodsId
    var goods_skuid = that.data.goods_skuid //e.currentTarget.dataset.goodsSkuid
    var order_skuid = that.data.order_skuid //e.currentTarget.dataset.skuId
    var shop_type = that.data.shop_type
    var order_index = that.data.order_index
    var sku_index = that.data.sku_index
    console.log('礼物回收 goods_id:', goods_id, 'goods skuid:', goods_skuid, 'order skuid:', order_skuid, ' order_index:', order_index)
    //礼物折现
    wx.request({
      url: weburl + '/api/client/buyin',
      method: 'POST',
      data: {
        username: username,
        m_id: m_id,
        access_token: token,
        order_skuid: order_skuid,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var orderObjects = res.data.result;
        if (res.data.status != 'y') {
          wx.showToast({
            title: res.data.info ? res.data.info : '回收失败',
            icon: 'loading',
            duration: 1500
          })

        } else {
          wx.showToast({
            title: '回收完成',
            icon: 'success',
            duration: 1500
          })
          var orders = that.data.orders
          orders[order_index]['order_sku'][sku_index]['status'] = 1
          that.setData({
            orders: orders,
          })
        }
      }
    })
  },
  comment: function (e) {
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_skuid = e.currentTarget.dataset.goodsSkuid;
    var order_skuid = e.currentTarget.dataset.skuId;
    console.log('礼物评价 goods_id:', goods_id, 'goods skuid:', goods_skuid, 'order skuid:', order_skuid);

    wx.navigateTo({
      url: '../goods/comment/comment?goods_id=' + goods_id + '&goods_skuid=' + goods_skuid + '&order_skuid=' + order_skuid
    });
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
  cancel_order: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_no = e.currentTarget.dataset.objectId;
    var order_index = e.currentTarget.dataset.index;
    var shop_type = that.data.shop_type
    wx.showModal({
      title: '请确认',
      content: '确认要取消吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: weburl + '/api/client/update_order_status',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              order_no: order_no,
              status_info: 'cancel',
              shop_type: shop_type,
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
                  title: '取消完成',
                  icon: 'success',
                  duration: 1000
                })
                var orders = that.data.orders
                orders[order_index]['status'] = 8  // 8 订单取消
                that.setData({
                  orders: orders,
            
                })

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
  receive: function (e) {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var shop_type = that.data.shop_type
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
              shop_type:shop_type,
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