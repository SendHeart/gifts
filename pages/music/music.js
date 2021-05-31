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
var timeId='';//定时器
var lineTimeId='';//水平线定时器
var isDelete=false;//是否删除开启的定时器
const bgMusic = wx.getBackgroundAudioManager()
//const query = wx.createSelectorQuery()

Page({
  data: {
    isOpen: false,//播放开关
    playStatus: false,
    audioIndex: 0,
    progress: 0,
    duration: 0,
    audioList: [],
    showList: true,
    dkheight:500,
    pagesize:10,
    page:1,
    floorstatus:false,
    scrollTop:0,
    current_scrollTop:0,
    page_num:0,
    all_rows:0,
    is_reloading:false,
    scrollHeight: 500,
    isSlider:false,//是否正在拖动进度条
    //以下歌词
    lrc_height:320, //歌词窗口高度
    lrc_lineheight:35,  //歌词行高度
    lrc_line_pre:200, //前导空行高度
    isLrc:true,//是否显示歌词
    lrcArr:[],//歌词定位数组
    location:0,//歌词滚动位置
    locationIndex:0,//
    locationValue:0,//歌词滚动具体位置
    locationTime:0,//歌词定位时间
    locationShowTime:'00:00',//歌词定位显示时间
    isScroll:false,//滚动显示水平线
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

  //歌词触碰开始
  touchstart(e){
    console.log("触摸开始",e);
    this.setData({
      isScroll:true
    });
    isDelete=false;
    if(lineTimeId){
      clearTimeout(lineTimeId);
      lineTimeId='';
    }
  },
  //歌词触碰结束
  touchend(e){
    isDelete=true;
    console.log("触摸结束",e);
    if(lineTimeId!='') return;
    lineTimeId=setTimeout(()=>{
      if(isDelete===true){
        this.setData({
          isScroll:false
        });
        lineTimeId='';
      }
    },4000);
  },
  //歌词滚动
  scroll:function(e){
    var that = this
    if(that.data.isScroll){
      let i=parseInt(e.detail.scrollTop/27);
      if(!that.data.lrcArr[i])return;//空白区域，没有时间不执行
      console.log("滚动",e.detail.scrollTop,that.data.lrcArr[i]);//歌词的间隔区间为27
      let locationShowTime = that.formatTime(that.data.lrcArr[i])
      that.setData({
        locationTime:that.data.lrcArr[i],
        locationShowTime:locationShowTime
      });
    }
  },
  
  //切换是否显示歌词
  isLrc:function(e){
    this.setData({
      isLrc:!this.data.isLrc
    });
  },
  lrc:function(lrc){
    var that = this 
    var lrc_lineheight = that.data.lrc_lineheight
    var lrc_height = that.data.lrc_height
    //console.log("歌曲歌词 ："+lrc);
    let str=lrc;
    let lrcArr=[];
    let arr=[];
    str=str.split(/\n/g);
    str.map(item=>{
      let i=item.match(new RegExp("\\[[0-9]*:[0-9]*.[0-9]*\\]","g"));
      if(i){
        i=i[0].replace('[','').replace(']','')
        let time=Number(i.split(':')[0]*60)+Number(i.split(':')[1].split('.')[0]);//毫秒：+Number(i.split(':')[1].split('.')[1]);         01:12.232  ['01','12.232'] ['12','232'] 
        // console.log(time,dayjs(time).format('mm:ss')); 
        lrcArr.push(time);
        arr.push(item.replace(new RegExp("\\[(.*)\\]","g"),""));
      }
    });
    //去空
    let a1=[],a2=[];
    for(let i=0;i<arr.length;i++){
      if(arr[i]&&lrcArr[i]){//当前是否有歌词
        a1.push(arr[i]);
        a2.push(lrcArr[i]);
      }
    }
    arr=a1,lrcArr=a2
    console.log('lrc() arr:'+arr+' lrcArr:'+lrcArr);
    that.setData({
      lrc:arr,
      lrcArr:lrcArr,
      location:0, 
      locationIndex:0, 
      locationValue:0, 
      locationTime:0, 
      locationShowTime:'00:00', 
    },function(){
      const query = wx.createSelectorQuery()
      query.select('#lrc_line').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {       
        let lrc_lineheight = res[0].height*1.4
        let lrc_height = res[0].height*13
        let lrc_line_pre = lrc_lineheight * 4
        that.setData({
          lrc_height:lrc_height,
          lrc_lineheight: lrc_lineheight,
          lrc_line_pre:lrc_line_pre, //前导空行高度
        })
        console.log('歌词行高度 lrc() lrc line height:'+lrc_lineheight+' lrc_height:'+lrc_height+' res:'+JSON.stringify(res)); 
      })
    })
    
  },

  dowloadLRC:function(file_url=''){
    var that = this
    if(file_url!=''){
      wx.downloadFile({
        url: file_url, 
        success (lrc_res) {
          //console.log('music/music downloadLRC() file_url:'+file_url+' lrc_res:'+ JSON.stringify(lrc_res))
          if (lrc_res.statusCode == 200) {
            var localfile_path = lrc_res.tempFilePath
            wx.getFileSystemManager().readFile({ //读取文件
              filePath: localfile_path,
              encoding: 'utf-8',
              success: file_res => {
                var lrc = file_res.data              
                //console.log('下载歌词完成:'+ lrc)
                
                that.lrc(lrc)
              },
              fail: console.error
            })            
          }
        },
        fail(res){
          console.log('下载歌词失败:'+res)
        }
      })
    }
  },
  //歌词定时器更新
  updateLRC:function(){
    var that = this
    var playStatus = that.data.playStatus
    var isSlider = that.data.isSlider
    if(isSlider) {
      console.log('music/music updateLRC() 无法滚动歌词 playStatus:'+playStatus+' isSlider:'+isSlider)
      return;
    }
    let nowTime=bgMusic.currentTime;
    let totalTime=bgMusic.duration;
    let value=bgMusic.currentTime;
    let max=bgMusic.duration;
    if(nowTime&&totalTime){//都有数据
      //处理歌词当前位置
      // let len=0;//歌词排除为空的下标
      for(let i=0;i<that.data.lrcArr.length;i++){
        if(nowTime>that.data.lrcArr[that.data.lrcArr.length-1]){//最后的歌词
          that.setData({
            location:that.data.lrcArr.length-1
          });
          break;
        }
        //console.log(nowTime,that.data.lrcArr[i]);
        if(nowTime>=that.data.lrcArr[i] && nowTime<that.data.lrcArr[i+1]){
          //console.log("歌词滚动");
          that.setData({
            location:i
          });
          break;
        }
      }

        //设置滚动
      if(that.data.isScroll===false){
        that.setData({
          locationIndex:that.data.location
        });
      }
      //处理显示
      //console.log("时间2：",totalTime,nowTime);
      that.setData({
        nowTime:that.formatTime(Math.ceil(nowTime)),
        totalTime:that.formatTime(Math.ceil(totalTime)) ,
        max:max,
        value:value
      })
      //console.log("时间2：",that.data.totalTime,that.data.nowTime);
    }
  },

  // 进度条拖拽
  sliderChange:function(e) {
    var that = this
    var offset = parseInt(e.detail.value);
    bgMusic.pause();
    bgMusic.seek(offset);
    that.setData({
      isOpen: true,
      isSlider: false,    
      progressText: that.formatTime(e.detail.value)
    })
    
    setTimeout(function() {
      that.updateLRC();
      bgMusic.play();
    }, 1000);
  },

  sliderChanging:function(e) {
    var that = this
    that.setData({
      isSlider: true,        
    })
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
    var that = this
    let audioIndex = that.data.audioIndex > 0 ? that.data.audioIndex - 1 : that.data.audioList.length - 1;
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
    if (pos != audio_index || pos==0) {
      that.setData({
        audioIndex: pos,
        showList: false,
        isOpen:true,
      })
      that.playMusic();     
    } else {
      that.setData({
        showList: false,
        isOpen:true,
      })
    }
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
 
    var lrc_url = audio.lrc
    if(lrc_url!=''){
      console.log("music/music playMusic() lrc url:"+lrc_url)
      that.dowloadLRC(lrc_url)
    } else{
      that.setData({
        lrc: [],
        lrcArr:[],//歌词定位数组
        location:0,//歌词滚动位置
        locationIndex:0,//
        locationValue:0,//歌词滚动具体位置
        locationTime:0,//歌词定位时间
      })
    }   
    that.updateLRC()
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
    
    that.setData({
      is_reloading:true
    })     
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
            that.setData({
              is_reloading:true
            })                
          }, 500)
      }
    })
  },

  handletouchstart: function (event) {
    // console.log(event)
    this.setData({
        touchstop: false,
        lastX:event.touches[0].pageX,
        lastY:event.touches[0].pageY
    })
  },
  handletouchend: function (event) {
    var that = this
    var currentY = that.data.lastY
    this.setData({
        touchstop: true,
    })
  },

  handletouchmove: function (event) {
    var that = this
    var currentX = event.touches[0].pageX
    var currentY = event.touches[0].pageY
    var tx = currentX - this.data.lastX
    var ty = currentY - this.data.lastY
    var scrollHeight = that.data.scrollHeight
    var page  = that.data.page
    var page_num = that.data.page_num
    var is_reloading = that.data.is_reloading

    if (Math.abs(tx) > Math.abs(ty)) {
        if (tx < 0) { // text = "向左滑动"

        }
        else if (tx > 0) {   // text = "向右滑动"

        }
    } else { //上下方向滑动
        if (ty < 0 ) {  // text = "向上拉"
            if (page < page_num && !is_reloading) {
                //将当前坐标进行保存以进行下一次计算
                that.getMoreMusicTapTag()                   
            }                
        } else if (ty > 0) {  //text = "向下拉"
             
        }
    }
    //console.log('currentY:'+ currentY + 'scrollHeight:' + scrollHeight)
    if (currentY > scrollHeight * 2) {
        that.setData({
           floorstatus: true,
           _fixed: true,
       })
    } else {                   
        that.setData({
           floorstatus: false,
           _fixed: false,
        });
    }  
    that.setData({
        //floorstatus: true,
        lastX:currentX,
        lastY:currentY
    })
    //console.log('hall/hall handletouchmove()  ty:'+ty)      
  },

  // 获取滚动条当前位置
  /* 

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
    
  */
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
    timeId=setInterval(()=>{
      that.updateLRC()     
    },500)
         
  },
  // 页面卸载时停止播放
  onUnload() {
    var that = this
    clearInterval(timeId);
    bgMusic.stop()//停止播放
    console.log("离开")
  },
})
