/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports) {

	//解析XML文件
	var loadXML = function(xmlFile) {
	    var xmlDoc = null;
	    //判断浏览器的类型
	    //支持IE浏览器
	    if (!window.DOMParser && window.ActiveXObject) {
	        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
	        for (var i = 0; i < xmlDomVersions.length; i++) {
	            try {
	                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
	                break;
	            } catch (e) {
	                console.log(e);
	            }
	        }
	    } else if (document.implementation && document.implementation.createDocument) {
	    	//支持Mozilla，opera浏览器
	        try {
	            /* document.implementation.createDocument('','',null); 方法的三个参数说明
	            * 第一个参数是包含文档所使用的命名空间URI的字符串； 
	            * 第二个参数是包含文档根元素名称的字符串； 
	            * 第三个参数是要创建的文档类型（也称为doctype）
	            */
	            xmlDoc = document.implementation.createDocument('', '', null);
	        } catch (e) {
	            console.log(e);
	        }
	    } else {
	        return null;
	    }
	
	    if (xmlDoc != null) {
	        try {
	            xmlDoc.asyc = false;   //是否异步调用
	            xmlDoc.load(xmlFile);  //文件路径
	            return xmlDoc;
	        } catch (e) {  
	            //chrome，safari不支持load()方法，故用http协议，XMLHttpRequest对象。
	            var xmlhttp = new XMLHttpRequest();
	            xmlhttp.open('GET', xmlFile, false);   //创建一个新的http请求，并指定此请求的方法、URL以及验证信息
	            xmlhttp.send(null);
	            return new DOMParser().parseFromString('<go>' + xmlhttp.responseText + '</go>', 'text/xml'); 
	
	            //XMLHttpRequest对象回调函数
	            // xmlhttp.onload = function(e) { 
	            //     if(this.status == 200||this.status == 304){
	                    // return new DOMParser().parseFromString(xmlhttp.responseText, "text/xml"); 
	                // }
	            // };
	        }
	    }
	    return null;
	}
	
	// var book = {
	//     _year: 2004,
	//     edtion: 1
	// };
	
	// Object.defineProperty(book, 'year', {
	//     get: function() {
	//         return this._year;
	//     }, 
	//     set: function(newValue) {
	//         this._year = newValue;
	//         this.edtion += newValue - 2004
	//     }
	// });
	
	// 双向绑定
	// function bidirectionalBind(obj, key) {
	//     Object.defineProperty(obj, key, {
	//         get: function() {
	//             return this.key;
	//         }, 
	//         set: function(newValue) {
	//             this.key = newValue;
	//             obj.parentClass.didMount();
	//             // this.edtion += newValue - 2004;
	
	//         }
	//     });
	// }
	
	//生命周期 数据双向绑定
	
	var Go = function(opt) {
	    this.opt = opt;
	    this.init();
	};
	
	Go.prototype.init = function() {
	    var me = this;
	    var scriptFlie = document.getElementsByTagName('script');
	    
	    for (var i = 0; i < scriptFlie.length; i++) {
	        var fileSrc = scriptFlie[i].attributes['src'],
	            fileType = scriptFlie[i].attributes['type'];
	
	        if (typeof fileType != 'undefined' && fileType.value === 'text/goo') {
	            var xmldoc = loadXML(fileSrc.value);
	            me.compile(xmldoc);
	        }
	    }
	}
	
	Go.prototype.compile = function(xmldoc) {
	    console.log(xmldoc);
	    var me = this;
	    me.compileTemplate(xmldoc);
	    me.compileStyle(xmldoc);
	    me.compileScript(xmldoc);
	}
	
	Go.prototype.compileTemplate = function(xmldoc) { 
	    var me = this,
	        temps, beforeHtml, modefiedHtml, attrName, target;
	    temps = xmldoc.getElementsByTagName('template');
	
	    for (var i = 0; i < temps.length; i++) {
	        beforeHtml = temps[i].innerHTML;
	
	        attrName = beforeHtml.replace(/(.*)\{\{(.*)\}\}(.*)/g, '$2').replace(/\s/g, '');
	        modefiedHtml = beforeHtml.replace(/\{\{(.*)\}\}/g, me.opt.data[attrName]);
	
	        if (/^\#/g.test(me.opt.ele)) {
	            target = document.getElementById(me.opt.ele.slice(1, me.opt.ele.lenth));
	            target.innerHTML = modefiedHtml;
	
	        } else if (/^\./g.test(me.opt.ele)) {
	            target = document.getElementsByClassName(me.opt.ele.slice(1, me.opt.ele.lenth));
	            for (var j = 0; j < target.length; j++) {
	                target[j].innerHTML = modefiedHtml;
	            }
	        }
	    }
	}
	
	Go.prototype.compileStyle = function(xmldoc) { 
	    var styleObj,
	        styleEles;
	
	    styleEles = xmldoc.getElementsByTagName('style');  
	    styleObj = document.createElement('style');
	
	    for (var i = 0; i < styleEles.length; i++) {
	        styleObj.innerHTML += styleEles[i].innerHTML;
	    }
	    document.body.appendChild(styleObj);
	}
	
	Go.prototype.compileScript = function(xmldoc) { 
	    var scriptObj;
	
	    scriptObj = xmldoc.getElementsByTagName('script');  
	    for (var i = 0; i < scriptObj.length; i++) {
	        eval(scriptObj[i].innerHTML);
	    }
	}
	
	Go.prototype.component = function() {
	    
	}
	
	// (function() {
	
	// })()
	
	


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map