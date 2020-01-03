var wxparse = require("../../wxParse/wxParse.js");
var util = require('../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl
var playerurl = app.globalData.playerurl
var appid = app.globalData.appid
var appsecret = app.globalData.secret
var user_type = app.globalData.user_type ? app.globalData.user_type : 0;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0 ;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var userauth = wx.getStorageSync('userauth') ? wx.getStorageSync('userauth') : '';
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]

function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
/*
{
  color: '#000000', // 默认黑色
  content: '', // 弹幕内容
  image: {
    head: {src, width, height}, // 弹幕头部添加图片
    tail: {src, width, height}, // 弹幕尾部添加图片
    gap: 4 // 图片与文本间隔
  }
}
*/

Page({
  barrage:'',
  data: {
    nickName: userInfo.nickName,
    refername:'',
    liveid:'3954',
    streamname:'sendheart_3989.m3u8',
    playerurl: playerurl,
    videourl:'',
    liveurl: '',
    live_goods:'',
    errorhidden:true,
    error_message:'',
    poster_image: weburl+'/uploads/video_poster_image.png',
    inputValue:'欢迎光临送心礼物',
    danmuServ:[],
    danmuList:[],
    page: 1,
    pagesize: 10,
    pageoffset:0,
    goods_page: 1,
    goods_pagesize: 20,
    goods_all_rows:0,
    venuesItems: [],
    share_title:'送心礼物视频分享',
    share_image: weburl + '/uploads/video_share_image.png',
    share_desc:'送心礼物期待您的光临',
    share_logo: weburl + '/uploads/video_share_logo.png',
    danmustatus:true,
    tanmuHidden:true,
    goods_num:1,
    live_members:1,
    modalGoodsHidden:true,
    modalDanmuHidden: false,
    loadingHidden: true, // loading
    goods_scrollTop: 0,
    current_goods_scrollTop:0,
    is_goods_loading: false,
    danmu_scrollTop: 0,
  },
  /*
  onReady(res) {
    this.ctx = wx.createLivePlayerContext('player')
  },
  */
  onLoad: function (options){
    var that = this 
    var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
    var liveid = options.liveid ? options.liveid:'3954'
    var live_goods = options.live_goods ? options.live_goods : ''
    var live_name = options.live_name ? options.live_name : '送心礼物'
    var live_poster = options.live_poster ? options.live_poster : that.data.poster_image
    var live_desc = options.live_desc ? options.live_desc : that.data.share_desc
    var live_logo = options.live_logo ? options.live_logo : that.data.share_logo
    var playerurl = that.data.playerurl
    var streamname = options.liveid ? 'sendheart_' + liveid +'.m3u8':that.data.streamname
    var refername = options.refername ? options.refername:''
    that.setData({
      nickName: userInfo.nickName,
      liveurl: playerurl + '/' + streamname,
      live_goods: live_goods,
      live_name: live_name,
      live_poster: live_poster,
      live_desc: live_desc,
      live_logo: live_logo,
      liveid: liveid,
      refername: refername,
    })
    that.query_liveroom_info()
    that.get_goods_list()
    that.join_liveroom()
    console.log('player onLoad videourl:', that.data.videourl, ' liveid:', liveid, ' live_logo:', live_logo, ' live_name:', live_name, ' live_desc:', live_desc)
  },
  onShow: function () {
    var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        let winWidth = res.windowWidth;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight,
          winHeight: winHeight,
          winWidth: winWidth,
        })
      }
    })
  },

  onReady: function () {
    var that = this
    that.videoContext = wx.createVideoContext('myVideo')
    const barrageComp = that.selectComponent('.barrage')
    that.barrage = barrageComp.getBarrageInstance({
      font: 'bold 14px sans-serif',
      duration: 20,
      lineHeight: 2,
      mode: 'separate',  // 弹幕重叠 overlap  不重叠 separate
      padding: [10, 0, 10, 0], // 弹幕区四周留白
      range: [0, 0.3], // 弹幕显示的垂直范围，支持两个值。[0,1]表示弹幕整个随机分布，
      tunnelShow: false, // 显示轨道线
      tunnelMaxNum: 50, // 隧道最大缓冲长度
      maxLength: 50, // 弹幕最大字节长度，汉字算双字节
      safeGap: 4, // 发送时的安全间隔
    })
    setTimeout(function () {
      that.queryDanmu()
    }, 1000)
  },
  query_liveroom_info: function (event) {
    //venuesList
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var liveid = that.data.liveid
    
    wx.request({
      url: weburl + '/api/client/get_liveroom_list',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        liveid: liveid,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('query_liveroom_info:', res.data)
        if (res.data.status!='y') {
          that.setData({
            videourl: that.data.liveurl,
          }) 
          return
        }
        //var venuesItems = that.data.venuesItems
        var liveinfo = res.data.result
        if (liveinfo && liveinfo[0]['live_status']!=1) {
          var videourl = liveinfo[0]['videourl']
          that.setData({ 
            videourl: videourl ? videourl:that.data.liveurl,
          })            
        }else{
          that.setData({
            videourl: that.data.liveurl,
          }) 
        }
      },
      fail:function(e){
        that.setData({
          videourl: that.data.liveurl,
        }) 
      }
    })
  },
  join_liveroom: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var liveid = that.data.liveid
    var refername = that.data.refername

    wx.request({
      url: weburl + '/api/client/post_join',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        liveid: liveid,
        refername: refername,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('join_liveroom 签到完成:', res.data)
       
      },
      fail: function (e) {
        console.log('join_liveroom 签到失败:', res.data)
      }
    })
  },
  focus_liveroom: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var liveid = that.data.liveid
    var refername = that.data.refername

    wx.request({
      url: weburl + '/api/client/post_focus',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        liveid: liveid,
        refername: refername,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log('join_liveroom 关注完成:', res.data)

      },
      fail: function (e) {
        console.log('join_liveroom 关注失败:', res.data)
      }
    })
  },
  prize_liveroom: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var liveid = that.data.liveid
    var post_type = '2' //直播点赞
  
    wx.request({
      url: weburl + '/api/client/post_prize',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        post_id: liveid,
        post_type: post_type, 
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('prize_liveroom 点赞完成:', res.data)

      },
      fail: function (e) {
        console.log('prize_liveroom 点赞失败:', res.data)
      }
    })
  },
  goodslist: function (e) {
    var that = this
    var live_goods = that.data.live_goods
    wx.navigateTo({
      url: '../goods/list/list?live_goods=' + live_goods  
    })
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
    var image = e.currentTarget.dataset.image ? e.currentTarget.dataset.image : ''

    var sku_id = objectId
    wx.navigateTo({
      url: '/pages/details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_shape=' + goods_shape + '&goods_org=' + goods_org + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&name=' + goods_name + '&image=' + image + '&token=' + token + '&username=' + username
    })
  },

  get_goods_list: function (event) {
    //venuesList
    var that = this
    var goods_page = that.data.goods_page
    var goods_pagesize = that.data.goods_pagesize
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var live_goods = that.data.live_goods
    that.setData({
      loadingHidden: false,
      is_goods_loading: true,
    })
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        live_goods: live_goods,
        username: username,
        access_token: token,
        page: goods_page,
        pagesize: goods_pagesize,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('get_goods_list:', res.data)
        var venuesItems = res.data.result
        var all_rows = res.data.all_rows
        if (!venuesItems) {
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 2000
          })
          that.setData({
            venuesItems: [],
            goods_all_rows: 0,
          })
          return
        }

        for (var i = 0; i < venuesItems.length; i++) {
          if (!venuesItems[i]['goodsno']) {
            venuesItems[i]['goodsno'] = i+1
          } 
          if (!venuesItems[i]['act_info']) {
            venuesItems[i]['act_info'] = ''
          } 
          if (!venuesItems[i]['goods_tag']) {
            venuesItems[i]['goods_tag'] = ''
          } else {
            venuesItems[i]['goods_tag'] = venuesItems[i]['goods_tag'].substring(0, 10)
          }
          venuesItems[i]['image'] = venuesItems[i]['activity_image'] ? venuesItems[i]['activity_image'] : venuesItems[i]['image']
          if (venuesItems[i]['image'].indexOf("http") < 0) {
            venuesItems[i]['image'] = weburl + '/' + venuesItems[i]['image'];
          }
        }
        if (goods_page > 1 && venuesItems) {
          //向后合拼
          venuesItems = that.data.venuesItems.concat(venuesItems);
        }
        that.setData({
          venuesItems: venuesItems,
          goods_all_rows: all_rows,
          goods_num: (all_rows - goods_page) * goods_pagesize + venuesItems.length ,
          goods_page:goods_page ,
          loadingHidden: true,
          is_goods_loading: false,
        })
      }
    })
  },
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var goods_page = that.data.goods_page + 1;
    var goods_all_rows = that.data.goods_all_rows
    var is_goods_loading = that.data.is_goods_loading
    if (is_goods_loading) return
    if (goods_page > goods_all_rows) {
      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了'
      })
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
      }, 1000)
      return
    }

    that.setData({
      goods_page: goods_page,
    });
    that.get_goods_list()
  },
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var goods_page = that.data.goods_page + 1;
    var goods_all_rows = that.data.goods_all_rows
    var is_goods_loading = that.data.is_goods_loading
    if (is_goods_loading) return
    if (goods_page > goods_all_rows) {
      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了'
      })
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
      }, 1000)
      return
    }

    that.setData({
      goods_page: goods_page,
    });
    that.get_goods_list()
  },
  addBarrage: function() {
    var that = this 
    var inputValue = that.data.inputValue
    var danmuList = that.data.danmuList
    var nickName = that.data.nickName ? that.data.nickName+':':''
    if (inputValue!=''){
      var cur_danmu = {
        content: inputValue,
        color: '#fffff'
      }
      danmuList.push(cur_danmu)
      console.log('本地弹幕:', danmuList)
    }
   
    //that.barrage.open()
    //that.barrage.addData(danmuList)
    that.setData({
      inputValue: '',
      //danmuList:[],
    })
  },
  
  //点击播放按钮，封面图片隐藏,播放视频
  bindPlay: function (e) {
    console.log('detail bindPlay 响应失败', e)
    this.setData({
      tab_image: "none"
    }),
    this.videoContext.play()
  },

  playerror(e) {
    var that = this 
    var error_message = '网络错误!'
    var errorhidden = that.data.errorhidden
    that.setData({
      error_message: error_message,
      errorhidden: !errorhidden,
    })
    this.videoContext.stop()
  },

  playwaiting(e) {
    var that = this
    this.videoContext.stop()
    this.videoContext = wx.createVideoContext('myVideo')
    this.videoContext.play()
  },
  errorConfirmPlay(e) {
    var that = this
    var errorhidden = that.data.errorhidden
    that.setData({
      errorhidden: !errorhidden,
    })
    this.videoContext.stop()
    wx.navigateTo({
      url: '/pages/player/player?liveid='+that.data.liveid+'&live_goods='+that.data.live_goods+'&live_name='+that.data.shop_name+'&live_poster='+that.data.live_poster+'&live_desc='+that.data.live_desc+'&live_logo='+that.data.live_logo 
    })
  },

  errorCancelPlay(e) {
    var that = this
    var errorhidden = that.data.errorhidden
    that.setData({
      errorhidden: !errorhidden,
    })
    wx.navigateBack({
      delta: 1,
    })
  },

  bindInputBlur: function (e) {
    var that = this
    var inputValue = e.detail.value
    that.setData({
      inputValue: inputValue,
    })
  },
  
  bindSendDanmu: function () {
    var that = this
    var inputValue = that.data.inputValue ? that.data.inputValue:''
    var danmustatus = that.data.danmustatus
    if (!danmustatus){
      wx.showToast({
        title: '弹幕已关闭',
        icon: 'loading',
        duration: 2000
      }) 
    }else{
      if (inputValue) {
        that.addBarrage()
        setTimeout(function () {
          that.saveDanmu(inputValue)
        }, 300)
        
        console.log('弹幕信息:', inputValue)
      }
    }
  },
  danmuClose: function () {
    var that = this
    var danmustatus = that.data.danmustatus
    const barrageComp = this.selectComponent('.barrage')
    this.barrage = barrageComp.getBarrageInstance({
      font: 'bold 16px sans-serif',
      duration: 10,
      lineHeight: 2,
      mode: 'separate',
      padding: [10, 0, 10, 0],
      tunnelShow: false
    })
    this.barrage.close()
    that.setData({
      danmustatus: !danmustatus,
    })
    console.log('弹幕关闭 danmuClose')
  },
  saveDanmu: function (danmu) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var nickName = that.data.nickName
    var liveid = that.data.liveid 
    
    if(!danmu) return 
    wx.request({
      url: weburl + '/api/client/save_danmu',
      method: 'POST',
      data: {
        username: username ? username : openid,
        m_id:m_id,
        liveid:liveid,
        access_token: token,
        danmu: danmu,
        nickname: nickName,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 'n') {
          wx.showToast({
            title: res.data.info ? res.data.info : '弹幕上传失败',
            icon: 'none',
            duration: 2000
          }) 
        }else{
          wx.showToast({
            title: '发布成功',
            icon: 'none',
            duration: 1500
          }) 
          var tanmuHidden = that.data.tanmuHidden
          that.setData({
            tanmuHidden: !tanmuHidden
          })
          console.log('弹幕信息保存完成:', that.data.inputValue)
        }
      }
    })
  },
  queryDanmu: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var nickName = this.data.nickName ? this.data.nickName + ':' : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var liveid = that.data.liveid
    var danmuList = that.data.danmuList
    var page = that.data.page
    var pagesize = that.data.pagesize
    var pageoffset = that.data.pageoffset
    var danmustatus = that.data.danmustatus

    if (!danmustatus) return
    console.log('获取服务端弹幕信息 live id:', liveid, 'm_id:', m_id, ' pageoffset:', pageoffset)
    wx.request({
      url: weburl + '/api/client/query_danmu',
      method: 'POST',
      data: {
        username: username ? username : openid,
        m_id: m_id,
        liveid: liveid,
        access_token: token,
        shop_type: shop_type,
        pageoffset: pageoffset,
        page: page,
        pagesize:pagesize,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 'y') {
          var danmuServ = res.data.result
          var pageoffset = res.data.all_rows
          console.log('获取服务端弹幕信息完成:', res.data)
          //console.log('获取服务端弹幕信息完成 live id:', liveid, 'pageoffset:', pageoffset, ' result info:', danmuServ)
          if (danmuServ){
            for (var i = 0; i < danmuServ.length;i++){
              var nickName = danmuServ[i]['nickname'] ? danmuServ[i]['nickname']+':':''
              var background_color = nickName ? getRandomColor() : '#e34c55'
              var cur_danmu = {
                nickname:nickName,
                content: danmuServ[i]['content'],
                color: getRandomColor() ,
                background_color: background_color,
              }
              danmuList.push(cur_danmu)
            }
          }
          that.setData({
            danmuList: danmuList,
            pageoffset: pageoffset,
          }, function() { 
            that.addBarrage()
          })
        }  
      }
    })
    setTimeout(function () {
      that.queryDanmu()
    }, 1000 * 30)
  },
 
  goodsinfo(e) {
    var that = this
    var modalGoodsHidden = that.data.modalGoodsHidden
    that.setData({
      modalGoodsHidden: !modalGoodsHidden,
    })
  },
  modalGoodsconfirm: function () {
    this.setData({
      modalGoodsHidden: !this.data.modalGoodsHidden
    })
  }, 

  sendDanmu(e) {
    var that = this
    var tanmuHidden = that.data.tanmuHidden
    that.setData({
      tanmuHidden: !tanmuHidden,
    })
  },
  modalMessageconfirm: function () {
    var that = this
    var tanmuHidden = that.data.tanmuHidden
    that.setData({
      tanmuHidden: !tanmuHidden,
    })
  }, 
  // 获取滚动条当前位置
  goods_scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true,
        hidddensearch: false
      })
    } else {
      this.setData({
        floorstatus: false,
        hidddensearch: true,
      })
    }
    this.setData({
      current_goods_scrollTop: e.detail.scrollTop
    })

  },

  // 获取滚动条当前位置
  danmn_scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true,
        hidddensearch: false
      })
    } else {
      this.setData({
        floorstatus: false,
        hidddensearch: true,
      })
    }
    this.setData({
      current_danmu_scrollTop: e.detail.scrollTop
    })

  },
  onShareAppMessage: function (options) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var liveid = that.data.liveid
    var share_live_image = that.data.live_logo ? that.data.live_logo : that.data.live_poster
    var share_live_title = that.data.live_name ? that.data.live_name:''
    var share_live_desc = that.data.live_desc ? that.data.live_desc:''
    var m_id = that.data.m_id > 0 ? that.data.m_id : 0
    var live_goods = that.data.live_goods
    var live_name = that.data.live_name
    var live_logo = that.data.live_logo
    var live_poster = that.data.live_poster
    var live_desc = that.data.live_desc
    console.log('onShareAppMessage live_logo:', live_logo, ' share_live_desc:', share_live_desc)
    var shareObj = {
      title: share_live_title + '视频',
      desc: share_live_desc,
      imageUrl: share_live_image,
      path: '/pages/hall/hall?liveid=' + liveid + '&live_goods=' + live_goods + '&live_logo=' + live_logo + '&live_poster=' + live_poster + '&live_desc=' + live_desc + '&refername=' + username,
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
      console.log('送心分享', shareObj)
     
    }
    return shareObj;
    // 返回shareObj
    
  }
})