var app = getApp();
var wxparse = require("../../wxParse/wxParse.js");
var weburl = "https://czw.saleii.com";

Page({
    data: {
        user:null,
        userinfo:null,
        username:null,
        indicatorDots: true,
        vertical: false,
        autoplay: true,
        page:1,
        interval: 3000,
        duration: 1200,
        goodsname:null,
        goodsshortname: null,
        goodsinfo:null,
        goodsprice: null,
        goodssale: null,
        goodsid: null,
        sku_gov_price:null,
        sku_earnest_price:null,
        sku_id:null,
        commodityAttr:null,
        attrValueList:null,
        includeGroup:null,
        firstIndex:0,
        image:null,
        hideviewgoodsinfo:true,
        hideviewgoodspara:true,
        dkheight: 300,
        scrollTop:100,
        toView: 'red',
        hideviewgoodsinfoflag:true, 
        hideviewgoodsparaflag:true,
        modalHidden: true,//是否隐藏对话框  
        dkcontent:[],
        goodsPicsInfo:[],
        selectValueInfo:null

    },

    onLoad: function(options) {
        var that = this;
        var username = wx.getStorageSync('username') ? wx.getStorageSync('username') : '';
        var token = wx.getStorageSync('token') ? wx.getStorageSync('token') : '1';
        var page = this.data.page;
        var goodsname = options.name;
        var goodsshortname = goodsname?goodsname.substring(0,13)+'...':'';
        that.setData({
          goodsname: options.name,
          goodsinfo: options.info,
          goodsshortname: goodsshortname,
          image: options.image,
          goodsid: options.id,
          sku_gov_price: options.gov_price,
          sku_earnest_price: options.earnest_price,
        })
      
        if (!options.name){
          wx.request({
            url: weburl + '/api/client/get_goods_list',
            method: 'POST',
            data: { 
              username: options.username ? options.username : username, 
              access_token: token, 
              goods_id: options.id, 
              page: page,
            },
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: function (res) {
              var goonds_info = res.data.result;
              console.log('获取单个产品信息');
              console.log(goonds_info[0]['name']);
             
              that.setData({
                goodsname: goonds_info[0]['name'],
                goodsinfo: goonds_info[0]['act_info'],
                goodstag: goonds_info[0]['goods_tag'],
                goodsprice: goonds_info[0]['sell_price']*0.01,
                goodssale: goonds_info[0]['sale'],
                goodsshortname: goonds_info[0]['name'] ? goonds_info[0]['name'].trim().substring(0, 20) + '...' : ''
              })
            }
          })
        }

        // 商品详情图片
        wx.request({
          url: weburl+'/api/client/get_goodsdesc_list',
          method: 'POST',
          data: { username: options.username ? options.username : this.data.username, access_token: token, goods_id: options.id, page: page },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            that.setData({
              goodsPicsInfo: res.data.result,
            })
          }
        })
        // 商品SKU
        wx.request({
          url: weburl+'/api/client/get_goodssku_list',
          method: 'POST',
          data: { username: options.username ? options.username:this.data.username, access_token: token, goods_id: options.id, page: page },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          success: function (res) {
            console.log(res.data.result);
            var attrValueList = res.data.result.spec_select_list;
            var commodityAttr = res.data.result.sku_list;
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
              if (attrValueList[i].attrValueStatus) {
                attrValueList[i].attrValueStatus = true;
              } else {
                attrValueList[i].attrValueStatus = false;
              }
            }
           
            that.setData({
              attrValueList: attrValueList
            })

          }
        })
      

    },
    //事件处理函数 选择型号规格  
    goodsmodel: function () {
      var that = this;
     
      this.setData({
        modalHidden: !that.data.modalHidden,
        sku_id: this.data.commodityAttr[0].id
      })
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
      var username = wx.getStorageSync('username');
      if (!username) {//登录
        wx.navigateTo({
          url: '../login/login?goods_id=' + this.data.goodsid
        })
      }else{
        if (this.data.sku_id){
          this.insertCart(this.data.sku_id, username);
          
        }else{
          wx.showToast({
            title: '该产品无货',
            icon: 'loading',
            duration: 1500
          });
        }
      }
      
    },
    insertCart: function (sku_id,username) {
      var that = this;
  
      // 加入购物车
      wx.showModal({
        title: '提示',
        content: '确认要加入购物车吗?',
        success: function (res) {
          if (res.confirm) {
            // 加入购物车
            var that=this;
            wx.request({
              url: weburl + '/api/client/add_cart',
              method: 'POST',
              data: { username: username, access_token: "1", sku_id: sku_id },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: function (res) {
                //console.log(res.data.result);
                wx.showToast({
                  title: '加入购物车完成',
                  duration: 500
                });
              }
            })

          }
        }
      })
    },
    showCartToast: function (message) {
      wx.showToast({
        title: message ? message:'已加入购物车',
        icon: 'success',
        duration: 1000
      });
    },

    showCart: function () {
      wx.switchTab({
        url: '../hall/hall'
      });
    },
 
    showGoodsinfo: function () {
      // 获得高度  
      let winPage = this;
      winPage.setData({
        hideviewgoodsinfo: (!winPage.data.hideviewgoodsinfo)
      })
     
      if (winPage.data.hideviewgoodsinfoflag){
        wx.getSystemInfo({
          success: function (res) {
            let winHeight = res.windowHeight;
            console.log(winHeight);
            winPage.setData({
              dkheight: winHeight - winHeight * 0.05 - 80,
              scrollTop: winPage.data.scrollTop + 10
            })
          }
        })
        wxparse.wxParse('dkcontent1', 'html', winPage.data.goodsPicsInfo.desc['desc'], winPage, 1);
       
      }
      winPage.setData({
        hideviewgoodsinfoflag: false
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
            console.log(winHeight);
            winPage.setData({
              dkheight: winHeight - winHeight * 0.05 - 80,
              scrollTop: winPage.data.scrollTop + 10
            })
          }
        })
      wxparse.wxParse('dkcontent2', 'html', winPage.data.goodsPicsInfo.desc['desc2'], winPage, 1);
      }
      winPage.setData({
        hideviewgoodsparaflag: false
      })
    },

    upper: function (e) {
      console.log(e)
    },
    lower: function (e) {
      console.log(e)
    },
    scroll: function (e) {
      console.log(e)
    },

    getAttrIndex: function (attrName, attrValueList) {
      // 判断数组中的attrKey是否有该属性值 
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrName == attrValueList[i].name) {
          break;
        }
      }
      return i < attrValueList.length ? i : -1;
    },
    isValueExist: function (value, valueArr) {
      // 判断是否已有属性值 
      for (var i = 0; i < valueArr.length; i++) {
        if (valueArr[i] == value) {
          break;
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
      var attrValueList = this.data.attrValueList;
      var index = e.currentTarget.dataset.index;//属性索引 
      var key = e.currentTarget.dataset.key;
      var value = e.currentTarget.dataset.value;
      this.setData({
        //includeGroup: commodityAttr,
        firstIndex: index,
      });
      if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
        if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
          // 取消选中 
          this.disSelectValue(attrValueList, index, key, value);
        } else {
          // 选中 
          this.selectValue(attrValueList, index, key, value);
        }

      }
      this.setData({
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
      })
      var selectValueInfo='';
      for (var i = 0; i < this.data.attrValueList.length; i++) {
        if (this.data.attrValueList[i].selectedValue) {
          selectValueInfo = selectValueInfo+this.data.attrValueList[i].selectedValue+';';
        }
      }
      for (var i = 0; i < this.data.commodityAttr.length; i++) {
        if (selectValueInfo.indexOf(this.data.commodityAttr[i].sku_key)>=0) {
          this.setData({
            sku_id: this.data.commodityAttr[i].id,
            sku_gov_price: this.data.commodityAttr[i].gov_price,
            sku_earnest_price: this.data.commodityAttr[i].earnest_price,
          })
          break;
        }
        
      }

      
     
    },
    /* 选中 */
    selectValue: function (attrValueList, index, key, value, unselectStatus) {
      // console.log('firstIndex', this.data.firstIndex); 
     // var includeGroup = [];
      /*
      if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选 
        var commodityAttr = this.data.commodityAttr;
        // 其他选中的属性值全都置空 
        // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus); 
        for (var i = 0; i < attrValueList.length; i++) {
          attrValueList[i].selectedValue = '';
        }
      } else {
        var commodityAttr = this.data.includeGroup;
      }

      // console.log('选中', commodityAttr, index, key, value); 
      for (var i = 0; i < commodityAttr.length; i++) {
        for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
          if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
            includeGroup.push(commodityAttr[i]);
          }
        }
      }
      */
      attrValueList[index].selectedValue = value;
      /*
      // 判断属性是否可选 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].attrValueStatus[j] = false;
        }
      }
      for (var k = 0; k < attrValueList.length; k++) {
        for (var i = 0; i < includeGroup.length; i++) {
          for (var j = 0; j < includeGroup[i].attrValueList.length; j++) {
            if (attrValueList[k].attrKey == includeGroup[i].attrValueList[j].attrKey) {
              for (var m = 0; m < attrValueList[k].attrValues.length; m++) {
                if (attrValueList[k].attrValues[m] == includeGroup[i].attrValueList[j].attrValue) {
                  attrValueList[k].attrValueStatus[m] = true;
                }
              }
            }
          }
        }
      }
      // console.log('结果', attrValueList); 
      */
      this.setData({
        attrValueList: attrValueList,
        //includeGroup: includeGroup
      });
      
      
/*
      var count = 0;
      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
      if (count < 2) {// 第一次选中，同属性的值都可选 
        this.setData({
          firstIndex: index
        });
      } else {
        this.setData({
          firstIndex: -1
        });
      }
      */
    },
    /* 取消选中 */
    disSelectValue: function (attrValueList, index, key, value) {
      //var commodityAttr = this.data.commodityAttr;
      attrValueList[index].selectedValue = '';
      this.setData({
        //includeGroup: commodityAttr,
        sku_id: '',
        sku_gov_price: '',
        sku_earnest_price: '',
        attrValueList: attrValueList
      });
/*

      // 判断属性是否可选 
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
      this.setData({
        includeGroup: commodityAttr,
        attrValueList: attrValueList
      });

      for (var i = 0; i < attrValueList.length; i++) {
        if (attrValueList[i].selectedValue) {
          this.selectValue(attrValueList, i, attrValueList[i].name, attrValueList[i].selectedValue, true);
        }
      }
      */
    },
    
  onShow: function () {
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
  },

  onReady: function () {
  
    
  },

  onShareAppMessage: function () {
    return {
      title: '展易购商城',
      desc: '展易购3D商城!',
      path: '/pages/index/index?id=123'
    }
  }
})
