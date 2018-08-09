import defaultData from '../../data';
//获取应用实例
var app = getApp();
var weburl = app.globalData.weburl;
var page = 1;
var pagesize = 20;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '15355813859';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var shop_type = app.globalData.shop_type;
var shop_id = 3749;
// 请求数据

Page({
  data: {
    navLeftItems: [],
    navRightItems: [],
    lists: [],
    curNav: 1,
    curIndex: 0,
    hidden: true,
    scrollTop: 0,
    scrollHeight: 0,
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,

  },
  loadgoods: function (cat_id) {
    var that = this;
    var catid = cat_id > 0 ? cat_id : 1;
    console.log('loadgoods:');
    console.log(cat_id);
    console.log(page);
    wx.request({
      url: weburl + '/api/client/get_goods_list',
      method: 'POST',
      data: {
        cash_cat_id: catid,
        page: page,
        pagesize: pagesize,
        username: username,
        access_token: token,
        shop_type: shop_type,
        shop_id: shop_id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'

      },
      success: function (res) {
        console.log(res.data.result)
        var list = that.data.lists;
        for (var i = 0; i < res.data.result.length; i++) {
          res.data.result[i]['short_name'] = res.data.result[i]['name'].substring(0, 15) + '...';
          if (res.data.result[i]['activity_image']) res.data.result[i]['image'] = weburl + res.data.result[i]['activity_image'];
          list.push(res.data.result[i]);
        }
        that.setData({
          lists: list
        });
        that.setData({
          hidden: true
        });
      },
      fail: function (res) {
        console.log('fail')
        that.setData({
          hidden: true
        });
      },
      complete: function () {
        that.setData({
          hidden: true
        });
      }
    })
  },

  onLoad: function () {

    // 加载的使用进行网络访问，把需要的数据设置到data数据对象
    var that = this;
    //sliderList
    wx.request({
      url: weburl + '/api/client/query_adv',
      method: 'POST',
      data: { position_id: "9" },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        var advpicInfo = res.data.result
        for (var i = 0; i < advpicInfo.length; i++) {
          if (advpicInfo[i].ext == 'mp4') {
            that.setData({
              interval: 50000,
              duration: 12000,
            })
          }
        }
        that.setData({
          images: res.data.result
        })

      },
      fail: function (res) {
        console.log('fail')
      },
      complete: function () {
        console.log('always')
      }
    })

    wx.request({
      url: weburl + '/api/client/get_shop_goods_category',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_id: shop_id,
        reid: 4
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        that.setData({
          navLeftItems: res.data.result,
          navRightItems: res.data.result
        })

        that.loadgoods(that.data.navLeftItems[that.data.curIndex]['id']);
      }
    })

  },

  //事件处理函数
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值
    let id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index);
    // 把点击到的某一项，设为当前index
    this.setData({
      curNav: id,
      curIndex: index
    })
    this.setData({
      lists: []
    });
    page = 1;
    this.loadgoods(this.data.navLeftItems[this.data.curIndex]['id']);
  },

  //页面滑动到底部
  bindDownLoad: function () {
    var that = this;
    that.setData({
      page: page++
    });
    this.loadgoods(this.data.navLeftItems[this.data.curIndex]['id']);
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

})
