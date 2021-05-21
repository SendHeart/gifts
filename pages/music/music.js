//获取应用实例
const app = getApp()
var weburl = app.globalData.weburl
var shop_type = app.globalData.shop_type
var wssurl = app.globalData.wssurl
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var user_group_id = wx.getStorageSync('useruser_group_idInfo') ? wx.getStorageSync('user_group_id') : '0'

const bgMusic = wx.getBackgroundAudioManager()
 
Page({
  data: {
    isOpen: false,//播放开关
    starttime: '00:00', //正在播放时长
    duration: '06:41',   //总时长
  },
  // 播放
  listenerButtonPlay: function () {
    var that = this
    //bug ios 播放时必须加title 不然会报错导致音乐不播放
    bgMusic.title = '此时此刻'  
    bgMusic.epname = '此时此刻'
   
    console.log('hall/hall listenerButtonPlay() 播放 index:' + app.globalData.bg_index);    
    bgMusic.src = app.globalData.musicLib.music[app.globalData.bg_index].downloadURL;
    bgMusic.onTimeUpdate(() => { 
      //bgMusic.duration总时长  bgMusic.currentTime当前进度
      //console.log(bgMusic.currentTime)
      var duration = bgMusic.duration; 
      var offset = bgMusic.currentTime;  
      var currentTime = parseInt(bgMusic.currentTime);
      var min = "0" + parseInt(currentTime / 60);
      var max = parseInt(bgMusic.duration);
      var sec = currentTime % 60;
      if (sec < 10) {
        sec = "0" + sec;
      };
      var starttime = min + ':' + sec;   /*  00:00  */
      that.setData({
        offset: currentTime,
        starttime: starttime,
        max: max,
        changePlay: true
      })
    })
    //播放结束
    bgMusic.onEnded(() => {
      that.setData({
        starttime: '00:00',
        isOpen: false,
        offset: 0
      })
      console.log("音乐播放结束");
      app.globalData.bg_index++;
      if(app.globalData.bg_index > app.globalData.musicLib.music.length-1){
        app.globalData.bg_index = 0
      }
    })
    bgMusic.play();
    that.setData({
      isOpen: true,
    })
  },
  //暂停播放
  listenerButtonPause(){
     var that = this
      bgMusic.pause()
      that.setData({
        isOpen: false,
    })
  },
  listenerButtonStop(){
    var that = this
    bgMusic.stop()
  },
  // 进度条拖拽
  sliderChange(e) {
    var that = this
    var offset = parseInt(e.detail.value);
    bgMusic.play();
    bgMusic.seek(offset);
    that.setData({
      isOpen: true,
    })
  },
  get_bgmusic_list: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;       
    wx.request({
      url: weburl + '/api/client/get_bgmusic_list',
      method: 'POST',
      data: {
        username:username,
        access_token:token,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('获取背景音乐列表 hall/hall get_bgmusic_list() res:', res.data.result)
        var bgmusic_list = res.data.result;
        if (!bgmusic_list) {          
          return
        } 
        for (var i = 0; i < bgmusic_list.length;i++){
            bgmusic_list[i]['downloadURL'] =  bgmusic_list[i]['downloadURL']+'?rand='+Math.random()*100
        }    
        app.globalData.musicLib.music = bgmusic_list
        setTimeout(function () {
            if(app.globalData.musicLib.music.length>0){
                that.listenerButtonPlay()
            }else{
                console.log('背景音乐列表为空 hall/hall get_bgmusic_list() bgmusit list:', app.globalData.musicLib.music)
            }                
          }, 500)
      }
    })
  },
  onLoad() {
    var that = this
    
  },
  onShow(){
    var that = this
    that.get_bgmusic_list()

  },
  // 页面卸载时停止播放
  onUnload() {
    var that = this
    //that.listenerButtonStop()//停止播放
    console.log("离开")
  },
})
