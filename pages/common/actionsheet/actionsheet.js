Component({
  properties: {
    tops: {
      type: String  //外部传入数据 content高度值为百分比例如60%
    }
  },
  data: {
    isShowSheet: false,
    openSheet: '',
    contentAnimate: null,
    masterAnimate: null,
  },
  methods: {
    __closeMaster() {
      var that = this;
      this.contentAnimate.top("0%").step();
      this.masterAnimate.opacity(0).step();
      this.setData({
        contentAnimate: this.contentAnimate.export(),
        masterAnimate: this.masterAnimate.export(),
      });
      setTimeout(function () {
        that.setData({
          isShowSheet: false,
        })
      }, 300)
    },
    __showMaster() {
      //创建动画  展开
      this.setData({
        isShowSheet: true,
      });
      // 容器上弹
      var contentAnimate = wx.createAnimation({
        duration: 100,
      })
      contentAnimate.top(`-${this.properties.tops}`).step();
      //master透明度
      var masterAnimate = wx.createAnimation({
        duration: 500,
      })
      masterAnimate.opacity(.5).step();
      this.contentAnimate = contentAnimate;
      this.masterAnimate = masterAnimate;
      this.setData({
        contentAnimate: contentAnimate.export(),
        masterAnimate: masterAnimate.export(),
      })
    }
  }
})