        
var util = require('../../../utils/util.js');
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var now = new Date().getTime()
var page = 1;
var pagesize = 10;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var navList2 = [
  { id: "activity_banner", title: "感恩节活动", value: "", img: "/uploads/activity_info/activity_banner.gif" },
  { id: "activity_footer", title: "活动说明", value: "", img: "/uploads/activity_info/activity_footer.png" },
];
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
var now = new Date().getTime()
Page({
  data: {
    currenttime: now ? parseInt(now) : 0,
    new_task_image: weburl + "/uploads/gift_logo.png", //默认的新人送礼图片
    hidden: true,
    windowWidth: 0,
    windowHeight: 0,
    winHeight:300,
  
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    shop_type: shop_type,
    navList2: navList2,
   
    page: 1,
    pagesize: 10,
    status: 0,
    all_rows: 0,
    page_num: 0,
    messageHidden: true,
  },
 
  //确定按钮点击事件 
  messageConfirm: function () {
    var that = this
    var messageHidden = that.data.messageHidden
    that.setData({
      messageHidden: !messageHidden,
    })
  },
  refer_detail: function (e) {
    var that = this
    var messageHidden = that.data.messageHidden
    var refer_list = e.currentTarget.dataset.referList
    console.log('refer_detail refer list:', refer_list)
    if (refer_list){
      for (var i = 0; i < refer_list.length; i++) {
        refer_list[i]['time'] = util.getDateStr(refer_list[i]['time'] * 1000, 0)
      } 

      that.setData({
        refer_list: refer_list,
        messageHidden: !messageHidden,
      })
      console.log('refer_detail message:', that.data.refer_list)
    }
   
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.switchTab({
        url: '/pages/hall/hall'
      })

      //wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '/pages/hall/hall'
      })
    }

  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    var hall_banner = that.data.hall_banner
    var gifts_list = []
    console.log('task get_project_gift_para navList2:', navList_new)
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
            return
          } else {
            wx.setStorageSync('navList2', navList_new)
            that.setData({
              navList2: navList_new,
              hall_banner: navList_new[8] ? navList_new[8] : hall_banner, //首页banner图
              gifts_list: navList_new[9] ? that.data.gifts_list.push(navList_new[9]):'',
            })
          }
        }
      })
    } else {
      gifts_list.push(navList_new[9])
      that.setData({
        navList2: navList_new,
        hall_banner: navList_new[8] ? navList_new[8] : hall_banner, //首页banner图
        gifts_list: gifts_list,
      })
    }
    console.log('task get_project_gift_para gifts_list:', that.data.gifts_list)
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)

  },
  bannerTapTag: function (e) {
    var that = this
    var banner_link = e.currentTarget.dataset.bannerlink
    var nav_path = banner_link.split("/")
    console.log('bannerTapTag:', nav_path)
    if (nav_path[2] == 'hall' || nav_path[2] == 'wish' || nav_path[2] == 'index' || nav_path[2] == 'my') {
      var pagelist = getCurrentPages()
      var len = pagelist.length
      var init = 0
      var index = 0;
      for (var i = 0; i < len; i++) {
        if (pagelist[i].route.indexOf("hall/hall") >= 0) {//看路由里面是否有首页
          init = 1
          index = i
        }
      }
      if (init == 1) {
        wx.navigateBack({
          delta: len - i - 1
        })
      } else {
        wx.switchTab({
          url: '/pages/hall/hall'
        })

      }
    } else {
      wx.navigateTo({
        url: banner_link + '&username=' + username + '&token=' + token
      })
    }
  },

  qrcodeTapTag: function (e) {
    var that = this
    var qr_type = 'activityshare'  //
    var act_id = that.data.act_id
    var act_title = that.data.act_title ? that.data.act_title : '送心活动'
    var page_type = '4'  //
    that.setData({
      qr_type: qr_type,
    })
    wx.navigateTo({
      url: '../share/share?qr_type=' + qr_type + '&act_id=' + act_id + '&act_title=' + act_title
    })

  },

  showGoods: function (e) {
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    var goods_price = e.currentTarget.dataset.goodsPrice;
    var goods_info = e.currentTarget.dataset.goodsInfo;
    var goods_sale = e.currentTarget.dataset.sale;
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../../details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&token=' + token + '&username=' + username
    });
  },
  touchStart: function (e) {
    var startX = e.touches[0].clientX;
    this.setData({
      startX: startX,
      itemLefts: []
    });
  },
  touchMove: function (e) {
    var index = e.currentTarget.dataset.index;
    var movedX = e.touches[0].clientX;
    var distance = this.data.startX - movedX;
    var itemLefts = this.data.itemLefts;
    itemLefts[index] = -distance;
    this.setData({
      itemLefts: itemLefts
    });
  },
  touchEnd: function (e) {
    var index = e.currentTarget.dataset.index;
    var endX = e.changedTouches[0].clientX;
    var distance = this.data.startX - endX;
    // button width is 60
    var buttonWidth = 60;
    if (distance <= 0) {
      distance = 0;
    } else {
      if (distance >= buttonWidth) {
        distance = buttonWidth;
      } else if (distance >= buttonWidth / 2) {
        distance = buttonWidth;
      } else {
        distance = 0;
      }
    }
    var itemLefts = this.data.itemLefts;
    itemLefts[index] = -distance;
    this.setData({
      itemLefts: itemLefts
    });
  },

  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  //获取消息
  get_member_messages: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    wx.request({
      url: weburl + '/api/client/get_member_messages',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        message_type: 6, //任务信息
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var messages_all = res.data
        var messages = messages_all['result']
        console.log('task get_member_messages:', messages_all, 'messages:', messages)
        if (messages_all['status'] == 'y') {
          /*
          if (messages.length == 0) {//为空时虚拟一条送礼任务
            var message_info = {
              message_type: 0,
              message: '请完成一次送礼',
              image: that.data.new_task_image
            }
            var task_info = {
              step_no: 0,
              task_status: 0,
              step_info: '未开始'
            }
            var message_info2 = {
              message_type: 0,
              message: '把这个活动分享给5个好友，并且他们都点击查看了你的分享',
              image: that.data.new_task_image
            }
            var task_info2 = {
              step_no: 0,
              task_status: 0,
              step_info: '已完成(0/5)',
              refer_list:[],
            }
             
            var new_task = [
              {
                addtime: util.getDateStr(that.data.currenttime, 0),
                msg_id: 0,
                msg_status: 0,
                title: '任务一：',
                type: 6, //送礼类型
                message_info: message_info,
                task_info: task_info,
              },
              {
                addtime: util.getDateStr(that.data.currenttime, 0),
                msg_id: 0,
                msg_status: 0,
                title: '任务二：',
                type: 6, //送礼类型
                message_info: message_info2,
                task_info: task_info2,
              }
            ]
           
          }  
          */
          /*
          for (var i = 0; i < messages.length;i++){
            if(i>0){
            messages[i]['task_info']['last_status'] = messages[i-1]['task_info']['task_status'] 
            }else{
              messages[i]['task_info']['last_status'] = 9
              messages[i]['message_info']['message_type'] = messages[i]['task_info']['task_status'] != 9 ? 0 : messages[i]['message_info']['message_type']
            }
          }
         
          messages[0]['title'] = '任务一'
          messages[1]['title'] = '任务二'
          */
          that.setData({
            task_list: messages,
          })
          console.log('获取消息:',that.data.task_list)
        } else {
          wx.showToast({
            title: '暂无消息',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },

  task_action: function (e) {
    var that = this
    var msg_id = 0
    var task_status = 0
    var image = that.data.new_task_image
    if (task_status == 0 && msg_id==0) {
      wx.navigateTo({
        url: '/pages/details/details?id=7482'
      })
    }

  },
  query_pubcoupon: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var shop_type = that.data.shop_type
    var coupons_id = e.currentTarget.dataset.couponId
    var msg_id = e.currentTarget.dataset.msgId
    
    wx.request({
      url: weburl + '/api/client/query_pubcoupon',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        coupons_id: coupons_id,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var coupons_info = res.data.result
        console.log('task query_pubcoupon:', res.data)
        if (res.data.status == 'n') {
          wx.showToast({
            title: res.data.info ? res.data.info : '已过期',
            icon: 'none',
            duration: 2000
          })
        } else {
          for (var i = 0; i < coupons_info.length; i++) {
            coupons_info[i]['start_time'] = util.getDateStr(coupons_info[i]['start_time'] * 1000, 0)
            coupons_info[i]['end_time'] = util.getDateStr(coupons_info[i]['end_time'] * 1000, 0)
          }
          var goods_id = coupons_info[0]['object_goods'].split(",") //多个goods_id
          that.setData({
            coupons_info: coupons_info,
            goods_id: goods_id[0] ? goods_id[0]:'7362',
            msg_id:msg_id,
          })
          console.log('任务 查询红包信息 query_pubcoupon coupons_info:', coupons_info, 'coupons_info.length:', coupons_info.length)
          that.band_coupon()
        }
      }

    })
  },
  band_coupon: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var coupons_info = that.data.coupons_info
    var coupons_json = JSON.stringify(coupons_info)
    var msg_id = that.data.msg_id
    var goods_id = that.data.goods_id

    console.log('领取红包 band_coupon coupons_info:', coupons_info);
    wx.request({
      url: weburl + '/api/client/band_coupon',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        coupons: coupons_json,
        coupon_type: 'receive',
        msg_id: msg_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('领取红包返回:', res.data);
        var coupons_update = res.data.result;
        if (!res.data.result) {
          wx.showToast({
            title: res.data.info ? res.data.info : '已被领取',
            icon: 'none',
            duration: 1500
          })
        } else {
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 1500
          })
        }
        if (goods_id) {
          wx.navigateTo({
            url: '/pages/details/details?id=' + goods_id
          })
        }else{
          wx.switchTab({
            url: '/pages/hall/hall'
          })
        }
      
      }

    })

  },
  getMoreOrdersTapTag: function (e) {
    var that = this
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多记录了',
        icon: 'none',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    })
    that.get_member_messages()
  },
  onLoad: function (options) {
    var that = this
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var username = wx.getStorageSync('username');
    var page_type = options.page_type ? options.page_type : ''
    var order_no = options.order_no ? options.order_no : ''
    var act_id = options.act_id ? options.act_id : ''
    var coupons = options.coupons ? options.coupons : ''
    var receive = options.receive ? options.receive : ''
    var task = options.task ? options.task : 0
    var msg_id = options.msg_id ? options.msg_id : 0
    var task_image = options.image ? options.image : ''
    that.get_project_gift_para()
    that.setData({
      act_id: act_id,
      page_type: page_type,
      order_no: order_no,
      coupons: coupons,
      receive: receive,
      task:task,
      msg_id:msg_id,
      task_iimage:task_image,
    })
    //that.setNavigation()
    console.log('activity page_type:', page_type, ' order_no:', order_no, ' receive:', receive, ' act_id:', act_id)
    if (!username) {
      /*
      wx.switchTab({
        url: '/pages/my/index'
      })
      */
      wx.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      if (page_type == 2) { //收到礼物
        if (receive == 1) {
          wx.navigateTo({
            url: '../order/receive/receive?order_no=' + order_no + '&receive=1'
          })
        }
      }
      that.get_member_messages()
      app.getUserInfo(function (userInfo) {
        //更新数据
        that.setData({
          userInfo: userInfo
        })
      })
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          console.log('getSystemInfo:', winHeight);
          that.setData({
            dkheight: winHeight,
          })
        }
      })

      this.setData({
        username: username
      })
      //this.reloadData(username, token);
    }
    
  },
  //事件处理函数

  //页面滑动到底部
  bindDownLoad: function () {
    var that = this;
    that.setData({
      page: page++
    });
    // this.loadgoods(reid,this.data.navLeftItems[this.data.curIndex]['id']);
    console.log("lower");
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
  onShow: function () {
    var that = this;
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var username = wx.getStorageSync('username');
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }

    
  },
  onShareAppMessage: function (options) {
    var that = this
    var res
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var nickname = that.data.nickname
    var task = 1
    var msg_id = that.data.msg_id
    var currenttime = that.data.currenttime
    var desc = '新手任务免费得大礼'
    var imageUrl = that.data.task_image ? that.data.task_image : that.data.navList2[9]['img']
    var title = '好友' + nickname + '邀请你一起参与送心礼物任务~'

    console.log('开始分享送礼任务', options,' task:',task)
    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: desc,
      path: '/pages/hall/hall?task=' + task + '&msg_id=' + msg_id + '&refername=' + username + '&sharetime=' + currenttime,   // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        console.log(res)
        if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
          that.setData({
            send_status: 1,
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
      complete: function () { // 转发结束之后的回调（转发成不成功都会执行）
      },
    }
    if (options.from === 'button') {
      console.log('任务分享', shareObj)
    }
    // 返回shareObj
    return shareObj;

  },
})
