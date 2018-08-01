var app = getApp()
var weburl = app.globalData.weburl;

Page({
	navigateToAddress: function () {
		wx.navigateTo({
			url: '../../address/list/list'
		});
	},
	navigateToOrder: function (e) {
		var status = e.currentTarget.dataset.status
		wx.navigateTo({
			url: '../../order/list/list?status=' + status
		});
	},
	logout: function () {
		
	},
	onShow: function () {
		var that = this;
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
	},
	chooseImage: function () {
		var that = this;
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePath = res.tempFilePaths[0];
			
			}
		})
	},
	navigateToAboutus: function () {
		wx.navigateTo({
			url: '/pages/member/aboutus/aboutus'
		});
	},
	navigateToDonate: function () {
		wx.navigateTo({
			url: '/pages/member/donate/donate'
		});
	},
	navigateToShare: function () {
		wx.navigateTo({
			url: '/pages/member/share/share'
		});
	}
})