var app = getApp();
var wxparse = require("../../wxParse/wxParse.js");
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var from_page = app.globalData.from_page;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid;
var secret = app.globalData.secret;
Page({
    data: {
        title_name: '详情',
        title_logo: '../../images/footer-icon-05.png',
        share_title:'这个礼物真不错，来看看吧，要是你能送我就更好了~',
        share_desc:'送礼就是送心',
        share_avatarUrl: weburl + '/uploads/avatar.png',
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        user:null,
        userInfo:{},
        username:null,
        indicatorDots: true,
        vertical: false,
        autoplay: true,
        page:1,
        interval: 3000,
        duration: 1200,
        goodsname:'',
        goodsshortname: '',
        goodsinfo:[],
        goodsprice: 0,
        goodssale: 0,
        goodsid: 0,
        sku_gov_price:0,
        sku_earnest_price:0,
        sku_sell_price: 0,
        sku_id:0,
        commodityAttr:[],
        attrValueList:[],
        firstIndex:0,
        cur_img_id:0,
        image:'',
        image_pic:[],
        hideviewgoodsinfo:true,
        hideviewgoodspara:true,
        dkheight: 300,
        scrollTop: 0,
        scrollTop_init:10,
        toView: 'red',
        hideviewgoodsinfoflag:true, 
        hideviewgoodsparaflag:true,
        modalHidden: true,//是否隐藏对话框  
        dkcontent:[],
        goodsPicsInfo:[],
        selectValueInfo:'',
        wishflag:0,
        goodsinfoshowflag:0,
        shop_type:shop_type,
        comm_list: [],
    },
    /*
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
  */
  goBack: function () {
    var pages = getCurrentPages();
    console.log('details goBack pages:', pages)
    if (pages.length > 1) {
      wx.navigateBack({ changed: true });//返回上一页
    } else {
      app.globalData.from_page = '/pages/details/details'
      app.globalData.hall_gotop = 1
      wx.switchTab({
        url: '/pages/hall/hall'
      })
    }
  },
  commTapTag: function () {
    var that = this
    wx.navigateTo({
      url: '../goods/commentlist/commentlist?goods_id=' + that.data.goodsid
    })

  },
  mycommTapTag: function () {
    var that = this
    var goods_skuid = that.data.commodityAttr[0]['id']
    var goods_id = that.data.goodsid
    wx.navigateTo({
      url: '../goods/comment/comment?goods_id=' + goods_id + '&goods_skuid=' + goods_skuid +'&comm_type='+1
    })

  },
  returnTapTag: function () {
    var that = this
    wx.switchTab({
      url: '/pages/hall/hall'
    })

  },
  swiperchange: function (e) {
    var that = this
    //console.log(e)
    console.log('detail swiperchange:', e.detail.current)
    that.setData({
      cur_img_id: e.detail.current,
    })
  },
  sharegoodsTapTag: function () {
    var that = this
    var share_goods_id = that.data.goodsid
    var share_goods_image = that.data.image_pic[that.data.cur_img_id]['url']
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : that.data.share_avatarUrl
    var share_goods_title = that.data.share_title
    var share_goods_desc = that.data.share_desc
    var share_avatarUrl = that.data.share_avatarUrl
    var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
    var goods_image_cache = wx.getStorageSync('goods_image_cache')
    var share_goods_qrcode = wx.getStorageSync('goods_qrcode_cache')
    share_goods_wx_headimg = wx_headimg_cache ? wx_headimg_cache : share_goods_wx_headimg
    if (that.data.cur_img_id==0){ 
      share_goods_image = goods_image_cache ? goods_image_cache : share_goods_image
    }
   
    console.log('sharegoodsTapTag share_goods_qrcode:', share_goods_qrcode, 'share_goods_id:', share_goods_id)
    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?share_goods_id=' + share_goods_id + '&share_goods_image=' + share_goods_image + '&share_goods_wx_headimg=' + share_goods_wx_headimg + '&share_goods_title=' + share_goods_title + '&share_goods_desc=' + share_goods_desc + '&share_goods_image2=' + that.data.image_pic[that.data.cur_img_id]['url'] + '&share_goods_qrcode_cache=' + share_goods_qrcode 
    })
    wx.getStorageInfo({
      success: function (res) {
        console.log('detail 缓存列表 keys::', res.keys, 'currentSize:', res.currentSize, 'limitSize:', res.limitSize)
      }
    })
  },

  image_save:function(image_url,image_cache_name){
    var that = this
    console.log('imge save image url:', image_url, 'image_cache_name:', image_cache_name)
    wx.downloadFile({
      url: image_url,
      success: function (res) {
        if (res.statusCode === 200) {
          var img_tempFilePath = res.tempFilePath
          console.log('图片下载成功' + res.tempFilePath)
          const fs = wx.getFileSystemManager()
          fs.saveFile({
            tempFilePath: res.tempFilePath, // 传入一个临时文件路径
            success(res) {
              console.log('detail image_save 图片缓存成功', res.savedFilePath)  
              wx.setStorageSync(image_cache_name, res.savedFilePath)
            },
            fail(res) {
              console.log(' detail image_save 图片缓存失败', res) 
              var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
              var goods_image_cache = wx.getStorageSync('goods_image_cache')
              var goods_qrcode_cache = wx.getStorageSync('goods_qrcode_cache')
              fs.getSavedFileList({
                success(res) {
                  console.log('detail getSavedFileList 缓存文件列表', res)
                  for (var i = 0; i < res.fileList.length;i++){
                    if (res.fileList[i]['filePath'] != wx_headimg_cache && res.fileList[i]['filePath'] != goods_image_cache && res.fileList[i]['filePath'] != goods_qrcode_cache){
                      fs.removeSavedFile({
                        filePath: res.fileList[i]['filePath'],
                        success(res) {
                          console.log('detail image_save 缓存清除成功', res)
                        },
                        fail(res) {
                          console.log('detail image_save 缓存清除失败', res)
                        }
                      })
                    }
                  }
                  fs.saveFile({
                    tempFilePath: img_tempFilePath, // 传入一个临时文件路径
                    success(res) {
                      console.log('image_save 图片缓存成功', res.savedFilePath)
                      wx.setStorageSync(image_cache_name, res.savedFilePath)
                    },
                  })
                },
                fail(res) {
                  console.log('detail getSavedFileList 缓存文件列表查询失败', res)
                }
              })
            },
          })
        } else {
          console.log('image_save 响应失败', res.statusCode)
        }
      }
    })
  },
  //点击播放按钮，封面图片隐藏,播放视频
  bindplay: function (e) {
    console.log('detail bindplay 响应失败', e)
    this.setData({
      tab_image: "none"
    }),
      this.videoContext.play()
  },
  onLoad:function(options) {
        var that = this
        var phonemodel = wx.getStorageSync('phonemodel') ? wx.getStorageSync('phonemodel') : 'Andriod'
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        username = options.username ? options.username : username
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var page = that.data.page
        var scene = decodeURIComponent(options.scene)
        var goodsname = options.name
        //var goodsshortname = goodsname?goodsname.substring(0,13)+'...':''
        var goodsid = options.id
        var share_goods_id = options.goodsid
        goodsid = goodsid ? goodsid : share_goods_id
        var refer_mid = options.mid ? options.mid:0
        var goodsinfo = options.goods_info ? options.goods_info:''
        var goodsprice = options.goods_price
        var marketprice = options.goods_marketprice 
        var goodssale = options.sale
        var image = options.image
        var activity_image = options.activity_image
        var share_goods_image = activity_image ? activity_image : image
        var shop_type =  that.data.shop_type
        var qr_type = 'wishshare' 
        var image_video = []
        var image_pic = []
      
        console.log('detail options:', options)
        that.setData({
          is_apple: phonemodel.indexOf("iPhone")>= 0?1:0
        })
        
        if (image.indexOf(".mp4") >= 0) {
          var video_init = {
            id: 0,
            url: image,
            activity_image: activity_image,
          }
          image_video.push(video_init)
          that.setData({
            image_video: image_video,
          })
        }else{
          var image_init = {
            id: 0,
            goods_id: goodsid,
            url: activity_image ? activity_image : image,
          }
          image_pic.push(image_init)
          that.setData({
            image_pic: image_pic,
          })
        }
     
        that.showGoodspara()
        goodsinfo = goodsinfo == 'undefined' ? '' : goodsinfo
        that.setData({
          goodsname: goodsname ? goodsname:'',
          goodsinfo: goodsinfo ? goodsinfo:'',
         // goodsshortname: goodsshortname ? goodsshortname:'',
          goodsid: goodsid ? goodsid:0,
          refer_mid: refer_mid,
          goodsprice: goodsprice ? goodsprice:0,
          marketprice: marketprice ? marketprice : '',
          goodssale: goodssale ? goodssale:0,
        })
    var share_goods_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + goodsid
    that.image_save(share_goods_qrcode, 'goods_qrcode_cache')
    console.log('商品分享二维码下载缓存 goods_qrcode_cache', 'share_goods_image:', share_goods_image)
  
    console.log('detail onLoad goodsid:', goodsid, ' share_goods_image:', share_goods_image, ' goodsname:', goodsname, ' goodsinfo:', goodsinfo, 'scene:', scene);
        //that.setNavigation()
        if (goodsid>0){
          that.image_save(share_goods_image, 'goods_image_cache')
          console.log('商品详情图片下载缓存 goods_image_cache', share_goods_image)
          wx.request({
            url: weburl + '/api/client/get_goods_list',
            method: 'POST',
            data: { 
              username: options.username ? options.username : username, 
              access_token: token, 
              goods_id: options.id,
              refer_mid: refer_mid,
              shop_type:shop_type
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var goods_info = res.data.result
              var ret_info = res.data.info
              console.log('获取单个产品信息 res.data:',res.data,' goods info:',goods_info);
              if (goods_info) {
                that.setData({
                  goodsname: goods_info[0]['name'],
                  goodsinfo: goods_info[0]['act_info'],
                  goodstag: goods_info[0]['goods_tag'],
                  goodsprice: goods_info[0]['sell_price'],
                  marketprice: goods_info[0]['market_price'],
                  goodssale: goods_info[0]['sale'],
                  //goodsshortname: goods_info[0]['name'] ? goods_info[0]['name'].trim().substring(0, 20) + '...' : '',
                  goodscoverimg: goods_info[0]['activity_image'],
                  share_title: goods_info[0]['3D_image'] ? goods_info[0]['3D_image']:that.data.share_title, 
                  share_goods_wx_headimg: goods_info[0]['share_goods_wx_headimg'],
                })
                //var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
                that.image_save(that.data.share_goods_wx_headimg, 'wx_headimg_cache')
                console.log('头像图片下载缓存 wx_headimg_cache')
                
              }else{
                wx.showToast({
                  title: '商品已下架',
                  icon: 'loading',
                  duration: 3000
                })
                setTimeout(function () {
                  wx.navigateBack();
                }, 1500)
              }
            }
          })
        }else{
          console.log('单个产品名称为空',goodsid);
          return
        }

        // 商品详情图片
        console.log('商品详情图片', image_pic)
      
        wx.request({
          url: weburl+'/api/client/get_goodsdesc_list',
          method: 'POST',
          data: { 
            username: username, 
            access_token: token, 
            goods_id: options.id, 
            page: page,
            shop_type: shop_type 
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('get_goodsdesc_list:', res.data.result)
            var goodsPicsInfo = res.data.result
           
            for (var i = 1; i < goodsPicsInfo.image.length;i++){
              if (goodsPicsInfo.image[i]['ext'] == 'mp4'){
                image_video.push(goodsPicsInfo.image[i])
              }else{
                image_pic.push(goodsPicsInfo.image[i])
              }
            }
            that.setData({
              goodsPicsInfo: res.data.result,
              image_video: image_video,
              image_pic: image_pic,
            })
            console.log('get_goodsdesc_list image_pic:', that.data.image_pic)
          that.showGoodsinfo()
          }
         
        })
        // 商品SKU
        wx.request({
          url: weburl+'/api/client/get_goodssku_list',
          method: 'POST',
          data: { 
            username: username,
            access_token: token, 
            goods_id: options.id, 
            shop_type:shop_type,
            page: page 
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('goods_sku:',res.data.result);
            var attrValueList = res.data.result.spec_select_list ? res.data.result.spec_select_list:'';
            var commodityAttr = res.data.result.sku_list ? res.data.result.sku_list:'{}';
            if (!commodityAttr) return; 
            for (var i = 0; i < commodityAttr.length; i++) {
              if (commodityAttr[i].attrValueStatus) {
                commodityAttr[i].attrValueStatus = true;
              } else {
                commodityAttr[i].attrValueStatus = false;
              }
            }
            that.setData({
              commodityAttr: commodityAttr
            })
            
            if (!attrValueList ) return
            for (var i = 0; i < attrValueList.length; i++) {
              if (!attrValueList[i].attrValueStatus) {
                attrValueList[i].attrValueStatus = true
              } 
            }
           
            that.setData({
              attrValueList: attrValueList
            })

          }
      })
  
      // 商品评价
      wx.request({
        url: weburl + '/api/client/get_order_comment',
        method: 'POST',
          data: {
          username: username,
          access_token: token,
          goods_id: goodsid,
          query_type: 1,  //1查商品所有评价 0查本人对商品的评价
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
            
            that.setData({
              comm_list: that.data.comm_list.concat(comm_list),
              all_rows: all_rows,
            })
            //console.log('获取订单评论信息 :' + comm_list, 'goods_id:', goodsid );
            console.log('获取订单评论信息:', comm_list, ' all rows:',all_rows)
          }
        }
      })
    },
  
    //事件处理函数 选择型号规格  
    goodsmodel: function () {
      var that = this
      var modalHidden = that.data.modalHidden
      var sku_id = that.data.commodityAttr[0].id
      var attrValueList = that.data.attrValueList
      var sku_sell_price = that.data.commodityAttr[0].sell_price
      if(attrValueList.length>0){
        
        that.setData({
          modalHidden: !modalHidden,
          sku_id: sku_id,
          sku_sell_price: sku_sell_price,
          add_cart_title: '商品名称',
          wishflag: 0,
        })
        console.log('购买送出 挑选 sku_id:' + that.data.commodityAttr[0].id, 'modalHidden:', that.data.modalHidden);
      }else{
        console.log('购买送出 sku_id:' + that.data.commodityAttr[0].id, 'attrValueList:', attrValueList);
        that.setData({
          sku_id: sku_id,
          wishflag: 0,
        })
        that.addCart()
      }
      
    },
    wishCart: function () {
      var that = this
      var attrValueList = that.data.attrValueList
      if (attrValueList.length > 0) {
        that.setData({
          modalHidden: !that.data.modalHidden,
          sku_id: that.data.commodityAttr[0].id,
          add_cart_title: '商品名称',
          wishflag: 1,
        })
      } else {
        that.setData({
          sku_id: that.data.commodityAttr[0].id,
          wishflag: 1,
        })
        that.addCart()
      }
      
    },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      this.setData({
        modalHidden: !this.data.modalHidden,
       
      }),
      this.addCart();
    },
    //取消按钮点击事件  
    modalBindcancel: function () {
      this.setData({
        modalHidden: !this.data.modalHidden
      })
    },  
    addCart: function () {
      var that = this
      var username = wx.getStorageSync('username');
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + that.data.goodsid
        })
      }else{
        if (that.data.sku_id){
          that.insertCart(that.data.sku_id, username,that.data.wishflag);
        }else{
          wx.showToast({
            title: '该产品无货',
            icon: 'loading',
            duration: 1500
          });
        }
      }
      
    },
    insertCart: function (sku_id,username,wishflag) {
      var that = this
      var shop_type = that.data.shop_type
      wx.request({
        url: weburl + '/api/client/add_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: "1",
          sku_id: sku_id,
          wishflag: wishflag,
          shop_type:shop_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('details insertCart res data:', res.data, ' wishflag：', wishflag);
          var title = wishflag == 1 ? '已加入心愿单' : '已加入礼物袋'
          wx.showToast({
            title: title,
            duration: 2000
          })
          app.globalData.from_page = '/pages/details/details'
          if (wishflag == 1) {
            /*
            wx.navigateTo({
              url: '/pages/details/details'
            })
            */
            wx.navigateTo({
              url: '/pages/wish/wish'
            })
          } 
          else {
            console.log('details insertCart wishflag:', wishflag)
            app.globalData.hall_gotop = 1
            wx.switchTab({
              url: '/pages/hall/hall'
            })
          }

        }

      })
      /*
      // 加入购物车
      var title = wishflag == 1 ? '确认要加入心愿单吗' :'确认要购买送出吗'
      wx.showModal({
        title: '提示',
        content: title,
        success: function (res) {
          if (res.confirm) {
            // 加入购物车
            var that=this;
            

          }
        }
      })
      */
    },
    showCartToast: function (message) {
      wx.showToast({
        title: message ? message:'添加成功',
        icon: 'success',
        duration: 1000
      });
    },

 
    showCart: function () {
      app.globalData.from_page = '/pages/details/details'
      console.log('details insertCart showCart:', app.globalData.from_page )
      wx.switchTab({
        url: '../hall/hall'
      });
    },

    showGoodsinfo: function () {
      // 获得高度  
      let winPage = this;
      winPage.setData({
        //hideviewgoodsinfo: (!winPage.data.hideviewgoodsinfo),
        hideviewgoodsinfo:false,
      })
      
      if (winPage.data.hideviewgoodsinfoflag){
        if (winPage.data.goodsinfoshowflag==0){
          wxparse.wxParse('dkcontent1', 'html', winPage.data.goodsPicsInfo.desc['desc'], winPage, 1)
        }
      }
      winPage.setData({
        hideviewgoodsinfoflag: !winPage.data.hideviewgoodsinfoflag,
        goodsinfoshowflag: 1,
        scrollTop: winPage.data.scrollTop_init
      })
    },

    showGoodspara: function () {
      // 获得高度  
      var winPage = this;
      winPage.setData({
        hideviewgoodspara: (!winPage.data.hideviewgoodspara)
      })
      if (winPage.data.hideviewgoodsparaflag) {
        wx.getSystemInfo({
          success: function (res) {
            let winHeight = res.windowHeight;
            let winWidth = res.windowWidth;
            console.log('detail getSystemInfo:',res);
            winPage.setData({
              dkheight: winHeight - winHeight * 0.05 - 100,
              winHeight: winHeight,
              winWidth: winWidth,
            })
            wx.setStorageSync('systeminfo', res.system)
            wx.setStorageSync('phonemodel', res.model)
          }
        })
        if (winPage.data.goodsPicsInfo.desc){
          wxparse.wxParse('dkcontent2', 'html', winPage.data.goodsPicsInfo.desc['desc2'], winPage, 1)
        }
      }
      winPage.setData({
        hideviewgoodsparaflag: false
      })
    },

    upper: function (e) {
      //console.log(e)
    },
    lower: function (e) {
      //console.log(e)
    },
    scroll: function (e) {
      //console.log(e)
    },

    getAttrIndex: function (attrName, attrValueList) {
      // 判断数组中的attrKey是否有该属性值 
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrName == attrValueList[i].name) {
          break
        }
      }
      return i < attrValueList.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
      // 判断是否已有属性值 
      for (var i = 0; i < valueArr.length; i++) {
        if (valueArr[i] == value) {
          break
        }
      }
      return i < valueArr.length;
    },
    /* 选择属性值事件 */
    selectAttrValue: function (e) {
      /* 
      点选属性值，联动判断其他属性值是否可选 
      { 
      attrKey:'型号', 
      attrValueList:['1','2','3'], 
      selectedValue:'1', 
      attrValueStatus:[true,true,true] 
      } 
      console.log(e.currentTarget.dataset); 
      */
      var that = this
      var attrValueList = that.data.attrValueList;
      var index = e.currentTarget.dataset.index;//属性索引 
      var firstIndex = that.data.firstIndex
      var valueindex = e.currentTarget.dataset.valueindex;//属性索引 
      var key = e.currentTarget.dataset.key;
      var value = e.currentTarget.dataset.value;
      var status = e.currentTarget.dataset.status
      var selectedvalue = e.currentTarget.dataset.selectedvalue
      this.setData({
        
        firstIndex: index,
        secondIndex: valueindex,
      });
      if (status || valueindex == that.data.secondIndex) {
        if (attrValueList[index].type==2){
          value = attrValueList[index].note[valueindex]
        }
        if (selectedvalue == value) {
          // 取消选中 
          that.disSelectValue(index, key, value);
        } else {
          // 选中 
          that.selectValue( index, key, value);
        }

      }
      that.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        sku_sell_price: '',
      })
      var selectValueInfo='';
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          selectValueInfo = selectValueInfo + attrValueList[i].selectedValue+';';
        }
      }
      
      for (var i = 0; i < that.data.commodityAttr.length; i++) {
        if (selectValueInfo.indexOf(that.data.commodityAttr[i].sku_key)>=0) {
          that.setData({
            sku_id: that.data.commodityAttr[i].id,
            sku_gov_price: that.data.commodityAttr[i].gov_price,
            sku_earnest_price: that.data.commodityAttr[i].earnest_price,
            sku_sell_price: that.data.commodityAttr[i].sell_price,
          })
          //break
        }
        
      }

      
     
    },
    /* 选中 */
    selectValue: function (index, key, value) {
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = value;
    
      that.setData({
        attrValueList: attrValueList,
      
      })
     // console.log('selectValueInfo 选中信息:', attrValueList,' index:',index); 
    },
    /* 取消选中 */
    disSelectValue: function (index, key, value) {
      //var commodityAttr = this.data.commodityAttr;
      var that = this
      var attrValueList = that.data.attrValueList
      attrValueList[index].selectedValue = '';
      this.setData({
      
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        attrValueList: attrValueList
      })
     // console.log('selectValueInfo 取消选中信息:', attrValueList,' index:',index); 
    },
    
  onShow: function () {
     var that = this
    var pages = getCurrentPages()
    if (pages.length > 1) {
      that.setData({
        title_logo: '../../images/back.png'
      })
    }  
      //console.log('App Show');
   // this.distachAttrValue(this.data.attrValueList);
      // 只有一个属性组合的时候默认选中 
      // console.log(this.data.attrValueList); 
      /*
      if (this.data.commodityAttr.length == 1) {
        for (var i = 0; i < this.data.commodityAttr[0].attrValueList.length; i++) {
          this.data.attrValueList[i].selectedValue = this.data.commodityAttr[0].attrValueList[i].attrValue;
        }
        this.setData({
          attrValueList: this.data.attrValueList
        });
      }
      */
    wx.getSystemInfo({
      success: function (res) {
        let winHeight = res.windowHeight;
        console.log(winHeight);
        that.setData({
          dkheight: winHeight - winHeight * 0.05 - 100,
        })
      }
    })
  },

  onReady: function () {
    this.videoContext = wx.createVideoContext('myVideo')
   // this.videoContext.seek(1)
    this.setData({
      tab_image: "block"
    })
  },

  onShareAppMessage: function () {
    var that = this
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var share_goods_id = that.data.goodsid
    var share_goods_image = that.data.image_pic[0]['url']
    var share_goods_title = that.data.share_title
    var share_goods_desc = that.data.share_desc
    return {
      title: share_goods_title,
      desc: share_goods_desc,
      imageUrl: share_goods_image,  
      path: '/pages/details/details?id=' + share_goods_id + '&image=' + share_goods_image+'&refername='+username
    }
  }
})
