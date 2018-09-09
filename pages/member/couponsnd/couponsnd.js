import defaultData from '../../../data'
var util = require('../../../utils/util.js')

var app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid
var secret = app.globalData.secret
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var navList2 = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },

]
Page({
  data: {
    title_name: '优惠券送出',
    title_logo: '../../../images/footer-icon-05.png',
    coupon_img: weburl + '/uploads/coupon_bg.jpg', //
    wechat_share: '', //优惠券分享背景
    shop_type:shop_type,
    weburl:weburl,
    page: 1,
    pagesize: 10,
    status: 0,
    all_rows: 0,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 2000,
    note_title:'Hi~:',
    headimg: userInfo.avatarUrl,
    nickname: userInfo.nickName,
    send_status:0,
    navList2: navList2,
    hiddenmodalput: false,
    amount:0,
    nums:0,
    start_time: util.getDateStr(new Date,0),
    end_time: util.getDateStr(new Date,3),
    name:'送心优惠券',
    hiddenqrcode:true,
    
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
  //点击按钮指定的hiddenmodalput弹出框  
  modalinput: function () {
    var that = this
    that.setData({
      hiddenmodalput: !that.data.hiddenmodalput
    })
  },
  //取消按钮  
  cancel: function () {
    var that = this
     
    setTimeout(function () {
      wx.navigateBack();
    }, 500);
  },
  //确认  
  confirm: function () {
    var that = this
    that.setData({
      hiddenmodalput: true
    })
    that.get_coupon()
  },
  bindChangeNums: function (e) {
    var that = this
    var nums = e.detail.value
    that.setData({
      nums: nums
    })
    console.log('nums:' + that.data.nums)

  },   
  bindChangeStartTime: function (e) {
    var that = this;
    var start_time = e.detail.value
    that.setData({
      start_time: start_time
    })
    console.log('start_time:' + that.data.start_time)
  },  
  bindChangeEndTime: function (e) {
    var that = this
    var end_time = e.detail.value
    that.setData({
      end_time: end_time
    })
    console.log('end_time:' + that.data.end_time)
  },  
  bindChangeName: function (e) {
    var that = this;
    var name = e.detail.value
    that.setData({
      name: name
    })
    console.log('name:' + that.data.name)
  },  
  qrcodeTapTag: function (e) {
    var that = this
    var qr_type = 'couponshare'  //
    var page_type = '3'  //
    var hiddenqrcode = that.data.hiddenqrcode
    var hiddenmodalput = that.data.hiddenmodalput
    var coupons_json = JSON.stringify(that.data.coupons)
    that.setData({
      hiddenqrcode: !hiddenqrcode,
      coupons_json: coupons_json,
      //hiddenmodalput: !hiddenmodalput,
      qr_type: qr_type,
    })
    //that.eventDraw()
    wx.navigateTo({
      url: '../share/share?coupons=' + coupons_json
    })

  },
  returnTapTag: function (e) {
    /*
    wx.navigateTo({
      url: '../../order/list/list'
    });
    */
    wx.switchTab({
      url: '../../my/index'
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
    var shop_type= that.data.shop_type
    var navList2 = that.data.navList2
    var page = that.data.page
    var pagesize = that.data.pagesize

    //项目列表
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        type: 1,  //暂定
        shop_type:shop_type
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
          navList2: navList_new,
          wechat_share: navList_new[6]['img'],
          coupon_img: navList_new[7]['img'],
        })

        setTimeout(function () {
          that.setData({
            loadingHidden: true,
          })
        }, 1500)
       // that.eventDraw()
      }
    })
  },

  get_coupon:function(){
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type =  that.data.shop_type
    var amount = that.data.amount   //优惠券面额 
    var name = that.data.name   //优惠券名 
    var nums = that.data.nums   //优惠券数量
    var start_time = that.data.start_time   //优惠券有效期
    var end_time = that.data.end_time   //优惠券有效期
    var quan_type = 1 //送心打折券
    var coupon_img = that.data.coupon_img
    //that.setNavigation()
    console.log('优惠券信息')

    //获取优惠券链接
    if(start_time > end_time){
      wx.showToast({
        title: '有效期错误!',
        icon: 'loading',
        duration: 1500
      })
      setTimeout(function () {
        wx.navigateBack();
      }, 1500);
      return
    }
    wx.request({
      url: weburl + '/api/client/get_coupon',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        name:name,
        amount: amount,
        nums: nums,
        start_time: start_time,
        end_time: end_time,
        quan_type: quan_type,
        shop_type:shop_type,
        image: coupon_img,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('生成优惠券:', res.data.result)
        var couponObjects = res.data.result
        if (!couponObjects) {
          wx.showToast({
            title: res.data.info ? res.data.info : '无法生成优惠券',
            icon: 'loading',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack()
          }, 1500);
          return
        } else {
          var coupons = couponObjects
          that.setData({
            coupons: coupons
          })
         
        }
      }
    })
  },
  onLoad: function (options) {
    // 订单状态，已下单为1，已付为2，已发货为3，已收货为4 5已经评价 6退款 7部分退款 8用户取消订单 9作废订单 10退款中
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    
    /*
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
        })
      }
    })
    */  
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
  /*
  eventDraw: function () {
    var that = this
    var wechat_share = that.data.wechat_share
    var shop_type = that.data.shop_type
    var qr_type = 'couponshare'  //
    var coupons = that.data.coupons[0]
    
    var coupons_json = JSON.stringify(coupons)
    
    wx.showLoading({
      title: '生成优惠券扫码图片',
      mask: true
    })
    //console.log('优惠券扫码图片信息:', coupons)
    that.setData({
      painting: {
        width: 375,
        height: 667,
        clear: true,
        views: [
          {
            type: 'image',
            url: wechat_share,
            top: 0,
            left: 0,
            width: 375,
            height: 667
          },
       //'&coupons_addtime=' + coupons['addtime']+'&coupons_endtime=' + coupons['end_time']+ '&coupons_starttime=' + coupons['start_time']+ '&coupons_amount=' + coupons['amount']+ '&coupons_image=' + coupons['image']+ '&coupons_status=' + coupons['status']+ '&coupons_shoptype=' + coupons['shop_type']+ '&coupons_type=' + coupons['type']+ '&coupons_name=' + coupons['name']+ '&coupons_adminid=' + coupons['admin_id'] + '&coupons_flag=' + coupons['flag']
          {
            type: 'image',
            //url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&coupons_status=' + coupons['status'] + '&coupons_flag=' + coupons['flag'] + '&coupons_name=' + coupons['name'] + '&coupons_type=' + coupons['type'] + '&coupons_name=' + coupons['name'] + '&coupons_amount=' + coupons['amount'],
            url: weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&coupons=' + coupons_json,
            top: 450,
            left: 130,
            width: 110,
            height: 125,

          },
          {
            type: 'text',
            content: '长按识别二维码，领取优惠券',
            fontSize: 18,
            color: '#dc344d',
            textAlign: 'left',
            top: 580,
            left: 70,
            lineHeight: 30,
            MaxLineNumber: 2,
            breakWord: true,
            //width: 150
          }
        ]
      }
    })
    console.log('二维码 paint:', that.data.painting)
  },
  eventSave: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImage,
      success(res) {
        wx.showToast({
          title: '保存图片成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  eventGetImage: function (event) {
    console.log('eventGetImage:',event)
    wx.hideLoading()
    const { tempFilePath, errMsg } = event.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath
      })
    }
  },
  */
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
    var coupons = that.data.coupons
    var username = that.data.username
    var token = that.data.token;
    var nickname = that.data.nickname
    var title = '收到一张'+that.data.name+'~';
    var imageUrl = that.data.navList2[6]['img']
    console.log('开始送优惠券', options)
      
    if (!coupons){
      console.log('优惠券为空')
      return
    }
    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc:"一张优惠券",
      //path: '/pages/hall/hall?page_type=3&coupons=' + JSON.stringify(coupons)  + '&receive=1' + '&random=' + Math.random().toString(36).substr(2, 15),   // 默认是当前页面，必须是以‘/’开头的完整路径
      path: '/pages/member/couponrcv/couponrcv?coupons=' + JSON.stringify(coupons) + '&receive=1',   // 默认是当前页面，必须是以‘/’开头的完整路径
        imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
        success: function (res) {　　　
          console.log(res)
          if (res.errMsg == 'shareAppMessage:ok') {  // 转发成功之后的回调
            that.setData({
              send_status: 1,
               
            });
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
       
        console.log('优惠券分享', shareObj)
        
        
        }
        // 返回shareObj
        return shareObj;
    
  } ,
   

  
});