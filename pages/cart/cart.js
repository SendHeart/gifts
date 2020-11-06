//import util from '../../utils/util.js';
//获取应用实例
var app = getApp();
var shop_type = app.globalData.shop_type;
var weburl = app.globalData.weburl;
var page = 1;
var pagesize = 20;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var current_shop_info = wx.getStorageSync('current_shop_info') ? wx.getStorageSync('current_shop_info') : ''
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo3.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_gb", title: "背景", value: "", img: "/uploads/wechat_share.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []

Page({
  data: {
    navList2: navList2,
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    main_title_Bg: weburl + "/uploads/xianshe_hall_banner.png",
    gifts_rcv: 0,
    gifts_snd: 0,
    note: '',
    username: null,
    token: null,
    carts: [],
    recommentList: [],
    minusStatuses: [],
    selectedAllStatus: false,
    total: '',
    startX: 0,
    itemLefts: [],
    showmorehidden: true,
    rshowmorehidden: true,
    page:page,
    pagesize:pagesize,
    all_rows: 0,
    rall_rows: 0,
    rpage_num: 0,
    windowWidth: 0,
    windowHeight: 0,
    carts: [],
    cartIds: null,
    amount: 0,
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    shop_type: shop_type,
    machine_uuid: current_shop_info['machine_uuid'], //售货机 uuid
    is_machine: current_shop_info['type'] == 2 ? 1 : 0, //是否售货机
    machine_shop_id: current_shop_info['shop_id'], //售货机 所属 shop_id
    machine_location_id: current_shop_info['id'], //售货机 所属 shop_id
    is_buymyself:1,
    goodsshape:1,
  },
  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      note: e.detail.value
    })

  },
  bindMinus: function (e) {
    // loading提示
    /*
    wx.showLoading({
      title: '操作中',
      mask: true
    });
    */
    var that = this
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index]['num'];
    var num_cur = num
    //  
    if (num_cur > 1) {
      num--
    } else {
      num_cur = 0  //减到0视同删除
    }

    //var minusStatus = num <= 1 ? 'disabled' : 'normal';
    var minusStatus = num <= 1 ? 'normal' : 'normal';  //减到0视同删除
    // 购物车数据
    var carts = that.data.carts;
    carts[index]['num'] = num;
    // 按钮可用状态
    var minusStatuses = that.data.minusStatuses;
    minusStatuses[index] = minusStatus;
    // 将数值与状态写回
    that.setData({
      carts: carts,
      minusStatuses: minusStatuses
    })

    // update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id'];
    that.updateCart(username, sku_id, num, token)
    wx.hideLoading()
    this.sum()
    if (num_cur == 0) {
      that.setData({
        deleteindex: index,
      })
      that.delete()
    }
  },
  bindPlus: function (e) {
    wx.showLoading({
      title: '操作中',
      mask: true
    });
    var index = parseInt(e.currentTarget.dataset.index);
    var num = this.data.carts[index]['num'];
    // 自增
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 购物车数据
    var carts = this.data.carts;
    carts[index]['num'] = num;
    // 按钮可用状态
    var minusStatuses = this.data.minusStatuses;
    minusStatuses[index] = minusStatus;
    // 将数值与状态写回
    this.setData({
      carts: carts,
      minusStatuses: minusStatuses
    });
    // update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id']
    this.updateCart(username, sku_id, num, token);
    wx.hideLoading();
    this.sum();
  },
  bindManual: function (e) {
    wx.showLoading({
      title: '',
      mask: true
    });
    var index = parseInt(e.currentTarget.dataset.index);
    var carts = this.data.carts;
    var num = parseInt(e.detail.value);
    carts[index]['num'] = num;
    // 将数值与状态写回
    this.setData({
      carts: carts
    });
    wx.hideLoading();
    this.sum();
  },
  bindManualTapped: function () {
    // 什么都不做，只为打断跳转
  },
  bindCheckbox: function (e) {
    wx.showLoading({
      title: '操作中',
      mask: true
    });
    var that = this;
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = that.data.carts[index]['selected'];
    var carts = that.data.carts;
    // 对勾选状态取反
    carts[index]['selected'] = !selected;
    // 写回经点击修改后的数组
    that.setData({
      carts: carts,
    });
    // update database
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var sku_id = carts[index]['id'];
    var buy_num = carts[index]['num'];
    that.updateCart(username, sku_id, buy_num, token);
    wx.hideLoading();
    that.sum();
  },
  bindSelectAll: function () {
    wx.showLoading({
      title: '操作中',
      mask: true
    });
    // 环境中目前已选状态
    var selectedAllStatus = this.data.selectedAllStatus;
    // 取反操作
    selectedAllStatus = !selectedAllStatus;
    // 购物车数据，关键是处理selected值
    var carts = this.data.carts;
    // 遍历
    for (var i = 0; i < carts.length; i++) {
      carts[i]['selected'] = selectedAllStatus;
      // update selected status to db
    }

    this.setData({
      selectedAllStatus: selectedAllStatus,
      carts: carts,
    });
    wx.hideLoading();
    this.sum();

  },
  bindPickGoods: function () {
    wx.navigateTo({
      url: '../classify/classify?username=' + username + '&token=' + token
    });
  },
  bindShowMore: function () {
    var that = this;
    var carts = that.data.carts
    // 遍历 设置 hidden
    for (var i = 0; i < carts.length; i++) {
      carts[i]['hidden'] = 0;
    }

    that.setData({
      carts: carts,
      showmorehidden: true

    });
  },
  bindShowLess: function () {
    var that = this;
    var carts = that.data.carts
    // 遍历 设置 hidden
    for (var i = 0; i < carts.length; i++) {
      if (i > 1) carts[i]['hidden'] = 1;
    }

    that.setData({
      carts: carts,
      showmorehidden: false

    });
  },
  bindShowMoreR: function () {
    var that = this;
    var recommentList = that.data.recommentList
    // 遍历 设置 hidden
    for (var i = 0; i < recommentList.length; i++) {
      recommentList[i]['hidden'] = 0;
    }

    that.setData({
      recommentList: recommentList,
      rshowmorehidden: true
    });
  },
  bindShowLessR: function () {
    var that = this;
    var recommentList = that.data.recommentList
    // 遍历 设置 hidden
    for (var i = 0; i < recommentList.length; i++) {
      if (i > 1) recommentList[i]['hidden'] = 1;
    }

    that.setData({
      recommentList: recommentList,
      rshowmorehidden: false

    });
  },

  bindCheckout: function () {
    var that = this;
    var order_type = 'gift'
    var order_note = that.data.note
    var amount = that.data.total;
    var cartIds = that.calcIds();
    cartIds = cartIds.join(',');
    var is_buymyself = that.data.is_buymyself
    var goodsshape = that.data.goodsshape
    var share_goods_image = ''
    var liveid = 0
    var carts = that.data.carts;
    var cartselected = [];
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    // 遍历selected 
    var index = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['selected']) {
        cartselected[index++] = carts[i];
      }
    }
    if (cartselected.length == 0) {
      wx.showToast({
        title: '请选商品',
        icon: 'success',
        duration: 1000
      })
      return
    }

    that.setData({
      amount: amount,
      carts: carts,
      cartIds: cartIds,
      username: username,
      token: token,

    });
    //that.confirmOrder()

    /*
    wx.navigateTo({
      url: '../order/checkout/checkout?cartIds=' + cartIds + '&amount=' + that.data.total + '&carts=' + JSON.stringify(cartselected) + '&username=' + username + '&token=' + token
    });
    */
    wx.navigateTo({
      url: '/pages/order/checkout/checkout?cartIds=' + cartIds + '&amount=' + amount + '&carts=' + JSON.stringify(cartselected) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + goodsshape + '&order_image=' + share_goods_image + '&liveid=' + liveid + '&username=' + username + '&token=' + token
    })
    /*
    wx.navigateTo({
      url: '../order/checkout/checkout?cartIds=' + cartIds + '&amount=' + amount + '&carts=' + JSON.stringify(cartselected) + '&order_type=' + order_type + '&order_note=' + order_note + '&username=' + username + '&token=' + token
    });
    */
  },

  confirmOrder: function () {
    // submit order
    var that = this;
    var carts = that.data.carts;
    var cartIds = that.data.cartIds
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var status = 0;
    var amount = that.data.amount;
    var order_type = 'gift';
    var order_note = that.data.note;
    if (!order_note) order_note = '送你一份心意，愿美好长存!'; //默认祝福
    console.log('附言:' + order_note)


    wx.request({
      url: weburl + '/api/client/add_order',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        sku_id: cartIds,
        buy_type: 'cart',
        order_type: order_type,
        note: order_note,

      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
        var order_data = res.data.result;

        if (!res.data.info) {
          wx.showToast({
            title: '订单提交完成',
            icon: 'success',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: res.data.info,
            icon: 'loading',
            duration: 1500
          });
        }
        wx.navigateTo({
          url: '../order/payment/payment?orderNo=' + order_data['order_no'] + '&totalFee=' + order_data['order_pay']
        });
      }
    })

  },

  delete: function (e) {
    var that = this
    var shop_type = that.data.shop_type
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var index = 0
    var objectId = 0
    if (e) {
      index = e.currentTarget.dataset.index ? e.currentTarget.dataset.index : 0
      objectId = e.currentTarget.dataset.objectId;
    } else {
      index = that.data.deleteindex
    }

    index = parseInt(index)
    var carts = this.data.carts;
    var sku_id = this.data.carts[index]['id'];

    // 购物车单个删除
    console.log(objectId);
    wx.showModal({
      title: '',
      content: '确认移除该商品？', /*文案修改*/
      success: function (res) {
        if (res.confirm) {
          // 从网络上将它删除
          // 购物车单个删除
          wx.request({
            url: weburl + '/api/client/delete_cart',
            method: 'POST',
            data: { 
              username: username, 
              access_token: token, 
              sku_id: sku_id,
              shop_type:shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              console.log('删除购物车单个商品:',res.data.result)
              var new_carts = []
              var j = 0;
              for (var i = 0; i < carts.length; i++) {
                if (i != index) {
                  //剔除删除产品
                  new_carts[j++] = carts[i];
                }
              }
              if (new_carts.length == 0) {
                var all_rows = 0;
                var showmorehidden = true;
              } else {
                var all_rows = new_carts.length;
                var showmorehidden = true; // false
              }
              that.setData({
                carts: new_carts,
                all_rows: all_rows,
                showmorehidden: showmorehidden
              })
              that.sum()
            }
          })

        }else if(res.cancel){

        }
      }
    })
  },
  calcIds: function () {
    // 遍历取出已勾选的cid
    // var buys = [];
    var cartIds = [];
    for (var i = 0; i < this.data.carts.length; i++) {
      if (this.data.carts[i]['selected']) {
        // 移动到Buy对象里去
        // cartIds += ',';
        cartIds.push(this.data.carts[i]['objectId']);
      }
    }

    return cartIds;
  },
  sum: function () {
    var carts = this.data.carts;
    // 计算总金额
    var total = 0;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i]['selected']) {
        total += carts[i]['num'] * carts[i]['sell_price'];
      }
    }
    total = total.toFixed(2);
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,
      total: total
    });
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
    var goods_sale = e.currentTarget.dataset.sale
    var goods_shape = e.currentTarget.dataset.goodsShape
    //var carts = this.data.carts;
    var sku_id = objectId;
    wx.navigateTo({
      url: '../details/details?sku_id=' + objectId + '&id=' + goods_id + '&name=' + goods_name + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&goods_shape=' + goods_shape +'&sale=' + goods_sale + '&token=' + token + '&username=' + username
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
  updateCart: function (username, sku_id, buy_num, token) {
    var that = this
    var shop_type = that.data.shop_type
    var token = that.data.token;

    // 加入购物车
    wx.request({
      url: weburl + '/api/client/update_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token, 
        sku_id: sku_id, 
        buy_num: buy_num,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result);
      /*
        wx.showToast({
          title: '已更新',
          icon: 'success',
          duration: 1000
        })
        */
      }
    })
  },
  reloadData: function (username, token) {
    // auto login
    var that = this;
    var minusStatuses = []
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    // cart info
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: { 
        username: username, 
        access_token: token,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data);
        var carts = [];

        var cartlist = res.data.result.list;
        var showmorehidden;

        var index = 0;
        for (var key in cartlist) {
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
              cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
            }
            
            if (cartlist[key]['sku_list'][i]['sku_note']) {
              cartlist[key]['sku_list'][i]['sku_note'] = cartlist[key]['sku_list'][i]['sku_note'].substr(0, 13) + '...';
            }

            cartlist[key]['sku_list'][i]['selected'] = '';
            cartlist[key]['sku_list'][i]['shop_id'] = key;
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
            /*
            if (index > 1) {
              cartlist[key]['sku_list'][i]['hidden'] = 1;
            }
            */
            carts[index] = cartlist[key]['sku_list'][i];
            minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'disabled' : 'normal';
            index++;
          }
        }
        if (index > 1) {
          showmorehidden = false
        } else {
          showmorehidden = true
        }
        //倒序
        /*
        var k = carts.length
        var carts_sort = []
        var minusStatuses_sort = []
        var j=0
        for (var i = k-1; i >=0 ; i--) {
          carts_sort[j] = carts[i]
          if(j>1){
            carts_sort[j]['hidden'] = 1
          } else{
            carts_sort[j]['hidden'] = 0
          }
          minusStatuses_sort[j] = minusStatuses[i]
          j++
        }
        */
        //console.log(carts);
        that.setData({
          carts: carts,
          minusStatuses: minusStatuses,
          showmorehidden: showmorehidden,
          all_rows: carts.length
        });
      }
    })

    // recommend goods info
    wx.request({
      url: weburl + '/api/client/query_member_goods_prom',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type:shop_type,
        page: page,
        pagesize: pagesize,
        query_type:'cart', //购物车推荐商品
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('会员推荐商品列表获取:', res.data);
  
        var recommentslist = res.data.result;
        var rshowmorehidden;
        if (recommentslist) {
          for (var i = 0; i < recommentslist.length; i++) {
            if (recommentslist[i]['image'].indexOf("http") < 0) {
              recommentslist[i]['image'] = weburl + '/' + recommentslist[i]['image'];
            }
           
           /*
            recommentslist[i]['name'] = recommentslist[i]['name'].substr(0, 13) + '...';
            if (i > 1) {
             recommentslist[i]['hidden'] = 1;
            }
            */
          }
          if (recommentslist.length > 0) {
            rshowmorehidden = false
          } else {
            rshowmorehidden = true
          }
          var rpage_num = that.data.rpage_num
          rpage_num = (recommentslist.length / pagesize + 0.5)
          that.setData({
            recommentList: recommentslist,
            rshowmorehidden: rshowmorehidden,
            rall_rows: recommentslist.length,
            rpage_num: rpage_num.toFixed(0),
          })
        }
      }
    })

   

  },
  showCart: function () {
    wx.switchTab({
      url: '../../cart/cart'
    });
  },

  showCartToast: function (message) {

    wx.showToast({
      title: message ? message : '已完成',
      icon: 'success',
      duration: 1000
    });
  },

  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  get_project_gift_para: function () {
    var that = this
    var navList_new = that.data.navList2
    var shop_type = that.data.shop_type
    var hall_banner = that.data.hall_banner
    var gift_para_interval = that.data.gift_para_interval
    console.log('hall get_project_gift_para navList2:', navList_new, ' is_video_play', that.data.is_video_play)
    if (navList_new.length == 0 || gift_para_interval>0){
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
          //console.log('get_project_gift_para:', res.data)
          navList_new = res.data.result;
          console.log('get_project_gift_para:', navList_new)
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
            that.setData({
              gift_para_interval: 0,
              navList2: navList_new,
              hall_banner: navList_new[3] ? navList_new[3]:hall_banner, //首页banner图
              middle1_img: navList_new[11] ? navList_new[11]['img'] : '',
              middle2_img: navList_new[12] ? navList_new[12]['img'] : '',
              middle3_img: navList_new[13] ? navList_new[13]['img'] : '',
              middle4_img: navList_new[14] ? navList_new[14]['img'] : '',
              middle5_img: navList_new[15] ? navList_new[15]['img'] : '',
              middle6_img: navList_new[16] ? navList_new[16]['img'] : '',
              middle7_img: navList_new[17] ? navList_new[17]['img'] : '',
              middle8_img: navList_new[18] ? navList_new[18]['img'] : '',

              middle1_title: navList_new[11] ? navList_new[11]['title'] : '',
              middle2_title: navList_new[12] ? navList_new[12]['title'] : '',
              middle3_title: navList_new[13] ? navList_new[13]['title'] : '',
              middle4_title: navList_new[14] ? navList_new[14]['title'] : '',
              middle5_title: navList_new[15] ? navList_new[15]['title'] : '',
              middle6_title: navList_new[16] ? navList_new[16]['title'] : '',
              middle7_title: navList_new[17] ? navList_new[17]['title'] : '',
              middle8_title: navList_new[18] ? navList_new[18]['title'] : '',

              middle1_note: navList_new[11] ? navList_new[11]['note'] : '',
              middle2_note: navList_new[12] ? navList_new[12]['note'] : '',
              middle3_note: navList_new[13] ? navList_new[13]['note'] : '',
              middle4_note: navList_new[14] ? navList_new[14]['note'] : '',
              middle5_note: navList_new[15] ? navList_new[15]['note'] : '',
              middle6_note: navList_new[16] ? navList_new[16]['note'] : '',
              middle7_note: navList_new[17] ? navList_new[17]['note'] : '',
              middle8_note: navList_new[18] ? navList_new[18]['note'] : '',

              is_video_play: navList_new[19] ? navList_new[19]['value'] : 0,
            })
            wx.setStorageSync('navList2', navList_new)
          }
        } 
      })
    } else{
      that.setData({
        //navList2: navList_new,
        hall_banner: navList_new[3] ? navList_new[3]:hall_banner, //首页banner图
        middle1_img: navList_new[11]?navList_new[11]['img']:'',
        middle2_img: navList_new[12]?navList_new[12]['img']:'',
        middle3_img: navList_new[13]?navList_new[13]['img']:'',
        middle4_img: navList_new[14]?navList_new[14]['img']:'',
        middle5_img: navList_new[15] ? navList_new[15]['img'] : '',
        middle6_img: navList_new[16] ? navList_new[16]['img'] : '',
        middle7_img: navList_new[17] ? navList_new[17]['img'] : '',
        middle8_img: navList_new[18] ? navList_new[18]['img'] : '',

        middle1_title: navList_new[11]?navList_new[11]['title']:'',
        middle2_title: navList_new[12]?navList_new[12]['title']:'',
        middle3_title: navList_new[13]?navList_new[13]['title']:'',
        middle4_title: navList_new[14]?navList_new[14]['title']:'',
        middle5_title: navList_new[15] ? navList_new[15]['title'] : '',
        middle6_title: navList_new[16] ? navList_new[16]['title'] : '',
        middle7_title: navList_new[17] ? navList_new[17]['title'] : '',
        middle8_title: navList_new[18] ? navList_new[18]['title'] : '',

        middle1_note: navList_new[11]?navList_new[11]['note']:'',
        middle2_note: navList_new[12]?navList_new[12]['note']:'',
        middle3_note: navList_new[13]?navList_new[13]['note']:'',
        middle4_note: navList_new[14]?navList_new[14]['note']:'',
        middle5_note: navList_new[15] ? navList_new[15]['note'] : '',
        middle6_note: navList_new[16] ? navList_new[16]['note'] : '',
        middle7_note: navList_new[17] ? navList_new[17]['note'] : '',
        middle8_note: navList_new[18] ? navList_new[18]['note'] : '',

        is_video_play: navList_new[19] ? navList_new[19]['value'] : 0,
      })
    }
    const fs = wx.getFileSystemManager()
    fs.getSavedFileList({
      success(res) {
        console.log('hall getSavedFileList 缓存文件列表', res)
        for (var i = 0; i < res.fileList.length; i++) {
          
          fs.removeSavedFile({
            filePath: res.fileList[i]['filePath'],
            success(res) {
              console.log('hall image_save 缓存清除成功', res)
            },
            fail(res) {
              console.log('hall image_save 缓存清除失败', res)
            }
          })
        }
      },
      fail(res) {
        console.log('hall getSavedFileList 缓存文件列表查询失败', res)
      }
    })
    /*
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
    */
  },

  onLoad: function () {
    var that = this
    that.get_project_gift_para()

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

    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?wechat=1'
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight - 60,
          scrollTop: that.data.scrollTop + 10
        })
      }
    })

    that.setData({
      username: username
    })
    that.reloadData(username, token);
    // sum
    that.sum();
  },
  onShareAppMessage: function () {
    return {
      title: '伴生',
      desc: '伴生',
      path: '/pages/main/main?refername=' + username
    }
  }
})
