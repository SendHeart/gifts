var app = getApp()
var util = require('../../../utils/util.js')
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
var page = 1
var pagesize =20
var is_loading = false
Page({
  data: {
    shop_type:shop_type,  
    scrollTop: 0,		
    style: {
      pageHeight: 0,
      contentViewHeight: 0,
      footViewHeight: 90,
      mitemHeight: 0,
    }, 
    touchstop:false,
    lastX:0,
    lastY:0,
    wechatList: [],
    wechatList_show:[],
    show_max:20,
    page:page,
    pagesize:pagesize,
    all_rows: 0,
    rall_rows: 0,
    rpage_num: 0,
    page_num:0,   
    inputShowed: false,  // 搜索框值
    search_goodsname:'',
    search_goodsid:'',
  },

  clearInput: function (e) {
    var that = this
    that.setData({
      search_goodsname: '',
      search_goodsid:'',
    })
  },

  search_goodsidTapTag: function (e) {
    var that = this;
    var search_goodsid = e.detail.value
    that.setData({
      search_goodsid: search_goodsid
    })
  },

  search_goodsnameTapTag: function (e) {
    var that = this;
    var search_goodsname = e.detail.value
    that.setData({
      search_goodsname: search_goodsname
    })
  },

  searchTapTag: function (e) {
    var that = this
    console.log('搜索关键字：' + that.data.search_goodsname)
    that.setData({
      page: 1,
    })
    that.query_custservice()
  },

  onLoad: function(options) {
    var that = this
		var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var current_date = util.formatTime(new Date())
    var bar_title = options.bar_title?options.bar_title:''
    var frompage = options.frompage ? options.frompage : ''     
   
    //自定义头部方法
    that.setData({
      navH: app.globalData.navHeight,
      startBarHeight:0, //app.globalData.navHeight,
      startBarHeight2:30,//app.globalData.navHeight+30
    });
    is_loading = false
    let screen_para=wx.getSystemInfoSync()
    let style ={
      pageHeight : screen_para.windowHeight,
      contentViewHeight : screen_para.windowHeight - 80
    }
   
    that.setData({
      bar_title:bar_title,
      frompage:frompage,
      style:style,
      bar_title:'客服列表'
    })
 
		wx.setNavigationBarTitle({
				title: that.data.bar_title
		})
    that.query_custservice()
  },

  onShow: function(e) {
    var that = this
  },
 
  // 页面加载完成
  onReady: function() {
    var that = this
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

  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var page_num = that.data.page_num
    var is_loading = that.data.is_loading
    console.log('getMoreGoodsTapTag 加载更多中，请稍等 page:', page, 'is_loading:', is_loading)
    if (is_loading) {
        return
    }

    if (page > page_num) {
        wx.showToast({
            title: '已经到底了~',
            icon: 'none',
            duration: 1000
        })
        return
    }
    that.setData({
        page: page,
    })
    that.query_custservice()
  },

  handletouchmove: function (event) {
    var that = this
    //var is_loading = that.data.is_loading
    //var page = that.data.page
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
        if (ty < 0 ) {  // text = "向上滑动"
          if (that.data.page < that.data.page_num) {
            that.getMoreGoodsTapTag()
          }
        } else if (ty > 0) {  //text = "向下滑动"
          
        }
    }
    that.setData({
      lastX : currentX,
      lastY : currentY
    })
   
   
    //console.log('currentX:', currentX, 'currentY:', currentY, 'ty:', ty, ' page:', page,' is_loading:',is_loading)
  },

  handletouchstart: function (event) {
    // console.log(event)
  
    this.setData({
        touchstop: false,
        lastX : event.touches[0].pageX,
        lastY : event.touches[0].pageY
    })
  },

  handletouchend: function (event) {
    var that = this
    this.setData({
        touchstop: true,
    })
  },

  showGoods: function (e) {   
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var goods_index = e.currentTarget.dataset.index;
    let wechatlist_info = that.data.wechatList?that.data.wechatList[goods_index]:{}
    var show_goods = {
      goods_id:wechatlist_info['goods_id'],
      goods_shape:wechatlist_info['goods_shape'],			 
      goods_info:wechatlist_info['act_info'],			 
      goods_name:wechatlist_info['name'],
      image:wechatlist_info['activity_image']?wechatlist_info['activity_image']:wechatlist_info['image'],
      token:token,
      username:username
    }
    
    wx.navigateTo({
      url: '/pages/details/details?id=' + show_goods.goods_id + '&goods_shape=' + show_goods.goods_shape + '&goods_info=' + show_goods.goods_info +  '&name=' + show_goods.goods_name + '&image=' + show_goods.image + '&token=' + token + '&username=' + username
    })
  },	
  
  navigateToChatroom: function (e) {
    var that = this
    var goods_index = e.currentTarget.dataset.index
    let wechatlist_info = that.data.wechatList?that.data.wechatList[goods_index]:{} 
    console.log('wechat/wechatList showGoods() goods_index:',goods_index,' wechatlist_info:', wechatlist_info)	
    
    var goods_id = wechatlist_info['goods_id'] 
    var goods_name = wechatlist_info['name'] 
    var goods_owner = wechatlist_info['goods_owner']  
    var from_username = wechatlist_info['username']
    var from_nickname = wechatlist_info['wx_nickname']
    var from_headimg = wechatlist_info['headimgurl']?wechatlist_info['headimgurl']:wechatlist_info['wx_headimg']
    var m_id =  wechatlist_info['m_id']
    
    wx.navigateTo({
      url: '/pages/wechat/wechat?frompage=/pages/customerservice/customerservice&goods_id='+goods_id+'&goods_name='+goods_name+'&goods_owner='+goods_owner+'&from_username='+from_username+'&from_headimg='+from_headimg+'&from_nickname='+from_nickname+'&m_id='+m_id+'&customer=2&is_refresh=1'
    })
  },

  //查询客服列表
  query_custservice: function () { 
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type 
    var page = that.data.page==0?1:that.data.page
    var pagesize = that.data.pagesize>0?that.data.pagesize:20			
    var page_num = that.data.page_num
    var search_goodsname = that.data.search_goodsname
    var search_goodsid = that.data.search_goodsid
    if(is_loading || (page > page_num && page>1)){
      console.log('wechat/wechatList query_custservice() page:', page,' page_num:',page_num,' is_loading:',is_loading)
      return
    }else{
      is_loading = true
    }
    wx.request({
      url: weburl + '/api/mqttservice/query_custservice',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type:shop_type,
        query_type:'chatroom', 
        page: page,
        pagesize: pagesize,
        search_goodsname:search_goodsname,
        search_goodsid:search_goodsid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var wechatList = res.data.result	
        var page_num = res.data.all_rows
     
				if (wechatList) {
						for (var i = 0; i < wechatList.length; i++) {
							if (wechatList[i]['image'].indexOf("http") < 0) {
								wechatList[i]['image'] = weburl + '/' + wechatList[i]['image'];
							}
						}	
           if(page == 1){
              that.setData({
                wechatList:[],
              })
           }
            
           that.setData({
              wechatList:that.data.wechatList.concat(wechatList),
              page_num : page_num,          
            },function(){
              is_loading = false
            })
            console.log('wechat/wechatList query_custservice() wechatList:', wechatList,' page_num:',that.data.page_num)						
				}else{
          wx.showToast({
            title: res.data.info?res.data.info:'没有数据',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    })
  },
})