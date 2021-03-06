var util = require('../../../utils/util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var messageflag = app.globalData.messageflag;
app.globalData.messageflag = 1;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var navList_order = [
  { id: "AI", title: "智能选礼" },
  { id: "task", title: "任务" },
  { id: "message", title: "消息" },
];
var now = new Date().getTime()
Page({
  data: {
    new_task_image: weburl + "/uploads/gift_logo.png", //默认的新人送礼图片
    loading_img: weburl + "/uploads/loading.gif",
    shop_type: shop_type,
    user: null,
    userInfo: {},
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    username: null,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    page: 1,
    pagesize: 10,
    all_rows: 0,
    page_num: 0,
    userInfo: userInfo,
    hiddenmodalput: true,
    withdrawNum: null,
    withdrawWx: null,
    withdraw_selected: 1,
    message_list: [],
    task_list: [],
    messageHidden: true,
    dkheight: 300,
    message:{},
    messageflag: messageflag,
    noselected:0,
    selected_num:0,
    selected_all: false,
    selected_start: true,
    rules_length:5, //默认规则种类数 
    task_num: 0,
    message_num: 0,
    navList_order: navList_order,
    tab2: 'task',
    activeIndex2: 0,
    currenttime: now ? parseInt(now) : 0,
    message_type:0,
  },

  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'selectBtn') {
      that.selectBtnTap()
    } else if (form_name == 'addCart'){
      var goods_id = e.currentTarget.dataset.goodsId
      that.setData({
        goods_id: goods_id,
      })
      that.addCart()
    } else if (form_name =='selectBtn_next'){
      var selected_num = that.data.selected_num +1
      var rules_length = that.data.rules_length-1
      that.setData({
        selected_num: selected_num <= rules_length ? selected_num : rules_length,
        selected_all: selected_num == rules_length?true:false,
        selected_start: selected_num == 0 ? true : false
      })
    } else if (form_name =='selectBtn_last'){
      var selected_num = that.data.selected_num - 1
      var rules_length = that.data.rules_length - 1
      that.setData({
        selected_num: selected_num <= 0 ?  0: selected_num,
        selected_all: selected_num == rules_length ? true : false,
        selected_start: selected_num == 0 ? true : false
      })
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

  showGoods: function (e) {
    var that=this
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var goods_id = e.currentTarget.dataset.goodsId;
    var goods_name = e.currentTarget.dataset.goodsName;
    var goods_price = e.currentTarget.dataset.goodsPrice;
    var goods_info = e.currentTarget.dataset.goodsInfo;
    var goods_sale = e.currentTarget.dataset.sale;
    var image = e.currentTarget.dataset.image
    var rule_selected_info = that.data.rule_selected_info
    //var carts = this.data.carts;
    var sku_id = objectId;
    if (!rule_selected_info) {
      var rule_list = that.data.rule_list
      rule_selected_info = ''
      for (var i = 0; i < rule_list.length; i++) {
        var selected = rule_list[i]['selected']
        rule_selected_info = rule_selected_info + '"' + rule_list[i]['id'] + '":"' + rule_list[i]['item_name'][selected] + '"'
      }
      rule_selected_info = '{' + rule_selected_info + '}'
    }
    wx.navigateTo({
      url: '/pages/details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&name=' + goods_name + '&image=' + image + '&rule_selected_info=' + rule_selected_info+ '&token=' + token + '&username=' + username
    });
  },
  onOrderTapTag: function (e) {
    var that = this;
    var tab = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var messageflag = that.data.messageflag
    var message_type = that.data.message_type
    if (tab == 'task') { //task
      messageflag = 0;
      app.globalData.messageflag = messageflag
      message_type = 0
    } else if (tab == 'AI') {
      messageflag = 2; //message
      app.globalData.messageflag = messageflag
     
    }else{
      messageflag = 1; //message
      app.globalData.messageflag = messageflag
      message_type = 5
    }
    that.setData({
      activeIndex2: index,
      tab2: tab,
      page: 1,
      messageflag: messageflag,
      message_type: message_type,
      message_list:[],
    });
    console.log('onOrderTapTag:'+JSON.stringify(e)) ;
    console.log('tab:' + tab, ' messageflag:', messageflag,'activeIndex2:',that.data.activeIndex2)
    //that.reloadData()
    if (that.data.activeIndex2 == 0) {
      that.get_ai_rules()
    } else {
      that.get_member_messages()
    }
  },
  bindChangeNum: function (e) {
    var that = this;
    var withdrawNum = e.detail.value

    that.setData({
      withdrawNum: withdrawNum
    })
    console.log('withdrawNum:' + that.data.withdrawNum)
  },
  bindChangeWx: function (e) {
    var that = this;
    var withdrawWx = e.detail.value
    that.setData({
      withdrawWx: withdrawWx
    })
    console.log('withdrawWx:' + that.data.withdrawWx)
  },
  /** 
     * 预览图片
     */
  imgYu: function (event) {
    var that = this
    var shop_type = that.data.shop_type
    var src = event.currentTarget.dataset.src;//获取data-src
    var order_no = event.currentTarget.dataset.orderNo
    var message_type = event.currentTarget.dataset.messageType
    var imgList =[]
     imgList.push(event.currentTarget.dataset.list)//获取data-list
    if(order_no){
      wx.request({
        url: weburl + '/api/client/query_order',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          order_no: order_no,
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('message gift info:', res.data.result)
          var orderObjects = res.data.result
          var sku_id = that.data.sku_id
          if (!res.data.info) {
            var order_price = 0
            for (var i = 0; i < orderObjects.length; i++) {
              if (res.data.result[i]['logo'].indexOf("http") < 0) {
                orderObjects[i]['logo'] = weburl + orderObjects[i]['logo']
              }
              for (var j = 0; j < orderObjects[i]['order_sku'].length; j++) {
                if (res.data.result[i]['order_sku'][j]['sku_image'].indexOf("http") < 0) {
                  orderObjects[i]['order_sku'][j]['sku_image'] = weburl + orderObjects[i]['order_sku'][j]['sku_image']
                }
                
                if (sku_id != '') {
                  sku_id = sku_id + ',' + orderObjects[i]['order_sku'][j]['sku_id']
                } else {
                  sku_id = orderObjects[i]['order_sku'][j]['sku_id']
                }

              }
              //order_price = order_price + orderObjects[i]['order_price']
            }
            //totalFee = order_price.toFixed(2) * 100
            that.setData({
              orderObjects: orderObjects[0],
            })
            wx.navigateTo({
              url: '/pages/order/orderdetail/orderdetail?order_object=' + JSON.stringify(that.data.orderObjects) + '&order_id=' + orderObjects['id']
            })
          } else {
            wx.showToast({
              title: res.data.info,
              icon: 'loading',
              duration: 1500
            })
          }
        }
      })
    }else{
       //图片预览
       wx.previewImage({
         current: src, // 当前显示图片的http链接
         urls: imgList, // 需要预览的图片http链接列表
       })
     }
   
  },
  //领取 
  message_action: function (e) {
    var that = this
    var msg_id = e.currentTarget.dataset.msgId
    var msg_type = e.currentTarget.dataset.msgType
    var coupon_id = e.currentTarget.dataset.couponId
    var coupons_type = e.currentTarget.dataset.amountType
    if(msg_type==4){
      if (coupons_type == 1) {
        coupons_type = 2
      } else if (coupons_type == 2) {
        coupons_type = 3
      } else {
        coupons_type = 1
      }
      wx.navigateTo({
        url: '/pages/member/couponrcv/couponrcv?receive=1&coupons_flag=9&coupons_type=' + coupons_type + '&coupons_id=' + coupon_id + '&msg_id=' + msg_id
      })
    } else if (msg_type == 6){
      wx.switchTab({
        url: '/pages/member/task/task'
      })
    }
    
  },

  //领取 
  task_action: function (e) {
    var that = this
    var msg_id = e.currentTarget.dataset.msgId
    var task_status = e.currentTarget.dataset.taskStatus ? e.currentTarget.dataset.taskStatus : 0
    var image = e.currentTarget.dataset.image
    if (task_status < 9) {
    
    }
    wx.navigateTo({
      url: '/pages/member/task/task?task=1&image=' + image + '&msg_id=' + msg_id
    })
  },

  //选规则 
  rule_select: function (e) {
    var that = this
    var rule_list = that.data.rule_list
    var goods_item_id = e.currentTarget.dataset.goodsItemId
    var goods_item_index = e.currentTarget.dataset.goodsItemIndex
    var rule_selected_info = ''
    for (var i = 0; i < rule_list.length; i++) {
      if (rule_list[i]['id'] == goods_item_id){
        rule_list[i]['selected'] = goods_item_index
        //break
      }
      var selected = rule_list[i]['selected']
      rule_selected_info = rule_selected_info + '"' + rule_list[i]['id'] + '":"' + rule_list[i]['item_name'][selected]+'"'
    }
    rule_selected_info = '{' + rule_selected_info+'}'
    that.setData({
      rule_list:rule_list,
      rule_selected_info: rule_selected_info,
    })
    console.log('rule_selected_info:', rule_selected_info)
  },

  //确定按钮点击事件 
  messageConfirm: function () {
    var that = this
    var messageHidden = that.data.messageHidden
    that.setData({
      messageHidden: !messageHidden,
    })

  },
  message_detail: function (e) {
    var that = this
    var message_info = e.currentTarget.dataset.message
    var message_type = e.currentTarget.dataset.messageType;
    var amount = e.currentTarget.dataset.amount
    var amount_type = e.currentTarget.dataset.amountType
    var footer = e.currentTarget.dataset.footer
    var content = e.currentTarget.dataset.content
    var accept_time = e.currentTarget.dataset.acceptTime
    var start_time = e.currentTarget.dataset.startTime
    var end_time = e.currentTarget.dataset.endTime
    var image = e.currentTarget.dataset.image
    var messageHidden = that.data.messageHidden
    var message = that.data.message
    start_time = util.getDateStr(start_time * 1000, 0)
    end_time = util.getDateStr(end_time * 1000, 0)
    if (message_type>3) return
    message = {
      message: message_info,
      message_type: message_type,
      amount: amount,
      amount_type: amount_type,
      footer: footer,
      content: content,
      start_time: start_time,
      end_time: end_time,
      image: image,
    }
    that.setData({
      message: message,
      messageHidden: !messageHidden,
    })
    console.log('message_detail message:', that.data.message)
  },
  //确定按钮点击事件 
  tryagain: function () {
    var that = this
   
    that.setData({
      messageflag: app.globalData.messageflag,
    })

  },
  onLoad: function (options) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log('getSystemInfo:', winHeight);
        that.setData({
          dkheight: winHeight,
        })
      }
    })
    var default_para = {
      currentTarget:{
        dataset:{
          id:'message',
          index:2,
          title:'消息'
        }
      }
    }
    that.onOrderTapTag(default_para) ;
  },
  onShow: function(){
    var that = this
    var activeIndex2 = 0
    if (app.globalData.messageflag == 0){
      activeIndex2 = 1
    } else if (app.globalData.messageflag == 1){
      activeIndex2 = 2
    }else{
      activeIndex2 = 0
    }
    console.log('message onShow messageflag:', app.globalData.messageflag, 'activeIndex2:', activeIndex2)
    that.setData({
      activeIndex2: activeIndex2,
      messageflag: app.globalData.messageflag,
    })

    that.get_member_messages()

    /*
    if (activeIndex2==0){
      that.get_ai_rules()
    } else  {
      that.get_member_messages()
    }
    */
  },
  //获取消息
  get_member_messages: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var page = that.data.page
    var pagesize = that.data.pagesize
    var message_type = that.data.message_type
    wx.request({
      url: weburl + '/api/client/get_member_messages',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        message_type: message_type, //所有消息
        page: page,
        pagesize: pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var messages_all = res.data
        var all_rows = res.data.all_rows
        
        if (messages_all['status']=='y') {
          var messages = messages_all['result']
          var task_list =[]
          var message_list = []
          for (var i = 0; i < messages.length;i++){
            if(messages[i].type==6) { //task info
              console.log('message get_member_messages messages[i]:',i, messages[i])
              if (messages[i]['task_info']['task_status']!=9){
               // if (task_list.length==0) task_list.push(messages[i])
                
              }
              if (task_list.length==0) task_list.push(messages[i])
            }else{
              message_list.push(messages[i])
            }
          }
          /*
          if (task_list.length==0){//为空时虚拟一条送礼任务
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
            var new_task = [{
              addtime: util.getDateStr(that.data.currenttime,0), 
              msg_id:0,
              msg_status:0,
              title:'新手免费送大礼',
              type:6, //送礼类型
              message_info:message_info,
              task_info:task_info,
            }]
          }
          */
          var page_num = that.data.page_num
          page_num = (all_rows / pagesize + 0.5)
          if (page_num > 1 && message_list) {
            //向后合拼
            message_list = that.data.message_list.concat(message_list);
          }
          that.setData({
            message_list: message_list,
            task_list: task_list,
            page_num: page_num.toFixed(0),
          })
          console.log('member/messages get_member_messages() 获取消息:', that.data.message_list, that.data.task_list,page,pagesize)
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
  //获取AI规则
  get_ai_rules: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    console.log('get_ai_rules')
    wx.request({
      url: weburl + '/api/client/get_ai_rules',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        type:2
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var rule_info = res.data
        console.log('get_ai_rules info:',rule_info)
        if (rule_info['status'] == 'y') {
          var rule_list = rule_info['result']
          for (var i = 0; i < rule_list.length; i++) {
            if (rule_list[i]['item_name'].length>0){
              rule_list[i]['selected'] = 0
            }
          }
          that.setData({
            rule_list: rule_list,
            rules_length: rule_list.length,
            selected_num: 0,
            selected_all: false,
            selected_start:true,
          })
          console.log('获取智能选品规则:', that.data.rule_list)
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
  //获取AI 商品列表
  selectBtnTap: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var rule_list = that.data.rule_list
    var rule_select =[]

    that.setData({
      isLoadingTrue: true
    })
    setTimeout(function () {
      that.setData({
        isLoadingTrue: false
      })
    }, 3000)

    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    for (var i = 0; i < rule_list.length; i++) {
      var selected={}
      selected['id'] = rule_list[i]['id']
      selected['selected'] = rule_list[i]['selected']
      rule_select.push(selected)
       
    }
    console.log('selectBtnTap selected rule:', rule_select)
    wx.request({
      url: weburl + '/api/client/get_ai_goods_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        rule_select: JSON.stringify(rule_select),
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var rule_goods_info = res.data
        console.log('get_ai_rules 智能选品列表 goods info:', rule_goods_info)
        if (rule_goods_info['status'] == 'y') {
          var rule_goods_list = rule_goods_info['result']
          var rule_goods_len = rule_goods_list.length
          rule_goods_len > 2 ? 3 : rule_goods_len
          for (var i = 0; i < rule_goods_len;i++){
            rule_goods_list[i]['image'] = rule_goods_list[i]['activity_image'] == "" ? rule_goods_list[i]['image'] : rule_goods_list[i]['activity_image']
          }
        
          that.setData({
            rule_goods_list: rule_goods_list,
            select_goods_list: rule_goods_list[0],
            select_goods_1: rule_goods_list[1] ? rule_goods_list[1]:'',
            select_goods_2: rule_goods_list[2] ? rule_goods_list[2] : '',
            messageflag:3,
          })
          app.globalData.messageflag = that.data.messageflag
          
          console.log('get_ai_rules 智能选品列表:', that.data.rule_goods_list)
        } else {
          that.setData({
            messageflag: 9,
          })  
          console.log('get_ai_rules 暂无推荐的商品:', that.data.noselected)
        }
      }
    })
  },
  addCart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_id = that.data.goods_id
    var page = that.data.page
    
    if (!username) {//登录
      wx.navigateTo({
        url: '../login/login?goods_id=' + that.data.goodsid+'&is_permission=1'
      })
    } else {
      // 获取商品SKU
      wx.request({
        url: weburl + '/api/client/get_goodssku_list',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          goods_id: goods_id,
          shop_type: shop_type,
          page: page
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('goods_sku:', res.data.result);
          var attrValueList = res.data.result.spec_select_list ? res.data.result.spec_select_list : '';
          var commodityAttr = res.data.result.sku_list ? res.data.result.sku_list : '{}';
          if (!commodityAttr) {
            wx.showToast({
              title: '该产品已下架',
              icon: 'loading',
              duration: 1500
            })
            return
          }
          for (var i = 0; i < commodityAttr.length; i++) {
            if (commodityAttr[i].attrValueStatus) {
              commodityAttr[i].attrValueStatus = true;
            } else {
              commodityAttr[i].attrValueStatus = false;
            }
          }
          that.setData({
            commodityAttr: commodityAttr,
            sku_id: commodityAttr[0]['id'],
          })
          console.log('goods sku id:', that.data.sku_id)
          that.insertCart(that.data.sku_id, username, 0)
          if (!attrValueList) return
          for (var i = 0; i < attrValueList.length; i++) {
            if (!attrValueList[i].attrValueStatus) {
              attrValueList[i].attrValueStatus = true
            }
          }
          that.setData({
            attrValueList: attrValueList,
          })
         
        }
      })
    }
  },
  insertCart: function (sku_id, username, wishflag) {
    var that = this
    var shop_type = that.data.shop_type
    var rule_selected_info = that.data.rule_selected_info
    if (!rule_selected_info){
      var rule_list = that.data.rule_list
      rule_selected_info=''
      for (var i = 0; i < rule_list.length; i++) {
        var selected = rule_list[i]['selected']
        rule_selected_info = rule_selected_info + '"' + rule_list[i]['id'] + '":"' + rule_list[i]['item_name'][selected] + '"'
      }
      rule_selected_info = '{' + rule_selected_info + '}'
    }
    
    wx.request({
      url: weburl + '/api/client/add_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: "1",
        sku_id: sku_id,
        wishflag: wishflag,
        shop_type: shop_type,
        rule_selected_info: rule_selected_info,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('details insertCart res data:', res.data, ' wishflag：', wishflag);
        var title = wishflag == 1 ? '已加入心愿单' : '已加入购物袋'
        wx.showToast({
          title: title,
          duration: 2000
        })
        app.globalData.from_page = '/pages/details/details'
        if (wishflag == 1) {
          /*
          wx.navigateTo({
            url: '/pages/details/details'
          })
          */
          wx.navigateTo({
            url: '/pages/wish/wish'
          })
        }
        else {
          console.log('details insertCart wishflag:', wishflag)
          app.globalData.hall_gotop = 1
          wx.switchTab({
            url: '/pages/hall/hall'
          })
        }

      }

    })
   
  },
  getMoreAccountTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1
    var pagesize = that.data.pagesize
    var all_rows = that.data.all_rows
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'loading',
        duration: 1000
      })
      return
    }
    that.setData({
      page: page,
    })
    that.get_member_messages()
  },
  goBack: function () {
    var pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ changed: true })  /返回上一页
    } else {
      /*
      wx.switchTab({
        url: '../../hall/hall'
      })*/
      wx.navigateTo({
        url: '/pages/list/list',
      })
    }
  },
  onPullDownRefresh: function () {
    //下拉刷新
    //wx.startPullDownRefresh()
    //wx.stopPullDownRefresh()
  },
  move: function () {},
})