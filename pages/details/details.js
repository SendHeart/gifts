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
        share_desc:'送心礼物，开启礼物社交时代！',
        share_avatarUrl: weburl + '/uploads/avatar.png',
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        user:null,
        userInfo:{},
        username:null,
        indicatorDots: true,
        vertical: false,
        autoplay: false,
        page:1,
        interval: 3000,
        duration: 300,
        circular: true,
        goodsname:'',
        goodsshortname: '',
        goodsinfo:[],
        goodsprice: 0,
        goodssale: 0,
        goodsid: 0,
        goodsdiscount:100,
        discountinfo:'9折优惠券',
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
        image_save_count:0,
        image_save_times:0,
        is_buymyself:0,
        buynum:1,
    },

  formSubmit: function (e) {
    var that = this
    var formId = e.detail.formId;
    var form_name = e.currentTarget.dataset.name  
    console.log('formSubmit() formID：', formId, ' form name:', form_name)
    if (form_name == 'buyGift') {
      that.buyGift()
    } else if (form_name == 'buyMyself') {
      that.buyMyself()
    } else if (form_name == 'wishcart') {
      that.wishCart()
    } else if (form_name == 'mycommTapTag') {
      that.mycommTapTag()
    }
    if (formId) that.submintFromId(formId)
  },

  //提交formId，让服务器保存到数据库里
  submintFromId: function (formId) {
    var that = this
    var formId = formId
    var shop_type = that.data.shop_type
    var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
    var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
    wx.request({
      url: weburl + '/api/client/save_member_formid',
      method: 'POST',
      data: {
        username: username,
        access_token: token,
        formId: formId,
        shop_type: shop_type,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log('submintFromId() update success: ', res.data)
      }
    })
  },
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
    var cur_img_id = e.detail.current
    //console.log(e)
   
    that.setData({
      cur_img_id: cur_img_id,
    })
    //console.log('detail swiperchange:', e.detail.current, 'cur_img_id:',cur_img_id)
  },
  sharegoodsTapTag: function () {
    var that = this
    var share_goods_id = that.data.goodsid
    var share_goods_price = that.data.goodsprice
    var share_goods_name = that.data.goodsname
    share_goods_name = share_goods_name.replace(/\&/g, ' ')
    var cur_img_id = that.data.cur_img_id
    var share_goods_wx_headimg = that.data.share_goods_wx_headimg ? that.data.share_goods_wx_headimg : that.data.share_avatarUrl
    var share_goods_title = that.data.share_title
    var share_goods_desc = that.data.share_desc
    var share_avatarUrl = that.data.share_avatarUrl
    var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
    var goods_image_cache = wx.getStorageSync('goods_image_cache_' + share_goods_id)
    var share_goods_qrcode = wx.getStorageSync('goods_qrcode_cache_' + share_goods_id)
    share_goods_wx_headimg = wx_headimg_cache ? wx_headimg_cache : share_goods_wx_headimg
    if (that.data.cur_img_id==0){ 
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
      share_goods_image = goods_image_cache ? goods_image_cache : share_goods_image
    }else{
      cur_img_id = cur_img_id - that.data.image_video.length
      var share_goods_image = that.data.image_pic[cur_img_id]['url']
    }
    console.log('sharegoodsTapTag share_goods_qrcode:', share_goods_qrcode, 'share_goods_id:', share_goods_id, 'cur_img_id:', cur_img_id, 'image_save_count:',that.data.image_save_count)
   
    if (that.data.image_save_count < 3){
      if (that.data.image_save_times > 8) { //8次不成功返回上一级
        return
      }
      setTimeout(function () {
        wx.showToast({
          title: "开始分享" ,
          icon: 'loading',
          duration: 2000,
        })
      
        var image_save_times = that.data.image_save_times+1
         that.setData({
           image_save_times: image_save_times,
        })
        that.sharegoodsTapTag()
      }, 1500)
      return
    }
    wx.navigateTo({
      url: '/pages/wish/wishshare/wishshare?share_goods_id=' + share_goods_id + '&share_goods_name=' + share_goods_name + '&share_goods_price=' + share_goods_price+ '&share_goods_image=' + share_goods_image + '&share_goods_wx_headimg=' + share_goods_wx_headimg + '&share_goods_title=' + share_goods_title + '&share_goods_desc=' + share_goods_desc + '&share_goods_image2=' + that.data.image_pic[cur_img_id]['url'] + '&share_goods_qrcode_cache=' + share_goods_qrcode
    })
    /*
    wx.getStorageInfo({
      success: function (res) {
        console.log('detail 缓存列表 keys:', res.keys, 'currentSize:', res.currentSize, 'limitSize:', res.limitSize)
      }
    })
    */
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
              console.log('detail image_save 图片缓存成功', image_cache_name,res.savedFilePath)  
              wx.setStorageSync(image_cache_name, res.savedFilePath)
              if (image_cache_name == 'goods_image_cache_' + that.data.goodsid || image_cache_name == 'goods_qrcode_cache_' + that.data.goodsid || image_cache_name == 'wx_headimg_cache') {
                console.log('image_save 图片缓存成功', image_cache_name, 'image_save_count', that.data.image_save_count++)
                that.setData({
                  image_save_count: that.data.image_save_count++,
                })
              }
            },
            fail(res) {
              console.log(' detail image_save 图片缓存失败', image_cache_name,res) 
              var wx_headimg_cache = wx.getStorageSync('wx_headimg_cache')
              var goods_image_cache = wx.getStorageSync('goods_image_cache_' + that.data.goodsid)
              var goods_qrcode_cache = wx.getStorageSync('goods_qrcode_cache_'+that.data.goodsid)
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
                      wx.setStorageSync(image_cache_name, res.savedFilePath)
                      console.log('image_save 图片缓存成功', image_cache_name, wx.getStorageSync(image_cache_name), 'goods id:', that.data.goodsid )
                      if (image_cache_name == 'goods_image_cache_' + that.data.goodsid || image_cache_name == 'goods_qrcode_cache_' + that.data.goodsid || image_cache_name == 'wx_headimg_cache'){
                        console.log('image_save 图片缓存成功', image_cache_name, 'image_save_count',that.data.image_save_count)
                        that.setData({
                          image_save_count: that.data.image_save_count++,
                        })
                      }
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
        var m_id = wx.getStorageSync('m_id') ? wx.getStorageSync('m_id') : 0
        var phonemodel = wx.getStorageSync('phonemodel') ? wx.getStorageSync('phonemodel') : 'Andriod'
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
        username = options.username ? options.username : username
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
        var page = that.data.page
        var scene = decodeURIComponent(options.scene)
        var goodsname = options.name
        var goodsid = options.id
        var share_goods_id = options.goodsid
        goodsid = goodsid ? goodsid : share_goods_id
        var refer_mid = options.mid ? options.mid:0 //分享人id
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
      
        console.log('detail options:', options,'scene:',scene)
        that.setData({
          is_apple: phonemodel.indexOf("iPhone")>= 0?1:0,
          image_save_count:0,
        })
        if(scene){
          if (scene.indexOf("goodsid=") >= 0) {
            var goodsidReg = new RegExp(/(?=goodsid=).*?(?=\&)/)
            var midReg = new RegExp(/\&mid=(.*)/)
        
            var scene_goodsid = scene.match(goodsidReg)[0]
            goodsid = scene_goodsid ? scene_goodsid.substring(8,scene_goodsid.length):goodsid
            //m_id = scene.match(/mid=(.*)/)[1] //取 mid=后面所有字符串
            var scene_mid = scene.match(midReg) ? scene.match(midReg)[0]: 0
            refer_mid = scene_mid?scene_mid.substring(5, scene_mid.length):refer_mid
            console.log('scene_goodsid:', scene_goodsid, 'mid:', scene_mid, ' goodsid:', goodsid, 'refer_id:', refer_mid)//输出  
          }
        }
        if (image){
          if (image.indexOf("%3A%2F%2F") >= 0){
            image = decodeURIComponent(image)
            share_goods_image = activity_image ? activity_image : image
            goodsname = decodeURIComponent(goodsname)
            goodsinfo = decodeURIComponent(goodsinfo)
          }
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
          }
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
          goodsid: goodsid ? goodsid:0,
          refer_mid: refer_mid,
          goodsprice: goodsprice ? goodsprice:0,
          marketprice: marketprice ? marketprice : '',
          goodssale: goodssale ? goodssale:0,
          m_id:m_id,
        })
    var share_goods_qrcode = weburl + '/api/WXPay/getQRCode?username=' + username + '&appid=' + appid + '&secret=' + secret + '&shop_type=' + shop_type + '&qr_type=' + qr_type + '&share_goods_id=' + goodsid + '&m_id=' + m_id
    that.image_save(share_goods_qrcode, 'goods_qrcode_cache_'+goodsid)
    console.log('商品分享二维码下载缓存 goods_qrcode_cache_'+goodsid, 'share_goods_image:', share_goods_image)
  
    console.log('detail onLoad goodsid:', goodsid, ' share_goods_image:', share_goods_image, ' goodsname:', goodsname, ' goodsinfo:', goodsinfo, 'scene:', scene);
        //that.setNavigation()
        if (goodsid>0){
          if (share_goods_image){
            that.image_save(share_goods_image, 'goods_image_cache_' + goodsid)
            console.log('商品详情图片下载缓存 goods_image_cache_' + goodsid, share_goods_image)
          } 
          wx.request({
            url: weburl + '/api/client/get_goods_list',
            method: 'POST',
            data: { 
              username: options.username ? options.username : username, 
              access_token: token, 
              goods_id: goodsid,
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
                  goodsdiscount: goods_info[0]['discount'],
                  discountinfo: goods_info[0]['discount_info'],
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
            goods_id: goodsid, 
            refer_mid: refer_mid, //分享人id
            page: page,
            shop_type: shop_type,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log('get_goodsdesc_list:', res.data.result)
            var goodsPicsInfo = res.data.result
            var k = image?1:0
            for (var i = k; i < goodsPicsInfo.image.length;i++){
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
            if (!share_goods_image) {
              that.image_save(image_pic[0]['url'], 'goods_image_cache_' + goodsid)
              console.log('商品详情图片下载缓存 goods_image_cache_' + goodsid, image_pic[0]['url'])
            } 
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
            goods_id: goodsid, 
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
            console.log('获取订单评论信息:', comm_list, ' all rows:',all_rows)
          }
        }
      })
    },
  
    bindMinus: function (e) {
      var that = this
      var num = that.data.buynum
      num--
      that.setData({
        buynum: num>0?num:1
      })
    },
    bindPlus: function (e) {
      var that = this
      var num = that.data.buynum
    // 自增
      num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
      var minusStatus = num <= 1 ? 'disabled' : 'normal';
      this.setData({
        buynum: num <= 1?1:num,
      })
    },
    //事件处理函数 选择型号规格  
    goodsmodel: function () {
      var that = this
      var modalHidden = that.data.modalHidden
      var sku_id = that.data.commodityAttr[0].id
      var attrValueList = that.data.attrValueList
      var sku_sell_price = that.data.commodityAttr[0].sell_price
      var is_buymyself = that.data.is_buymyself
      console.log('detail goodsmodel is_buymyself:',is_buymyself)
      if(attrValueList.length>0){
        that.setData({
          modalHidden: !modalHidden,
          sku_id: sku_id,
          sku_sell_price: sku_sell_price,
          add_cart_title: '商品名称',
          wishflag: 0,
        })
        console.log('挑选 sku_id:' + that.data.commodityAttr[0].id, 'modalHidden:', that.data.modalHidden)
      }else{
        console.log('送礼 sku_id:' + that.data.commodityAttr[0].id, 'attrValueList:', attrValueList)
        that.setData({
          modalHidden: !modalHidden,
          sku_sell_price: sku_sell_price,
          add_cart_title: that.data.goodsname,
          sku_id: sku_id,
          wishflag: 0,
        })
        //that.addCart()
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
    buyMyself: function () {
      var that = this
      that.setData({
        is_buymyself: 1,
      })
      that.goodsmodel()
    },
  buyGift: function () {
    var that = this
    that.setData({
      is_buymyself: 0,
    })
    that.goodsmodel()
  },
    //确定按钮点击事件  
    modalBindaconfirm: function () {
      var that = this
      this.setData({
        modalHidden: !this.data.modalHidden,
      })
      this.addCart()
    },
    //取消按钮点击事件  
    modalBindcancel: function () {
      this.setData({
        modalHidden: !this.data.modalHidden
      })
    },  
    addCart: function () {
      var that = this
      var is_buymyself = that.data.is_buymyself
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + that.data.goodsid
        })
      }else{
        if (that.data.sku_id){
          that.insertCart(that.data.sku_id, that.data.buynum, username, token,that.data.shop_type, that.data.wishflag, is_buymyself);
        }else{
          wx.showToast({
            title: '该产品无货',
            icon: 'loading',
            duration: 1500
          });
        }
      }
    },
  insertCart: function (sku_id, buynum, username, token, shop_type, wishflag, is_buymyself) {
      var that = this
      //var shop_type = that.data.shop_type
      wx.request({
        url: weburl + '/api/client/add_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          sku_id: sku_id,
          num: buynum,
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
          title = is_buymyself==1?'生成订单':title
          wx.showToast({
            title: title,
            duration: 2000
          })
          app.globalData.from_page = '/pages/details/details'
          if (wishflag == 1) {
            wx.navigateTo({
              url: '/pages/wish/wish'
            })
          } 
          else {
            if (is_buymyself==1){
              that.queryCart()
            }else{
              console.log('details insertCart wishflag:', wishflag)
              app.globalData.hall_gotop = 1
              wx.switchTab({
                url: '/pages/hall/hall'
              })
            }
          }
        }
      })
      
    },

    queryCart: function () {
      var that = this
      var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : ''
      var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1'
      var order_type = 'gift'
      var order_note = '送你一份礼物，希望你喜欢!'; //默认祝福
      var buynum = that.data.buynum
      var sku_sell_price = that.data.sku_sell_price
      var amount = parseFloat(sku_sell_price) * buynum
      var sku_id = that.data.sku_id
      var is_buymyself = that.data.is_buymyself
      wx.request({
        url: weburl + '/api/client/query_cart',
        method: 'POST',
        data: {
          username: username,
          access_token: token,
          shop_type: shop_type,
          sku_id: sku_id,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log('hall reloadData:', res.data);
          var carts = [];
          if (!res.data.result) {
            wx.showToast({
              title: '未挑选商品' + res.data.info,
              icon: 'none',
              duration: 1500
            })
            return
          }
          var cartlist = res.data.result.list;
          var index = 0;
          for (var key in cartlist) {
            for (var i = 0; i < cartlist[key]['sku_list'].length; i++) {
              if (cartlist[key]['sku_list'][i]['image'].indexOf("http") < 0) {
                cartlist[key]['sku_list'][i]['image'] = weburl + '/' + cartlist[key]['sku_list'][i]['image'];
              } 
              cartlist[key]['sku_list'][i]['selected'] = true;
              cartlist[key]['sku_list'][i]['shop_id'] = key;
              cartlist[key]['sku_list'][i]['objectId'] = cartlist[key]['sku_list'][i]['id'];
             
              carts[index] = cartlist[key]['sku_list'][i];
              index++;
            }
          }

          that.setData({
            carts: carts,
            all_rows: carts.length,
            is_buymyself:0,
          })
          var amount = parseFloat(that.data.sku_sell_price) * buynum
          wx.navigateTo({
            url: '../order/checkout/checkout?cartIds=' + sku_id + '&amount=' + amount + '&carts=' + JSON.stringify(carts) + '&is_buymyself=' + is_buymyself + '&order_type=' + order_type + '&order_note=' + order_note + '&username=' + username + '&token=' + token
          })
        }
      })
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
      })
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
    var m_id = that.data.m_id > 0 ? that.data.m_id:0
    var scene = 'goodsid='+that.data.goodsid +'&mid='+m_id
    return {
      title: share_goods_title,
      desc: share_goods_desc,
      imageUrl: share_goods_image,  
      path: '/pages/details/details?id=' + share_goods_id + '&image=' + share_goods_image+'&refername='+username,
     // path: '/pages/details/details?scene=' + encodeURIComponent(scene)
    }
  }
})
