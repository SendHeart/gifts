// 手机号码验证
function isUnicoms(mobileNo) {
  //移动：134(0 - 8) 、135、136、137、138、139、147、150、151、152、157、158、159、178、182、183、184、187、188、198 
  //联通：130、131、132、145、155、156、175、176、185、186、166
  //电信：133、153、173、177、180、181、189、199 
// 1，移动 2，联通 3，电信
var move = /^((134)|(135)|(136)|(137)|(138)|(139)|(147)|(150)|(151)|(152)|(157)|(158)|(159)|(178)|(182)|(183)|(184)|(187)|(188)|(198))\d{8}$/g;
var link = /^((130)|(131)|(132)|(155)|(156)|(145)|(185)|(186)|(176)|(175)|(170)|(171)|(166))\d{8}$/g;
var telecom = /^((133)|(153)|(173)|(177)|(180)|(181)|(189)|(199))\d{8}$/g;
if (move.test(mobileNo)) {
  return '1';
} else if (link.test(mobileNo)) {
  return '2';
} else if (telecom.test(mobileNo)) {
  return '3';
} else {
  return '非三网号段';
}
}
// 网络请求
function request(url, method, data, message, _success, _fail) {
wx.showNavigationBarLoading()
if (message != "") {
  wx.showLoading({
    title: message
  })
}
wx.request({
  url: url,
  data: data,
  header: {
    'content-type': 'application/x-www-form-urlencoded'
  },
  method: method,
  success: function (res) {
    _success(res)
    wx.hideNavigationBarLoading()
    if (message != "") {
      wx.hideLoading()
    }
  },
  fail: function (err) {
    if (err) {
      _fail(err)
    }
    wx.hideNavigationBarLoading()
    if (message != "") {
      wx.hideLoading()
    }
  },
})
}

//上传语音
function up_audio(url, audioSrc,name, data, _succ, _fail) {
const uploadTask = wx.uploadFile({
    url: url, //仅为示例，非真实的接口地址
    filePath: audioSrc,
    name: name,
    formData: data,
    header: {
      "content-type": "multipart/form-data"
    },
    success: function (res) {
      _succ(res)
    },fail:function(err){
      _fail(err)
    }
  })
  uploadTask.onProgressUpdate((res) => {
    console.log('audio上传进度', res.progress)
    console.log('audio已经上传的数据长度', res.totalBytesSent)
    console.log('audio预期需要上传的数据总长度', res.totalBytesExpectedToSend)
  })
}
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function getDateStr(today, addDayCount,type=0) {
  var dd;
  if (today) {
    dd = new Date(today);
  } else {
    dd = new Date();
  }
  dd.setDate(dd.getDate() + addDayCount);//获取AddDayCount天后的日期 
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1;//获取当前月份的日期 
  var d = dd.getDate();
  var hour = dd.getHours()
  var minute = dd.getMinutes()
  var second = dd.getSeconds()
  if (m < 10) {
    m = '0' + m;
  };
  if (d < 10) {
    d = '0' + d;
  };
  if (hour < 10) {
    hour = '0' + hour;
  };
  if (minute < 10) {
    minute = '0' + minute;
  };
  if (second < 10) {
    second = '0' + second;
  };
  if(type==0){ //返回日期
    return y + "-" + m + "-" + d;
  }else if(type==1){//返回时间 分钟
    return hour + ":" + minute;
  } else if (type == 2) {//返回时间 秒
    return hour + ":" + minute + ":" + second;
  }else{
    return y + "-" + m + "-" + d;
  }
}

function checkPhoneNumber(phone) {
  var pattern = /^1[3456789]\d{9}$/;
  return pattern.test(phone);
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getDateDiff(dateTimeStamp) {
  var result;
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var year = day * 365;
  var now = new Date().getTime();
  var diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    //非法操作
    return '数据出错';
  }
  var yearC = diffValue / year;
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  if (yearC >= 1) {
    result = parseInt(yearC) + '年以前';
  } else if (monthC >= 1) {
    result = parseInt(monthC) + '个月前';
  } else if (weekC >= 1) {
    result = parseInt(weekC) + '星期前';
  } else if (dayC >= 1) {
    result = parseInt(dayC) + '天前';
  } else if (hourC >= 1) {
    result = parseInt(hourC) + '小时前';
  } else if (minC >= 5) {
    result = parseInt(minC) + '分钟前';
  } else {
    result = '刚刚发表';
  }
  return result;
}

 function formatString(str) {
  if (typeof (str) != "string") {
    console.log('去除回车换行空格失败！参数不是字符串类型')
    return;
  }
  str = str.replace(/\ +/g, "");//去掉空格
  str = str.replace(/[\r\n]/g, "");//去掉回车换行
  return str;
}

