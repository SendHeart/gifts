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
module.exports = {
  formatTime: formatTime,
  getDateDiff: getDateDiff,
  getDateStr: getDateStr,
  formatString: formatString,
  calDateDiff: calDateDiff,
  compareVersion:compareVersion,
  filterEmoji: filterEmoji,
  checkPhoneNumber: checkPhoneNumber,
}
