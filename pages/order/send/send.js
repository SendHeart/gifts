var app = getApp();
var weburl = app.globalData.weburl;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var navList2 = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },

];
Page({
  data: {
    title_name: '礼物送出',
    title_logo: '../../../images/footer-icon-05.png',
    orders: [],
    orderskus:[],
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
    headimg: userInfo.avatarUrl,
    nickname: userInfo.nickName,
    send_status:0,
    navList2: navList2,
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
  returnTapTag: function (e) {
    /*
    wx.navigateTo({
      url: '../../order/list/list'
    });
    */
    wx.switchTab({
      url: '../../index/index'
    });
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

  get_project_gift_para: function () {
    var that = this
    var navList2 = that.data.navList2
    var page = that.data.page
    var pagesize = that.data.pagesize

    //项目列表
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        type: 1,  //暂定
        shop_type:2
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
        }

        that.setData({
          navList2: navList_new
        })

        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
      }
    })
  },

  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var order_no = options.order_no; 
    var receive = options.receive;
    that.setNavigation()
    console.log('礼品信息')
    console.log(order_no)
  
    if (receive == 1){
      console.log('礼品接受处理')
      console.log(options)
      return
    }
    if (!order_no) {
      console.log('礼品订单号为空 send')
      console.log(options)
      return
    }

    //再次确认订单状态
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        order_type: 'send',
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var orderObjects = res.data.result;
        if (!orderObjects) {
          wx.showToast({
            title: '没有该订单',
            icon: 'loading',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 1500);
          
          return
        } else {
          if (orderObjects[0]['gift_status']>0) {
            wx.showToast({
              title: '该订单已送出',
              icon: 'loading',
              duration: 1500
            })
            setTimeout(function () {
              wx.navigateBack();
            }, 1500)
            return

          }

        }

      }
    })

    var orders = JSON.parse(options.orders);
    var orderskus = that.data.orderskus;
    var note_title = that.data.note_title
    var headimg = that.data.headimg
    var nickname = that.data.nickname
    var note = that.data.note;
    note = orders[0]['rcv_note'];
    headimg = orders[0]['from_headimg'];
    nickname = orders[0]['from_nickname'];
    console.log(orders);
    // order_sku 合并在一个对象中
    for (var i = 0; i < orders.length; i++) {
      for (var j = 0; j < orders[i]['order_sku'].length; j++) {
        orders[i]['order_sku'][j]['goods_name'] = orders[i]['order_sku'][j]['goods_name'].substring(0,15)
        orderskus.push(orders[i]['order_sku'][j])
      }
    }
    console.log('order sku list:');
    console.log(orderskus);
    that.setData({
      order_no: order_no,
      orders: orders,
      orderskus:orderskus,
      note:note,
      note_title:note_title,
      headimg:headimg,
      nickname:nickname,
      username:username,
      token:token,
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      }
    })  
  },

  onShow: function () {
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    that.get_project_gift_para()
  },

  reloadData: function () {
    /*
    var that = this;
    var order_type = that.data.tab2;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var status = that.data.status;
    var page = that.data.page;
    var pagesize = that.data.pagesize;
    //从服务器获取订单列表
    wx.request({
      url: weburl + '/api/client/query_order_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        status: status,
        order_type: order_type,
        page: page,
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
            title: '没有该类型订单',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(function () {
            wx.navigateBack();
          }, 500);
          that.setData({
            orders: [],
            all_rows: 0
          });
        } else {
          // 存储地址字段
          for (var i = 0; i < orderObjects.length; i++) {
            orderObjects[i]['logo'] = weburl + '/' + orderObjects[i]['logo'];
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image'];
            }

          }
          if (page > 1 && orderObjects) {
            //向后合拼
            orderObjects = that.data.orders.concat(orderObjects);
          }
          that.setData({
            orders: orderObjects,
            all_rows: all_rows
          });
        }


      }
    })
*/
  },
  
  showGoods: function (e) {
    var skuId = e.currentTarget.dataset.skuId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    console.log('showGoods')
    console.log(goods_name + ' ' + goods_id);
    wx.navigateTo({
      url: '../../details/details?sku_id=' + skuId + '&goods_name=' + goods_name + '&id=' + goods_id + '&token=' + token + '&username=' + username
    });
  },

  onShareAppMessage: function (options ) {
      var that = this 
      var res
      var order_no = that.data.order_no;
      var username = that.data.username;
      var token = that.data.token;
      var title = '收到一份来自' + that.data.nickname +'的大礼,快打开看看吧~';
      var imageUrl = that.data.navList2[0]['img']
      console.log('开始送礼'); 
      console.log(options);  
      if (!order_no){
        console.log('礼品订单号为空 send')
        return
      }
      var shareObj = {
        title: title,        // 默认是小程序的名称(可以写slogan等)
        desc:"礼物代表我的心意",
        //path: '/pages/hall/hall?page_type=2&order_no=' + order_no + '&receive=1' + '&random=' + Math.random().toString(36).substr(2, 15),   // 默认是当前页面，必须是以‘/’开头的完整路径
        path: '/pages/order/receive/receive?page_type=2&order_no=' + order_no + '&receive=1' + '&random=' + Math.random().toString(36).substr(2, 15),   // 默认是当前页面，必须是以‘/’开头的完整路径
        imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      　success: function (res) {　　　
          console.log(res)
          if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
            wx.request({ //更新发送状态
              url: weburl + '/api/client/update_order_status',
              method: 'POST',
              data: {
                username: username,
                access_token: token,
                status_info: 'send',
                order_no: order_no,
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log(res.data.result);
                wx.showToast({
                  title: '礼物发送成功',
                  icon: 'success',
                  duration: 1500
                })   
                that.setData({
                  send_status: 1,
                });
                /*
                wx.navigateTo({
                  url: '../../order/list/list?username=' + username
                });
                
                wx.switchTab({
                  url: '../../index/index'
                })
                */
              }
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
          complete: function() { // 转发结束之后的回调（转发成不成功都会执行）
        　　　　　　
      　　　　
  　　    },
        }
      if (options.from === 'button') {
          // 来自页面内转发按钮
            // shareBtn
          　　　　// 此处可以修改 shareObj 中的内容
        //var orderno = order_no.split(','); //有可能一份礼物包括多个订单号 按店铺拆单的情况
        //shareObj.path = '/pages/hall/hall?page_type=2&order_no=' + order_no+'&receive=1'
        //shareObj.imageUrl = imageUrl
        console.log('礼物分享:')
        console.log(shareObj)
        
        }
        // 返回shareObj
        return shareObj;
    
  } ,
   

  
});