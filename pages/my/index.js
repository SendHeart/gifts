var wxparse = require("../../wxParse/wxParse.js");
var util = require('../../utils/util.js');
var app = getApp();
var weburl = app.globalData.weburl
var appid = app.globalData.appid
var appsecret = app.globalData.secret
var user_type = app.globalData.user_type ? app.globalData.user_type:0;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var userauth = wx.getStorageSync('userauth') ? wx.getStorageSync('userauth') : '';
var member_group_id = wx.getStorageSync('member_group_id') ? wx.getStorageSync('member_group_id') : 0
var member_group_name = wx.getStorageSync('member_group_name') ? wx.getStorageSync('member_group_name') : 0
var navList2 = wx .getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
Page({
  data:{
    title_name: '我的',
    m_id:m_id,
    title_logo: '/images/footer-icon-05.png',
    share_art_image: weburl+'/uploads/share_art_image.jpg?rand='+Math.random()*100,
    nickname: userInfo.nickName ? userInfo.nickName:'登录',
    avatarUrl: userInfo.avatarUrl,
    userauth: userauth,
    member_group_name:member_group_name,
    member_group_id:member_group_id,
    message_type:0,
    default_avatar: weburl + '/uploads/avatar.png?rand='+Math.random()*100,
    hideviewagreementinfo: true,
    agreementinfoshowflag: 0,
    playsxinfoshowflag: 0,
    artinfoshowflag: 0,
    scrollTop: 0,
    scrollTop_init: 10,
    scrollLeft:0,
    current_scrollTop: 0,
    scrollHeight: 500,
    modalHiddenCele:true,
    modalHiddenAgreement:true,
    modalHiddenBankcard: true,
    modalHiddenPlaysx: true,
    modalHiddenArt: true,
    modalHiddenArtInfo:true,
    modalHiddenPhone:true,
    modalHiddenUserName: true,
    shop_type:shop_type,
    index: 0,
    art_index:0,
    web_url:'',
    web_id: '',
    image_save_count:0,
    needPhoneNumber:'微信授权',
    needUserName: '',
    inputShowed: false,
    sendheartappHidden: false,
    sendheartappurl: weburl+'/hall/appdown/index.html',
    recharge_skuid:0,
    recharge_price:0,
    card_name:'Black Shell Club',
    card_logo:'',
    default_card_logo: '', //weburl + '/uploads/default_card_logo.png?rand='+Math.random()*100
    card_no:'',
    card_due_start:'0000-00-00',
    card_due_end:'0000-00-00',
    is_card_overdue:false,
    recharge_type:0,
    recommentslist: [], 
    recommentslist_show: [],
    show_max:20,
    is_reloading:false,
    page:1,
    pagesize: 20,
    pageoffset:0,
    rpage_num:1,
    floorstatus:false,
    showmorehidden: true,
    loadingHidden: true,
    all_rows:0,
    rall_rows:0,
  },

  handletouchmove: function (event) {
    var that = this
    var currentX = event.touches[0].pageX
    var currentY = event.touches[0].pageY
    var tx = currentX - this.data.lastX
    var ty = currentY - this.data.lastY
    var scrollHeight = that.data.scrollHeight
    var page  = that.data.page
    var rpage_num = that.data.rpage_num
   
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) { // text = "向左滑动"

      }
      else if (tx > 0) {   // text = "向右滑动"

      }
    } else { //上下方向滑动
      if (ty < 0 && !that.data.is_reloading) {  // text = "向上滑动"
        //console.log('向上滑动 page:', page, 'rpage_num:', rpage_num)
        if (page < rpage_num) {
          //将当前坐标进行保存以进行下一次计算
          that.getMoreGoodsTapTag()
          /*
          if (currentY > scrollHeight - 100) {
            
          }
          */
        } 
      } else if (ty > 0) {  //text = "向下滑动"
        
      }
    }
   
    that.setData({
      floorstatus: true,
    })
    that.data.lastX = currentX
    that.data.lastY = currentY
    //console.log('currentX:', currentX, 'currentY:', currentY, 'ty:', ty, ' page:', page, ' rpage_num:', rpage_num)
  },
    
  handletouchstart: function (event) {
    var that = this
    // console.log(event)
    // 赋值
    that.data.lastX = event.touches[0].pageX
    that.data.lastY = event.touches[0].pageY
    that.setData({
      touchstop: false,
    })
  },
  handletouchend: function (event) {
    var that = this
    that.setData({
      touchstop: true,
    })
    //console.log('滑动停止 event:', event)
  },
   
  getMoreGoodsTapTag: function (e) {
    var that = this;
    var page = that.data.page + 1;
    var rpage_num = that.data.rpage_num
    var is_reloading = that.data.is_reloading
    //console.log('getMoreGoodsTapTag 加载更多中，请稍等 page:', page, 'is_reloading:', is_reloading, that.data.scrollHeight)
    if (is_reloading) {
      console.log('getMoreGoodsTapTag 加载中，请稍等 page:', page, 'is_reloading:', is_reloading, that.data.scrollHeight)
      return
    }
    if (page > rpage_num) {
      wx.showToast({
        title: '已经到底了~',
        icon: 'none',
        duration: 1000
      })

      that.setData({
        loadingHidden: false,
        loading_note: '已经到底了~'
      })
      setTimeout(function () {
        that.setData({
          loadingHidden: true,
        })
      }, 1000)
      return
    }
   
    that.setData({
      page: page,
      loadingHidden: false,
      loading_note: '加载中'
    })
    that.reloadData()
  },
  //回到顶部，内部调用系统API
  goTop: function () {  // 一键回到顶部
    var that = this
    /*
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    */
    //console.log('goTop:', that.data.scrollTop)
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0 ,
        duration:300,
      })
      
      that.setData({
        scrollTop: 0,
        recommentslist_show: [],
        page:1,
        pageoffset:0,
        floorstatus:false,
      },function(){
        that.reloadData()
        const fs = wx.getFileSystemManager()
        fs.getSavedFileList({
          success(res) {
            console.log('hall getSavedFileList 缓存文件列表', res)
            for (var i = 0; i < res.fileList.length; i++) {
              fs.removeSavedFile({
                filePath: res.fileList[i]['filePath'],
                success(res) {
                  console.log('hall image_save 缓存清除成功', res)
                },
                fail(res) {
                  console.log('hall image_save 缓存清除失败', res)
                }
              })
            }
          },
          fail(res) {
            console.log('hall getSavedFileList 缓存文件列表查询失败', res)
          }
        })
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，暂无法使用该功能，请升级后重试。'
      })
    }
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
    var image = e.currentTarget.dataset.image ? e.currentTarget.dataset.image:''
    //var carts = this.data.carts
    var sku_id = objectId
    wx.navigateTo({
      url: '/pages/details/details?sku_id=' + objectId + '&id=' + goods_id + '&goods_shape=' + goods_shape +  '&goods_org=' + goods_org + '&goods_info=' + goods_info + '&goods_price=' + goods_price + '&sale=' + goods_sale + '&name=' + goods_name+'&image=' + image+'&token=' + token + '&username=' + username
    })
  },

  reloadData: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var page=that.data.page
    var pagesize=that.data.pagesize
    var pageoffset = that.data.pageoffset
    var shop_type = that.data.shop_type

    that.setData({
      is_reloading: true,
      loadingHidden: false,
    })
    /*
    wx.showLoading({
      title: '加载中',
    })
    */
    wx.request({
      url: weburl + '/api/client/query_member_goods_prom',
      method: 'POST',
      data: { 
        username: username ? username:openid, 
        access_token: token,
        shop_type:shop_type,
        query_type:'browser',  //浏览过的商品列表
        page:page,
        pagesize:pagesize,
        pageoffset:pageoffset,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
       console.log('会员浏览商品列表获取:', recommentslist, ' page num:', rpage_num, ' page:', page, ' pageoffset:', pageoffset, ' res.data:', res.data);
        if(res.data.status=='y'){
          var recommentslist = that.data.recommentslist
          var recommentslist_new = res.data.result
          var rpage_num = res.data.all_rows?res.data.all_rows:0
          var pageoffset = res.data.pageoffset?res.data.pageoffset:0
          var show_max = that.data.show_max
          var recommentslist_show = that.data.recommentslist_show
          if (!recommentslist_new) return
          var recomm_len = recommentslist_new.length
        
          for (var i = 0; i < recomm_len; i++) {
            if (recommentslist_new[i]['activity_image'].indexOf("http") < 0 && recommentslist_new[i]['activity_image']) {
              recommentslist_new[i]['activity_image'] = weburl + '/' + recommentslist_new[i]['activity_image'];
            }
            if (recommentslist_new[i]['image'].indexOf("http") < 0 && recommentslist_new[i]['image']) {
              recommentslist_new[i]['image'] = weburl + '/' + recommentslist_new[i]['image'];
            }
            recommentslist_new[i]['image'] = recommentslist_new[i]['activity_image'] ? recommentslist_new[i]['activity_image'] : recommentslist_new[i]['image']
            //recommentslist[i]['name'] = recommentslist[i]['name'].substr(0, 13) + '...';
            if (i > 1) {
              recommentslist_new[i]['hidden'] = 0  //1
            }
          }

          if (page > 1 && recommentslist_new) {
            //向后合拼
            recommentslist = recommentslist.concat(recommentslist_new)
          } else {
            recommentslist = recommentslist_new
          }
          //更新当前显示页信息
          if (recommentslist_show.length >= show_max) {
            recommentslist_show.shift()
          }

          that.setData({
            recommentslist: recommentslist,
            rpage_num: rpage_num,
            ["recommentslist_show[" + (page - 1) + "]"]: recommentslist_new,
            pageoffset: pageoffset,
          }, function () {
            that.setData({
              is_reloading: false,
              loadingHidden: true,
            })
          })
          console.log('会员浏览商品列表获取:', recommentslist_show, ' page num:', rpage_num, ' page:', page,'scrollTop:',that.data.scrollTop, ' res.data:', res.data);
        }else{
          wx.showToast({
            title: '加载完成',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            is_reloading: false,
            loadingHidden: true,
          })
        }
      }
    })
  },

  getScancode: function () {
    var _this = this
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        var result = res.result
        var scantype = res.scanType
        var qrcode_info = res.path? res.path:'?'
        var pathinfo = qrcode_info.split('?')
        var path = '/'+pathinfo[0]
        var sceneinfo = pathinfo[1]
        var charset = res.charSet
        var reg = new RegExp("scene=", "g")
        var scene = sceneinfo.replace(reg, "")
        //手机和开放者工具不一样的地方就在这几步了
        scene = decodeURIComponent(scene);   //在手机上省略这一步  开发者工具需要

        if (path.indexOf("pages")>-1) { //小程序码
          console.log(' getScancode path:', path,' scene:',scene)
          if (scene.indexOf("goodsid=") >= 0) {
            wx.navigateTo({
              url: '/pages/details/details?' + scene
            })
          }else if (scene.indexOf("promid=") >= 0) {
            wx.navigateTo({
              url: '/pages/details/details?' + scene
            })
          }else if (scene.indexOf("ordno=") >= 0) {
            wx.navigateTo({
              url: '/pages/order/receive/receive?receive=1&' + scene
            })
          }else if (scene.indexOf("wish_id=") >= 0) {
            wx.navigateTo({
              url: '/pages/wish/wish?' + scene
            })
          }else{
            if(path.indexOf("wish/wish")>-1 || path.indexOf("index/index")>-1||path.indexOf("my/index")>-1||path.indexOf("list/list")>-1||path.indexOf("hall/hall")>-1){
              wx.switchTab({
                url: path
              })
            }else{
              wx.navigateTo({
                url: path + '?' + scene
              })
            }
          }
        } else if (result.indexOf('http') > -1){ //非小程序码
          console.log(' getScancode result:', result)
          wx.navigateTo({
            url: '../member/aboutus/aboutus?url=' + result
          })
        } else {
          wx.showToast({
            title: '内容:result:' + result + ' scan type:' + scantype + '  charset:'+charset + ' path:'+path,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  requestSubscribeMessage: function (subscribe_tmpl_list) {
    var that = this
    var subscribe_tmpl_id = []
    var subscribe_tmpl_name = []
    //var subscribe_tmpl = that.data.subscribe_tmpl
    if (!subscribe_tmpl_list) {
      console.log('订阅消息模板ID为空')
      return
    }else{
      for (let i = 0; i < subscribe_tmpl_list.length;i++){
        subscribe_tmpl_id[i] = subscribe_tmpl_list[i]['id']
        subscribe_tmpl_name[i] = subscribe_tmpl_list[i]['name']
      }
    }
    console.log('订阅消息模板列表:', subscribe_tmpl_list)
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: subscribe_tmpl_id,
        success: (res) => {
          for (let i = 0; i < subscribe_tmpl_id.length;i++){
            if (res[subscribe_tmpl_id[i]] === 'accept') {
              wx.showToast({
                title: subscribe_tmpl_name[i]+'订阅OK！',
                icon:'none',
                duration: 1500,
                success(data) {
                  //成功
                  resolve()
                }
              })
            }
          }
        },
        fail(err) {//失败
          console.error(err);
          reject()
        },
        /*
        complete: fin => {
          console.log(fin)
          // resolve(fin)
          reject(fin)
        },
        */
      })
    })
  },

  //获取订阅模板信息
  subscribeMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : ''
    var message_type = that.data.message_type?that.data.message_type:0 //0订单类消息
   
    wx.request({
      url: weburl + '/api/client/get_subscribe_tmpl',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        m_id: m_id,
        shop_type: shop_type,
        message_type: message_type
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('订阅消息 my subscribeMessage:',res.data)
        if (res.data.status == 'y') {
          var subscribe_tmpl_list = res.data.result
          var info_content=''
          wx.setStorageSync('subscribe_tmpl_list', subscribe_tmpl_list)
          if (subscribe_tmpl_list) {

            var subscribe_tmpl = []
            for (let i = 0; i < subscribe_tmpl_list.length; i++) {
              if (i % 4 == 0) {
                subscribe_tmpl = []
                info_content = ''
              }
              info_content = info_content + '[' + subscribe_tmpl_list[i]['name'] + '] '
              subscribe_tmpl[i%4] = subscribe_tmpl_list[i]
              if (i%4 == 3) {
                that.requestSubscribeMessage(subscribe_tmpl)
                wx.showToast({
                  title: info_content + "订阅完成" ,
                  icon: 'none',
                  duration: 5000,
                })
              }
            }
          }
        }
      }
    })
  },

  goBack: function () {
    var that = this
    var pages = getCurrentPages()    
    var userInfo = wx.getStorageSync('userInfo') 
    var frompage = app.globalData.from_page?app.globalData.from_page:that.data.frompage
    app.globalData.from_page = ''
    app.globalData.art_id = 0
    console.log('my/index goBack() frompage:', frompage,' userInfo:',userInfo,' pages length:',pages.length)
    if (userInfo){
      if (pages.length > 0) {
        if (frompage) {
          if(frompage.indexOf('/pages/hall')>=0||frompage.indexOf('/pages/cart/cart')>=0||frompage.indexOf('/pages/member/message')>=0||frompage.indexOf('/pages/my/index')>=0){
            wx.switchTab({
              url: frompage
            })
          }else{
            wx.navigateTo({
              url: frompage,
            })
          }          
        } 
        /*else if(pages.length > 1){
          wx.navigateBack({ changed: true });//返回上一页
        }
        */
      } else {
        wx.switchTab({
          url: '../hall/hall'
        })
      }
    }
  },
  bindPickerChange: function (e) {
    var that = this
    var selected_index = e.detail.value
    var bank_name = that.data.bank_info[selected_index]['bank_name']
    var bank_id = that.data.bank_info[selected_index]['id']
    console.log('picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      index: selected_index,
      bank_name: bank_name,
      bank_id: bank_id
    })
    console.log('自定义值:', that.data.bank_info[selected_index]['bank_name']);
  },

  bindchangeBankcardno: function (e) {
    var that = this
    var bankcard_no = e.detail.value

    that.setData({
      bankcard_no: bankcard_no
    })
    console.log('bankcard_no:' + that.data.bankcard_no)
  },
  bindchangeBankcardname: function (e) {
    var that = this
    var bankcard_name = e.detail.value
    that.setData({
      bankcard_name: bankcard_name
    })
    console.log('bankcard_name:' + that.data.bankcard_name)
  },
  //绑定银行卡
  get_bank_info: function () {
    var that = this 
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
   //获取银行列表
    wx.request({
      url: weburl + '/api/client/get_bankinfo',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if(res.data.status=='y'){
          var bank_info  = res.data.result
          var index = that.data.index
          that.setData({
            bank_info: bank_info,
            modalHiddenBankcard: !that.data.modalHiddenBankcard,
            bank_name: bank_info[index]['bank_name'],
            bank_id: bank_info[index]['id']
          })
           
          console.log('获取银行列表完成:', res.data.result)
          //获取我的银行列表
          wx.request({
            url: weburl + '/api/client/get_member_bankcardinfo',
            method: 'POST',
            data: {
              username: username,
              access_token: token,
              shop_type: shop_type,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              if (res.data.status == 'y') {
                var mbank_info = res.data.result
                
                that.setData({
                  bank_name: mbank_info[0]['bank_name'],
                  bank_id: mbank_info[0]['bank_id'],
                  bankcard_no: mbank_info[0]['bank_cardno'],
                  bankcard_name: mbank_info[0]['bank_cardname'],
                })
                if (mbank_info[0]['id']){
                  for (var i = 0; i < that.data.bank_info.length; i++) {
                    if (that.data.bank_info[i]['id'] == mbank_info[0]['bank_id']){
                      that.setData({
                        index : i,
                      })
                      //console.log('获取我的银行列表 index:', i, 'my bank id:', mbank_info[0]['bank_id'])
                    }
                  }
                }
               
                console.log('获取我的银行列表完成:', res.data.result)
              }
            }
          })
        }else{
          wx.showToast({
            title: res.data.info+'[失败]',
            icon: 'none',
            duration: 1500
          })
        }
      }
    })
  },

  //绑定银行卡
  band_bank_card: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    var bank_id = that.data.bank_id
    var bank_cardno = that.data.bankcard_no
    var bank_cardname = that.data.bankcard_name

    var regNum = new RegExp('[0-9]', 'g')//判断是否为数字
    var rsNum = regNum.exec(bank_cardno)

    if (rsNum) {
      wx.request({
        url: weburl + '/api/client/update_member_bankcardinfo',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          shop_type: shop_type,
          bank_id: bank_id,
          bank_cardno: bank_cardno,
          bank_cardname: bank_cardname,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          if (res.data.status == 'y') {
            wx.showToast({
              title: '银行卡绑定成功',
              icon: 'none',
              duration: 1500
            })
            console.log('银行卡绑定完')
          } else {
            wx.showToast({
              title: res.data.info + '[失败]',
              icon: 'none',
              duration: 1500
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '银行卡输入有误',
        icon: 'loading',
        duration: 1500
      });
    }
  },

  getPhoneNumber: function (e) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var session_key = wx.getStorageSync('session_key') ? wx.getStorageSync('session_key') : ''

    console.log('my getPhoneNumber:',e.detail.errMsg == "getPhoneNumber:ok");
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      wx.request({
        url: weburl + '/api/client/update_name',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          appid:appid,
          session_key: session_key,
          type:'1',
          shop_type: shop_type,
          encryptedData: encodeURIComponent(e.detail.encryptedData),
          iv: e.detail.iv,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          var result = res.data.result
          var phoneNumber = result.phoneNumber
          wx.setStorageSync('user_phone', phoneNumber)
          that.setData({
            modalHiddenPhone: !that.data.modalHiddenPhone
          })
        }
      })
    }else{ //授权失败，具体进入‘我的’页面
      wx.switchTab({
        url: '../hall/hall'
      })
    }
  },
  getUserName: function (user_name, user_gender) {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    /*
    if (!user_name || !user_gender) {
      return
    }
    */
    wx.request({
      url: weburl + '/api/client/update_name',
      method: 'POST',
      data: {
        username: username ? username : openid,
        access_token: token,
        full_name: user_name,
        sex: user_gender,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        if (res.data.status = 'y') {
          wx.setStorageSync('user_name', user_name)
        } else {
          wx.showToast({
            title: '姓名更新失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    })
  },

  user_nameTapTag: function (e) {
    var that = this
    var user_name = e.detail.value
    that.setData({
      user_name: user_name
    })
  },
  //按钮点击事件  获取姓名
  modalBindconfirmUsername: function () {
    var that = this
    var user_name = that.data.user_name
    var user_gender = that.data.user_gender
    var needUserName = ''
    that.setData({
      modalHiddenUserName: !that.data.modalHiddenUserName
    })
    if (user_name && user_gender) {   
      that.getUserName(user_name, user_gender)
    } else {
      needUserName = '需要您的姓名和性别'      
    }
    that.setData({
      needUserName: needUserName
    })
  },

  radiochange: function (e) {
    var that = this
    var user_gender = e.detail.value
    //console.log('radio发生change事件，携带的value值为：', e.detail.value)
    that.setData({
      user_gender: user_gender
    })
    wx.setStorageSync('user_gender', user_gender)
  },
  navigateToAgreement:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var art_id = '29'  //21黑贝会用户协议 29会员规则和权益协议
    var art_cat_id = '9'  //黑贝会协议类
    var shop_type = that.data.shop_type
    var agreementinfoshowflag = that.data.agreementinfoshowflag ? that.data.agreementinfoshowflag:0
    if (agreementinfoshowflag == 0) {
      wx.request({
        url: weburl + '/api/client/query_art',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          art_id: art_id,
          art_cat_id: art_cat_id,
          shop_type:shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          that.setData({
            agreementInfo: res.data.result,
            art_id:0,
          })
          app.globalData.art_id = 0
          console.log('黑贝会协议:', that.data.agreementInfo)
          that.showAgreementinfo()
        }
      })
    } else{
      that.showAgreementinfo()
    }
  },
  navigateToPlaysx: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var art_id = that.data.art_id ? that.data.art_id:'28'  //22玩转黑贝会 28什么是会员制 29会员规则和权益协议
    var art_cat_id = that.data.art_cat_id ? that.data.art_cat_id:'9'  //黑贝会协议类
    var art_title = that.data.art_title ? art_title = that.data.art_title :'如何玩转黑贝会'
    var playsxinfoshowflag = that.data.playsxinfoshowflag
    console.log('黑贝会协议 art_id:', art_id)
    if (playsxinfoshowflag == 0) {
      wx.request({
        url: weburl + '/api/client/query_art',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          art_id: art_id,
          art_cat_id: art_cat_id,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          that.setData({
            playsxInfo: res.data.result,
          })
          app.globalData.art_id = 0
          console.log('玩转黑贝会:', that.data.playsxInfo)
          that.showPlaysxinfo()
        }
      })
    } else {
      that.showPlaysxinfo()
    }
  },

  navigateToArticle: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var shop_type = that.data.shop_type
    wx.request({
      url: weburl + '/api/client/query_art',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        art_type: 1,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('文章信息：',res.data.result)
        if (!res.data.result.info){
          var article = res.data.result
          that.setData({
            article: article,
            modalHiddenArt: !that.data.modalHiddenArt
          })
        }else{
          wx.showToast({
            title: '暂时没有文章',
            icon: 'loading',
            duration: 1500
          })
        }
      }
    })
  },
  showAgreementinfo: function () {
    let winPage = this
    //var hideviewagreementinfo = winPage.data.hideviewagreementinfo
    var modalHiddenAgreement = winPage.data.modalHiddenAgreement
    var agreementinfoshowflag = winPage.data.agreementinfoshowflag ? winPage.data.agreementinfoshowflag:0
  
    winPage.setData({
      //hideviewagreementinfo: !hideviewagreementinfo,
      modalHiddenAgreement: !modalHiddenAgreement,
    })

    if (!winPage.data.modalHiddenAgreement && agreementinfoshowflag == 0) {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          console.log(winHeight);
          winPage.setData({
            dkheight: winHeight - winHeight * 0.05 - 120,
            
          })
        }
      })
      winPage.setData({
        agreementinfoshowflag: 1,
      })
      wxparse.wxParse('dkcontent1', 'html', winPage.data.agreementInfo[0]['desc'], winPage, 5)
    }
  },

  showPlaysxinfo: function () {
    let winPage = this
    //var hideviewagreementinfo = winPage.data.hideviewagreementinfo
    var modalHiddenPlaysx = winPage.data.modalHiddenPlaysx
    var playsxinfoshowflag = winPage.data.playsxinfoshowflag
    winPage.setData({
      //hideviewagreementinfo: !hideviewagreementinfo,
      modalHiddenPlaysx: !modalHiddenPlaysx,
    })

    if (!winPage.data.modalHiddenPlaysx && playsxinfoshowflag == 0) {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          //console.log(winHeight);
          winPage.setData({
            dkheight: winHeight - winHeight * 0.05 - 120,
          })
        }
      })
      winPage.setData({
        playsxinfoshowflag: 1,
      })
      var dkcontent2 = winPage.data.playsxInfo[0]['desc'].replace('<img', '<img style="max-width:100%;height:auto;margin:0 auto;" ')
      wxparse.wxParse('dkcontent2', 'html', dkcontent2, winPage, 5)
    }
  },

  showArt: function () {
    let winPage = this
    var modalHiddenArt = winPage.data.modalHiddenArt
    var modalHiddenArtInfo = winPage.data.modalHiddenArtInfo
    var artinfoshowflag = winPage.data.artinfoshowflag
    var art_index = winPage.data.art_index ? winPage.data.art_index:0
    winPage.setData({
      modalHiddenArt: !modalHiddenArt,
      modalHiddenArtInfo: !modalHiddenArtInfo,
    })
    console.log('my index showArt() modalHiddenArtInfo:', modalHiddenArtInfo, 'artinfoshowflag:',artinfoshowflag, 'art_index:', art_index);
    if (!winPage.data.modalHiddenArtInfo && artinfoshowflag == 0) {
      wx.getSystemInfo({
        success: function (res) {
          let winHeight = res.windowHeight;
          console.log('my index showArt():', winHeight, 'art_index:', art_index);
          winPage.setData({
            dkheight: winHeight - winHeight * 0.05 - 120,
          })
        }
      })
      winPage.setData({
        artinfoshowflag: 1,
        art_index: art_index,
      })
      var dkcontent2 = winPage.data.article[art_index]['desc'].replace('<img ', '<img style="max-width:100%;height:auto;margin:0 auto;" ')
      //console.log('my index showArt() dkcontent2:', dkcontent2);
      wxparse.wxParse('dkcontent2', 'html', dkcontent2, winPage, 5)
     // wxparse.wxParse('dkcontent2', 'html', winPage.data.article[art_index]['desc'], winPage, 5)
    }
  },
  navigateToMyLocation: function (e) {
    wx.navigateTo({
      url: '../member/mylocation/mylocation?'
    })
  },
  /*
  navigateToOrder: function (e) {
    var status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '../../order/list/list?status=' + status
    });
  },
  */
  navigateToRecharge: function (e) {
    var that = this
    var is_recharge = 1
    var recharge_level = 2
    var recharge_type =  e.currentTarget.dataset.recharge?e.currentTarget.dataset.recharge:0
    var recharge_selected = 2  //默认的充值档次 2:一年会员
    wx.request({
      url: weburl + '/api/client/add_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type:shop_type,
        is_recharge: is_recharge,
        recharge_level:recharge_level,
        recharge_type:recharge_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('My navigateToRecharge res data:', res.data);
        var result =  res.data.result
        var membercard_no = result.card_no? result.card_no:''
        var membercard_logo = result.card_logo? result.card_logo:''
        if(membercard_no!=''){
          that.setData({
            card_no:membercard_no,
            card_logo:membercard_logo,
            recharge_type:recharge_type
          })
          if(recharge_type==1 || recharge_type==0) { 
            return // 立即入会 暂时不转充值       
          }else{
            wx.showToast({
              title: '会员充值',
              icon:'loading',
              duration: 2000
            })
          }   
        }else{
          wx.showToast({
            title: '会员卡生成失败',
            icon:'loading',
            duration: 2000
          })
          return
        }       
        
        that.setData({
          recharge_skuid: result.recharge_skuid,
          recharge_price: result.recharge_price,
          recharge_selected:result.recharge_selected?result.recharge_selected:recharge_selected,
          recharge_image: result.recharge_image,
          recharge_title1: result.recharge_title1?result.recharge_title1:'6个月期', 
          recharge_title2: result.recharge_title2?result.recharge_title2:'1年期',
          recharge_title3: result.recharge_title3?result.recharge_title3:'3年期', 
          recharge_title4: result.recharge_title4?result.recharge_title4:'终身', 
          recharge_amount1: result.recharge_amount1?result.recharge_amount1:'88',
          recharge_amount2: result.recharge_amount2?result.recharge_amount2:'168', 
          recharge_amount3: result.recharge_amount3?result.recharge_amount3:'358', 
          recharge_amount4: result.recharge_amount4?result.recharge_amount4:'1888', 
          recharge_note: result.recharge_note?result.recharge_note:'',
          recharge_note2: result.recharge_note2?result.recharge_note2:'',
        },function(){
          that.queryCart()
        })
      }
    })  
  },

  navigateToOrder: function (e) {
    var status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '/pages/index/index?status=' + status
    })
  },
  
  queryCart: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var order_type = 'recharge'
    var order_shape = '8'
    var order_note = '会员充值'; 
    var recharge_image = that.data.recharge_image
    var buynum = 1
    var sku_sell_price = that.data.recharge_price
    var amount = parseFloat(sku_sell_price) * buynum
    var sku_id = that.data.recharge_skuid
    var is_buymyself = 1
    var goods_shape = 7 
    var recharge_title1 = that.data.recharge_title1 
    var recharge_title2 = that.data.recharge_title2 
    var recharge_title3 = that.data.recharge_title3 
    var recharge_title4 = that.data.recharge_title4 
    var recharge_amount1 = that.data.recharge_amount1
    var recharge_amount2 = that.data.recharge_amount2
    var recharge_amount3 = that.data.recharge_amount3
    var recharge_amount4 = that.data.recharge_amount4
    var recharge_note = that.data.recharge_note
    var recharge_note2 = that.data.recharge_note2
    wx.request({
      url: weburl + '/api/client/query_cart',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        sku_id: sku_id,
        goods_shape:goods_shape
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('my index queryCart:', res.data);
        var carts = [];
        if (!res.data.result) {
          wx.showToast({
            title: '会员充值:' + res.data.info,
            icon: 'none',
            duration: 1500
          })
          return
        }
        var cartlist = res.data.result.list;
        var index = 0;
        for (var key in cartlist) {
          cartlist[key]['sku_list'][0]['image'] = recharge_image
          for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
            if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
              cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image']
            } 
            cartlist[key]['sku_list'][i]['selected'] = true
            cartlist[key]['sku_list'][i]['shop_id'] = key
            cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id']
            carts[index] = cartlist[key]['sku_list'][i]
            index++;
          }
        }

        that.setData({
          carts: carts,
          all_rows: carts.length,
          is_buymyself:is_buymyself,
        })
      
        wx.navigateTo({
          url: '../order/recharge/recharge?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_shape=' + order_shape + '&order_image=' + recharge_image + '&recharge=1'+'&recharge_title1='+recharge_title1+'&recharge_amount1='+recharge_amount1+'&recharge_title2='+recharge_title2+'&recharge_amount2='+recharge_amount2+'&recharge_title3='+recharge_title3+'&recharge_amount3='+recharge_amount3+'&recharge_title4='+recharge_title4+'&recharge_amount4='+recharge_amount4+'&recharge_note='+recharge_note+'&recharge_note2='+recharge_note2+'&username=' + username + '&token=' + token
        })
      }
    })
  },

  navigateToAccount: function (e) {
    wx.navigateTo({
      url: '../member/account/account?'
    })
  },
  navigateToWishlist: function (e) {
    wx.navigateTo({
      url: '../wish/wish'
    })
  },
  navigateToShopowner: function (e) {
    wx.navigateTo({
      url: '../member/shopowner/shopowner?'
    })
  },
  navigateToCelebration: function (e) {
    var that = this
    var shop_type = that.data.shop_type
    wx.request({
      url: weburl + '/api/client/get_project_gift_para',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        shop_type: shop_type,
        type: 1,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data.result)
        var webviewurl = res.data.result

        that.setData({
          webviewurl: webviewurl,
          modalHiddenCele: !that.data.modalHiddenCele
        })
      }
    })
    
  },
  bindCelePickerChange: function (e) {
    var that = this
    var selected_index = e.detail.value
    var web_url = that.data.webviewurl[selected_index]['url']
    var web_id = that.data.webviewurl[selected_index]['id']
    console.log('celebration picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      web_url: web_url,
      web_id: web_id,
      index: selected_index,
    })
   
  },
  //确定按钮点击事件  祝福贺卡
  modalBindconfirmCele: function () {
    var that = this
    that.setData({
      modalHiddenCele: !that.data.modalHiddenCele,
    })
    wx.navigateTo({
      url: '../member/aboutus/aboutus?url='+that.data.web_url
    })
  },
  //取消按钮点击事件  祝福贺卡
  modalBindcancelCele: function () {
    var that = this
    that.setData({
      modalHiddenCele: !that.data.modalHiddenCele
    })
  },  

  //按钮点击事件  获取手机号
  modalBindconfirmPhone: function () {
    var that = this
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    /*
    if (user_phone){
      that.setData({
        modalHiddenPhone: !that.data.modalHiddenPhone
      })
    }else{
      var needPhoneNumber='需要您的手机号授权'
      that.setData({
        needPhoneNumber: needPhoneNumber
      })
    }
    */
  },  

  bindArtPickerChange: function (e) {
    var that = this
    var selected_index = e.detail.value
    var art_title = that.data.article[selected_index]['title']
    var art_image = that.data.article[selected_index]['image']
    var art_id = that.data.article[selected_index]['id']
    var art_cat_id = that.data.article[selected_index]['cat_id']
    console.log('article picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      art_title: art_title,
      art_id: art_id,
      art_cat_id: art_cat_id,
      art_index: selected_index,
      art_image: art_image ? art_image:that.data.share_art_image
    })

  },
  //确定按钮点击事件  文章
  modalBindconfirmArt: function () {
    var that = this
    that.showArt()
    
  },
  //取消按钮点击事件 文章
  modalBindcancelArt: function () {
    var that = this
    that.setData({
      modalHiddenArtInfo: true,
      modalHiddenArt: true,
      artinfoshowflag:0,
    })
  },  
  //确定按钮点击事件  文章内容
  modalBindconfirmArtInfo: function () {
    var that = this
    that.setData({
      modalHiddenArtInfo: true,
      modalHiddenArt: true,
      artinfoshowflag: 0,
    })
    that.setData({
      art_id: 0,
      art_cat_id: 0,
    })
  },
  //确定按钮点击事件  文章分享
  modalBindShareArtInfo: function () {
    var that = this
    that.setData({
      modalHiddenArtInfo: true,
      modalHiddenArt: true,
      artinfoshowflag: 0,
    })
    var selected_index = that.data.art_index
    var art_title = that.data.article[selected_index]['title']
    var art_image = that.data.article[selected_index]['image'] ? that.data.article[selected_index]['image']:that.data.share_art_image
    var art_id = that.data.article[selected_index]['id']
    var art_cat_id = that.data.article[selected_index]['cat_id']
    var art_wx_headimg = that.data.article[selected_index]['wx_headimg']
    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?share_art_id=' + art_id + '&share_art_cat_id=' + art_cat_id + '&share_art_image=' + art_image + '&share_art_wx_headimg=' + art_wx_headimg + '&share_art_title=' + art_title
    })
    that.setData({
      art_id: 0,
      art_cat_id: 0,
    })
  },
  navigateToMessage: function (e) {
    wx.navigateTo({
      url: '../member/message/message?'
    })
  },

  /*
  onGotUserInfo: function (e) {
    var that = this
    console.log('onGotUserInfo errMsg:', e.detail.errMsg, 'userInfo:', e.detail.userInfo, 'rawData:', e.detail.rawData)
    //console.log(e.detail.userInfo)
    //console.log(e.detail.rawData)
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('获取用户登录态 code:' + res.code);
          wx.request({
            url: weburl + '/api/WXPay/getOpenidAction',
            data: {
              js_code: res.code,
              appid: appid,
              appsecret: appsecret
            },
            method: 'POST',
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var user = res.data//返回openid
              wx.setStorageSync('openid', user.openid);
              wx.setStorageSync('session_key', user.session_key)
              wx.setStorageSync('username', user.openid) //用openid代替用户手机号登录
              that.setData({
                username: user.openid
              })
              console.log('获取用户OpenId:')
              console.log(user.openid)
              wx.navigateTo({
                url: '../login/login?frompage=/pages/my/index'
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  */
  customerService: function (url) {
    var that = this
    var web_view_url = url
    wx.navigateTo({
     // url: '../wechat/wechat'
      url: '../cs/cs'
    });
  },
  //确定按钮点击事件  银行卡
  modalBindconfirmBankcard: function () {
    var that = this
    that.setData({
      modalHiddenBankcard: !that.data.modalHiddenBankcard,
    })
    that.band_bank_card()
  },
  //取消按钮点击事件  银行卡
  modalBindcancelBankcard: function () {
    var that = this
    that.setData({
      modalHiddenBankcard: !that.data.modalHiddenBankcard
    })
  },  

  //确定按钮点击事件  用户协议
  modalBindconfirmAgreement: function () {
    var that = this
    that.setData({
      modalHiddenAgreement: !that.data.modalHiddenAgreement,
      art_id:0,
    })
    app.globalData.art_id = 0
    wx.setStorageSync('isReadAgreement', 1) //协议阅读标志
    that.goBack()
  },
  //取消按钮点击事件  用户协议
  modalBindcancelAgreement: function () {
    this.setData({
      modalHiddenAgreement: !this.data.modalHiddenAgreement
    })
  },  
  //确定按钮点击事件 会员制说明
  modalBindconfirmPlaysx: function () {
    var that = this
    that.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx,
      art_id: 0,
      art_cat_id: 0,
      playsxinfoshowflag: 0,
    })
    that.goBack()
  },
  //取消按钮点击事件 会员制说明
  modalBindcancelPlaysx: function () {
    this.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx,
      art_id: 0,
      art_cat_id: 0,
      playsxinfoshowflag: 0,
    })
    
  },  
  
  get_project_gift_para: function () {
    var that = this
    var navList_new = wx.getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
    var shop_type = that.data.shop_type
    var hall_banner = that.data.hall_banner
    console.log('hall get_project_gift_para navList2:', navList_new)
    if (navList2.length == 0) {
      //项目列表
      wx.request({
        url: weburl + '/api/client/get_project_gift_para',
        method: 'POST',
        data: {
          type: 2,  //暂定 1首页单图片 2首页轮播  
          shop_type: shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('get_project_gift_para:', res.data.result)
          navList_new = res.data.result;
          if (!navList_new) {
            /*
             wx.showToast({
               title: '没有菜单项2',
               icon: 'loading',
               duration: 1500
             });
             */
            return
          } else {
            wx.setStorageSync('navList2', navList_new)
            that.setData({
              navList2: navList_new,
              hall_banner: navList_new[3] ? navList_new[3] : hall_banner, //首页banner图
              middle1_img: navList_new[11]['img'],
              middle2_img: navList_new[12]['img'],
              middle3_img: navList_new[13]['img'],
              middle4_img: navList_new[14]['img'],
              middle1_title: navList_new[11]['title'],
              middle2_title: navList_new[12]['title'],
              middle3_title: navList_new[13]['title'],
              middle4_title: navList_new[14]['title'],
              middle1_note: navList_new[11]['note'],
              middle2_note: navList_new[12]['note'],
              middle3_note: navList_new[13]['note'],
              middle4_note: navList_new[14]['note'],
            })
          }
        }
      })
    } else {
      that.setData({
        navList2: navList_new,
        hall_banner: navList_new[3] ? navList_new[3] : hall_banner, //首页banner图
        middle1_img: navList_new[11]['img'],
        middle2_img: navList_new[12]['img'],
        middle3_img: navList_new[13]['img'],
        middle4_img: navList_new[14]['img'],
        middle1_title: navList_new[11]['title'],
        middle2_title: navList_new[12]['title'],
        middle3_title: navList_new[13]['title'],
        middle4_title: navList_new[14]['title'],
        middle1_note: navList_new[11]['note'],
        middle2_note: navList_new[12]['note'],
        middle3_note: navList_new[13]['note'],
        middle4_note: navList_new[14]['note'],
      })
    }

    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
    }, 1500)
  },
  onLoad: function (options) {
    var that = this
    var gifts_rcv = that.data.gifts_rcv
    var gifts_send = that.data.gifts_send
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var frompage = app.globalData.from_page ? app.globalData.from_page:options.frompage
    var scene = decodeURIComponent(options.scene)
    var art_id = options.art_id ? options.art_id:0
    
    var art_cat_id = options.art_cat_id ? options.art_cat_id:0
    var art_title = options.art_title ? options.art_title:''
    var refer_id = options.mid ? options.mid : 0
    var userInfo = wx.getStorageSync('userInfo')  
    var userauth = wx.getStorageSync('userauth')  
    //var my_index = app.globalData.my_index //1跳转传参
    that.get_project_gift_para()
    that.setData({
      scene:scene,
      m_id: m_id,
      art_id: art_id,
      art_cat_id: art_cat_id,
      art_title: art_title,
      refer_id: refer_id,  
      nickname: userInfo.nickName ? userInfo.nickName : '登录',
      avatarUrl: userInfo.avatarUrl ? userInfo.avatarUrl : '', 
      frompage: frompage,
      userauth: userauth,
    })
    console.log("my index onload options:", options, 'scene:', scene, ' userauth:', JSON.stringify(userauth))
    that.reloadData()
    //that.query_user_info()
  },
  onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var user_type = wx.getStorageSync('user_type') ? wx.getStorageSync('user_type') : 0
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
    var art_id =  app.globalData.art_id>0?app.globalData.art_id:that.data.art_id
    var scene = that.data.scene
    var modalHiddenPhone = that.data.modalHiddenPhone
    var modalHiddenUserName = that.data.modalHiddenUserName
    var userInfo = wx.getStorageSync('userInfo') 
    var isReadAgreement = wx.getStorageSync('isReadAgreement') ? wx.getStorageSync('isReadAgreement') : 0
    user_type = parseInt(user_type)
    console.log('my index onShow() user info:', userInfo, 'art_id:', art_id)
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/left_arrow.png',
      })
    }  
    that.query_user_info()
    if (userInfo){
      if (!user_phone || user_phone == '') { //必须获取手机号
        modalHiddenPhone = !modalHiddenPhone
        that.setData({
          modalHiddenPhone: modalHiddenPhone,
        })
      } else if (!user_name || user_name == '') {
        modalHiddenUserName = !modalHiddenUserName
        that.setData({
          modalHiddenUserName: modalHiddenUserName,
        })
      } else if (isReadAgreement == 0 && username) { //已登录未阅读用户购买协议
        that.navigateToAgreement()
      }
    }
    that.setData({
      user_type: user_type,
      art_id:art_id,
      userInfo:userInfo,
      user_name:user_name,
    })
    //调用应用实例的方法获取全局数据
    /*
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
    */
    if (scene.indexOf("artid=") >= 0 || scene.indexOf("&catid=") >= 0) {
      var artidReg = new RegExp(/(?=artid=).*?(?=\&)/)
      var artcatidReg = new RegExp(/(?=catid=).*?(?=\&)/)
      var midReg = new RegExp(/\&mid=(.*)/)

      var scene_artid = scene.match(artidReg)[0]
      art_id = scene_artid ? scene_artid.substring(6, scene_artid.length) : art_id
      var scene_artcatid = scene.match(artcatidReg)[0]
      art_cat_id = scene_artcatid ? scene_artcatid.substring(6, scene_artcatid.length) : art_cat_id
      var scene_mid = scene.match(midReg) ? scene.match(midReg)[0] : 0
      refer_mid = scene_mid ? scene_mid.substring(5, scene_mid.length) : refer_mid
      console.log('scene_art_id:', scene_artid, 'scene_art_cat_id:', scene_artcatid, 'refer_id:', refer_mid)//输出  
    }
    if (art_id>0){
      if(art_id == 29){
        that.navigateToAgreement()
      }else{
        that.navigateToPlaysx()
      }
    }
    //that.reloadData()
    console.log('my index user_type:',that.data.user_type)
    if(that.data.scrollTop == 0){
      that.goTop()
    }
  },
  /*
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePath = res.tempFilePaths[0]
      }
    })
  },
  */
  login: function () { 
    var that = this
    wx.navigateTo({
      url: '/pages/login/login?frompage=/pages/my/index'
    })
  },

  navigateToAboutus: function () {
    wx.navigateTo({
      url: '/pages/member/aboutus/aboutus'
    })
  },
  navigateToDonate: function () {
    wx.navigateTo({
      url: '/pages/member/donate/donate'
    })
  },

  image_save: function (image_url, image_cache_name) {
    var that = this
    console.log('membershare imge save image url:', image_url, 'image_cache_name:', image_cache_name)
    wx.downloadFile({
      url: image_url,
      success: function (res) {
        if (res.statusCode === 200) {
          var img_tempFilePath = res.tempFilePath
          // console.log('图片下载成功' + res.tempFilePath)
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              wx.setStorageSync(image_cache_name, res.savedFilePath)
              console.log('membershare image_save 用户分享图片缓存成功', image_cache_name, res.savedFilePath)
            },
            fail(res) {
              console.log(' membershare image_save 用户图片缓存失败', image_cache_name, res)
              var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
              var membershare_qrcode_cache = wx.getStorageSync('membershare_qrcode_cache_' + that.data.act_id)
              fs.getSavedFileList({
                success(res) {
                  console.log('membershare getSavedFileList 缓存文件列表', res)
                  for (var i = 0; i < res.fileList.length; i++) {
                    if (res.fileList[i]['filePath'] != wx_headimg_cache && res.fileList[i]['filePath'] != membershare_qrcode_cache) {
                      fs.removeSavedFile({
                        filePath: res.fileList[i]['filePath'],
                        success(res) {
                          console.log('membershare image_save 缓存清除成功', res)
                        },
                        fail(res) {
                          console.log('membershare image_save 缓存清除失败', res)
                        }
                      })
                    }
                  }
                  fs.saveFile({
                    tempFilePath: img_tempFilePath, // 传入一个临时文件路径
                    success(res) {
                      wx.setStorageSync(image_cache_name, res.savedFilePath)
                    },
                  })
                },
                fail(res) {
                  console.log('membershare getSavedFileList 缓存文件列表查询失败', res)
                }
              })
            },
          })
        } else {
          console.log('membershare image_save 响应失败', res.statusCode)
        }
      }
    })
  },
  navigateToShare: function () {
    var that = this
    var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
    //var share_member_qrcode = wx.getStorageSync('member_qrcode_cache_' + m_id)
    var qr_type = 'membershare'
   // var share_member_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + appsecret + '&shop_type=' + shop_type + '&qr_type=' + qr_type
    //that.image_save(share_member_qrcode, 'member_qrcode_cache_' + m_id)
    /*
    wx.showToast({
      title: "加载中...",
      icon: 'loading',
      duration: 1500,
    })
    setTimeout(function () {
      that.setData({
        loadingHidden: true,
      })
      //var share_member_qrcode_cache = wx.getStorageSync('member_qrcode_cache_' + m_id)
    
    }, 1300)
    */
    wx.navigateTo({
      url: '/pages/member/share/share?qr_type=membershare' //+ '&share_member_qrcode_cache=' + share_member_qrcode_cache
    })
  },
  navigateToCoupon: function () {
    wx.navigateTo({
      url: '/pages/member/couponsnd/couponsnd'
    })
  },
  navigateToMyCoupon: function () {
    wx.navigateTo({
      url: '/pages/member/couponmy/couponmy'
    })
  },
   navigateToMyRedpackage: function () {
    wx.navigateTo({
      url: '/pages/member/couponmy/couponmy?red=1'
    })
  },

  navigateToCustomerservice: function () {
    wx.navigateTo({
      url: '/pages/wechat/wechatlist/wechatlist'
    })
  },

  showsendheartapp: function (e) {
    var that = this
    var data_info = that.data.sendheartappurl
    wx.setClipboardData({
      data: data_info,
      success: function () {
        console.log('copyorderinfo success data:', data_info);
      }
    })
    that.setData({
      sendheartappHidden: true,
    })
  },
  closesendheartapp: function (e) {
    var that = this
    that.setData({
      sendheartappHidden: false,
    })
  },

  query_user_info:function () {
    var that = this
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var user_phone = wx.getStorageSync('user_phone') ? wx.getStorageSync('user_phone') : ''
    var user_name = wx.getStorageSync('user_name') ? wx.getStorageSync('user_name') : ''
    var shop_type = that.data.shop_type
    that.setData({
      username: username,
    })
   
    wx.request({
      url: weburl + '/api/web/user/login/user_xcx_login',
      method: 'POST',
      data: { 
        username: username ?username:openid, 
        wx_nickname:that.data.wx_nickname,
        wx_headimg:that.data.wx_headimg,
        user_phone: user_phone,
        user_name: user_name,
        login_type:1,
        type:8,
        shop_type:shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        /*      
        let card_due_end_str = res.data.result['card_due_end'] +' 23:59:59'
				let time_due_end = new Date(card_due_end_str).getTime()
        let time_now = new Date().getTime()
        let is_card_overdue = Math.floor((time_now - parseInt(time_due_end)) / 1000)>0?true:false 
        */
        console.log('my index login 用户基本信息:',res.data.result)      
        that.setData({
          token: res.data.result['token'],
          user_group_id:res.data.result['member_group_id'],
          user_group_name:res.data.result['member_group_name'],
          card_name:res.data.result['card_name'],
          card_logo:res.data.result['card_logo']?res.data.result['card_logo']:that.data.default_card_logo,
          card_no:res.data.result['card_no']?res.data.result['card_no']:'',
          card_due_start:res.data.result['card_due_start'],
          card_due_end:res.data.result['card_due_end'],
          is_card_overdue:res.data.result['is_card_overdue']?res.data.result['is_card_overdue']:false,
          user_name:res.data.result['user_name'],
          user_gender:res.data.result['user_gender'],
        })

          
        var userauth = JSON.parse(res.data.result['userauth'])
        wx.setStorageSync('token', res.data.result['token'])
        wx.setStorageSync('extensionCode', res.data.result['extensionCode'])
        wx.setStorageSync('username', res.data.result['username'])
        wx.setStorageSync('m_id', res.data.result['m_id'])
        wx.setStorageSync('user_phone', res.data.result['user_phone'])
        wx.setStorageSync('user_name', res.data.result['user_name'])
        wx.setStorageSync('user_gender', res.data.result['user_gender'])
        wx.setStorageSync('user_type', res.data.result['user_type'])
        wx.setStorageSync('userauth', userauth)
        wx.setStorageSync('user_group_id', res.data.result['member_group_id'])
        wx.setStorageSync('user_group_name', res.data.result['member_group_name'])
        wx.setStorageSync('card_name', res.data.result['card_name'])
        wx.setStorageSync('card_logo', res.data.result['card_logo'])
        wx.setStorageSync('card_no', res.data.result['card_no'])
        wx.setStorageSync('card_due_start', res.data.result['card_due_start'])
        wx.setStorageSync('card_due_end', res.data.result['card_due_end'])
      },
    })
  },

  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var share_art_id = that.data.art_id
    var share_art_cat_id = that.data.art_cat_id
    var share_art_image = that.data.art_image ? that.data.art_image: that.data.share_art_image
    var share_art_title = that.data.art_title
    var m_id = that.data.m_id > 0 ? that.data.m_id : 0
    var scene = 'art_id=' + that.data.art_id + '&art_cat_id=' + that.data.art_cat_id + '&mid=' + m_id
    return {
      title: share_art_title,
      desc: share_art_title,
      imageUrl: share_art_image,
      path: '/pages/my/index?art_id=' + share_art_id + '&art_cat_id=' + share_art_cat_id + '&image=' + share_art_image + '&refer_id=' + m_id,
      // path: '/pages/details/details?scene=' + encodeURIComponent(scene)
    }
  }
})