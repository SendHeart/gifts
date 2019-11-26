var md5 = require('../../../utils/md5.js')
var app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var md5_key = app.globalData.md5_key
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
    modalHidden: true,
  },
  update_goods: function (e) {
    var that = this
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_sku_id = e.currentTarget.dataset.skuId
    var goods_name = e.currentTarget.dataset.goodsName
    var sell_price = e.currentTarget.dataset.goodsPrice
    var store_nums = e.currentTarget.dataset.goodsStore
    var goods_status = e.currentTarget.dataset.goodsStatus
    var goods_sku_key = e.currentTarget.dataset.goodsSkukey
    that.setData({
      modalHidden: !that.data.modalHidden,
      goods_sku_id: goods_sku_id,
      goods_id: goods_id,
      goods_name:goods_name,
      sell_price: sell_price,
      store_nums: store_nums,
      goods_status: goods_status,
      goods_sku_key: goods_sku_key,
    })
    //console.log('formSubmit() formID：', formId, ' form name:', form_name)
  },
  goodsStatusInput: function (e) {
    var that = this;
    var goods_status = e.detail.value
    console.log("选中商品状态：" + goods_status);
   
    that.setData({
      goods_status: goods_status
    })
  },
  storeNumsInput: function (e) {
    var that = this;
    var store_nums = e.detail.value
    console.log("商品库存：" + store_nums);

    that.setData({
      store_nums: store_nums
    })
  },
  sellPriceInput: function (e) {
    var that = this;
    var sell_price = e.detail.value
    console.log("商品价格：" + sell_price);
    that.setData({
      sell_price: sell_price
    })
  },

  modalBindaconfirm: function () {
    var that = this
    that.setData({
      modalHidden: !that.data.modalHidden,
    })
    that.update_goods_info()
  },
  //取消按钮点击事件  
  modalBindcancel: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    })
  }, 
  update_goods_info: function () {
    var that = this
    var shop_type = that.data.shop_type
    var goods_id = that.data.goods_id
    var goods_sku_id = that.data.goods_sku_id
    var sell_price = that.data.sell_price
    var goods_store_nums = that.data.store_nums
    var goods_status = that.data.goods_status
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var tokenmd5 = md5.md5(username,md5_key) 

    //提交商品信息更新
    wx.request({
      url: weburl + '/api/client/update_manager_goods_info',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        access_tokenmd5: tokenmd5,
        goods_id: goods_id,
        goods_sku_id: goods_sku_id,
        sell_price: sell_price,
        goods_store_nums: goods_store_nums,
        goods_status: goods_status,
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
            title: res.data.info ? res.data.info : '商品更新失败',
            icon: 'loading',
            duration: 1500
          })
        } else {
          wx.showToast({
            title: '商品更新完成',
            icon: 'success',
            duration: 1000
          })
          that.setData({
            goods: [],
            page:1,
          },function(){
            that.reloadData()
          })
        }
      }
    })

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
      orders: giftflag==0?that.data.orders:[],
      goods: giftflag == 1 ? that.data.goods : [],
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
      /*
      wx.navigateTo({
        url: '../login/login'
      })
      */
      wx.switchTab({
        url: '../my/index'
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

  search_goodsnameTapTag: function (e) {
    var that = this
    var keyword = e.detail.value
    that.setData({
      keyword: keyword
    })
  },
  orderSearch: function () {
    var that = this
    //console.log('orderSearch keyword:', that.data.keyword)
    that.setData({
      page: 1,
    })
    that.reloadData()
  },
  reloadData: function () {
    var that = this;
    var order_type = that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var status = that.data.status
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    var keyword = that.data.keyword ? that.data.keyword:''
    console.log('reloadData shop_type:' + shop_type + ' order_type:' + order_type)
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1500
    })
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
          keyword: keyword,
          page: page,
          pagesize: pagesize
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
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
                if (orderObjects[i]['logo'].indexOf("http") < 0) {
                  orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo']
                }
               
                for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                  if (orderObjects[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                    orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
                  }
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
              console.log('gift_send:' + gift_send + ' gift_rcv:' + gift_rcv, ' orders:', that.data.orders);
            }
          }
        }
      })
    }else{
      //从服务器获取商品列表
      var shop_type = that.data.shop_type
      var shape = 1
      wx.request({
        url: weburl + '/api/client/get_manager_goods_list',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          page: page,
          pagesize: pagesize,
          shop_type: shop_type,
          shape: shape,
          keyword: keyword,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'

        },
        success: function (res) {
          var goods = res.data.result;
          var page = that.data.page;
          var all_rows = res.data.all_rows;
          if (!goods) {
            wx.showToast({
              title: '没有搜到记录',
              icon: 'loading',
              duration: 1000
            });
            that.setData({
              goods: [],
              all_rows: 0,
              keyword: ''
            })
            return;
          }
          for (var i = 0; i < goods.length; i++) {
            goods[i]['short_name'] = goods[i]['name'].substring(0, 10) + '...'
            if (!goods[i]['act_info']) {
              goods[i]['act_info'] = ''
            }
            if (!goods[i]['goods_tag']) {
              goods[i]['goods_tag'] = ''
            } else {
              goods[i]['goods_tag'] = goods[i]['goods_tag'].substring(0, 10)
            }
          }
          if (page > 1 && goods) {
            //向后合拼
            goods = that.data.goods.concat(goods);
          }
          var page_num = that.data.page_num
          page_num = (all_rows / pagesize + 0.5)
          that.setData({
            goods: goods,
            all_rows: all_rows,
            page_num: page_num,
          })
          console.log('get_manager_goods_list:', that.data.goods, ' all_rows:', all_rows)
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