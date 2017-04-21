/**
 * 
 */

function View() {
	this.div = null;
}

View.prototype = {

/**
 * 
 */
	getDiv: function() {
		return this.div;
	},

	setFocus: function(focus) {

	},

	setVisible: function(visible) {
		this.div.style.display = visible ? "block" : "none";
	},

	hide: function() {
		this.setVisible(false);
	},

	show: function() {

		this.setVisible(true);
	},
	
	render: function() {
		
	},

	onKeyEvent: function(key) {

	},

	moveTo: function(t, l, r, b) {
		if (typeof(this.div) === "object") {
			if (t || t === 0) this.div.style.top = t + "px";
			if (l || l === 0) this.div.style.left = l + "px";
			if (r || r === 0) this.div.style.right = r + "px";
			if (b || b === 0) this.div.style.bottom = b + "px";
		}
	}
}

function ListView(div,controller,focusViewConstructor) {
	View.call(this);
	this.index = 0;
	this.items = [];
	this.div = div;

	this.selected = 0;
	this.displaycount = 8;
	this.displaybase = 0;
	this.startY = 0;
	this.item_height = 50;
	
	this.itemindex = 0;
	
	this.focusView = focusViewConstructor ? new focusViewConstructor(this) : new FocusView(this);
	this.ctrl = controller;
	
	this.needRepaintFocus = true;
	this.needRepaintItems = true;
	this.repaintItemsDirect = null; 
	this.needDescendKeyEvent = true;
	this.render();
}

ListView.prototype = new View();

ListView.prototype.setVisible = function(visible) {
	
}

ListView.prototype.setDescendKeyEvent = function (isDown) {
	this.needDescendKeyEvent = isDown ? true : false;
}

ListView.prototype.setFocus = function(focus) {
	var item = this.items[this.selected];
	if (item) {
		item.setFocus(focus);
	}
}


ListView.prototype.painterList = function (isUp) {
	var i;
	var sum;
	var startY = this.startY;
	var items = this.items;
	var ctrl = this.ctrl;
	var len = ctrl.getCount();
	var data = ctrl.data;
	if (len < this.displaycount) {
		sum = len + 1;
	} else {
		sum = this.displaycount + 1;
	}
	
	if (isUp === true) {      //按键为方向键下，items向上移动
		
		var base = this.displaybase - 1;
		var offset = 1;
		
		for(i = 0; i < sum; i++){
			var itemPostion = i + offset;
			var dataPostion = i + base;
			items[itemPostion] = ctrl.getView(this,items[itemPostion],dataPostion);
			items[itemPostion].moveTo((i - 1) * this.item_height, null, null, null);
//			console.log("itemPostion===" + itemPostion + "     dataPostion ===" + dataPostion)
//			console.log("the chan is"+items[itemPostion].nameDiv.innerText + "   i-1=" + parseInt(i -1));
//			console.log("++")
		}
		
		var reverse = startY + this.displaycount * this.item_height;
		var tmp = items.shift();
		if(tmp && tmp.moveTo)
		{
			tmp.moveTo(reverse);
			
		}
		
		items.push(tmp)

		this.repaintItemsDirect = null;
	}
	else if (isUp === false) {  //按键为方向键上，items向下移动
		
		var base = this.displaybase;
	 	var offset = 0;
//		console.log("DATA DN ====== base ="+base + "   this.displaybase=" + this.displaybase )

		for(i = 0; i < sum; i++){
			var itemPostion = i+offset;
			var dataPostion = i+base;
			items[itemPostion] = ctrl.getView(this,items[itemPostion],dataPostion);
			items[itemPostion].moveTo(startY + i * this.item_height, null, null, null);
		}
		var reverse = startY + (-1) * this.item_height;
		var tmp = items.pop();
		if(tmp && tmp.moveTo)
		{
			tmp.moveTo(reverse);
		}
		
		items.unshift(tmp)
		this.repaintItemsDirect = null;
	}
	else {
	 	var base = this.displaybase;
	 	var offset = 1;
		for(i = 0; i < sum; i++){
			var itemPostion = i+offset;
			var dataPostion = i+base;
			items[itemPostion] = ctrl.getView(this,items[itemPostion],dataPostion);
			items[itemPostion].moveTo(startY + i * this.item_height, null, null, null);
		}
	}
}

ListView.prototype.focusMove = function() {
	var ctrl = this.ctrl;
	var len = ctrl.getCount();
	var pos = this.selected - this.displaybase;
	if (pos > -1 && pos < len) {
		//this.focusView.style.webkitTransition = 'top 0.3s';
		this.focusView.moveTo(parseInt(this.startY + pos * this.item_height));
	}
}