//计算两个时间戳的差
function calDateDiff(startTime, endTime,type=0) {
  //日期格式化
  var start_date = new Date(startTime.replace(/-/g, "/"));
  var end_date = new Date(endTime.replace(/-/g, "/"));
  //转成毫秒数，两个日期相减
  var ms = end_date.getTime() - start_date.getTime();
  //转换成天数
  var day = parseInt(ms / (1000 * 60 * 60 * 24));
  if(type==0){ //毫秒级
    return ms ;
  }else if(type==1){//日级
    return day ;
  }
  //do something
  //console.log("day = ", day);
}

function filterEmoji(name) {
  var str = name.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");
  return str;
}

// 版本对比  兼容
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])
    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

function base64src(base64data) {

  let FILE_BASE_NAME = 'tmp_base64src';
  return new Promise((resolve, reject) => {
    if (!wx.getFileSystemManager) {
      reject(new Error('微信版本过低'))
      return
    }
    let fsm = wx.getFileSystemManager();

    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      reject(new Error('ERROR_BASE64SRC_PARSE'));
    }
    const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
    const buffer = wx.base64ToArrayBuffer(bodyData);
    fsm.writeFile({
      filePath,
      data: buffer,
      encoding: 'binary',
      success() {
        resolve(filePath);
      },
      fail() {
        reject(new Error('ERROR_BASE64SRC_WRITE'));
      },
    });
  });
};

//获取客户端平台
function getPlatform() {
  var platform = 'ios'
  try {
    var res = wx.getSystemInfoSync()
    platform = res.platform
  } catch (e) {
    // Do something when catch error
  }
  return platform
}

function percentage(number1, number2) {
  return (Math.round(number1 / (number1 + number2) * 10000) / 100.00 + "%");
  // 小数点后两位百分比
}
function base64_encode(str) { // 编码，配合encodeURIComponent使用
  var c1, c2, c3;
  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var i = 0, len = str.length, strin = '';
  while (i < len) {
    c1 = str.charCodeAt(i++) & 0xff;
    if (i == len) {
      strin += base64EncodeChars.charAt(c1 >> 2);
      strin += base64EncodeChars.charAt((c1 & 0x3) << 4);
      strin += "==";
      break;
    }
    c2 = str.charCodeAt(i++);
    if (i == len) {
      strin += base64EncodeChars.charAt(c1 >> 2);
      strin += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      strin += base64EncodeChars.charAt((c2 & 0xF) << 2);
      strin += "=";
      break;
    }
    c3 = str.charCodeAt(i++);
    strin += base64EncodeChars.charAt(c1 >> 2);
    strin += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
    strin += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
    strin += base64EncodeChars.charAt(c3 & 0x3F)
  }
  return strin
}

function base64_decode(input) { // 解码，配合decodeURIComponent使用
  var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = base64EncodeChars.indexOf(input.charAt(i++));
    enc2 = base64EncodeChars.indexOf(input.charAt(i++));
    enc3 = base64EncodeChars.indexOf(input.charAt(i++));
    enc4 = base64EncodeChars.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  return utf8_decode(output);
}


function utf8_decode(utftext) { // utf-8解码
  var string = '';
  let i = 0;
  let c = 0;
  let c1 = 0;
  let c2 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c1 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
      i += 2;
    } else {
      c1 = utftext.charCodeAt(i + 1);
      c2 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
      i += 3;
    }
  }
  return string;
}
module.exports = {
  formatTime: formatTime,
  getDateDiff: getDateDiff,
  getDateStr: getDateStr,
  formatString: formatString,
  calDateDiff: calDateDiff,
  compareVersion:compareVersion,
  filterEmoji: filterEmoji,
  checkPhoneNumber: checkPhoneNumber,
  base64src: base64src,
  getPlatform: getPlatform,
  percentage: percentage,
  base64_encode: base64_encode,
  base64_decode: base64_decode,
  utf8_decode: utf8_decode,
  request: request,
  isUnicoms: isUnicoms,
  up_audio: up_audio
}
