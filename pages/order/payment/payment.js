var util = require('../../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl; 
var shop_type = app.globalData.shop_type; 
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
Page({
	data: {
    title_name: '支付',
    title_logo: '../../../images/footer-icon-05.png',
    orderNo: '',
    orders: [],
    totalFee:0,
    sku_id:'',
    navList2: navList2,
    page: 1,
    pagesize: 5,
    page_num: 0,
    all_rows: 0,
    shop_type: shop_type,
    is_buymyself:0,
    order_shape:0,
    is_checkout:0,
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
  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'pay') {
      that.pay()
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
      wx.navigateBack({ changed: true })//返回上一页
    } else {
      wx.switchTab({
        url: '../../hall/hall'
      })
    }

  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    var navList2 = that.data.navList2

    console.log('payment get_project_gift_para navList2:', navList2, 'length:', navList2.length)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定
          shop_type: shop_type
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
            return;
          } else {
            that.setData({
              navList2: navList_new
            })
            console.log('payment get_project_gift_para navList_new:', navList_new)
          }
        }
      })
    }
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },
	onLoad: function (options) {
    var that = this
    var orderNo = options.orderNo;
    var totalFee = options.totalFee ? options.totalFee:0
    var is_buymyself = options.is_buymyself ? options.is_buymyself:0 //自购礼品
    var received = options.received ? options.received : 0 //未支付礼物订单支付
    var is_checkout =  options.is_checkout ? options.is_checkout : 0
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var navList2 = that.data.navList2
    //that.setNavigation()
    that.get_project_gift_para()
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: orderNo,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('payment onload:',res.data.result)
        var orderObjects = res.data.result
        var sku_id = that.data.sku_id
        if (!res.data.info) {
          var order_price =0
          for (var i = 0; i < orderObjects.length; i++) {
            if (orderObjects[i]['logo'].indexOf("http") < 0) {
              orderObjects[i]['logo'] = weburl + orderObjects[i]['logo'];
            }
            for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
              if (orderObjects[i]['order_sku'][j]['sku_image'] .indexOf("http") < 0) {
                orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
              }
              if (sku_id!=''){
                sku_id = sku_id + ','+orderObjects[i]['order_sku'][j]['sku_id']
              }else{
                sku_id = orderObjects[i]['order_sku'][j]['sku_id']
              }
            }
            order_price = order_price + orderObjects[i]['order_price']
            orderObjects[i]['order_price'] = parseFloat(orderObjects[i]['order_price']).toFixed(2)
          }
          totalFee = order_price.toFixed(2)*100
          //totalFee = totalFee.toFixed(0)
          console.log('order_price:' + order_price, 'totalFee:', totalFee)
          that.setData({
            orders: orderObjects,
            orderNo: orderNo,
            username: username,
            token: token,
            totalFee: totalFee ? totalFee:order_price,
            sku_id:sku_id,
            is_buymyself:is_buymyself,
            received:received,
            order_shape:orderObjects[0]['shape'],
            is_checkout:is_checkout,
          })
          if ((is_buymyself == 0 && received == 0) || totalFee==0 ) that.pay()
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          })
        }
      }
    })
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 120,
        })
      }
    })
    
	},
  onShow:function(){
    var that = this 
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/back.png'
      })
    }  
    //调用应用实例的方法获取全局数据
    /*
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
  },

  pay: function () {
		var that = this;
    var openId = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var totalFee = that.data.totalFee;
    var orderNo = that.data.orderNo;
    var shop_type = that.data.shop_type
    var is_buymyself = that.data.is_buymyself
    var received = that.data.received
    var order_shape = that.data.order_shape
    var is_checkout = that.data.is_checkout
    console.log('payment openId', openId, ' totalFee:', totalFee, ' is_buymyself:', is_buymyself, ' received:', received);

		//统一下单接口对接
    if (totalFee<=0){
      that.delete_cart()
      wx.navigateTo({
        url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
      })
        return
    }
    if (is_buymyself==1 || received==1){ //自购礼品 未支付礼物被接收 支付
      wx.request({
        url: weburl + '/api/WXPay',
        data: {
          openid: openId,
          body: '商城',
          tradeNo: that.data.orderNo,
          totalFee: that.data.totalFee,
          shop_type: shop_type
        },
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (response) {
          // 发起支付
          if (response.data.timeStamp) {
            wx.requestPayment({
              'timeStamp': response.data.timeStamp,
              'nonceStr': response.data.nonceStr,
              'package': response.data.package,
              'signType': 'MD5',
              'paySign': response.data.paySign,
              'success': function (res) {
                console.log('支付成功:' + res);
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 2000,
                })
                if(received==1 && order_shape!=8 && order_shape!=7){
                  wx.navigateTo({
                    url: '/pages/lottery/lottery?lotterlotteryy_type=0' + '&order_no=' + orderNo,
                  })
                } else if(order_shape==8 || order_shape ==7){
                  that.delete_cart()
                  if(is_checkout=='1'){
                    wx.navigateTo({
                      url: '/pages/order/checkout/checkout?is_checkout=1',
                    })
                  }else{
                    wx.switchTab({
                      url: '/pages/my/index'
                    })
                  }                  
                } else {
                  that.delete_cart()
                  that.returnTapTag()
                  /*
                  wx.navigateTo({
                    url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
                  })
                  */
                }
              }
            })
          } else {
            console.log('支付返回:' + res);
            wx.showToast({
              title: res.data ? res.data:'支付返回',
              icon: 'loading',
              duration: 2000,
            })
          }
        },
        fail: function (response) {
          console.log('发起支付失败', response);
          //console.log(response);
        }
      })
    }else{ //未支付 送礼
      console.log('未支付送礼', 'orderNo:', that.data.orderNo,' orders:',that.data.orders);
      that.delete_cart()
      wx.navigateTo({
        url: '../send/send?order_no=' + that.data.orderNo + '&orders=' + JSON.stringify(that.data.orders) + '&is_buymyself=' + is_buymyself
      })
    }
	},
  returnTapTag: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_flag = that.data.goods_flag
    var is_checkout = that.data.is_checkout
    var order_no = that.data.orderNo
    var is_buymyself = that.data.is_buymyself
    //再次确认订单状态
    wx.request({
      url: weburl + '/api/client/query_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        order_no: order_no,
        order_type: 'send',
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('order payment returnTapTag()再次确认订单状态:', res.data)
        var orderObjects = res.data.result;
        if (!orderObjects) {
          console.log('order payment returnTapTag() 没有该订单 orderObjects:', orderObjects)
          wx.showToast({
            title: '没有该订单',
            icon: 'none',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack()         
          }, 1500)
          return
        } else {
          if (orderObjects[0]['gift_status'] > 0) {
            console.log('order payment returnTapTag() 该订单已购出 orderObjects:', orderObjects)
            wx.showModal({
              title: '支付完成',
              content: '您的订单已确认，请等待快递配送',
              confirmColor: '#FF952D',
              showCancel: false,
              confirmText: '返回',
              success (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateBack();
                } else if (res.cancel) {
                  console.log('用户点击取消')
                  return
                }
              }
            })
            /* wx.showToast({
              title: '支付完成',
              content: '您的订单已确认，请等待快递配送',
              icon: 'success',
              duration: 2000
            }) 
            setTimeout(function () {
              wx.navigateBack();
            }, 2000)
            */
            return
          } else {
            that.setData({
              send_status: 0,
              orders: orderObjects,
              goods_flag: orderObjects[0]['order_sku'][0]['goods_flag'],
              order_price: orderObjects[0]['order_price'],
            })
            wx.request({ //更新发送状态
              url: weburl + '/api/client/update_order_status',
              method: 'POST',
              data: {
                username: username,
                shop_type, shop_type,
                access_token: token,
                status_info: 'send',
                order_no: order_no,
                goods_flag: that.data.goods_flag,
                is_buymyself: is_buymyself,
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log('order payment returnTapTag() 礼物发送状态更新完成:', res.data, ' is_buymyself:', is_buymyself)
                //自购礼品 接收处理
                console.log('order payment returnTapTag() 自购礼品 自动接收处理')
                that.receiveTapTag()
                /*
                wx.navigateTo({
                  url: '/pages/order/receive/receive?order_no=' + order_no + '&receive=1' + '&is_buymyself=' + is_buymyself
                })
                */
              }
            })
          }
        }
      }
    })
  },

  receiveTapTag: function () {
    var that = this
    var is_buymyself = that.data.is_buymyself
    var title = is_buymyself == 1 ? '收货地址' : '请确认'
    var content = is_buymyself == 1 ? '详细地址' : '确认接受吗'
    if (is_buymyself == 1) {
      //that.set_address()
      console.log('order/payment receiveTapTag() 订单完成 is_buymyself:',is_buymyself)
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
  },

  set_address: function () {
    var that = this
    var shop_type = that.data.shop_type
    var order_no = that.data.orderNo
    var order_shape = that.data.order_shape
    var goods_flag = that.data.goods_flag
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
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
    if(order_shape == 8 ) {
      wx.switchTab({
        url: '/pages/index/index',
      })
      return ; //充值订单无需设置收货地址
    }
    //通讯录权限
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              //wx.startRecord()
            }
          })
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
        console.log('收货地址选择 订单号 order receive chooseAddress:' + order_no + ' openid:' + openid)
        wx.request({ //更新收礼物状态
          url: weburl + '/api/client/update_order_status',
          method: 'POST',
          data: {
            username: that.data.username,
            shop_type: shop_type,
            openid: openid,
            nickname: that.data.nickname,
            headimg: that.data.headimg,
            order_no: order_no,
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
              if (is_buymyself == 1) { //自购礼物订单抽奖
                console.log('自购礼物订单抽奖 to lottery order_no:', order_no)
                wx.navigateTo({
                  url: '/pages/lottery/lottery?lottery_type=0' + '&order_no=' + order_no,
                })
              }
            } else {
              console.log('礼物接收失败 order_no:', order_no)
              wx.showToast({
                title: res.data.info ? res.data.info : '礼物接收失败',
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
  delete_cart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var sku_id = that.data.sku_id
    var shop_type = that.data.shop_type
    console.log('payment delete_cart sku_id:', sku_id);
    // 购物车单个删除
    wx.request({
      url: weburl + '/api/client/delete_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        sku_id: sku_id,
        shop_type:shop_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('payment delete_cart:',res.data.result);
      }
    })
  },

})