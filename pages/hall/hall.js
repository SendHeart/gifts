import { getDateStr, formatTime } from '../../utils/util.js'
//获取应用实例
var app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var wssurl = app.globalData.wssurl
var socketOpen = false
var socketMsgQueue = []
var sendMsgQueue = []
var message = ""

var text = '';
var page = 1
var pagesize = 20

var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var user_group_id = wx.getStorageSync('useruser_group_idInfo') ? wx.getStorageSync('user_group_id') : '0'
var navList2_init = [
    { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo3.png" },
    { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
    { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
    { id: "hall_banner", title: "首页banner", value: "", img: "" },
    { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
    { id: "wechat_gb", title: "背景", value: "", img: "/uploads/wechat_share.png" },
]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
var navList = [
    { id: "is_recommend", title: "推荐"  ,value:"1"},
]

Page({
    data: {
        navList2: navList2,
        navList:navList,
        activeIndex: 0,
        tab: 'is_recommend',
        tab_value:"1",
        toView:0,
        navlist_toView:0,
        navlist_title:'',
        is_category:false,
        title_name:'送心',
        title_logo: '../../images/footer-icon-05.png',
        img_discount: '../../images/discount.png',
        img_service: weburl+'/uploads/service.png',
        img_service2: weburl + '/uploads/service2.png',
        default_img : weburl + '/uploads/default_goods_image.png',
        default_avatar: weburl + '/uploads/avatar.png',
        platform:'',
        pagesize: pagesize,
        pageoffset:0,
        hidden: true,
        resp_message:{},
        messageHidden : true,
        notehidden : false,
        dkheight: 250,
        scrollTop: 0,
        scrollLeft:0,
        current_scrollTop: 0,
        scrollHeight: 500,
        indicatorDots: true,
        vertical: false,
        autoplay: true,
        interval: 7000,
        duration: 300,
        circular:true,
        hall_banner: weburl+"/uploads/songxin_banner.png", //默认的banner图
        banner_link: "/pages/list/list?navlist=1", //默认的banner图 跳转链接
        gifts_rcv:0,
        gifts_send:0,
        messages_num:0,
        note:'',
        username: null,
        token: null,
        recommentslist: [],
        recommentslist_show: [],
        show_max:20,
        minusStatuses: [],
        selectedAllStatus: true,
        total: '',
        startX: 0,
        itemLefts: [],
        showmorehidden: true,
        loadingHidden: true,
        all_rows:0,
        rall_rows:0,
        windowWidth: 0,
        windowHeight: 0,
        carts: [],
        cartIds: null,
        friends: [],
        modalFriendinfoHidden: true,
        friend_wx_nickname: '',
        friend_full_name: '',
        friend_address: '',
        friend_tel: '',
        modalFriendHidden:true ,
        amount:0,
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        user_group_id:user_group_id,
        shop_type:shop_type,

        hiddenallclassify:true,
        socktBtnTitle: '连接socket',
        message: '',
        text: text,
        content: '',
        buyhidden1: true,
        buyhidden2: false,
        page:1,
        friends_page: 1,
        friends_pagesize: 10,
        rpage_num:1,
        is_reloading:false,
        toView: 0,
        is_video_play:0,
        gift_para_interval:0,
    },

    handletouchmove: function (event) {
        var that = this
        var currentX = event.touches[0].pageX
        var currentY = event.touches[0].pageY
        var tx = currentX - this.data.lastX
        var ty = currentY - this.data.lastY
        var scrollHeight = that.data.scrollHeight
        var page  = that.data.page
        var rpage_num = that.data.rpage_num

        if (Math.abs(tx) > Math.abs(ty)) {
            if (tx < 0) { // text = "向左滑动"

            }
            else if (tx > 0) {   // text = "向右滑动"

            }
        } else { //上下方向滑动
            if (ty < 0 && !that.data.is_reloading) {  // text = "向上滑动"
                if (that.data.page < that.data.rpage_num) {
                    //将当前坐标进行保存以进行下一次计算
                    that.getMoreGoodsTapTag()
                    /*
                    if (currentY > scrollHeight - 100) {

                    }
                    */
                }
            } else if (ty > 0) {  //text = "向下滑动"

            }
        }

        that.setData({
            floorstatus: true,
        })
        that.data.lastX = currentX
        that.data.lastY = currentY
        //console.log('currentX:', currentX, 'currentY:', currentY, 'ty:', ty, ' page:', page, ' rpage_num:', rpage_num)

    },

    // 打开全部子分类
    openAllTapTag: function () {
        var that = this
        var hiddenallclassify = that.data.hiddenallclassify
        that.setData({
            hiddenallclassify: !hiddenallclassify,
        })
    },

    handletouchstart: function (event) {
        // console.log(event)
        // 赋值
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
        this.setData({
            touchstop: false,
        })
    },
    handletouchend: function (event) {
        var that = this
        var currentY = that.data.lastY
        this.setData({
            touchstop: true,
        })
    },

    getMoreGoodsTapTag: function (e) {
        var that = this;
        var page = that.data.page + 1;
        var rpage_num = that.data.rpage_num
        var is_reloading = that.data.is_reloading
        console.log('getMoreGoodsTapTag 加载更多中，请稍等 page:', page, 'is_reloading:', is_reloading, that.data.scrollHeight)
        if (is_reloading) {
            return
        }
        if (page > rpage_num) {
            wx.showToast({
                title: '已经到底了~',
                icon: 'none',
                duration: 1000
            })

            that.setData({
                loadingHidden: false,
                loading_note: '已经到底了~'
            })
            setTimeout(function () {
                that.setData({
                    loadingHidden: true,
                })
            }, 1000)
            return
        }
        /*
        wx.showToast({
          title: '加载中',
          icon: 'loading',
          duration: 500
        })
        */
        that.setData({
            page: page,
            loadingHidden: false,
            loading_note: '加载中'
        })
        that.reloadData()
    },

    /*
      onPageScroll: function (e) {
        var that = this
        if (e.scrollTop <= 0) {
          // 滚动到最顶部
          e.scrollTop = 0;
          //给scrollTop重新赋值
          that.setData({
            scrollTop: e.scrollTop
          })
        } else if (e.scrollTop > that.data.scrollHeight) {
          // 滚动到最底部
          e.scrollTop = that.data.scrollHeight
          //给scrollTop重新赋值
          that.setData({
            scrollTop: e.scrollTop,
          })
          that.getMoreGoodsTapTag()
        }
        if (e.scrollTop > that.data.scrollTop || e.scrollTop > that.data.scrollHeight-1000) {
          //向下滚动
          //console.log('向下 ', that.data.scrollHeight)
          that.setData({
            floorstatus: true
          })
        } else {
          //向上滚动
          //console.log('向上滚动 ', that.data.scrollHeight)
        }

      },
      */
    //回到顶部，内部调用系统API
    goTop: function () {  // 一键回到顶部
        var that = this
        var is_reloading = that.data.is_reloading

        /*
        if (is_reloading){
          setTimeout(function () {
            that.goTop()
          }, 500)
          return
        }
        */
        /*
         that.setData({
           scrollTop: 0
         })
         */
        console.log('goTop:', that.data.scrollTop)
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0 ,
                duration:300,
            })
            that.setData({
                scrollTop: 0,
                recommentslist_show: [],
                page:1,
                pageoffset:0,
            },function(){
                that.reloadData()
                app.globalData.hall_gotop = 0
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
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
            })
        }
    },
    videoPlayer: function (e) {
        var that = this;
        wx.navigateTo({
            url: '/pages/live/live?streamaname='
        })
    },
    searchTapTag: function (e) {
        var that = this;
        //console.log('搜索关键字：' + that.data.search_goodsname)
        wx.navigateTo({
            url: '/pages/goods/list/list?search=1'
        })
    },
    query_message:function(){
      var that = this
      var shop_type = that.data.shop_type; // var formid = formId?formId:that.data.formid
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var page = 1
      var pagesize =1
      wx.request({
        url: weburl + '/api/mqttservice/sh_query_message',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          message_type: 1,
          shop_type: shop_type,
          page:page,
          pagesize:pagesize,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('hall query_message 收到消息：' + JSON.stringify(res.data));
          var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
          var response = res.data;
          var messageHidden = that.data.messageHidden
          if (response.status=='y'){
            wx.pageScrollTo({
              scrollTop: 90,
              duration: 300,
            })
            var resp_message = response.result[0]
            var messages_num = that.data.messages_num
            resp_message['title'] = resp_message['title'] ? resp_message['title']:'我的消息'
            resp_message['start_time'] = getDateStr(resp_message['start_time'] * 1000, 0)
            resp_message['end_time'] = getDateStr(resp_message['end_time'] * 1000, 0)
            that.setData({
              resp_message: resp_message,
              messages_num: messages_num+1,
            })
          }
        }
      })
    },
    reSend: function () { //失败后重新发送
        var that = this;
        //失败重发
        var reSendMsgQueue = sendMsgQueue
        for (var i = 0; i < reSendMsgQueue.length; i++) {
            wx.sendSocketMessage({
                data: reSendMsgQueue[i],
                success: function (res) {
                    console.log("sendSocketMessage 重发完成")
                    console.log(rcvnew)
                    sendMsgQueue.splice(i, 1);
                },
                fail: function (res) {
                    console.log("sendSocketMessage 重发失败")
                    wx.showToast({
                        title: '网络故障',
                        icon: 'loading',
                        duration: 2000
                    })
                }
            })
        }
    },
    initSocketMessage: function () {
        var that = this
        var remindTitle = socketOpen ? '正在关闭' : '正在连接'
        //return
        if (!socketOpen) {
            wx.connectSocket({
                url: wssurl + '/wss'
            })
            wx.onSocketError(function (res) {
                socketOpen = false
                console.log('WebSocket连接打开失败，请检查！')
                that.setData({
                    socktBtnTitle: '连接socket'
                })
                wx.hideToast()
            })
            wx.onSocketOpen(function (res) {
                console.log('WebSocket连接已打开', wssurl + '/wss')
                wx.hideToast()
                that.setData({
                    socktBtnTitle: '断开socket'
                })
                socketOpen = true;
                var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
                var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : '';
                var web_name = m_id ? m_id : username
                var uid = web_name+'_'+shop_type
                wx.sendSocketMessage({
                    data: uid
                })

                for (var i = 0; i < socketMsgQueue.length; i++) {
                    that.setData({
                        message: socketMsgQueue[i],
                    })
                    that.sendSocketMessage()
                }
                //socketMsgQueue = []

            })
            wx.onSocketMessage(function (res) {
                var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
                var response = JSON.parse(res.data.trim(), true);
                var messageHidden = that.data.messageHidden
                console.log('收到服务器内容：' + res.data.trim())
                if (response.status=='y'){
                    wx.pageScrollTo({
                        scrollTop: 90,
                        duration: 300,
                    })
                    var resp_message = response.result
                    var messages_num = that.data.messages_num
                    resp_message['title'] = resp_message['title'] ? resp_message['title']:'我的消息'
                    resp_message['start_time'] = getDateStr(resp_message['start_time'] * 1000, 0)
                    resp_message['end_time'] = getDateStr(resp_message['end_time'] * 1000, 0)
                    that.setData({
                        resp_message: resp_message,
                        messages_num: messages_num+1,
                        //messageHidden: false
                    })
                    /*
                    setTimeout(function () {
                      that.setData({
                        messageHidden: true,
                      })
                    }, 9000)
                    */
                }
            })
            wx.onSocketClose(function (res) {
                socketOpen = false
                console.log('WebSocket 已关闭！')
                wx.hideToast()
                that.setData({
                    socktBtnTitle: '连接socket'
                })
            })
        }
    },
    sendSocketMessage: function () {
        var that = this;
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var myDate = formatTime(new Date)
        var message = that.data.message

        if (!socketOpen) {
            socketMsgQueue.push(message)
            that.initSocketMessage()
        } else {
            console.log('sendSocketMessage message:', message)
            wx.sendSocketMessage({
                data: message,
                success: function (res) {
                    console.log("sendSocketMessage 完成", res)
                    console.log("sendSocketMessage hall_banner:", that.data.hall_banner)
                },
                fail: function (res) {
                    console.log("sendSocketMessage 通讯失败")
                    wx.showToast({
                        title: '网络故障',
                        icon: 'loading',
                        duration: 1500
                    })
                }
            })
        }
    },

    bindMiddleGoods: function (e) {
        var that = this
        var goods_type = e.currentTarget.dataset.goodsType
        var middle_title = e.currentTarget.dataset.middleTitle
        wx.navigateTo({
            url: '/pages/goods/list/list?goods_type_value=' + goods_type + '&middle_title=' + middle_title
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

    // 点击获取对应分类的数据
    onTapTag: function (e) {
        var that = this;
        var tab = e.currentTarget.dataset.id;
        var tab_value = e.currentTarget.dataset.value;
        var index = e.currentTarget.dataset.index;
        var navList = that.data.navList ;
        var toView = index

        if (index > 2 && index < navList.length) {
            toView = index - 2
        } else {
            toView = 0
        }

        that.setData({
            activeIndex: index,
            tab: tab,
            tab_value: tab_value,
            toView: toView ? toView : 0,
            is_category:index==0?false:true,
            hiddenallclassify: true,
            gift_para_interval:1, //更新广告轮播图
            recommentslist:[],
            recommentslist_show: [],
            pageoffset:0,
            page:1,
            scrollTop: 0,
        },function(){
            that.reloadData()
            that.get_project_gift_para()
        })
        console.log('tab:' + that.data.tab)

        /*
        wx.navigateTo({
          url: '/pages/list/list?navlist_title='+navList[index]['title']
        })
        */
    },
    bannerTapTag: function (e) {
        var that = this
        var banner_link = e.currentTarget.dataset.bannerlink
        wx.navigateTo({
            url: banner_link+'&username='+username+'&token='+token
        })
    },

    messagesTapTag: function () {
        var that = this
        that.setData({
            messages_num: 0
        })
        app.globalData.messageflag = 1 //1系统消息
        //console.log('hall messagesTapTag: messageflag:', app.globalData.messageflag)
        /*
        wx.switchTab({
          url: '/pages/member/message/message'
        })
        */
        app.globalData.my_index = 1 //1系统消息
        app.globalData.art_id = 28 //28会员制说明
        console.log('hall messagesTapTag: art_id:', app.globalData.art_id)
        setTimeout(function () {
            wx.switchTab({
                url: '/pages/my/index'
            })
        }, 500)
    },
    userTapTag: function () {
        wx.switchTab({
            url: '../my/index'
        })
    },

    usergiftTapTag: function () {
        wx.switchTab({
            url: '../index/index'
        })
    },
    bindTextAreaBlur: function (e) {
        var that = this ;
        that.setData({
            note: e.detail.value
        })

    },
    bindMinus: function (e) {
        var that =this
        var index = parseInt(e.currentTarget.dataset.index);
        var num = that.data.carts[index]['num']
        var num_cur = num
        //
        if (num_cur > 1) {
            num--
        }else{
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
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var sku_id = carts[index]['id']
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
        /*
        wx.showLoading({
          title: '操作中',
          mask: true
        })
        */
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
            title: '操作中',
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
        })
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
    bindPlayer: function () {
        wx.navigateTo({
            url: '/pages/player/player?username=' + username + '&token=' + token
        })
    },
    bindPickGoods: function () {
        wx.navigateTo({
            url: '/pages/list/list?username=' + username + '&token=' + token
        })
    },
    bindAIPickGoods: function () {
        var that = this
        app.globalData.messageflag = 2
        wx.switchTab({
            url: '/pages/member/message/message',
        })
    },


    bindCheckout: function () {
        var that = this
        var is_buymyself = that.data.is_buymyself ? that.data.is_buymyself: 0
        var order_type = 'gift'
        var order_note = that.data.note
        var amount = that.data.total
        var cartIds = that.calcIds()
        var carts = that.data.carts
        var cartselected = []
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        console.log('hall bindCheckout is_buymyself:', is_buymyself, 'cartIds:',cartIds, 'carts:',carts)
        cartIds = cartIds.join(',')
        if (!order_note) order_note = '送你一份礼物，希望你喜欢!'; //默认祝福
        // 遍历selected
        var index = 0
        for (var i = 0; i < carts.length; i++) {
            if (carts[i]['selected']) {
                cartselected[index++] = carts[i]
            }
        }
        if (cartselected.length==0){
            that.query_cart()
            that.sum()
            wx.showToast({
                title: '礼物包是空的，先挑选礼物吧~', /* 文案修改 */
                icon: 'none',
                duration: 1500
            })
            return
        }

        that.setData({
            amount: amount,
            carts: carts,
            cartIds: cartIds,
            username:username,
            token:token,
            is_buymyself: is_buymyself,
        })

        console.log('hall bindCheckout cartIds:', cartIds, 'cartselected:', JSON.stringify(cartselected))
        wx.navigateTo({
            url: '../order/checkout/checkout?cartIds=' + cartIds + '&amount=' + amount + '&carts=' + JSON.stringify(cartselected) + '&is_buymyself='+is_buymyself +'&order_type=' + order_type + '&order_note=' + order_note +'&username=' + username + '&token=' + token
        })
    },

    formSubmit: function (e) {
        var that = this
        var formId = e.detail.formId;
        var form_name = e.currentTarget.dataset.name //记录用户的操作
        console.log('formSubmit() formID：', formId,' form name:',form_name)
        if (form_name=='sendgift'){
            that.setData({
                is_buymyself: 0,
            })
        }else if(form_name=='buymyself'){
            that.setData({
                is_buymyself: 1,
            })
        } else if (form_name == 'pickgift') {
            wx.navigateTo({
                url: '/pages/list/list?username=' + username + '&token=' + token
            })
            return
        }
        that.bindCheckout()
        that.submintFromId(formId, form_name)
    },

    //提交formId，让服务器保存到数据库里
    submintFromId: function (formId = 0, form_name='') {
        var that = this
        var shop_type=that.data.shop_type
        // var formid = formId?formId:that.data.formid
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        console.log('submintFromId() formID：', formId, ' form name:', form_name)
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
                console.log('submintFromId() update success: ',res.data.result)
            }
        })
    },

    query_friends: function () {
        var that = this;
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
        var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
        var shop_type = that.data.shop_type;
        var weburl = getApp().globalData.weburl;
        var friends_page = that.friends_page
        var friends_pagesize = that.friends_pagesize
        if (!username) {
            return;
        }
        wx.request({
            url: weburl + '/api/client/get_member_friends',
            method: 'POST',
            data: {
                username: username ? username : openid,
                access_token: token,
                type: 3,  // 3送心礼物好友
                shop_type: shop_type,
                page: friends_page,
                pagesize: friends_pagesize,
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            success: function (res) {
                //console.log('3送心礼物好友 hall query_friends:', res.data);
                if (!res.data.result) {
                    return;
                }

                var friends_list = res.data.result;
                var index = 0;

                if (friends_list) {
                    for (var i = 0; i < friends_list.length; i++) {
                        if (friends_list[i]['wx_headimg'].indexOf("http") < 0) {
                            friends_list[i]['wx_headimg'] = weburl + '/' + friends_list[i]['wx_headimg'];
                        }
                    }
                }

                that.setData({
                    friends: friends_list,
                })
                console.log('3送心礼物好友 hall query_friends friends:', that.data.friends);
            }
        })
    },
    bindFriendinfo: function (e) {
        var that = this
        var index = e.currentTarget.dataset.index
        var friends = that.data.friends
        var friend_wx_nickname = friends[index].wx_nickname
        var friend_full_name = friends[index].full_name
        var friend_address = friends[index].address
        var friend_tel = friends[index].tel

        wx.navigateTo({
            url: '/pages/member/friendinfo/friendinfo?friendinfo=' + JSON.stringify(friends[index])
        })
        console.log('bindFriendinfo() friend_full_name', friend_full_name, ' friend_address:', friend_address)
    },
    modalBindFriendconfirm: function () {
        var that = this
        var modalFriendHidden = !that.data.modalFriendHidden
        that.setData({
            modalFriendHidden: modalFriendHidden,
        })
    },
    //定位数据
    getleft: function (e) {
        var that = this;
        var scrollLeft = that.data.scrollLeft
        that.setData({
            scrollLeft: scrollLeft + 10,
        })
    },
    delete: function (e) {
        var that = this
        var shop_type = that.data.shop_type
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var index = 0
        var objectId = 0
        if(e){
            index = e.currentTarget.dataset.index ? e.currentTarget.dataset.index : 0
            objectId = e.currentTarget.dataset.objectId;
        }else{
            index = that.data.deleteindex
        }

        index = parseInt(index)
        var carts = this.data.carts;
        var sku_id = this.data.carts[index]['id'];

        // 购物车单个删除
        console.log(objectId);
        wx.showModal({
            title: '确认移除该礼物？',
            content: '', /*文案修改*/
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
                            console.log(res.data.result);
                            var new_carts = [];
                            var j = 0;
                            for (var i = 0; i < carts.length; i++) {
                                if (i != index) {
                                    //剔除删除产品
                                    new_carts[j++] = carts[i];
                                }
                            }
                            if (new_carts.length==0){
                                var all_rows = 0;
                                var showmorehidden = true;
                            }else{
                                var all_rows = new_carts.length;
                                var showmorehidden = true; // false
                            }
                            that.setData({
                                carts: new_carts,
                                all_rows:all_rows,
                                showmorehidden: showmorehidden
                            })
                            that.sum()
                            that.query_cart()
                        }
                    })
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
            /*
            if (carts[i]['selected']) {
              total += carts[i]['num'] * carts[i]['sell_price'];
            }
            */
            total += carts[i]['num'] * carts[i]['sell_price'];
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
        var objectId = e.currentTarget.dataset.objectId
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var goods_id = e.currentTarget.dataset.goodsId
        var goods_org = e.currentTarget.dataset.goodsOrg
        var goods_shape = e.currentTarget.dataset.goodsShape
        var goods_name = e.currentTarget.dataset.goodsName
        var goods_price = e.currentTarget.dataset.goodsPrice
        var goods_info = e.currentTarget.dataset.goodsInfo
        var goods_sale = e.currentTarget.dataset.sale
        var image = e.currentTarget.dataset.image ? e.currentTarget.dataset.image:''
        //var carts = this.data.carts
        var sku_id = objectId
        wx.navigateTo({
            url: '/pages/details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_shape=' + goods_shape +  '&goods_org=' + goods_org + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&name=' + goods_name+'&image=' + image+'&token=' + token + '&username=' + username
        })
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
                console.log(res.data.result)
                that.query_cart()
                /*
                wx.showToast({
                  title: '已更新',
                  icon: 'success',
                  duration: 1000
                });
                */
            }
        })
    },

    //确定按钮点击事件
    messageConfirm: function () {
        var that = this
        var messageHidden = that.data.messageHidden
        that.setData({
            messageHidden: !messageHidden,
            notehidden: !that.data.notehidden,
        })
        wx.navigateTo({
            url: '/pages/member/task/task'
        })

    },
    //取消按钮点击事件
    messageCandel: function () {
        var that = this
        that.setData({
            messageHidden: true,
            notehidden: !that.data.notehidden,
        })

    },
    query_cart:function(){
        var that = this
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var minusStatuses = []
        var shop_type = that.data.shop_type
        if (!openid && !username){
            wx.showToast({
                title: '加载中', /* 文案修改 */
                icon: 'loading',
                duration: 500
            })
            setTimeout(function () {
                that.query_cart()
            }, 500)
            return
        }

        // cart info
        wx.request({
            url: weburl + '/api/client/query_cart',
            method: 'POST',
            data: {
                username: username ? username : openid,
                access_token: token,
                shop_type: shop_type,
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log('hall reloadData:', res.data);
                var carts = [];
                if (!res.data.result) {
                    return
                }
                var cartlist = res.data.result.list;
                var showmorehidden;

                var index = 0;
                for (var key in cartlist) {
                    for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
                        if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
                            cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
                        }

                        cartlist[key]['sku_list'][i]['selected'] = true;
                        cartlist[key]['sku_list'][i]['shop_id'] = key;
                        cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
                        if (index > 1) {
                            cartlist[key]['sku_list'][i]['hidden'] = 1;
                        }
                        carts[index] = cartlist[key]['sku_list'][i];
                        //minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'disabled' : 'normal';
                        minusStatuses[index] = cartlist[key]['sku_list'][i]['num'] <= 1 ? 'normal' : 'normal';
                        index++;
                    }
                }

                that.setData({
                    carts: carts,
                    minusStatuses: minusStatuses,
                    all_rows: carts.length
                })
                that.sum()
            }
        })
    },
    reloadData: function () {
        var that = this
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var minusStatuses = []
        var page=that.data.page
        var pagesize=that.data.pagesize
        var pageoffset = that.data.pageoffset
        var shop_type = that.data.shop_type
        var goods_type = that.data.tab
        var goods_type_value = that.data.tab_value

        that.setData({
            is_reloading: true,
            loadingHidden: false,
        })
        /*
        wx.showLoading({
          title: '加载中',
        })
        */
        wx.request({
            url: weburl + '/api/client/query_member_goods_prom',
            method: 'POST',
            data: {
                username: username ? username:openid,
                access_token: token,
                shop_type:shop_type,
                goods_type: goods_type,
                goods_type_value: goods_type_value,
                page:page,
                pagesize:pagesize,
                pageoffset:pageoffset,
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log('会员推荐商品列表获取:', recommentslist, ' page num:', rpage_num, ' page:', page, ' pageoffset:', pageoffset, ' res.data:', res.data);
                if(res.data.status='y'){
                    var recommentslist = that.data.recommentslist
                    var recommentslist_new = res.data.result
                    var rpage_num = res.data.all_rows?res.data.all_rows:1
                    var pageoffset = res.data.pageoffset?res.data.pageoffset:0
                    var show_max = that.data.show_max
                    var recommentslist_show = that.data.recommentslist_show
                    if (!recommentslist_new) return
                    var recomm_len = recommentslist_new.length
                    for (var i = 0; i < recomm_len; i++) {
                        if (recommentslist_new[i]['activity_image'].indexOf("http") < 0 && recommentslist_new[i]['activity_image']) {
                            recommentslist_new[i]['activity_image'] = weburl + '/' + recommentslist_new[i]['activity_image'];
                        }
                        if (recommentslist_new[i]['image'].indexOf("http") < 0 && recommentslist_new[i]['image']) {
                            recommentslist_new[i]['image'] = weburl + '/' + recommentslist_new[i]['image'];
                        }
                        recommentslist_new[i]['image'] = recommentslist_new[i]['activity_image'] ? recommentslist_new[i]['activity_image'] : recommentslist_new[i]['image']
                        //recommentslist[i]['name'] = recommentslist[i]['name'].substr(0, 13) + '...';
                        if (i > 1) {
                            recommentslist_new[i]['hidden'] = 0;  //1
                        }
                    }

                    if (page > 1 && recommentslist_new) {
                        //向后合拼
                        recommentslist = recommentslist.concat(recommentslist_new);
                    } else {
                        recommentslist = recommentslist_new
                    }
                    //更新当前显示页信息
                    if (recommentslist_show.length >= show_max) {
                        recommentslist_show.shift()
                    }

                    that.setData({
                        recommentslist: recommentslist,
                        rpage_num: rpage_num?rpage_num:0,
                        ["recommentslist_show[" + (page - 1) + "]"]: recommentslist_new,
                        pageoffset: pageoffset?pageoffset:0,
                    }, function () {
                        that.setData({
                            is_reloading: false,
                            loadingHidden: true,
                        })
                        //wx.hideLoading()
                        //that.getScrollHeight() //获取页面实际高度

                    })
                    console.log('会员推荐商品列表获取:', recommentslist_show, ' page num:', rpage_num, ' page:', page, ' pageoffset:', pageoffset, ' res.data:', res.data);
                    /*
                    setTimeout(function () {
                      that.getScrollHeight() //获取页面实际高度
                    }, 500)
                    */
                }else{
                    wx.showToast({
                        title: '加载完成',
                        icon: 'success',
                        duration: 2000
                    })
                    that.setData({
                        is_reloading: false,
                        loadingHidden: true,
                    })
                }
            }
        })

        var gifts_rcv = that.data.gifts_rcv;
        var gifts_send = that.data.gifts_send;
        var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
        console.log("openid:" + openid + ' username:' + username)

        // 送收礼物信息查询
        wx.request({
            url: weburl + '/api/client/query_member_gift',
            method: 'POST',
            data: {
                username: username ? username : openid,
                access_token: token,
                openid: openid,
                shop_type:shop_type
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log('会员礼物收送信息获取:',res.data)
                if (res.data.result){
                    var gifts_rcv = res.data.result['giftgetnum']
                    var gifts_send = res.data.result['giftsendnum']

                    that.setData({
                        gifts_rcv: gifts_rcv,
                        gifts_send: gifts_send,
                    })
                }
            }
        })
    },

    // 获取滚动条当前位置
    /*
   scrolltoupper: function (e) {
     console.log('获取滚动条当前位置:', e.detail.scrollTop)
     if (e.detail.scrollTop > 10) {
       this.setData({
         floorstatus: true,
         scrollTop:e.detail.scrollTop,
       })

     } else {
       this.setData({
         floorstatus: false,
         scrollTop: e.detail.scrollTop,
       })
     }
   },
   */

    bindPickFriends: function () {
        /*
        wx.navigateTo({
          url: '/pages/member/friends/friends'
        })
        */
        wx.switchTab({
            url: '/pages/member/friends/friends'
        });
    },
    /*
      showCart: function () {
        wx.switchTab({
          url: '../../cart/cart'
        });
      },
    */

    showCartToast: function (message) {
        wx.showToast({
            title: message ? message : '',
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
        var cat_id = that.data.tab_value>0? that.data.tab_value:1
        console.log('hall get_project_gift_para navList2:', navList_new, ' gift_para_interval:', gift_para_interval)
        if (navList_new.length == 0 || gift_para_interval>0){
            //项目列表
            wx.request({
                url: weburl + '/api/client/get_project_gift_para',
                method: 'POST',
                data: {
                    type: 2,  //暂定 1首页单图片 2首页轮播
                    shop_type: shop_type,
                    cat_id:cat_id,
                },
                header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                success: function (res) {
                    //console.log('get_project_gift_para:', res.data)
                    navList_new = res.data.result;

                    if (!navList_new ) {
                        /*
                         wx.showToast({
                           title: '没有菜单项2',
                           icon: 'loading',
                           duration: 1500
                         });
                         */
                        console.log('get_project_gift_para 没有菜单项2:', navList_new)
                        return
                    }else{
                        that.setData({
                            gift_para_interval: 0,
                            navList2: navList_new,
                            hall_banner: navList_new[3].length>0 ? navList_new[3]:hall_banner, //首页banner图
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
                        console.log('get_project_gift_para 菜单项2:', navList_new)
                    }
                }
            })
        } else{
            that.setData({
                //navList2: navList_new,
                hall_banner: navList_new[3].length>0 ? navList_new[3]:hall_banner, //首页banner图
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

    get_menubar: function (event) { //获取菜单项
        var that = this
        var navlist_toView = that.data.navlist_toView
        var navlist_title = that.data.navlist_title
        var cat_id = that.data.tab_value?that.data.tab_value:1
        wx.request({
            url: weburl + '/api/client/get_menubar',
            method: 'POST',
            data: {
                menu_type: 1,
                cat_id:cat_id,
            },
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'

            },
            success: function (res) {
                console.log('get_menubar:',res.data.result)
                var navList_new = res.data.result;
                if (!navList_new) {
                    wx.showToast({
                        title: '没有菜单项',
                        icon: 'loading',
                        duration: 1500
                    });
                    return;
                }
                for (var i = 0; i < navList_new.length;i++){
                    if (navList_new[i]['title'].indexOf(navlist_title)>=0){
                        navlist_toView = i
                        break
                    }
                }
                that.setData ({
                    navList: navList_new,
                    index: navlist_toView,
                    activeIndex: navlist_toView,
                    tab: navList_new[navlist_toView]['id'],
                    tab_value: navList_new[navlist_toView]['value'],
                    venuesItems_show: [],
                },function(){
                    that.setData({
                        loadingHidden: true,
                    })
                })
            }
        })
    },

    onLoad: function (options) {
        var that = this
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
        var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
        var user_group_id = wx.getStorageSync('user_group_id') ? wx.getStorageSync('user_group_id') : '0';
        var shop_type = that.data.shop_type
        var page_type = options.page_type ? options.page_type:0
        var order_no = options.order_no ? options.order_no:0
        var coupons = options.coupons ? options.coupons:''
        var receive = options.receive ? options.receive:0
        var refername = options.refername ? options.refername : ''
        var task = options.task ? options.task : 0
        var liveid = options.liveid ? options.liveid : 0
        var msg_id = options.msg_id ? options.msg_id : 0
        var art_id = options.art_id ? options.art_id : 0
        var art_cat_id = options.art_cat_id ? options.art_cat_id : 0
        var art_title = options.art_title ? options.art_title : ''
        var message = '获取个人消息'
        var messages_num = that.data.messages_num
        var myDate = formatTime(new Date)
        var scene = decodeURIComponent(options.scene)
        wx.getSystemInfo({
            success: function (res) {
                let winHeight = res.windowHeight;
                console.log('getSystemInfo:', res);
                that.setData({
                    platform: res.platform,
                    dkheight: winHeight,
                })
            }
        })
        app.globalData.is_task = task
        that.get_menubar()

        //自定义头部方法
        this.setData({
            navH: app.globalData.navHeight,
            startBarHeight:0, //app.globalData.navHeight,
            startBarHeight2:30,//app.globalData.navHeight+30
        });

        console.log('hall onload scene:', scene, ' task:', app.globalData.is_task, ' username:', username)
        var message_info = {
            addtime: myDate,
            username: username,
            shop_type: shop_type,
            message: message,
            message_type: 1,
        }
        that.setData({
            user_group_id:user_group_id,
            message: JSON.stringify(message_info),
            refername: refername,
            scene: scene,
            msg_id: msg_id,
            art_id: art_id,
            art_cat_id: art_cat_id,
            art_title: art_title,
            page_type: page_type,
        })
        if (scene.indexOf("activity=") >= 0 || scene.indexOf("activity_id=") >= 0 ) {
            wx.navigateTo({
                url: '/pages/member/mylocation/mylocation?' + scene
            })
        }
        if (scene.indexOf("artid=") >= 0 || scene.indexOf("&catid=") >= 0) {
            var artidReg = new RegExp(/(?=artid=).*?(?=\&)/)
            var artcatidReg = new RegExp(/(?=catid=).*?(?=\&)/)
            var midReg = new RegExp(/\&mid=(.*)/)
            var scene_artid = scene.match(artidReg)[0]
            art_id = scene_artid ? scene_artid.substring(6, scene_artid.length) : art_id
            var scene_artcatid = scene.match(artcatidReg)[0]
            art_cat_id = scene_artcatid ? scene_artcatid.substring(6, scene_artcatid.length) : art_cat_id
            var scene_mid = scene.match(midReg) ? scene.match(midReg)[0] : 0
            refer_mid = scene_mid ? scene_mid.substring(5, scene_mid.length) : refer_mid
            console.log('scene_art_id:', scene_artid, 'scene_art_cat_id:', scene_artcatid, 'refer_id:', refer_mid)//输出
        }
        if (art_id > 0 || art_cat_id > 0) {
            wx.navigateTo({
                url: '/pages/my/index?art_id=' + art_id + '&art_cat_id=' + art_cat_id
            })
        }
        if (scene.indexOf("goodsid=") >= 0) {
            wx.navigateTo({
                url: '/pages/details/details?' + scene
            })
        }
        if (scene.indexOf("promid=") >= 0) {
            wx.navigateTo({
                url: '/pages/details/details?' + scene
            })
        }
        if (scene.indexOf("ordno=") >= 0) {
            wx.navigateTo({
                url: '/pages/order/receive/receive?receive=1&' + scene
            })
        }

        if (scene.indexOf("wish_id=") >= 0) {
            wx.navigateTo({
                url: '/pages/wish/wish?' + scene
            })
        }
        if (liveid > 0 ) {
            wx.navigateTo({
                url: '/pages/player/player?liveid=' + liveid + '&live_name=' + options.live_name + '&live_logo=' + options.live_logo + '&live_poster=' + options.live_poster + '&live_desc=' + options.live_desc + '&live_goods=' + options.live_goods + '&refername=' + refername
            })
        }
        if (scene.indexOf("liveid=") >= 0) {
            wx.navigateTo({
                url: '/pages/player/player?' + scene
            })
        }
        that.query_message()  
        //socketMsgQueue.push(that.data.message)
        //that.setNavigation()
        //that.initSocketMessage()
        /*
       setTimeout(function () {
         that.initSocketMessage()
       }, 20000)
       */
        setInterval(function () {
            that.query_message()
            //that.initSocketMessage()
            that.setData({
                gift_para_interval:1 //30秒获取一次系统参数
            })
            if(that.data.hall_banner.length == 0){
                that.get_project_gift_para()
            }
        }, 60*1000)

        /*
        setInterval(function () {
          that.reSend()
        }, 5000)
        */
        that.reloadData()
        that.sum()
    },
    //事件处理函数

    onShow: function () {
        var that = this;
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var username = wx.getStorageSync('username')
        var refername = that.data.refername
        var msg_id = that.data.msg_id
        var page_type = that.data.page_type
        var pages = getCurrentPages()
        that.query_cart()
        that.get_project_gift_para()
        that.query_friends()
        if (pages.length > 1) {
            that.setData({
                title_logo: '../../images/back.png'
            })
        }
        if(!username){
            /*
             wx.navigateTo({
              url: '/pages/login/login'
            })
            wx.switchTab({
              url: '/pages/my/index'
            })
            */

        }else{
            if (page_type == 2) { //收到礼物
                console.log('hall page_type:', page_type, ' order_no:', order_no, ' receive:', receive)
                if (receive == 1) {
                    wx.navigateTo({
                        url: '../order/receive/receive?order_no=' + order_no + '&receive=1'
                    })
                }
            }
            if (page_type == 3) { //收到优惠券
                console.log('收到优惠券 Hall page_type:', page_type, ' coupons_flag:', coupons_flag, ' coupons_id:', coupons_id, ' receive:', receive)
                if (receive == 1) {
                    wx.navigateTo({
                        url: '../member/couponrcv/couponrcv?coupons_flag=' + coupons_flag + '&coupons_id' + coupons_id + '&receive=1'
                    })
                }
            }
            if (app.globalData.is_task > 0) { //收到任务分享人信息
                console.log('收到任务分享 Hall task:', app.globalData.is_task, ' refername:', refername, ' msg_id:', msg_id)
                if (username != refername) { //保留分享人信息
                    wx.setStorageSync('taskrefername', refername);
                }
                wx.request({
                    url: weburl + '/api/client/get_task_refer',
                    method: 'POST',
                    data: {
                        username: username,
                        access_token: token,
                        shop_type: shop_type,
                        refername: refername,
                        msg_id: msg_id,
                        task: app.globalData.is_task,
                    },
                    header: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    success: function (res) {
                        app.globalData.is_task = 0
                        console.log('hall get_task_refer:', res.data)
                    }
                })
                that.setData({
                    messageHidden: !that.data.messageHidden,
                    main_prom_image: that.data.navList2[10]['img'],
                    main_prom_title: that.data.navList2[10]['title'] ? that.data.navList2[10]['title'] : '送心礼物',
                    main_prom_note: that.data.navList2[10]['note'] ? that.data.navList2[10]['note'] : '送心礼物欢迎您！',
                    notehidden: !that.data.notehidden,
                })
            }
        }

        if(app.globalData.hall_gotop == 1){
            that.goTop()
        }

        app.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        })

        console.log('onShow get_project_gift_para:', wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}])
        //app.globalData.messageflag = 0
    },

    //图片加载出错，替换为默认图片
    imageError: function (e) {
        var that = this
        var errorImgIndex = e.target.dataset.imageindex
        var default_img = that.data.default_img
        var imgObject = "recommentslist_show[" + errorImgIndex + "].image"    //commentList为数据源，对象数组
        var errorImg = {}
        errorImg[imgObject] = default_img              //构建一个对象
        that.setData(errorImg)
        console.log('hall imageError():', errorImg)
    },

    getScrollHeight: function () {
        var that = this
        wx.createSelectorQuery().select('#venues_box').boundingClientRect((rect) => {
            if (rect){
                that.setData({
                    scrollHeight: rect.height,
                    //loadingHidden:true
                })
                console.log('页面实际高度:', that.data.scrollHeight)
            }else{
                setTimeout(function () {
                    that.getScrollHeight()
                }, 300)
            }

        }).exec()
    },

    onShareAppMessage: function () {
        return {
            title: '开启礼物电商时代,200万人都在用的礼物小程序',
            desc: '送心礼物欢迎您',
            path: '/pages/hall/hall?refername='+username+'&mainpage=1'
        }
    },
    BuyModeChange:function(e) {
        console.log(e.detail.value)
        var obj={}
        obj['buyhidden2'] = e.detail.value
        this.setData(obj)
        obj = {}
        obj['buyhidden1'] = e.detail.value ? '' : 'true'
        this.setData(obj)
    }
})