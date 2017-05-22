/*
 * 兼容各浏览器对requestAnimationFrame的支持
 */
;(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());

;(function(global){ 
		var extend,
        _extend,
        _isObject;

    _isObject = function(o){ 
    	return Object.prototype.toString.call(o) === '[object Object]';
    }

    _extend = function self(destination, source) { 
    	var property; 
    	for (property in destination) { 
    		if (destination.hasOwnProperty(property)) { // 若destination[property]和sourc[property]都是对象，则递归
    			if (_isObject(destination[property]) && _isObject(source[property])) {
                    self(destination[property], source[property]);
                }; // 若sourc[property]已存在，则跳过 
                if (source.hasOwnProperty(property)) { 
                	continue;
                } else {
                    source[property] = destination[property];
                }
            }
        }
    }

    extend = function(){ 
    		var arr = arguments,
            result = {},
            i; if (!arr.length) return {}; for (i = arr.length - 1; i >= 0; i--) { if (_isObject(arr[i])) {
                _extend(arr[i], result);
            };
        }

        arr[0] = result;
        return result;
    }

    global.extend = extend;
})(window)
;(function(w){
	w.PM = new Object();
	//自定义extend函数
//	PM.extend = function(d, s) { 
//		for (var p in s) {
//		    d[p] = s[p];   
//		}
//		return d;   
//	};   
	//插件的默认配置项
	PM.d = {
		el:'#powerMap',//容器ID
		cavH:320,//canvas高
		cavW:320,//canvas宽
		linecolor:'#9c9c9a',//对角线颜色
		powerBgColor:"rgba(166, 149, 106, 0.73)",//能力多边形背景颜色
		powerFontColor:'#fff',//中心能力值字体颜色
		powerFontSize:24,//中心能力值字体大小
		sides:5,//多边形边数
		//多边形的配置参数如下：
		polygons:[
			{
				radius:105,
				bgcolor:"rgba(45, 44, 40, 0.6)"
			},
			{
				radius:65,
				bgcolor:"rgba(61, 62, 57, 0.5)"
			},
			{
				radius:25,
				bgcolor:"rgba(71, 72, 65, 0.4)"
			}],
			//能力类型的参数配置
		powerTypeInfo:{
			style:{
				font:'14px -apple-system,arial,sans-serif,Helvetica',
				fontColor:'rgb(166, 149, 106)',
				iconsRadius:145,
				iconsSize:28
			},
			icon:[{
				iconPath:'images/icon1.png',
				text:'身份'
			},
			{
				iconPath:'images/icon2.png',
				text:'资产'
			},
			{
				iconPath:'images/icon3.png',
				text:'偏好'
			},
			{
				iconPath:'images/icon4.png',
				text:'履约'
			},
			{
				iconPath:'images/icon5.png',
				text:'关系'
			},
			]
		}
	};
	//实例化插件
	PM.create = function(o){
		PM.s = extend(PM.d,o);
		clear();
		init();
	}
	//创建canvas元素，并插入目标元素中
	function createCanvas(el,w,h,cavId){
		var canvas = document.createElement('canvas');
		canvas.id = cavId;
		canvas.width = w;
		canvas.height = h;
		canvas.style.position = "absolute";
		canvas.style.top = "0";
		canvas.style.left = "0";
		document.querySelector(el).style.position = 'relative';
		document.querySelector(el).appendChild(canvas);
		//获取canvas上下文
		PM.ctx = document.getElementById(cavId).getContext('2d');
		PM.ctx.imageSmoothingEnabled = true;//开启图片抗锯齿
	}
	
	//定义坐标点对象
	function Point(x, y) {  
       this.x = x;  
       this.y = y;  
    }
	//传入半径，绘制多边行
	function getPolygonPoints(radius) {
	   var centerX = PM.s.cavW/2;
	   var centerY = PM.s.cavH/2;
	   var sides = PM.s.sides;//绘制边数
	   var points = [],  angle = 0;  //存放多边形的顶点坐标
	   for (var i=0; i < sides; ++i) { 
	      points.push(new Point( centerX + radius *Math.sin(angle) ,centerY - radius *Math.cos(angle)));  
	      angle += 2*Math.PI/sides;  
	   }  
	   return points;  
	}  
	
	//根据多边形的顶点集合，绘制多边形并填充颜色
	function drawPolygonPath(radius,bgcolor) {
	   var sides = PM.s.sides;
	   var points = getPolygonPoints(radius);
	   PM.ctx.beginPath();  
	   PM.ctx.moveTo(points[0].x, points[0].y);  
	 
	   for (var i=1; i < sides; ++i) {  
	      PM.ctx.lineTo(points[i].x, points[i].y);  
	   }  
	   PM.ctx.closePath(); 
	   PM.ctx.fillStyle = bgcolor;	
	   PM.ctx.fill();
	   
	   
	}  
	
	var lineco = 0;//计数器
	//依次绘制对角线及最外层图标
	function drawPowerTypeInfo(){
        var points = getPolygonPoints(PM.radius, PM.s.sides);
        
		if(lineco < points.length){
			PM.ctx.strokeStyle = PM.s.linecolor;
		   	PM.ctx.beginPath(); 
		   	PM.ctx.moveTo(PM.s.cavW/2, PM.s.cavH/2); 
		    PM.ctx.lineTo(points[lineco].x, points[lineco].y); 
		    PM.ctx.stroke();
		    powerTypeInfo();
		    lineco++;
		    var st = setTimeout(drawPowerTypeInfo,300);
		}else{
			lineco = 0;
			clearTimeout(st);
			//这里必须再次新建一个canvas层，
			//如果再一个canvas上绘制，能力分布多边形由于多次绘制重叠没有透明效果
			//所以解决办法是每次清除第二个canvas，并重新绘制能力分布多边形
			createCanvas(PM.s.el,PM.s.cavW,PM.s.cavH,"PM_Canvas2");
			drawPowerPolygon();
		} 
	}
	//依次绘制不同半径大小的多边形，达到层次效果
	function drawPolygons(){
		for (var i = 0;i<PM.s.polygons.length;i++) {
			drawPolygonPath(PM.s.polygons[i].radius,PM.s.polygons[i].bgcolor);
		}
	}
	//测试用函数，随机生成能力图的能力数据
	function getRandomPowerScale(){
		var radiusArr = new Array();
		var radius = PM.radius
		var sides = PM.s.sides;
		for (var i=0;i<sides;i++) {
			var num = Math.random()*(radius+1) > radius?radius:(Math.random()*(radius+1)).toFixed(2);
			radiusArr.push(num);
		}
		PM.powerScale = radiusArr;
//		return radiusArr;
	}
//	var radiusArr = null;
	//获取能力图的顶点坐标，动态传入递增的scale，达到动画效果
	function getPowerPoints(scale){
	   var centerX = PM.s.cavW/2;
	   var centerY = PM.s.cavH/2;
	   var sides = PM.s.sides;
	   var radiusArr = PM.powerScale;
	   var points = [],  angle = 0;  
	   for (var i=0; i < sides; ++i) {  
	   	  //计算顶点的（x,y）坐标值
	      points.push(new Point( centerX + radiusArr[i]*scale *Math.sin(angle) ,centerY - radiusArr[i]*scale *Math.cos(angle)));  
	      angle += 2*Math.PI/sides;  
	   }  
//	   console.log(points);
	   return points;  
	}
	var scale = 0;
	//绘制能力分布图并填充颜色
	function drawPowerPolygon() {
	   var centerX = PM.s.cavW/2;
	   var centerY = PM.s.cavH/2;
	   var sides = PM.s.sides;
	   var radius = PM.radius
	   if(scale<1){
	   	   scale+=0.01;
	   	   var points = getPowerPoints(scale);
	   	   //每次先清除画布，再重绘
	   	   PM.ctx.clearRect(0,0,PM.s.cavW,PM.s.cavH);
		   PM.ctx.beginPath();  
		   PM.ctx.moveTo(points[0].x, points[0].y);  
		   for (var i=1; i < sides; ++i) {  
		      PM.ctx.lineTo(points[i].x, points[i].y);  
		   }  
		   PM.ctx.closePath(); 
		   PM.ctx.fillStyle = PM.s.powerBgColor;	
		   PM.ctx.fill();
		   requestAnimationFrame(drawPowerPolygon);
	   }else{
	   	scale = 0;
	   	drawPowerValue();
	   }
	}  
	//设置canvas中最大内切圆的半径
	function setRadius(){
		PM.radius = PM.s.polygons[0].radius;
	}
	//测试用，绘制最大内切圆
	function drawC(){
		PM.ctx.beginPath();
		PM.ctx.strokeStyle = PM.s.linecolor;
	   	PM.ctx.arc(PM.s.cavW/2,PM.s.cavH/2,PM.radius,0,2*Math.PI,false);
	    PM.ctx.closePath();
	    PM.ctx.stroke();
	}
	
	function drawPowerValue(){
		var ctx = PM.ctx;
		var fontSize = PM.s.powerFontSize;
		ctx.font = fontSize+'px blod';
		var txt = (eval(PM.powerScale.join("+"))/PM.s.sides).toFixed(2);
		ctx.fillStyle=PM.s.powerFontColor;
		ctx.textAlign="center";
		ctx.fillText(txt,PM.s.cavW/2,PM.s.cavH/2+fontSize/4);
	}
	
	function loadIcons(url, callback) { 
		var img = new Image(); //创建一个Image对象，实现图片的预下载 
		img.src = url; 
//		if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数 
//			alert('complete1111');
//			callback.call(img); 
//			return; // 直接返回，不用再处理onload事件 
//			
//		} 
		img.onload = function () { //图片下载完毕时异步调用callback函数。 
			callback.call(img);//将回调函数的this替换为Image对象 
		}; 
	}
	function powerTypeInfo(){
		var icons = PM.s.powerTypeInfo.icon; 
		loadIcons(icons[lineco].iconPath,drawIcon);
	}
	function drawIcon(){
		var ctx = PM.ctx;
		var text = PM.s.powerTypeInfo.icon[lineco-1].text;
		var radius = PM.s.powerTypeInfo.style.iconsRadius;
		var size = PM.s.powerTypeInfo.style.iconsSize;
		var points = getPolygonPoints(radius);
		ctx.drawImage(this,points[lineco-1].x-size/2,points[lineco-1].y-size/2,size,size);
		ctx.font = PM.s.powerTypeInfo.style.font;
		ctx.fillStyle=PM.s.powerTypeInfo.style.fontColor;
		ctx.textAlign="center";
		ctx.fillText(text,points[lineco-1].x,points[lineco-1].y+size/2+15);
	}
	function clear(){
		var ctx1 = document.getElementById("PM_Canvas1");
		var ctx2 = document.getElementById("PM_Canvas2");
		if(ctx1&&ctx2){
			var parentId = PM.s.el.replace('#','');
			document.getElementById(parentId).removeChild(ctx1);
			document.getElementById(parentId).removeChild(ctx2);
		}
		
	}
	//初始化	
	function init(){
		setRadius();
		createCanvas(PM.s.el,PM.s.cavW,PM.s.cavH,"PM_Canvas1");
		getRandomPowerScale();//测试用，正式使用时直接对powerScale赋值即可，此行删除
//		drawC();////测试用，正式使用时可以删除
		drawPolygons();
		drawPowerTypeInfo();
	}
	//创建
//	PM.create();
})(window);
