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
    playStatus: false,
    audioIndex: 0,
    progress: 0,
    duration: 0,
    audioList: [],
    showList: true,
    dkheight:0,
    pagesize:10,
    page:1,
    floorstatus:false,
    scrollTop:0,
    current_scrollTop:0,
    page_num:0,
    all_rows:0,

    lrcDir: '',
      //文稿数组，转化完成用来在wxml中使用
    storyContent:[],
      //文稿滚动距离
    marginTop:0,
      //当前正在第几行
    currentIndex222:0,
  },
  // 播放
  /*
  listenerButtonPlay: function () {
    var that = this
    //bug ios 播放时必须加title 不然会报错导致音乐不播放
    
    bgMusic.title = app.globalData.musicLib.music[app.globalData.bg_index].name  
    bgMusic.epname = app.globalData.musicLib.music[app.globalData.bg_index].name   
    console.log('hall/hall listenerButtonPlay() 播放 index:' + app.globalData.bg_index);    
    bgMusic.src = app.globalData.musicLib.music[app.globalData.bg_index].downloadURL;
    bgMusic.coverImgUrl = app.globalData.musicLib.music[app.globalData.bg_index].poster;
    bgMusic.onTimeUpdate(() => { 
      //bgMusic.duration总时长  bgMusic.currentTime当前进度
      //console.log(bgMusic.currentTime)
      var duration = bgMusic.duration; 
      var offset = bgMusic.currentTime;  
      var currentTime = parseInt(bgMusic.currentTime);
      var min = "0" + parseInt(currentTime / 60);
      var duration_min = "0" + parseInt(parseInt(duration)/60);
      var duration_sec = parseInt(duration) % 60;
      var max = parseInt(duration);
      var sec = currentTime % 60;
      if (sec < 10) {
        sec = "0" + sec;
      };
      var starttime = min + ':' + sec;   
      var endtime = duration_min + ':' + duration_sec;    
      that.setData({
        offset: offset,
        starttime: starttime,
        max: max,
        changePlay: true,
        duration:endtime,       
      })
    })
    */
    //播放结束
    /*
    bgMusic.onEnded(() => {
      that.setData({
        starttime: '00:00',
        isOpen: false,
        offset: 0
      })
      
      app.globalData.bg_index++;
      
      if(app.globalData.bg_index > app.globalData.musicLib.music.length-1){
        console.log("音乐列表播放结束"+app.globalData.bg_index);
        app.globalData.bg_index = 0
        that.get_bgmusic_list()  
      }else{
        console.log("单曲音乐播放结束"+app.globalData.bg_index);
        bgMusic.title = app.globalData.musicLib.music[app.globalData.bg_index].name  
        bgMusic.epname = app.globalData.musicLib.music[app.globalData.bg_index].name   
        bgMusic.src = app.globalData.musicLib.music[app.globalData.bg_index].downloadURL;
        bgMusic.play();
        that.setData({
          isOpen: true,
        })
      }     
    })
    bgMusic.play();
    that.setData({
      isOpen: true,
    })
  },
  */

  //暂停播放
  /*
  listenerButtonPause(){
     var that = this
      bgMusic.pause()
      that.setData({
        isOpen: false,
    })
  },
  */
 /*
  listenerButtonStop(){
    var that = this
    bgMusic.stop()
  },
  */
  // 进度条拖拽
 
  sliderChange:function(e) {
    var that = this
    var offset = parseInt(e.detail.value);
    bgMusic.pause();
    bgMusic.seek(offset);
    that.setData({
      isOpen: true,
      progressText: that.formatTime(e.detail.value)
    })
    
    setTimeout(function() {
      bgMusic.play();
    }, 1000);
  },

  //循环计时
  countTimeDown: function(that, bgMusic, cancel) {
    if (that.data.playStatus) {
      setTimeout(function() {
        if (that.data.playStatus) {
          // console.log("duration: " + bgMusic.duration);
          // console.log(bgMusic.currentTime);
          that.setData({
            progress: Math.ceil(bgMusic.currentTime),
            progressText: that.formatTime(Math.ceil(bgMusic.currentTime)),
            duration: Math.ceil(bgMusic.duration),
            durationText: that.formatTime(Math.ceil(bgMusic.duration))
          })
          that.countTimeDown(that, bgMusic);
        }
      }, 1000)
    }
  },

  //上一首
  lastMusic: function() {
    let audioIndex = this.data.audioIndex > 0 ? this.data.audioIndex - 1 : this.data.audioList.length - 1;
    this.setData({
      audioIndex: audioIndex,
      playStatus: false,
      progress: 0,
      progressText: "00:00",
      durationText: "00:00"
    })
    setTimeout(function() {
      this.playMusic();
    }.bind(this), 1000);
  },
  //下一首
  nextMusic: function() {
    var that = this
    let audioIndex = that.data.audioIndex < that.data.audioList.length - 1 ? that.data.audioIndex + 1 : 0;
    that.setData({
      audioIndex: audioIndex,
      playStatus: false,
      progress: 0,
      progressText: "00:00",
      durationText: "00:00"
    })
    setTimeout(function() {
      that.playMusic();
    }.bind(that), 1000);
  },
  //列表点击事件
  list_play: function(e) {
    var that = this
    let audio_index = that.data.audioIndex
    let pos = e.currentTarget.dataset.pos;
    console.log('music/music list_play() pos:'+pos+' audio_index:'+audio_index) 
    if (pos != audio_index) {
      that.setData({
        audioIndex: pos,
        showList: false,
        isOpen:true,
      })     
    } else {
      that.setData({
        showList: false,
        isOpen:true,
      })
    }
   
    that.playMusic();
  },

  //界面切换
  pageChange: function() {
    var that = this
    that.setData({
      showList: true
    })
  },

  //格式化时长
  formatTime: function(s) {
    let t = '';
    s = Math.floor(s);
    if (s > -1) {
      let min = Math.floor(s / 60) % 60;
      let sec = s % 60;
      if (min < 10) {
        t += "0";
      }
      t += min + ":";
      if (sec < 10) {
        t += "0";
      }
      t += sec;
    }
    return t;
  },

  //播放按钮
  playOrpause: function() {
    var that = this
    var isOpen = that.data.isOpen
    //let manager = wx.getBackgroundAudioManager();
    if(!isOpen){
      that.setData({
        isOpen:true,
      })
      that.playMusic()
      return
    }
    if (that.data.playStatus) {
      bgMusic.pause();
    } else {
      bgMusic.play();
    }
  },

  playMusic: function() {
    var that = this
    let audio = that.data.audioList[that.data.audioIndex];
    //let manager = wx.getBackgroundAudioManager();
    bgMusic.title = audio.name || "音频标题";
    bgMusic.epname = audio.epname || "专辑名称";
    bgMusic.singer = audio.author || "歌手名";
    bgMusic.coverImgUrl = audio.poster;
    // 设置了 src 之后会自动播放
    bgMusic.src = audio.downloadURL;
    bgMusic.currentTime = 0;
    //let storyContent = that.parseLyric(audio.lrc)
    //storyContent = that.sliceNull(storyContent)
  
    that.setData({
      storyContent: ''
    })
  
    bgMusic.onPlay(function() {
      console.log("======onPlay======");
      that.setData({
        playStatus: true
      })
      that.countTimeDown(that, bgMusic);
    });
    bgMusic.onPause(function() {
      that.setData({
        playStatus: false
      })
      console.log("======onPause======");
    });
    bgMusic.onEnded(function() {
      console.log("======onEnded======");
      that.setData({
        playStatus: false
      })
      setTimeout(function() {
        that.nextMusic();
      }, 1500);
    });
  },

  get_bgmusic_list: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = app.globalData.shop_type;
    var page = that.data.page
    var pagesize = that.data.pagesize      
    wx.request({
      url: weburl + '/api/client/get_bgmusic_list',
      method: 'POST',
      data: {
        username:username,
        access_token:token,
        page:page,
        pagesize:pagesize,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        var bgmusic_list = res.data.result;
        var all_rows = res.data.all_rows
        if (!bgmusic_list) {
          console.log('获取背景音乐列表为空 hall/hall get_bgmusic_list() res:', res.data.result)          
          return
        } 
        console.log('获取背景音乐列表 hall/hall get_bgmusic_list() res:', res.data)
        for (var i = 0; i < bgmusic_list.length;i++){
            bgmusic_list[i]['downloadURL'] =  bgmusic_list[i]['downloadURL']+'?rand='+Math.random()*100
        }    
        //app.globalData.musicLib.music = bgmusic_list
        var audioList = that.data.audioList.concat(bgmusic_list)
        var page_num = that.data.page_num
            page_num = (all_rows / pagesize + 0.5)
        that.setData({
          audioList:audioList,
          all_rows:all_rows,
          page_num:page_num.toFixed(0),
        })
        setTimeout(function () {
            if(that.data.audioList.length>0){
                //that.playMusic()
            }else{
                console.log('背景音乐列表为空 hall/hall get_bgmusic_list() bgmusit list:', app.globalData.musicLib.music)
            }                
          }, 500)
      }
    })
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    if (e.detail.scrollTop >760) {
      this.setData({
        floorstatus: true,
        hidddensearch:false
      })
    } else {
      this.setData({
        floorstatus: false,
        hidddensearch: true,
      })
    }
    this.setData({
      current_scrollTop: e.detail.scrollTop
    })
  },

//回到顶部
  goTop: function (e) {  // 一键回到顶部
    var that = this
    that.setData({
      scrollTop: 0,
    })
    console.log('goTop:',that.data.scrollTop)
  },

  getMoreMusicTapTag: function () {
    var that = this
    if(that.data.is_loading) return
    var page = that.data.page;
    if (page + 1 > that.data.page_num) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
        duration: 1500
      })
      return
    }else{
      that.setData({
        page: page + 1,
      })
      console.log('get More Orders page:', page, 'current scrollTop:', that.data.current_scrollTop)
      that.get_bgmusic_list()
    }
  },

  onLoad() {
    var that = this
    bgMusic.stop()
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        that.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight,
          dkheight: winHeight
        })
      }
    })
    
  },
  onShow(){
    var that = this
    that.get_bgmusic_list()
  },
  // 页面卸载时停止播放
  onUnload() {
    var that = this
    //that.listenerButtonStop()//停止播放
    bgMusic.stop()//停止播放
    console.log("离开")
  },
})
