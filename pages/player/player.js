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
  data: {
    m_id:m_id,
    is_hoster:false,
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
    inputValue:'',
    lotteryValue:'',
    danmuServ:[],
    danmuList:[],
    live_headimg: [],
    live_headimg_max:3,
    page: 1,
    pagesize: 10,
    pageoffset:0,
    goods_page: 1,
    goods_pagesize: 20,
    goods_all_rows:0,
    goods_num: 1,
    venuesItems: [],
    member_page:1,
    member_pagesize:20,
    live_memberList:[],
    live_adv_goods:[], //推广商品
    live_adv_note:[], //广告通知
    share_title:'送心礼物视频分享',
    share_image: weburl + '/uploads/video_share_image.png',
    share_desc:'送心礼物期待您的光临',
    share_logo: weburl + '/uploads/video_share_logo.png',
    danmustatus:true,
    tanmuHidden:true,
    danmu_num:0,
    danmu_num_max: 200, //本地最多保存200条记录
    live_members:1,
    live_members_info:'',
    live_starttime: 0,
    live_focus_status: false,
    live_sub_name:'人气值:1',
    modalGoodsHidden:true,
    modalDanmuHidden: true,
    modalMemberHidden:true,
    modalAdvGoodshidden:true,
    modalAdvNotehidden:true,
    modalHosterHidden:true,
    loadingHidden: true, // loading
    goods_scrollTop: 0,
    current_goods_scrollTop:0,
    member_scrollTop: 0,
    current_member_scrollTop: 0,
    adv_note_scrollTop: 0,
    current_adv_note_scrollTop: 0,
    is_goods_loading: false,
    is_member_loading: false,
    is_danmu_loading: false,
    danmu_scrollTop: 0,
    extClass:"background-color:#333;opacity:0.8;",
    input_focus:true,
  },
  /*
  onReady(res) {
    this.ctx = wx.createLivePlayerContext('player')
  },
  */
  onLoad: function (options){
    var that = this 
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0;
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
      m_id: m_id,
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
    //console.log('options:',options)
    console.log('player onLoad videourl:', that.data.videourl, ' liveid:', liveid, ' live_logo:', live_logo, ' live_name:', live_name, ' live_poster:', live_poster)
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

  danmu_scroll_auto: function () {
    // 获取scroll-view的节点信息
    //创建节点选择器
    var query = wx.createSelectorQuery();
    query.select('.danmu-scroll').boundingClientRect()
    query.select('.danmu-scroll-list').boundingClientRect()
    query.exec((res) => {
      var containerHeight = res[0].height;
      var listHeight = res[1].height;
      // 滚动条的高度增加
       var interval = setInterval(() => {
         if (this.data.danmu_scrollTop < listHeight - containerHeight) {
            this.setData({
              danmu_scrollTop: this.data.danmu_scrollTop + 30
            })
         } else {
            clearInterval(interval);
          /*
            this.setData({
              danmu_scrollTop: 0
            })
          */
         }
       }, 200)
      
    })
  },

  onReady: function () {
    var that = this
    that.videoContext = wx.createVideoContext('myVideo')
    that.query_live_member()
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
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : '';
    var liveid = that.data.liveid
    var is_hoster = that.data.is_hoster
    
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
        //console.log('query_liveroom_info:', res.data)
        if (res.data.status!='y') {
          that.setData({
            videourl: that.data.liveurl,
            live_focus_status:true,  //视频
          }) 
          return
        }
        //var venuesItems = that.data.venuesItems
        var liveinfo = res.data.result
        if (liveinfo[0]['live_status']==2){ //锁定状态
          wx.showToast({
            title: '暂无视频',
            icon: 'none',
            duration: 1500
          }) 
          return
        }
        if (liveinfo[0]['logo'].indexOf("http") < 0) {
          liveinfo[0]['logo'] = weburl + '/' + liveinfo[0]['logo'];
        }
        var live_focus_num = liveinfo[0]['focus_num'] ? liveinfo[0]['focus_num'] : 0 
        var live_focus_status = liveinfo[0]['focus_status'] ? liveinfo[0]['focus_status'] : that.data.live_focus_status 
        live_focus_num = live_focus_num > 10000 ? (live_focus_num / 10000).toFixed(2) : live_focus_num
        var live_sub_name = live_focus_num > 0 ? '人气值:' + live_focus_num : '人气值:1'
        var live_hoster = liveinfo[0]['live_hoster']?liveinfo[0]['live_hoster'].split(','):[]
        for (var i = 0; i < live_hoster.length; ++i) {
          if (m_id==live_hoster[i]) is_hoster = true 
        }
        if (liveinfo && liveinfo[0]['live_status']!=1) { //离线 取视频url
          var videourl = liveinfo[0]['videourl']
          that.setData({ 
            videourl: videourl ? videourl:that.data.liveurl,
            live_logo: liveinfo[0]['logo'],
            live_sub_name: live_sub_name,
            live_focus_status: live_focus_status,
            live_hoster: live_hoster,
            is_hoster: is_hoster,
          }) 
        }else{ //在线
          that.setData({
            videourl: that.data.liveurl,
            live_starttime: liveinfo[0]['endtime'],
            live_logo: liveinfo[0]['logo'],
            live_name: liveinfo[0]['shop_name'] ? liveinfo[0]['shop_name']:'送心礼物' ,
            live_sub_name: live_sub_name,
            live_focus_status: live_focus_status,
            live_hoster: live_hoster,
            is_hoster: is_hoster,
          }, function () {
            that.join_liveroom()
            //that.query_live_member()
          }) 
        }
        //console.log('query_liveroom_info videourl:', videourl, ' live_starttime:', that.data.live_starttime, ' live_logo:', that.data.live_logo, ' live_name:', that.data.live_name, ' live_hoster:', live_hoster, 'is_hoster:',is_hoster)
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
    var live_starttime = that.data.live_starttime
    var sign_type = '1' //1签到
    var refername = that.data.refername

    wx.request({
      url: weburl + '/api/client/sign_in',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        sign_id: liveid,
        live_starttime: live_starttime,
        sign_type: sign_type,
        refername: refername,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        wx.showToast({
          title: '签到完成',
          icon: 'none',
          duration: 1500
        }) 
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
    var live_focus_status = that.data.live_focus_status
    if (live_focus_status) return 

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
        wx.showToast({
          title: '关注成功',
          icon: 'none',
          duration: 1000
        }) 
        that.setData({
          live_focus_status:true,
        })
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
    var post_type = '2' //点赞
  
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
        wx.showToast({
          title: '点赞完成',
          icon: 'none',
          duration: 1500
        }) 
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
  live_refer_goods: function (goods_id) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var liveid = that.data.liveid

    if (!goods_id) return
    wx.request({
      url: weburl + '/api/client/live_refer_goods',
      method: 'POST',
      data: {
        username: username ? username : openid,
        m_id: m_id,
        liveid: liveid,
        access_token: token,
        goods_id: goods_id,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 'n') {
          wx.showToast({
            title: res.data.info ? res.data.info : '商品推荐失败',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '商品推荐完成',
            icon: 'none',
            duration: 1500
          })
          console.log('商品推荐完成:', goods_id)
        }
      }
    })
  },
  showGoods: function (e) {
    var that = this
    var is_hoster = that.data.is_hoster
    // 点击购物车某件商品跳转到商品详情
    var objectId = e.currentTarget.dataset.objectId
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var liveid = that.data.liveid
    var goods_id = e.currentTarget.dataset.goodsId
    var goods_org = e.currentTarget.dataset.goodsOrg
    var goods_shape = e.currentTarget.dataset.goodsShape
    var goods_name = e.currentTarget.dataset.goodsName
    var goods_price = e.currentTarget.dataset.goodsPrice
    var goods_info = e.currentTarget.dataset.goodsInfo
    var goods_sale = e.currentTarget.dataset.sale
    var image = e.currentTarget.dataset.image ? e.currentTarget.dataset.image : ''

    var sku_id = objectId
    if(is_hoster && goods_id>0){ //商品推荐
      that.live_refer_goods(goods_id)
    }else{ //商品详情
      wx.navigateTo({
        url: '/pages/details/details?id=' + goods_id + '&goods_shape=' + goods_shape + '&goods_org=' + goods_org + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&name=' + goods_name + '&image=' + image + '&liveid=' + liveid
      })
    }
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
    var live_adv_goods = {}
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
       // console.log('get_goods_list:', res.data)
        var venuesItems = res.data.result
        var all_rows = res.data.all_rows
        if (!venuesItems) {
          /*
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 2000
          })
          */
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
        //console.log('get_goods_list venuesItems:', that.data.venuesItems)
      }
    })
  },
  query_live_member: function (event) {
    var that = this
    var member_page = that.data.member_page
    var member_pagesize = that.data.member_pagesize
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
    var live_members = that.data.live_members
    var liveid = that.data.liveid
    var liver_starttime = that.data.live_starttime
    var live_memberList = that.data.live_memberList
    var live_type = 1 
    var live_headimg = that.data.live_headimg
    var live_headimg_max = that.data.live_headimg_max
   
    that.setData({
      loadingHidden: false,
      is_member_loading: true,
    })
    wx.request({
      url: weburl + '/api/client/query_live_member',
      method: 'POST',
      data: {
        post_id: liveid,
        post_type: live_type,
        liver_starttime: liver_starttime,
        username: username,
        access_token: token,
        page: member_page,
        pagesize: member_pagesize,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        //console.log('query_live_member:', res.data)
        var live_memberList = res.data.result
        var all_rows = res.data.all_rows
        if (!live_memberList) {
          /*
          wx.showToast({
            title: '没有搜到记录',
            icon: 'loading',
            duration: 2000
          })
          */
          if(member_page==1){
            that.setData({
              live_memberList: [],
              member_all_rows: 0,
            })
          }
          return
        }

        for (var i = 0; i < live_memberList.length; i++) {
          if (live_memberList[i]['wx_headimg'].indexOf("http") < 0) {
            live_memberList[i]['wx_headimg'] = weburl + '/' + live_memberList[i]['wx_headimg'];
          }
          if(i<live_headimg_max){
            if (live_headimg.length > live_headimg_max-1) live_headimg.shift()
            live_headimg.push(live_memberList[i]['wx_headimg'])
          }
        }
        if (member_page > 1 && live_memberList) {
          //向后合拼
          live_memberList = that.data.live_memberList.concat(live_memberList);
        }
        var live_members = (all_rows - member_page) * member_pagesize + live_memberList.length
        live_members = live_members > 10000 ? (live_members / 10000).toFixed(2) : live_members
        var live_members_info = live_members > 10000 ? live_members + '万' : live_members
        that.setData({
          live_headimg: live_headimg,
          live_memberList: live_memberList,
          member_all_rows: all_rows,
          live_members: live_members,
          member_page: member_page,
          loadingHidden: true,
          is_member_loading: false,
          live_members_info:live_members_info,
        })
        //console.log('query_live_member:', live_memberList, ' all_rows:', all_rows, ' live_headimg:', that.data.live_headimg)
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
  
  getMoreMemberTapTag: function (e) {
    var that = this;
    var member_page = that.data.member_page + 1;
    var member_all_rows = that.data.member_all_rows
    var is_member_loading = that.data.is_member_loading
    if (is_member_loading) return
    if (member_page > member_all_rows) {
      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了'
      })
      setTimeout(function () {
        that.setData({
          is_member_loading: true,
        })
      }, 1000)
      return
    }

    that.setData({
      member_page: member_page,
    })
    that.query_live_member()
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
   
    
    that.setData({
      inputValue: '',
    })
  },
  
  //点击播放按钮，封面图片隐藏,播放视频
  bindPlay: function (e) {
    console.log('player bindPlay 响应', e)
    wx.onNetworkStatusChange(function (res) {
      if (res.isConnected){
        this.videoContext.play()
      }else{
        this.playerror(e)
      }
      //console.log(res.isConnected)
      //console.log(res.networkType)
    })
  },


  playerror(e) {
    var that = this 
    var error_message = '网络错误!'
    var errorhidden = that.data.errorhidden
    console.log('player playerror 播放错误', e)
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
    console.log('player playwaiting 播放等待', e)
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
  bindInputDanmu: function (e) {
    var that = this
    var inputValue = e.detail.value
    that.setData({
      inputValue: inputValue,
    })
  },

  bindLotteryBlur: function (e) {
    var that = this
    var lotteryValue = e.detail.value
   
    that.setData({
      lotteryValue: lotteryValue,
    })
   // console.log('bindLotteryBlur:', that.data.lotteryValue)
  },
 
  bindInputLottery: function (e) {
    var that = this
    var lotteryValue = e.detail.value

    that.setData({
      lotteryValue: lotteryValue,
    })
    console.log('bindInputLottery:', that.data.lotteryValue)
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
        setTimeout(function () {
          that.saveDanmu(inputValue)
        }, 300)
        
        console.log('弹幕信息:', inputValue)
      }
    }
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
            tanmuHidden: !tanmuHidden,
            inputValue:'',
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
    var danmu_num_max = that.data.danmu_num_max
    var live_adv_note = []
    var live_adv_goods = []
    var page = that.data.page
    var pagesize = that.data.pagesize
    var pageoffset = that.data.pageoffset
    var danmustatus = that.data.danmustatus
    var is_danmu_loading = that.data.is_danmu_loading
    if (!danmustatus || is_danmu_loading) {
      console.log('弹幕信息正在加载 live id:', liveid, 'm_id:', m_id, ' pageoffset:', pageoffset)
      return 
    }

    that.setData({
      is_danmu_loading:true,
    })
    //console.log('获取服务端弹幕信息 live id:', liveid, 'm_id:', m_id, ' pageoffset:', pageoffset)
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
          //console.log('获取服务端弹幕信息完成:', res.data)
         
          if (danmuServ && danmuServ.danmu){
            for (var i = 0; i < danmuServ.danmu.length;i++){
              var nickName = danmuServ.danmu[i]['nickname'] ? danmuServ.danmu[i]['nickname'] + ':' : ''
              var background_color = nickName ? getRandomColor() : '#e34c55'
              var cur_danmu = {
                nickname: nickName,
                content: danmuServ.danmu[i]['content'],
                color: getRandomColor(),
                background_color: background_color,
              }
              if (danmuList.length > danmu_num_max - 1) {
                danmuList.shift()
              }
              danmuList.push(cur_danmu)
            }
            console.log('获取服务端弹幕信息完成 live id:', liveid, 'pageoffset:', pageoffset, ' danmuList:', danmuList)
          }
          if (danmuServ && danmuServ.adv_note) {
            if (danmuServ.adv_note) { //通知
              for (var i = 0; i < danmuServ.adv_note.length; i++) {
                var cur_adv_note = danmuServ.adv_note[i]['content'] ? JSON.parse(danmuServ.adv_note[i]['content']) : ''
                if (cur_adv_note['image'].indexOf("http") < 0) {
                  cur_adv_note['image'] = weburl + '/' + cur_adv_note['image'];
                }
                live_adv_note.push(cur_adv_note)
              }
            } 
          }
          if (danmuServ && danmuServ.adv_goods) {
            for (var i = 0; i < danmuServ.adv_goods.length; i++) {
              if (danmuServ.adv_goods) { //商品推荐
                var cur_adv_goods = danmuServ.adv_goods[i]['content'] ? JSON.parse(danmuServ.adv_goods[i]['content']) : ''
                if (cur_adv_goods['image'].indexOf("http") < 0) {
                  cur_adv_goods['image'] = weburl + '/' + cur_adv_goods['image'];
                }
                live_adv_goods.push(cur_adv_goods)
                //console.log('获取服务端弹幕信息完成 live id:', liveid, 'danmuList:', danmuList, ' live_adv_goods:', live_adv_goods)
              }
            }
          }
          var danmu_num = that.data.danmu_num + danmuServ.danmu.length
          that.setData({
            danmuList: danmuList,
            pageoffset: pageoffset,
            danmu_scrollTop: danmuServ.length*30,
            danmu_num:danmu_num,
            modalAdvNotehidden: live_adv_note.length>0 ? false : that.data.modalAdvNotehidden,
            live_adv_note: live_adv_note ? live_adv_note : that.data.live_adv_note,
            modalAdvGoodshidden: live_adv_goods.length>0 ? false : that.data.modalAdvGoodshidden,
            live_adv_goods: live_adv_goods ? live_adv_goods : that.data.live_adv_goods,
          }, function() { 
            that.danmu_scroll_auto()
          })
        }
        
        that.setData({
          is_danmu_loading: !that.data.is_danmu_loading,
        })
      }
    })
    setTimeout(function () {
      that.queryDanmu()
      that.query_live_member()
    }, 1000 * 10)
  },
  danmuInfo(e) {
    var that = this
    var modalDanmuHidden = that.data.modalDanmuHidden
    that.setData({
      modalDanmuHidden: !modalDanmuHidden,
      danmu_num:0,
    })
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

  live_member_info(e) {
    var that = this
    var modalMemberHidden = that.data.modalMemberHidden
    that.setData({
      modalMemberHidden: !modalMemberHidden,
    })
  },
  modalMemberconfirm: function () {
    this.setData({
      modalMemberHidden: !this.data.modalMemberHidden
    })
  }, 
  sendDanmu(e) {
    var that = this
    var tanmuHidden = that.data.tanmuHidden
    that.setData({
      tanmuHidden: !tanmuHidden,
      input_focus:true,
    })
  },
  modalMessageconfirm: function () {
    var that = this
    var tanmuHidden = that.data.tanmuHidden
    that.setData({
      tanmuHidden: !tanmuHidden,
    })
  }, 
  // 获取滚动条当前位置 goods
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

  // 获取滚动条当前位置 member
  member_scrolltoupper: function (e) {
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
      current_member_scrollTop: e.detail.scrollTop
    })

  },
  // 获取滚动条当前位置 弹幕
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

  // 获取滚动条当前位置 goods
  adv_note_scrolltoupper: function (e) {
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
      current_adv_note_scrollTop: e.detail.scrollTop
    })
  },
  modalAdvGoodsconfirm: function () {
    var that = this
    var modalAdvGoodshidden = that.data.modalAdvGoodshidden
    var live_adv_goods = that.data.live_adv_goods
    console.log('modalAdvGoodsconfirm:',live_adv_goods)
    live_adv_goods.shift()
    if (live_adv_goods.length==0){
      that.setData({
        modalAdvGoodshidden: !modalAdvGoodshidden
      })
    } else{
      that.setData({
        live_adv_goods: live_adv_goods
      })
    }
  }, 

  modalAdvNoteconfirm: function () {
    console.log('modalAdvNoteconfirm 通知弹窗:', this.data.modalAdvNotehidden)
    this.setData({
      modalAdvNotehidden: !this.data.modalAdvNotehidden
    })
  }, 

  //抽奖
  live_lottery: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var lottery_type = '0'  //默认按关注、在线、点赞抽奖
    var lottery_value = that.data.lotteryValue
    var liveid = that.data.liveid
    //lottery_value = lottery_value.parseInt()
    if (lottery_value==0) {
      wx.showToast({
        title: '中奖人数为空' + that.data.lotteryValue,
        icon: 'none',
        duration: 1500
      })
      return
    }
    wx.request({
      url: weburl + '/api/client/live_lottery',
      method: 'POST',
      data: {
        username: username ? username : openid,
        m_id: m_id,
        liveid: liveid,
        access_token: token,
        lottery_type: lottery_type,
        lottery_value: lottery_value,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 'y') {
          wx.showToast({
            title: '抽奖完成',
            icon: 'none',
            duration: 1500
          })
          var live_adv_note = res.data.result
          var modalAdvNotehidden = that.data.modalAdvNotehidden
          that.setData({
            modalAdvNotehidden: !modalAdvNotehidden,
            live_adv_note: live_adv_note,
          })
          console.log('抽奖完成 live_adv_note:', that.data.live_adv_note) 
        } else {
          wx.showToast({
            title: res.data.info ? res.data.info : '抽奖失败,请重试',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  modalLotteryconfirm: function () {
    var that = this
    var modalHosterHidden = that.data.modalHosterHidden
    that.setData({
      modalHosterHidden: !modalHosterHidden,
    })
  }, 
  hoster_action: function () {
    var that = this
    var modalHosterHidden = that.data.modalHosterHidden
    that.setData({
      modalHosterHidden: !modalHosterHidden,
      modalAdvNotehidden:true,
      lotteryValue:'',
    })
  },
  modalHosterconfirm: function (e) {
    var that = this
    var modalHosterHidden = that.data.modalHosterHidden
    var inputValue = e.currentTarget.dataset.lotteryValue
    console.log('modalHosterconfirm inputValue:', inputValue)
    that.setData({
      modalHosterHidden: !modalHosterHidden,
      modalAdvNotehidden: true,
    })
    that.live_lottery()
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