ListView.prototype.setSelected = function(postion) {
	
}

ListView.prototype.render = function() {
	if (this.needRepaintFocus) {
		this.focusMove();
	}
	if (this.needRepaintItems) {
		this.painterList(this.repaintItemsDirect);
		
	}
}

ListView.prototype.onKeyEvent = function(keycode) {
	var sel = this.selected;
	var ctrl = this.ctrl;
	var items = this.items;
	var old_sel = sel;
	var channelCount = ctrl.getCount();
	if (keycode == 40) { //down
		if (channelCount > 0) {
			sel ++;
			if (sel > channelCount - 1) {
				sel = channelCount - 1;
			}
			this.index = sel;
			
			
			if (sel < channelCount) {	
				this.selected = sel;
				if (this.displaybase + parseInt(this.displaycount / 2) < sel && this.displaybase + this.displaycount < channelCount) {
					this.displaybase ++;
					this.needRepaintFocus = false;
					this.needRepaintItems = true;
					this.repaintItemsDirect = true; 
				} else {
					//focus move
					this.needRepaintFocus = true;  
					this.needRepaintItems = false; 
					this.repaintItemsDirect = null; 
				}
				
				this.render(); 
			}
			
			
			// 过半 sel > this.displaybase + parseInt(this.displaycount / 2)
			var itemPositon = sel - this.displaybase + (this.needRepaintItems || sel > this.displaybase + parseInt(this.displaycount / 2)  ? 2 : 1);
			console.log("down needRepaintItems is  " + this.needRepaintItems);
			console.log("sel===" + sel);
			console.log(sel > this.displaybase + parseInt(this.displaycount / 2))
		//	console.log("DN sel="+sel+"    base="+this.displaybase+"    repaintItems="+this.needRepaintItems + "   itemPositon="+itemPositon);
			this.onItemSelected(this, items[itemPositon], sel, items[itemPositon-1], old_sel);
		}
		
	} 
	else if (keycode == 38) { //up
		if (channelCount > 0) {
			sel--;
			if (sel < 0) sel = 0;
			this.index = sel;
			if (sel > -1) {
				this.selected = sel;
				if (this.displaybase + parseInt(this.displaycount / 2) > sel && this.displaybase > 0) {
					this.displaybase --;
					this.needRepaintFocus = false;
					this.needRepaintItems = true;
					this.repaintItemsDirect = false;
				} else {
					this.needRepaintFocus = true;
					this.needRepaintItems = false;
					this.repaintItemsDirect = null; 
				}
				
				this.render();  
			}
			
			
			var itemPositon = sel - this.displaybase + (this.needRepaintItems  || sel > this.displaybase + parseInt(this.displaycount / 2) ? 1 : 0);
		//	console.log("UP sel="+sel+"    base="+this.displaybase+"    repaintItems="+this.needRepaintItems + "   itemPositon="+itemPositon);
			this.onItemSelected(this, items[itemPositon], sel, items[itemPositon+1], old_sel);
		}
		
	} else {
		
		var item = ctrl.getView(this, items[sel - this.displaybase + 1], sel);
		
		if (this.needDescendKeyEvent) {
			
			item.onKeyEvent(keycode, sel);
		} 
		if (keycode == 13) { //enter
			
			this.onItemClicked(this, item, sel);
		}
	}
}

ListView.prototype.onItemClicked = function (listview, itemview, postion) {
	
}

ListView.prototype.onItemSelected = function (listview, itemview_now, postion_now, itemview_old, postion_old) {
	
}


function FocusView (listview) {	
	View.call(this);
	
	var div = listview.getDiv(); 
	var focusDiv = document.createElement("div");
	focusDiv.style.webkitTransition = "top 0.3s";
	focusDiv.id = "itemFocus";
	this.div = focusDiv;
	div.appendChild(focusDiv);	
	
}

FocusView.prototype = new View();
	
function ItemView() {
	View.call(this);
}

ItemView.prototype = new View();

ItemView.prototype.update = function(data) {
	
}

function Controller(viewConstructor,data) {
	this.data = data;
	this.viewConstructor = viewConstructor;
}

Controller.prototype = {
	getView: function(listview, itemview, position) {
		var data = this.data[position];
		if (!itemview) {
			var item = new this.viewConstructor(listview, data);
			itemview = item;
		} else if (data) {
			itemview.update(data);
		}
		return itemview;
	},
	
	getCount: function() {
		
		return this.data.length;
	},
	
	getData: function(postion) {
		return this.data[postion];
	}
}


