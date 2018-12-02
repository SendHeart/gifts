var util = require('../../../utils/util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var uploadurl = app.globalData.uploadurl;
Page({
	data:{
    shop_type: shop_type,
    uploadurl: uploadurl,
    user: null,
    userInfo: {},
    username: null,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    page: 1,
    pagesize: 10,
    all_rows: 0,
    page_num: 0,
    interval: 30000,
    duration: 12000,
    goodsname: '',
 
    goodsinfo: [],
    goodsprice: 0,
    goodssale: 0,
    goodsid: 0,
 
    sku_id: 0,
    commodityAttr: [],
    attrValueList: [],
    hideviewgoodsinfo: true,
 
    dkheight: 300,
    scrollTop: 0,
    scrollTop_init: 350,
    comment: '',
    comm_list: [],
    img_arr: [],
    new_img_arr: [],
    upimg_url: [],
    formdata: '',   
    star: [],
  
	},

	onLoad: function(options){
    var that = this
    var goods_id = options.goods_id
    var goods_skuid = options.goods_skuid ? options.goods_skuid:0
    var order_skuid = options.order_skuid ? options.order_skuid:0
    that.setData({
      goods_id: goods_id,
      goods_skuid: goods_skuid,
      order_skuid: order_skuid,
    })
    that.get_order_comment()
	},

  
  get_order_comment: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var page = that.data.page
    var pagesize = that.data.pagesize
    var goods_id = that.data.goods_id
    var query_type  = 1
    var page = that.data.page
    var pagesize = that.data.pagesize
    var shop_type = that.data.shop_type
    var img_arr = that.data.img_arr
    if (goods_id > 0) {
      wx.request({
        url: weburl + '/api/client/get_order_comment',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          goods_id: goods_id,
          query_type: query_type,
          m_id:m_id,
          page:page,
          pagesize:pagesize,
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var comm_list = res.data.result
          var ret_info = res.data.info
          var all_rows = res.data.all_rows ? res.data.all_rows : 1
          if (comm_list) {
            var page_num = that.data.page_num
            page_num = (all_rows / pagesize + 0.5)
           
            that.setData({
              comm_list: that.data.comm_list.concat(comm_list),
              all_rows: all_rows,
              page_num: page_num.toFixed(0),
            })
           
            console.log('获取商品评论信息:', comm_list, 'all_rows:', all_rows)
          }  
        }
      })
    }
  },
  getMoreCommentTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var pagesize = that.data.pagesize;
    var all_rows = that.data.all_rows;
    if (page > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'loading',
        duration: 1000
      });
      return
    }
    that.setData({
      page: page,
    })
    that.get_order_comment()
  },

	showCartToast: function () {
		wx.showToast({
			title: '已加入购物车',
			icon: 'success',
			duration: 1000
		});
	}
});