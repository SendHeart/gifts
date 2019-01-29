var wxparse = require("../../wxParse/wxParse.js");
var app = getApp();
var weburl = app.globalData.weburl;
var appid = app.globalData.appid;
var appsecret = app.globalData.secret;
var user_type = app.globalData.user_type ? app.globalData.user_type:0;
var shop_type = app.globalData.shop_type;
var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : '';
var navList2 = wx .getStorageSync('navList2') ? wx.getStorageSync('navList2') : [{}]
Page({
  data:{
    title_name: '我的',
    title_logo: '../../images/footer-icon-05.png',
    nickname: userInfo.nickName,
    avatarUrl: userInfo.avatarUrl,
    hideviewagreementinfo: true,
    agreementinfoshowflag: 0,
    playsxinfoshowflag: 0,
    scrollTop: 0,
    scrollTop_init: 10,
    modalHiddenAgreement:true,
    modalHiddenBankcard: true,
    modalHiddenPlaysx: true,
    shop_type:shop_type,
    index: 0,
     
  },
  setNavigation: function () {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  goBack: function () {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      wx.switchTab({
        url: '../hall/hall'
      })
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

  navigateToAgreement:function(){
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    var art_id = '21'  //送心用户协议
    var art_cat_id = '9'  //送心协议类
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
          })
          console.log('送心协议:', that.data.agreementInfo)
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
    var art_id = '22'  //玩转送心
    var art_cat_id = '9'  //送心协议类
    var playsxinfoshowflag = that.data.playsxinfoshowflag

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
          console.log('玩转送心:', that.data.playsxInfo)
          that.showPlaysxinfo()
        }

      })
    } else {
      that.showPlaysxinfo()
    }


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
      wxparse.wxParse('dkcontent1', 'html', winPage.data.agreementInfo[0]['desc'], winPage, 1)
     
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
      wxparse.wxParse('dkcontent2', 'html', winPage.data.playsxInfo[0]['desc'], winPage, 1)
    }

  },

  navigateToOrder: function (e) {
    var status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: '../../order/list/list?status=' + status
    });
  },
  navigateToAccount: function (e) {
    wx.navigateTo({
      url: '../member/account/account?'
    })
  },
  navigateToShopowner: function (e) {
    wx.navigateTo({
      url: '../member/shopowner/shopowner?'
    })
  },
  navigateToMessage: function (e) {
    wx.navigateTo({
      url: '../member/message/message?'
    })
  },

  onGotUserInfo: function (e) {
    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
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
                url: '../login/login?wechat=1'
              })
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  customerService: function (e) {
    wx.navigateTo({
     // url: '../wechat/wechat'
      url: '../cs/cs'
    });
  },
  //确定按钮点击事件  银行卡
  modalBindaconfirmBankcard: function () {
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
  modalBindaconfirmAgreement: function () {
    var that = this
    that.setData({
      modalHiddenAgreement: !that.data.modalHiddenAgreement,
    })
    wx.setStorageSync('isReadAgreement', 1) //协议阅读标志
    that.goBack()

  },
  //取消按钮点击事件  用户协议
  modalBindcancelAgreement: function () {
    this.setData({
      modalHiddenAgreement: !this.data.modalHiddenAgreement
    })
  },  
  //确定按钮点击事件  玩转送心
  modalBindaconfirmPlaysx: function () {
    this.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx,

    })
  },
  //取消按钮点击事件  玩转送心
  modalBindcancelPlaysx: function () {
    this.setData({
      modalHiddenPlaysx: !this.data.modalHiddenPlaysx
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
  onLoad: function () {
    var that = this
    var gifts_rcv = that.data.gifts_rcv
    var gifts_send = that.data.gifts_send
    var openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : ''
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    that.get_project_gift_para()
    console.log("openid:" + openid + ' username:' + username)
    if (!username) { // 登录
      wx.navigateTo({
        url: '../login/login?'
      })
    }
  },
  onShow: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var user_type = wx.getStorageSync('user_type') ? wx.getStorageSync('user_type') : 0
    var isReadAgreement = wx.getStorageSync('isReadAgreement') ? wx.getStorageSync('isReadAgreement'):0
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../../images/left_arrow.png',
      })
    }  
    if (isReadAgreement == 0 && username){ //已登录未阅读用户购买协议
      that.navigateToAgreement()
    }
    that.setData({
      user_type: user_type,
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
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
  navigateToShare: function () {
    wx.navigateTo({
      url: '/pages/member/share/share?qr_type=membershare'
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
  }
})