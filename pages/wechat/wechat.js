var app = getApp()
var util = require('../../utils/util.js')
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var wssurl = app.globalData.wssurl
var uploadurl = getApp().globalData.uploadurl
var mqtturl = getApp().globalData.mqtturl
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var user_group_id = wx.getStorageSync('useruser_group_idInfo') ? wx.getStorageSync('user_group_id') : '0'
var socketOpen = false
var socketMsgQueue = []
var socketMsgLen = 0
var chat_messages = []
var rcv_message_content = ''
var recorder = wx.getRecorderManager()
var SocketTask
var string_base64
var session
var onHide_s
var open_num 
var onUnload_num
var autoRestart 
var heartbeat_timer
const innerAudioContext = wx.createInnerAudioContext() //获取播放对象

Page({
  data: {
    shop_type:shop_type,
    is_customer:0,
    mqtt_mid:0,
    mqtt_goodsid:0,
    scrollTop: 0,
		message_len:0,
		messages: [{
			user: 'home',
			from_headimg:userInfo.avatarUrl,
			type: 'text',  
			content: '你好!',
			imageurl:'',
			goods_id:0,
			createtime:'',
		}],
    style: {
      pageHeight: 0,
      contentViewHeight: 0,
      footViewHeight: 90,
      mitemHeight: 0,
    }, 
    touchstop:false,
    lastX:0,
    lastY:0,
    page:1,
    rpage_num:1,
    pagesize:20,
  },

  onLoad: function(options) {
    var that = this
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
		var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
		var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
		var mqtt_goodsid = options.goods_id ? options.goods_id : that.data.mqtt_goodsid
    var current_date = util.formatTime(new Date())
    var mqtt_mid = options.m_id ? options.m_id : that.mqtt_mid;
		var goods_name = options.goods_name ? options.goods_name : ''
		var goods_owner = options.goods_owner ? options.goods_owner : ''
		var goods_shop_id = options.goods_shop_id ? options.goods_shop_id : 0			
		var from_username = options.from_username ? options.from_username : that.from_username;
		var from_nickname = options.from_nickname ? options.from_nickname : that.from_nickname;
		var from_headimg = options.from_headimg ? options.from_headimg : that.from_headimg;
		var qun_type = options.qun_type ? options.qun_type : '1'
		var is_customer = options.customer ? options.customer : '0'
		var bar_title = goods_name?goods_name.substring(0,12):''
    var frompage = options.frompage ? options.frompage : ''     
     
    let screen_para=wx.getSystemInfoSync()
    let scrollHeight = screen_para.windowHeight - 80
    let style ={
      pageHeight : screen_para.windowHeight,
      contentViewHeight : screen_para.windowHeight - 80
    }
   
    that.setData({
      mqtt_mid: mqtt_mid,
      mqtt_goodsid:mqtt_goodsid,
      goods_name:goods_name,
      goods_owner:goods_owner,
      goods_shop_id:goods_shop_id,
      from_username:from_username,
      from_nickname:from_nickname,
      from_headimg:from_headimg,
      is_customer:is_customer,
      qun_type:qun_type,
      bar_title:bar_title,
      frompage:frompage,
      style:style,
      scrollHeight:scrollHeight
    })
    that.webSocket_open()
    if(that.data.mqtt_goodsid || that.data.goods_owner){
      that.data.page =  1
      that.get_wechat_list()
    }
    if(is_customer == '1'){
      that.update_goods_custservice()
    }
    bar_title = is_customer=='1'?that.data.bar_title+'_用户':that.data.bar_title+'_客服'
		wx.setNavigationBarTitle({
				title: bar_title
		})
    heartbeat_timer = setInterval(function () {
      that.heartbeat()
    }, 10*1000)
  },

  onShow: function(e) {
    var that = this
    onHide_s = false
  },
 
  onHide: function() {
    var that = this
    console.log('onHide')
  },

  onUnload: function() {
    var that = this
    clearInterval(heartbeat_timer)
    console.log('onUnload')
    that.close();
  },
  // 页面加载完成
  onReady: function() {
    var that = this
    that.on_recorder();
  },

  handletouchmove: function (event) {
    var that = this
    var currentX = event.touches[0].pageX
    var currentY = event.touches[0].pageY
    var tx = currentX - this.data.lastX
    var ty = currentY - this.data.lastY

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
   
    that.data.lastX = currentX
    that.data.lastY = currentY
    //console.log('currentX:', currentX, 'currentY:', currentY, 'ty:', ty, ' page:', page, ' rpage_num:', rpage_num)
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
    this.setData({
        touchstop: true,
    })
  },

  message_scroll_auto: function () {
    // 获取scroll-view的节点信息
    //创建节点选择器
    var that = this 
    var cur_message_num = chat_messages.length
    var message_scrollTop = that.data.lastY + (cur_message_num)*50 //避免显示空行造成的偏差 
    var query = wx.createSelectorQuery();
    query.select('#chat_view').boundingClientRect()
    query.select('#chat_message_list').boundingClientRect()
    query.exec((res) => {
      var containerHeight = res[0].height;
      var listHeight = res[1].height;
      
      // 滚动条的高度增加
      if (message_scrollTop > listHeight - containerHeight) {
        if (wx.pageScrollTo) {
          wx.pageScrollTo({
              scrollTop: message_scrollTop ,
              duration:300,
          })          
        } else {
          wx.showModal({
              title: '提示',
              content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
          })
        }
      }
      //console.log('wechat/wechat message_scroll_auto() containerHeight:', containerHeight, ' listHeight:', listHeight, ' message_scrollTop:', message_scrollTop, ' cur_message_num:', cur_message_num)
    })
   
  },
  // 创建websocket
  webSocket_open: function () {
    var that = this
    console.log(' wechat/wechat webSocket_open 开始创建')
    // 创建Socket
    SocketTask = wx.connectSocket({
      url: wssurl+'/wss',
      header: {
        'content-type': 'application/json'
      },
      method: 'post',
      success: function(res) {
        console.log('wechat/wechat WebSocket连接创建', res)
      },
      fail: function(err) {
        wx.showToast({
          title: '网络异常！',
        })
        console.log('wechat/wechat error 网络异常！'+err)
      },
    })
    that.initSocketMessage();
  },
 
  
	// 获取焦点时把选择框全部隐藏
	closeUse : function(e){
		// this.setData({
		// 	openLook : false , 
		// })
	} , 
	// 失去焦点时获取输入框的光标位置
	inputBlur: function(e){
		this.cursor = e.detail.cursor;
  } , 
  
  	// 更改Input
	changeInput : function(e){
    var that = this
		var inputValue = e.detail.value;
		that.setData({
      inputValue: inputValue
		})
  } , 
  
  // 提交文字
  getInputMessage: function() {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
    var current_date = util.formatTime(new Date())
    var is_customer = that.data.is_customer
    var inputValue = that.data.inputValue;
    if (inputValue == "") {
      return
    }
    
    let user = is_customer=='1'?'customer':'home'
		var inputmessage = {
				user:user,
				type: 'text',
				content: inputValue ,
				imageurl: '',
				hasSub: false,
        subcontent: '',
        from_nickname:userInfo.nickName,
        from_headimg:userInfo.avatarUrl,
        createtime:current_date,
		}
		console.log('getInputMessage inputmessage:'+JSON.stringify(inputmessage))
    that.getSocketMessage(inputmessage)
  },
 
  getSocketMessage: function (Msginfo = {}) { //获取子组件的输入数据
    var that = this
    if(!Msginfo) { 
      return
    } 
    
    console.log('getSocketMessage Msginfo:'+JSON.stringify(Msginfo))
    if(socketOpen) {
      that.addMessage(Msginfo)	
    } else {
      console.log('getSocketMessage 掉线了 socketOpen:'+socketOpen+' socketMsgQueue:'+JSON.stringify(socketMsgQueue));
      wx.showToast({
        title: '掉线了,正在重连',
        icon: 'loading',
        duration: 2000
      })
      that.webSocket_open()
    }				
  },

  addMessage: function (msg={}) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = that.data.mqtt_mid
    var goods_id = that.data.mqtt_goodsid
    var goods_owner = that.data.goods_owner
    var mqtt_pub_title = that.data.mqtt_goodsid+'_'+that.data.mqtt_mid
    var shop_type = that.data.shop_type
    var current_date = util.formatTime(new Date())
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
    var is_customer = that.data.is_customer

    if(msg.content!='') {
      msg.content = util.filterEmoji(msg.content); //去除表情符
    }else{
        return
    }
    
    var message = {
      user: msg.user?msg.user:'',
      type:msg.type?msg.type:'',
      content: msg.content?msg.content:'',
      hasSub: msg.hasSub?msg.hasSub:'',
      subcontent: msg.subcontent?msg.subcontent:'',
      imageurl:msg.imageaddr?msg.imageaddr:msg.imageurl,
      from_headimg:msg.from_headimg!=''?msg.from_headimg:'',
      from_nickname:msg.from_nickname!=''?msg.from_nickname:'',
      from_username:msg.from_username?msg.from_username:'',
      createtime:msg.createtime?msg.createtime:current_date
    }
    
    let websocket_pub_message = {
      message_type: 2,  //商品服务群
      username: username,
      to_username:that.from_username,
      m_id:m_id,
      shop_type: shop_type,
      title: mqtt_pub_title,
      goods_id:goods_id,
      goods_owner:goods_owner,
      content_type:msg.type,
      content: msg.content,
      imageurl:msg.imageurl,
      user:msg.user,
      from_headimg:userInfo.avatarUrl,
      from_nickname:userInfo.nickName,
      from_username:username,
      createtime:current_date
    }
    //console.log('addMessage userInfo:'+JSON.stringify(userInfo))
    let chat_msg_last = chat_messages.length - 1
    if(chat_messages[chat_msg_last]['content']!=message['content']) chat_messages.push(message) //避免重复数据

    that.setData({
      messages:chat_messages,
    },function(){
      that.message_scroll_auto()
    })
 
    //console.log('chatroomservice addMessage messages len:'+chat_messages.length+' info:'+JSON.stringify(chat_messages))
    if(!socketOpen) {
      console.log('chatroomservice addMessage() 掉线了 socketOpen: '+socketOpen)
      console.log('chatroomservice addMessage socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      that.webSocket_open()
      return
    } 		
     
    if((msg.user=='home' && is_customer != '1')|| (msg.user=='customer' && is_customer == '1')){
      let socket_message = JSON.stringify(websocket_pub_message)
      socketMsgQueue.push(socket_message);
      console.log('chatroomservice addMessage socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      that.sendSocketMessage()	
    }
     
    setTimeout(function () {
      that.message_scroll_auto()
    }, 300)
  },

  heartbeat: function () {
    //心跳信息
    var that = this
		var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
		var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
		var current_date = util.formatTime(new Date())
    
    let websocket_heart_message = {
      message_type: 2,  //商品服务群
      username: username,
      m_id:that.data.mqtt_mid,
      shop_type: shop_type,
      //title: mqtt_pub_title,
      goods_id:that.data.mqtt_goodsid,
      //goods_owner:that.goods_owner,
      content: 'sh_gds_heartbeat',
      //imageurl:'',
      user:'home',
      //from_headimg:userInfo.avatarUrl,
      //from_nickname:userInfo.nickName,
      //from_username:username,
      createtime:current_date
    }
    if(!socketOpen){
      that.webSocket_open()
      return
    }
    wx.sendSocketMessage({
      data: JSON.stringify(websocket_heart_message), //自身定义一个发送消息对象
      success: function(res) {								
        //console.log('chatroomservice WebSocket发送完成！socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      },
      fail: function(error) {
        socketOpen = false;
        getApp().globalData.websocketOpen = socketOpen
        console.log('wechat/wechat WebSocket heart beat 发送失败！res:'+JSON.stringify(error))
        wx.showToast({
          title: '网络故障',
          icon: 'loading',
          duration: 1500
        })	
        return						
      }
    })
  },

  // socket监听事件
  initSocketMessage : function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
		var uid = username + '_' + shop_type+'_'+that.data.mqtt_goodsid

    console.log("wechat/wechat initSocketMessage", SocketTask)
    SocketTask.onOpen(res => {
      socketOpen = true;
      open_num++
      wx.sendSocketMessage({
        data: uid
      })
      console.log('wechat/wechat WebSocket 已连接', res,uid)
    })
    SocketTask.onClose(onClose => {
      console.log('wechat/wechat WebSocket 连接关闭。', onClose)
      session = null;
      SocketTask = false;
      socketOpen = false;
    })
    SocketTask.onError(onError => {
      console.log('wechat/wechat WebSocket 错误信息', onError)
      session = null;
    })
    SocketTask.onMessage(res => {
      let username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      let is_customer = that.data.is_customer
      let recv_message = res.data?JSON.parse(res.data, true):''	
      let current_date = util.formatTime(new Date())					 
			console.log('chatroomservice 收到服务器内容：' + res.data+' rcv_message_content：'+rcv_message_content)
			if(recv_message['d'] ){				 //&& recv_message['d']['content'][0]['content'] != rcv_message_content
        rcv_message_content = recv_message['d']['content'][0]['content']	 //避免重复接收
				let reply_message = {
				  user: recv_message['d']['user'],
				  type:recv_message['d']['type']?recv_message['d']['type']:'text',
				  content: recv_message['d']['content']?recv_message['d']['content']:'感谢您的支持',
				  imageurl: recv_message['d']['imageurl']?recv_message['d']['imageurl']:'',
				  hasSub: recv_message['d']['hasSub']?recv_message['d']['hasSub']:false,
          subcontent: recv_message?recv_message['d']['type']:'',
          from_nickname:recv_message?recv_message['d']['from_nickname']:'',
          from_headimg:recv_message?recv_message['d']['from_headimg']:'',
          imageaddr:'',
        }
       
	      console.log('chatroomservice 收到来自' + reply_message['user'] + '的消息' + JSON.stringify(reply_message)+' is_customer:'+is_customer+' current_date:'+current_date)
			  if((reply_message['user']=='customer' && is_customer!='1') || (reply_message['user']=='home' && is_customer=='1')){
					that.addMessage(reply_message)	
			  } 
			}
    })
  },

  sendSocketMessage: function () {
    var that = this;
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
   
    if (!socketOpen) {
      //console.log('chatroomservice sendSocketMessage socketOpen:'+socketOpen);
      that.webSocket_open()
    } else {
      //console.log('chatroomservice sendSocketMessage socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      socketMsgLen = socketMsgQueue.length
      if(socketMsgLen > 0){
        let resend_msg = socketMsgQueue
        for (var i = 0; i < resend_msg.length; i++) {
          let socket_message = resend_msg[i]
          //console.log('chatroomservice sendSocketMessage i:'+i+' socket_message:'+socket_message);
          wx.sendSocketMessage({
            data: socket_message, //自身定义一个发送消息对象
            success: function(res) {									
              socketMsgQueue.splice(i, 1)
              socketMsgLen--
              if(socketMsgLen == 0) {
                socketMsgQueue = [] //发送完成清零
                that.setData({
                  inputValue:''
                })
              }
              console.log('chatroomservice WebSocket 发送完成！socketMsgQueue:'+JSON.stringify(socketMsgQueue))
            },
            fail: function(error) {
              socketOpen = false;
              getApp().globalData.websocketOpen = socketOpen
              console.log('chatroomservice WebSocket 发送失败！res:'+JSON.stringify(error))
              wx.showToast({
                title: '网络故障',
                icon: 'loading',
                duration: 1500
              })
              that.webSocket_open()
              return
            }
          })
        }						
        //console.log('chatroomservice sendSocketMessage is_sending:'+is_sending+' socketMsgQueue:'+JSON.stringify(socketMsgQueue));
      }
    }
  },

  //查询历史记录
  get_wechat_list: function () { 
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type 
    var page = that.data.page==0?1:that.data.page
    var pagesize = that.data.pagesize>0?that.data.pagesize:30			
    var goods_id = that.data.mqtt_goodsid
    var goods_owner = that.data.goods_owner
    var m_id = that.data.mqtt_mid
    var from_username = that.data.from_username
    console.log('wechat/wechat get_wechat_list username:'+username)
    wx.request({
      url: weburl + '/api/mqttservice/get_wechat_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        m_id:m_id,
        goods_id:goods_id,
        goods_owner:goods_owner,
        from_username:from_username,
        page: page,
        pagesize: pagesize,
        shop_type: shop_type , 
        query_type:'APP' ,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var wechat_list = res.data.result;
        var all_rows = res.data.all_rows
        console.log('get_wechat_list wechat_list:'+JSON.stringify(wechat_list))
        
        if (wechat_list) {	
          var len = wechat_list.length
          if(page == 1){
            chat_messages = [{}]
          }
          
          for (var i = 0; i < len; i++) {
             //console.log('i:'+i+' wechat info:'+ wechat_list[i])
             if(wechat_list[i]['content'][0]['content']!='' || wechat_list[i]['content'][0]['imageurl']!=''){
                let message = {
                  user: wechat_list[i]['user'],
                  avatarUrl:wechat_list[i]['avatarUrl'],
                  type:wechat_list[i]['type'],
                  content: wechat_list[i]['content'][0]['content'],
                  hasSub: wechat_list[i]['hasSub'],
                  subcontent: wechat_list[i]['subcontent'],
                  imageurl:wechat_list[i]['content'][0]['imageurl'],
                  createtime:wechat_list[i]['content'][0]['createtime'],
                  from_nickname:wechat_list[i]['from_nickname'],
                  from_headimg:wechat_list[i]['from_headimg'],
               } 
               chat_messages.unshift(message)                                
             }
          }
          that.setData({
            messages:chat_messages
          })
        }else{
          page = page>1?page-1:1 
        }
        that.setData({
          page:page
        })
        that.initSocketMessage()
      }
    })
  },

  update_goods_custservice: function() {
		var that = this
		var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
		var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
		var shop_type = that.data.shop_type; 	
		var goods_id = that.data.mqtt_goodsid?that.data.mqtt_goodsid:0
		var goods_shop_id = that.data.goods_shop_id?that.data.goods_shop_id:0
    var goods_owner = that.data.goods_owner?that.data.goods_owner:''
    var is_customer = that.data.is_customer
		if(is_customer !='1') return 
		wx.request({
			url: weburl + '/api/mqttservice/update_goods_custservice',
			method: 'POST',
			data: {
				username: username,
				access_token: token,
				shop_type: shop_type,
				goods_id: goods_id,
				goods_owner:goods_owner,
				goods_shop_id:goods_shop_id,
			},
			header: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json'
			},
			success: function (res) {
				console.log('wechat/wechat update_goods_custservice：'+ JSON.stringify(res.data.result))
			}
		})
  },
      
  // 点击轮播图
  swiper_item_click: function (e) {
    var id = e.target.id
    console.log(id);
    var item_banners = this.data.listCustmerServiceBanner[id];
    var page = item_banners.page;
    // 类型1、自己小程序、2、其它小程序 3、H5
    switch (item_banners.type) {
      case 1:
        wx.navigateTo({
          url: page,
        })
        break;
      case 2:
        wx.navigateToMiniProgram({
          appId: item_banners.appid,
          path: page,
          extraData: {},
          envVersion: 'release',
          success(res) {
            // 打开成功
          }
        })
        break;
      case 3:
        wx.navigateTo({
          url: web + '?url=' + page,
        })
        break;
    }
  },
  // 关闭
  close: function (e) {
    if (SocketTask) {
      SocketTask.close(function (close) {
        console.log('关闭 WebSocket 连接。', close)
      })
    }
  },
  upimg: function () {
    var that = this
    var new_img_arr = that.new_img_arr
    var img_arr = that.img_arr
        
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      success: function (res) {
        that.new_img_arr = new_img_arr.concat(res.tempFilePaths)
        console.log('本次上传图片:', that.new_img_arr)
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (image) {
            console.log('image width:'+image.width+' heigth:'+image.height);
            if(image.width<4096 && image.height<4096){
              that.upload()
            }else{
              wx.showToast({
                title: '图片大小超过4096*4096',
                icon: 'loading',
                duration: 2000
              })
              that.new_img_arr=[]
            }
          }
        })						
      }
    });
  },
  
  cancel_upimg: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var img_tmp = [];
    var old_img_arr = that.img_arr;
    var j = 0;
    console.log('cancel_upimg:', old_img_arr.length, 'id:', id);
  
    for (var i = 0; i < old_img_arr.length; i++) {
      if (i != id) {
        img_tmp[j++] = old_img_arr[i];
      }
    }			
    that.img_arr = img_tmp
  },
  
  upload: function () {
    var that = this
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
    var goods_id = that.mqt_goodsid
    var new_img_addr = that.new_img_arr; //本次上传图片的手机端文件地址
    var new_img_url = []; //本次上传图片的服务端url
  
    for (var i = 0; i < new_img_addr.length; i++) {
      var count = new_img_addr.length;
      var filePath = new_img_addr[i]
      wx.uploadFile({
        url: uploadurl,
        filePath: filePath,
        name: 'wechat_upimg',
        //formData: adds,
        formData: {
          latitude: encodeURI(0.0),
          longitude: encodeURI(0.0),
          restaurant_id: encodeURI(0),
          city: encodeURI('杭州'),
          prov: encodeURI('浙江'),
          name: encodeURI(goods_id) // 名称
        },
        // HTTP 请求中其他额外的 form data
        success: function (res) {
          var retinfo = JSON.parse(res.data.trim());			
          if (retinfo['status'] == "y") {
            new_img_url.push(retinfo['result']['img_url']);
            that.new_img_url = new_img_url
            let message = {
              user: 'customer',
              type:'image',
              content: '',
              imageurl: retinfo['result']['img_url'],
              imageaddr:filePath,
              hasSub: false,
              subcontent: '',
              from_nickname:userInfo.nickName,
              from_headimg:userInfo.avatarUrl,
            }
            that.addMessage(message)
            count--;
            console.log('图片上传完成:', that.new_img_url, ' count:', count);
          }
        }
      })
    }
    that.new_img_arr=[]
  },
  
  imgYu: function () {
    var imgList = [];
    var imageurl = e.currentTarget.dataset.imageurl;
    imgList.push(imageurl);
    wx.previewImage({
      current: imageurl,
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  // 跳转小程
  minip: function(e) {
    console.log(e)
    wx.navigateToMiniProgram({
      appId: e.target.dataset.appid,
      path: e.target.dataset.path,
      extraData: {},
      envVersion: 'develop',
      success(res) {
        // 打开成功
      }
    })
  },
  // 跳转WEB
  link: function(e) {
    console.log(e.target.id)
    wx.navigateTo({
      url: '../web/web?link=' + e.target.id,
    })
  },
  // 点击加号
  add_icon_click: function(e) {
    console.log(e.target.id)
    // e.target.id == 1 点击加号   ==2  点击 X
    if (e.target.id == 2) {
      this.setData({
        add: true,
        cross: false,
        input_bottom: 0
      })
    } else if (e.target.id == 1) {
      this.setData({
        add: false,
        cross: true,
        input_bottom: 240
      })
    }
  },
  
  // 拨打电话
  phone_click: function() {
    var that = this;
    wx.showModal({
      title: '',
      content: '是否拨打' + that.data.staffServicePhone + '人工客服电话',
      success: function(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: that.data.staffServicePhone //仅为示例，并非真实的电话号码  
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 输入框
  bindKeyInput: function(e) {
    console.log(e.detail.value)
    if (e.detail.value == "") {
      this.setData({
        if_send: false,
        inputValue: e.detail.value
      })
    } else {
      this.setData({
        if_send: true,
        inputValue: e.detail.value
      })
    }
  },
  // 获取到焦点
  focus: function(e) {
    var that = this;
    console.log(e.detail.height)
    this.setData({
      focus: true,
      add: true,
      cross: false,
      input_bottom: e.detail.height
    })
  },
  // 失去焦点
  no_focus: function(e) {
    if (this.data.cross) {
      this.setData({
        focus: false,
        input_bottom: 240,
      })
    } else {
      this.setData({
        focus: false,
        input_bottom: 0
      })
    }
  },
 
  hide_bg: function() {
    var that = this
    that.setData({
      block: false
    })
  },
  // 点击录音事件
  my_audio_click: function(e) {
    console.log('my_audio_click执行了', e)
    var index = e.currentTarget.dataset.id;
    console.log('url地址', this.data.allContentList[index].audio);
    innerAudioContext.src = this.data.allContentList[index].audio
    innerAudioContext.seek(0);
    innerAudioContext.play();
  },
  // 手指点击录音
  voice_ing_start: function() {
    var that = this;
    this.setData({
      voice_ing_start_date: new Date().getTime(), //记录开始点击的时间
    })
    const options = {
      duration: 10000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 24000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 12, //指定帧大小，单位 KB
    }
    recorder.start(options) //开始录音
 
    this.animation = wx.createAnimation({
      duration: 1200,
    }) //播放按钮动画
    that.animation.scale(0.8, 0.8); //还原
    that.setData({
 
      spreakingAnimation: that.animation.export()
    })
  },
  // 录音监听事件
  on_recorder: function() {
    var that = this;
    recorder.onStart((res) => {
      console.log('开始录音');
    })
    recorder.onStop((res) => {
      console.log('停止录音,临时路径', res.tempFilePath);
      // _tempFilePath = res.tempFilePath;
      var x = new Date().getTime() - this.data.voice_ing_start_date
      if (x > 1000) {
        that.data.allContentList.push({
          is_my: true,
          audio: res.tempFilePath,
          length: x / 1000 * 30
        });
        that.setData({
          allContentList: that.data.allContentList
        })
      }
    })
    recorder.onFrameRecorded((res) => {
      var x = new Date().getTime() - this.data.voice_ing_start_date
      if (x > 1000) {
        console.log('onFrameRecorded  res.frameBuffer', res.frameBuffer);
        string_base64 = wx.arrayBufferToBase64(res.frameBuffer)
 
        // console.log('string_base64--', wx.arrayBufferToBase64(string_base64))
        if (res.isLastFrame) {
          that.session_pro.then(function(session) {
            var data = {
              audioType: 3,
              cmd: 1,
              type: 2,
              signType: 'BASE64',
              session: session,
              body: string_base64,
            }
            console.log('that.data.allContentList', that.data.allContentList)
            that.sendSocketMessage(data)
          })
          // 进行下一步操作
        } else {
          that.session_pro.then(function(session) {
            var data = {
              cmd: 1,
              audioType: 2,
              type: 2,
              signType: 'BASE64',
              session: session,
              body: string_base64
            }
            console.log('录音上传的data:', data)
            that.sendSocketMessagesendSocketMessage(data)
          })
        }
      }
    })
  },
  // 手指松开录音
  voice_ing_end: function() {
    var that = this;
    that.setData({
      voice_icon_click: false,
      animationData: {}
    })
    this.animation = "";
    var x = new Date().getTime() - this.data.voice_ing_start_date
    if (x < 1000) {
      console.log('录音停止，说话小于1秒！')
      wx.showModal({
        title: '提示',
        content: '说话要大于1秒！',
      })
      recorder.stop();
    } else {
      // 录音停止，开始上传
      recorder.stop();
    }
  },
  // 点击语音图片
  voice_icon_click: function() {
    this.setData({
      voice_icon_click: !this.data.voice_icon_click
    })
  },

})