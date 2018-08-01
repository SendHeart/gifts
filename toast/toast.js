function wxToast(a){
    function _toast(){
    	var _page = getCurrentPages()
    	this.page = _page[_page.length-1];
    	this.timer = null
    	if(a == undefined) a = {}
    	this.init(a);
    };
    _toast.prototype = {
    	init : function(a){
    		this.page.hideToastFn = ()=>{
    			if(a.tapClose){
		    		this.hide(a,1);
		    		a.hide && a.hide();
		    	};
    		};

    		if(!a){
    			a =  this.page.data.wxToastConfig;
    			this.hide(a,1);
    			return
    		}
    		a.title  = a.title ? a.title : '正在加载'
			a.block = true;
			this.page.setData({
	    		wxToastConfig : a
	    	});
	    	a.show && a.show();
	    	setTimeout(()=>{
				var Animation = wx.createAnimation();
				Animation.opacity(1).step({
		            duration : 500,
		            timingFunction : 'ease'
		        });
				a.animate = Animation.export() 
		    	this.page.setData({
		    		wxToastConfig : a
		    	});
	    	},40);
			this.timer = setTimeout(() =>{
				this.hide(a);
			},a.duration ? a.duration+500 : 2500)
    	},
    	hide : function(a,b){
    		if(!a.block) return
    		var Animation = wx.createAnimation();
			Animation.opacity(0).step({
	            duration : 500,
	            timingFunction : 'ease'
	        });
	        a.animate = Animation.export() 
	    	this.page.setData({
	    		wxToastConfig : a
	    	});
	    	setTimeout(()=>{
	    		a.block = false
				this.page.setData({
		    		wxToastConfig : a
		    	});
	    		if(!b) a.hide && a.hide();
	    	},500);
	    	clearTimeout(this.timer)
    	}
    }
    return new _toast();
}
module.exports = wxToast