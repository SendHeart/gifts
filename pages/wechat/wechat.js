var app = getApp();
var util = require('../../utils/util.js');
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var wssurl = app.globalData.wssurl
var socketOpen = false
var socketMsgQueue = []
var sendMsgQueue = []
var chat_messages = []
var uuid = ''
var time_ = "1"
var recorder = wx.getRecorderManager()
var frameBuffer_Data
var session
var  SocketTask
var string_base64
var  open_num = 0
var  submitTo_string
var onUnload_num = 0 
var autoRestart
var onHide_s = false
var is_customer
var heartbeat_timer
const innerAudioContext = wx.createInnerAudioContext() //获取播放对象

Page({
  data: {
    shop_type:shop_type,
    is_customer:0,
    mqtt_mid:0,
    mqtt_goodsid:0,
    messages:[],
    height : '100%' , 
		msg : '' , 
		scrollTop : 0 , 
		looks : app.globalData.looks , //表情包
		activeLook : 'w' , // 选择的表情包分组
		openLook : false , //打开选择表情包
		useLook : false , //选择好后表情包
		cursor : 0 , // 输入光标位置
		count : 0 , // 总人数
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
		var bar_title = that.goods_name?that.goods_name.substring(0,12):''
		var frompage = options.frompage ? options.frompage : ''
      
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
    })
    that.webSocket_open()
    if(is_customer == '1'){
      that.update_goods_custservice()
    }
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
    autoRestart = false;
    onHide_s = true
    console.log('onHide')
  },

  onUnload: function() {
    var that = this
    onUnload_num++;
    autoRestart = false
    clearInterval(heartbeat_timer)
    console.log('onUnload')
    that.close();
  },
  // 页面加载完成
  onReady: function() {
    var that = this
    that.on_recorder();
    that.bottom()
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
 
  // 表情分组
	useLookGroup : function(e){
		var group = e.currentTarget.dataset.group;
		this.setData({
			activeLook : group , 
		})
	} , 
	// 打开表情选择
	openLook : function(){
		var openLook = this.data.openLook;
		openLook = openLook ? false : true;
		this.setData({
			openLook : openLook
		})
	} , 
	// 选中表情
	useLook : function(e){
		let map = e.currentTarget.dataset;
		let value = map.key , msg = this.data.msg , group = map.group , cursor = this.cursor;
		let lookItem = '[' + group + ':' + value + ']';
		if(msg){
			if (cursor > 0) {
				let matchs = msg.substr(0 , cursor) , alldata = msg.substr(cursor , msg.length)
				matchs += lookItem
				msg = matchs + alldata;
			}else{
				msg += lookItem
			}
		}else{
			msg = lookItem
		}
		this.setData({msg : msg});
	} , 
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
      that.addMessage(Msginfo['user'], Msginfo['content'], Msginfo['hasSub'],Msginfo['type'],Msginfo['subcontent'],Msginfo['imageurl'])	
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

  addMessage: function (user='', content='', hasSub='false', subcontent='',type='text',imageurl='',imageaddr='') {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = that.data.mqtt_mid
    var goods_id = that.data.mqtt_goodsid
    var goods_owner = that.data.goods_owner
    var mqtt_pub_title = that.data.mqtt_goodsid+'_'+that.data.mqtt_mid
    var shop_type = that.data.shop_type
    var current_date = util.formatTime(new Date())
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
    var avatarUrl = userInfo.avatarUrl
    var is_customer = that.data.is_customer
    if(content!='') content = util.filterEmoji(content); //去除表情符
    var message = {
      user: user,
      avatarUrl:avatarUrl,
      type:type,
      content: content,
      hasSub: hasSub,
      subcontent: subcontent,
      imageurl:imageaddr?imageaddr:imageurl,
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
      content_type:type,
      content: content,
      imageurl:imageurl,
      user:user,
      from_headimg:userInfo.avatarUrl,
      from_nickname:userInfo.nickname,
      from_username:username,
      createtime:current_date
    }
    //console.log('addMessage message:'+JSON.stringify(message))
    chat_messages.push(message)
    that.messages = chat_messages
    //console.log('chatroomservice addMessage messages len:'+chat_messages.length+' info:'+JSON.stringify(chat_messages))
    if(!socketOpen) {
      console.log('chatroomservice addMessage() 掉线了 socketOpen: '+socketOpen)
      console.log('chatroomservice addMessage socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      that.webSocket_open()
      return
    } 		
     
    if((user=='home' && is_customer != '1')|| (user=='customer' && is_customer == '1')){
      let socket_message = JSON.stringify(websocket_pub_message)
      socketMsgQueue.push(socket_message);
      console.log('chatroomservice addMessage socketMsgQueue:'+JSON.stringify(socketMsgQueue))
      that.sendSocketMessage()
      that.data.inputValue = ''				
    }
     
    setTimeout(function () {
      that.bottom()
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
      //from_nickname:userInfo.nickname,
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
        uni.showToast({
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
			console.log('chatroomservice 收到服务器内容：' + res.data)
			if(recv_message['d']){						
				let reply_message = {
				  user: recv_message['d']['user'],
				  type:recv_message['d']['type']?recv_message['d']['type']:'text',
				  content: recv_message['d']['content']?recv_message['d']['content']:'感谢您的支持',
				  imageurl: recv_message['d']['imageurl']?recv_message['d']['imageurl']:'',
				  hasSub: recv_message['d']['hasSub']?recv_message['d']['hasSub']:false,
			    subcontent: recv_message?recv_message['d']['type']:'',
			  }
	      console.log('chatroomservice 收到来自' + reply_message['user'] + '的消息' + JSON.stringify(reply_message)+' is_customer:'+is_customer)
			  if((reply_message['user']=='customer' && is_customer!='1') || (reply_message['user']=='home' && is_customer=='1')){
					that.addMessage(reply_message['user'], reply_message['content'], reply_message['hasSub'],reply_message['type'],reply_message['subcontent'],reply_message['imageurl'])	
			  } 
			}
      that.bottom();
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
      if(socketMsgQueue.length > 0){
        let resend_msg = socketMsgQueue
        for (var i = 0; i < resend_msg.length; i++) {
          let socket_message = resend_msg[i]
          //console.log('chatroomservice sendSocketMessage i:'+i+' socket_message:'+socket_message);
          wx.sendSocketMessage({
            data: socket_message, //自身定义一个发送消息对象
            success: function(res) {									
              socketMsgQueue.splice(i, 1)
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
  // 解决问题
  is_problem: function(e) {
    console.log('e.target.id', e.currentTarget.dataset.id)
    console.log('item', e.currentTarget.dataset.item)
    var id = e.currentTarget.dataset.id;
    var item = e.currentTarget.dataset.item;
    // id=1 已解决  0 未解决
    var yse_problem = this.data.allContentList[item].yse_problem;
    var no_problem = this.data.allContentList[item].no_problem;
    if (yse_problem || no_problem) {
      console.log(12)
      return
    } else {
      if (id == 1) {
        this.setData({
          ['allContentList[' + item + '].yse_problem']: true
        })
      } else if (id == 0) {
        this.setData({
          ['allContentList[' + item + '].no_problem']: true
        })
      }
      console.log(this.data.allContentList[item].yse_problem, this.data.allContentList[item].no_problem)
      this.bottom();
    }
    var url = app.httpUrl + '/v1/userFeedbackResult.do'
    var data = {
      'session': app.http_session,
      'type': id,
      'uuid': uuid
    }
    console.log('userFeedbackResult提交的数据：', data)
    request(url, 'POST', data, '', function(res) {
      console.log('userFeedbackResult返回的数据：', res.data)
 
    }, function(err) {
      console.log(err)
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
  // 自动添加问题答案
  add_question: function(e) {
    var that = this;
    let answer = e.currentTarget.dataset.answer;
    let messageTime = e.currentTarget.dataset.messagetime;
    let question = e.currentTarget.dataset.question;
    console.log('question:', question, 'answer:', answer, 'messageTime', messageTime);
    this.data.allContentList.push({
      is_my: true,
      text: question
    });
    this.setData({
      allContentList: this.data.allContentList,
      if_send: false,
      inputValue: ''
    })
    that.bottom();
    setTimeout(function() {
      that.data.allContentList.push({
        is_ai: [{
          answer: answer,
          type: 1
        }],
        solve_show: true,
        show_answer: true,
        messageTime: false,
        text: question
      });
      that.setData({
        allContentList: that.data.allContentList,
      })
      that.bottom();
    }, 1000)
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
  // 获取hei的id节点然后屏幕焦点调转到这个节点  
  bottom: function() {
    var that = this
    that.setData({
      scrollTop: 100000
    })
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
//通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
function sendSocketMessage(msg) {
  var that = this;
  if (app.http_session != "") {
    msg.http_session = app.http_session
    console.log('通过 WebSocket 连接发送数据', JSON.stringify(msg))
    SocketTask.send({
      data: JSON.stringify(msg)
    }, function(res) {
      console.log('已发送', res)
    })
  } else {
    app.promise.then(function(http_session) {
      msg.http_session = http_session;
      console.log('通过 WebSocket 连接发送数据', JSON.stringify(msg));
      SocketTask.send({
        data: JSON.stringify(msg)
      }, function(res) {
        console.log('已发送', res);
      })
 
    })
 
  }
}