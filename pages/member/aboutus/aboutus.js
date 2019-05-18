var app = getApp();
var weburl = app.globalData.weburl;
var navList2_init = [
  { id: "gift_logo", title: "送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "wishlist_logo", title: "心愿单logo", value: "", img: "/uploads/wishlist.png" },
  { id: "trans_gift_logo", title: "转送礼logo", value: "", img: "/uploads/gift_logo.png" },
  { id: "hall_banner", title: "首页banner", value: "", img: "/uploads/songxin_banner.png" },
  { id: "wish_banner", title: "心愿单banner", value: "", img: "/uploads/wish_banner.png" },
  { id: "wechat_share", title: "背景", value: "", img: "/uploads/wechat_share.png" },

]
var navList2 = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : []
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
Page({
  data: {
    url: weburl+'/new_year_card',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
  },
  onLoad: function (options) {
    var that = this
    var url = options.url ? options.url:that.data.url
    var type = options.type ? options.type:0
    var promid = options.promid?options.promid:0
    var celebration = 1
    if (type == 'celebration') celebration = 1
    if (type == 'blessing') celebration = 2
    if(promid>0){
      url = weburl + '/prom?avatarUrl=' + userInfo.avatarUrl + '&nickname=' + userInfo.nickName + '&promid=' + promid
    }else{
      url = url + '?avatarUrl=' + userInfo.avatarUrl + '&nickname=' + userInfo.nickName
    }
    that.setData({ 
      url: url ,
      celebration: celebration,
      promid: promid,
      }) 
  },
  onShareAppMessage: function (options) {
    var that = this
    var res
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
    var nickname = that.data.nickname
    var msg_id = that.data.msg_id
    var celebration = that.data.celebration
    var start_time = that.data.start_time
    var title = '收到' + nickname + '的祝福~';
    var imageUrl = that.data.task_image ? that.data.task_image : that.data.wechat_share

    var desc = '送心祝福'

    console.log('开始送心祝福', options)

    var shareObj = {
      title: title,        // 默认是小程序的名称(可以写slogan等)
      desc: desc,
      path: '/pages/hall/hall?celebration=' + celebration + '&refername=' + username + '&sharetime=' + start_time,   // 默认是当前页面，必须是以‘/’开头的完整路径
      imageUrl: imageUrl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
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
      console.log('任务分享', shareObj)
    }
    // 返回shareObj
    return shareObj;

  }

})