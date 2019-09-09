var url = 'wss://sendheart.dreamer-inc.com/wss';
 
function connect(func) {

  wx.connectSocket({
    url: url
  });
  
  wx.onSocketMessage(func);
}


function send(msg) {
  wx.sendSocketMessage({ data: msg });
}
module.exports = {
  connect: connect,
  send: send
}