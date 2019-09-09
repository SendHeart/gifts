import md5 from './md5.js'
var util = require('./util.js')
var app = getApp();
var weburl = app.globalData.weburl;
var shop_type = app.globalData.shop_type;
var userInfo = wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : ''
var appid = app.globalData.appid
var secret = app.globalData.secret
var httpserviceurl = app.globalData.httpserviceurl
// 主域名
const domain = weburl; //线上地址

// 网关拼接路径
const gateWayPath = '';
// 网关appKey、secretKey
const appKey = 'HFrv2bzW_65LXJAG';
const secretKey = "vaqeBA0l_3YVnDi5";
// 接口版本号
const apiVersion = '6';

function request(method, url, data) {
  // 域名校验
  var resUrl = checkUrl(url)
  //参数预处理
  var resData = prepareRequestParameter(data)

  // 添加网关签名/添加header
  var header = wx.getStorageSync('sid') ? {
    'sid': wx.getStorageSync('sid')
  } : {}
  if (method === 'GET') {
    resData['sign'] = signParameter(resData)
  } else {
    //resData['sign'] = signParameter(resData)
    header['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
    resData = JSON.stringify(resData)
    header['sign'] = md5(secretKey + resData).toUpperCase()
  }
  //console.log("header:",header)
  
  //返回一个promise实例
  return new Promise((resolve, reject) => {
    console.log('http service request url:', resUrl, 'resData:', resData,'header:', header)
    wx.request({
      url: resUrl,
      header: header,
      data: resData,
      method: method,
      success: function(res) {
        console.log('request success:',res)
        responseSuccessHandle(res, resolve, reject)
      },
      fail: function(res) {
        console.log('request fail:',res)
        reject(res);
      },
      complete: function() {

      }
    })
  })
}

//域名校验
function checkUrl(url) {
  var resUrl = url
  if (resUrl.indexOf('https://') == 0 || resUrl.indexOf('http://') == 0) {
    return resUrl
  } else {
    // url无域名,需拼接
    resUrl = domain + '/' + gateWayPath + '/' + resUrl
    return resUrl
  }
}

//参数预处理 
function prepareRequestParameter(data) {
  var resData = data ? data : {}
  resData['tqmobile'] = 'true'
  resData['appKey'] = appKey
  resData['apiVersion'] = apiVersion
  // 设备平台
  resData['mobileType'] = util.getPlatform()
  return resData
}

// 生成网关sign
function signParameter(data) {
  var array = []
  for (var key in data) {
    array.push(key)
  }

  array.sort()

  var signString = ''
  for (var i = 0; i < array.length; i++) {
    var key = array[i]
    var value = key + data[key] //(typeof (data[key]) === 'object' ? JSON.stringify(data[key]) : data[key])
    signString = signString + value
  }
  return md5(secretKey + signString).toUpperCase()
}

//网络请求成功处理
function responseSuccessHandle(res, resolve, reject) {
  if (res.statusCode == 200) {
    if (res.data['status'] == 'y') {
      var resData = res.data['result']
      resolve(resData)
    } else {
      var errMsg = res.data['info']
      reject((errMsg && typeof(errMsg) === 'string') ? errMsg : '')
    }
  } else {
    reject('')
  }
}

//get方法：用来获取数据
function get(url, data) {
  var http_url = url ? url : httpserviceurl
   //console.log('HttpClient pos data:',data)
  return request('GET', http_url, data)
}

//post方法：用来更新数据
function post(url, data) {
  var http_url = url ? url : httpserviceurl
  //console.log('HttpClient pos data:',data)
  return request('POST', http_url, data)
}

module.exports = {
  get: get,
  post: post,
}