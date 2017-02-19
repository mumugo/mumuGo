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

//生命周期 数据双向绑定
var Go = function(opt) {
    var me = this;
    me.opt = opt;
    me.eventHandler = new eventHandler(this);
    me.components = [];
    me.data = opt.data;
    me.allNodes = {};
    me.target = /^\#/g.test(me.opt.ele) ? document.getElementById(me.opt.ele.slice(1, me.opt.ele.length)) :
                (/^\./g.test(me.opt.ele) ? document.getElementsByClassName(me.opt.ele.slice(1, me.opt.ele.length)) : null);
    me.init();
};

Go.prototype.init = function() {
    var me = this,
        tempObj = me.opt.template;

    if (me.target === null) {
        console.log('创建Go失败！找不到对应目标！');
        return;
    }

    tempObj = !!tempObj ? tempObj : me.target.innerHTML;
    
    me.eventHandler.on('toMounted', function() {
        !!me.opt.mounted && me.opt.mounted();
    });

    if (/\.goo$/.test(tempObj)) {
        //单文件组件
        me.eventHandler.rely('toMounted', ['templateReady', 'styleReady', 'scriptReady']);
        var scriptFlie = document.getElementsByTagName('script');

        for (var i = 0; i < scriptFlie.length; i++) {
            var fileSrc = scriptFlie[i].attributes['src'],
                fileType = scriptFlie[i].attributes['type'];
                // xmldoc;
            
            if (typeof fileSrc != 'undefined' && typeof fileSrc.value != 'undefined' && typeof fileType != 'undefined') {
                if (fileSrc.value.match(tempObj) && fileType.value === 'text/goo') {
                    var xmldoc = loadXML(fileSrc.value);
                    me.compile(xmldoc);
                }
            }
        }
    } else {
        //非单文件组件
        me.eventHandler.rely('toMounted', ['templateReady']);
        me.compileComponent(tempObj, me.opt.component, true);
    }

    // 双向绑定数据处理
    me.bidirectionalBind();
    

}

// 双向绑定
Go.prototype.bidirectionalBind = function() {
    var me = this;
    var allDoms = document.body.children;

    // function bind(doms) {
    //     for (var i = 0; i < doms.length; i++) {
    //         if (!!doms[i].attributes['g-model']) {
    //             console.log(doms[i]);
    //         }

    //         //递归查找
    //         if (doms[i].children.length !== 0) {
    //             bind(doms[i].children);
    //         }
    //     }
    // }
    function bindText(target) {
        var eles = document.querySelectorAll('[g-text]'),
            ele_data;

        for (var i = 0; i < eles.length; i++) {
            ele_data = eles[i].getAttribute('g-text');


        }
    }

    function bindModel(target, value) {
        var eles = document.querySelectorAll('[g-model]'),
            ele_data;
            
        for (var i = 0; i < eles.length; i++) {
            ele_data = eles[i].getAttribute('g-model');

            if(target === ele_data) {
                eles[i].value = value || '';
            }

            //每次修改进来了2次！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
            //为g-model元素绑定keyup事件
            if (document.addEventListener) {
                eles[i].addEventListener('keyup',function(event) {
                    console.log('test');
                    var e = event || window.event;
                    me.data[ele_data] = e.target.value;
                },false);
            } else {
                eles[i].attachEvent('onkeyup',function(event){
                    var e = event || window.event;
                    me.data[ele_data] = e.target.value;  
                }, false);
            }
        }
        
        
    }
    
    // bindModel();
    function defProperty(obj, isFirst) {
        for (var key in obj) {
            if (isFirst) {
                bindModel(key, obj[key]);
            }
            
            Object.defineProperty(obj, key, {
                get: function() {
                    return this.key;
                }, 
                set: function(newValue) {
                    this.key = newValue;
                    
                    // bindText();
                    // this.edtion += newValue - 2004;
                }
            });
        }
    }

    defProperty(me.data, true);
    // bind(allDoms);
}

// 编译组件
Go.prototype.compileComponent = function(temp, components, isFirst) {
    var me = this;

    // 第一次的时候才去渲染
    if (!!isFirst) {
        this.compileTemplate(temp, true);
    }

    if (!!components) {
        for (var key in components) {
            var tags = document.getElementsByTagName(key);
            
            for (var i = 0; i < tags.length; i++) {
                var parentNodeId = tags[i].attributes['goid'].value,
                    grandparent,
                    parentbrothers;

                grandparent = tags[i].parentElement;
                tags[i].outerHTML = '<div goid=' + parentNodeId + '>' + components[key].template + '</div>';
                parentbrothers = grandparent.children;

                for (var j = 0; j < parentbrothers.length; j++) {
                    if (parentbrothers[j].attributes['goid'].value === parentNodeId) {
                        me.allNodes[parentNodeId] = parentbrothers[j];
                        me.setNodeId(parentbrothers[j]);
                    }
                }

                //递归编译嵌套组件
                if (!!components[key].component) {
                    me.compileComponent(components[key].template, components[key].component);
                } else {
                    // me.eventHandler.emit('templateReady');
                }
            }
        }
    }
}

Go.prototype.compile = function(xmldoc) {
    var me = this;
    var goo_temp = xmldoc.getElementsByTagName('template')[0];
    var goo_style = xmldoc.getElementsByTagName('style');
    var goo_script = xmldoc.getElementsByTagName('script');

    me.compileTemplate(goo_temp, true);
    me.compileStyle(goo_style);
    me.compileScript(goo_script);
}

// 编译<template>
Go.prototype.compileTemplate = function(temps, isRoot) { 
    var me = this,
        beforeHtml, modefiedHtml, attrNames, target;

    // 获取原来的html
    modefiedHtml = beforeHtml = typeof temps == 'string' ? temps : temps.innerHTML;

    if (beforeHtml.match(/(.*)\{\{(.*)\}\}(.*)/g)) {
        attrNames = beforeHtml.match(/\{\{([^\}\}]*)\}\}/ig);
        for (var i = 0; i < attrNames.length; i++) {
            var attr = attrNames[i].replace(/(.*)\{\{(.*)\}\}(.*)/g, '$2').replace(/\s/g, '');
            var replace_html = '<span g-text=' + attr +'>' + me.opt.data[attr] + '</span>';     //增加g-text属性，以便双向绑定
            if (!!me.opt.data[attr]) {
                modefiedHtml = modefiedHtml.replace(attrNames[i], replace_html);
            }
        }
    } else {
        modefiedHtml = beforeHtml;
    }

    if (/^\#/g.test(me.opt.ele)) {
        me.target.innerHTML = modefiedHtml;
    } else if (/^\./g.test(me.opt.ele)) {
        target = document.getElementsByClassName(me.opt.ele.slice(1, me.opt.ele.length));
        for (var j = 0; j < target.length; j++) {
            target[j].innerHTML = modefiedHtml;
        }
    }

    if (isRoot) {
        me.setNodeId(me.target);
    }

    // if (!me.opt.component) {
    me.eventHandler.emit('templateReady');
    // }
}

// 编译<style>
Go.prototype.compileStyle = function(styleEles) { 
    var me = this,
        styleObj;
    styleObj = document.createElement('style');

    for (var i = 0; i < styleEles.length; i++) {
        styleObj.innerHTML += styleEles[i].innerHTML;
    }
    document.body.appendChild(styleObj);

    me.eventHandler.emit('styleReady');
}

// 编译<script>
Go.prototype.compileScript = function(scriptObj) { 
    var me = this;
    for (var i = 0; i < scriptObj.length; i++) {
        eval(scriptObj[i].innerHTML);
    }
    me.eventHandler.emit('scriptReady');
}

//为每个元素设置id
Go.prototype.setNodeId = function(dom) {
    var me = this,
        children = dom.children,
        parentNodeId;
    
    if (!!dom.attributes['goid']) {
        //非根节点
        parentNodeId = dom.attributes['goid'].value;
    } else {
        //根节点
        parentNodeId = 0;
        dom.setAttribute('goid', 0);
        me.allNodes[0] = dom;
    }
    
    for (var i = 0; i < children.length; i++) {
        var childNodeId = parentNodeId + '.' + i;
        children[i].setAttribute('goid', childNodeId);
        me.allNodes[childNodeId] = children[i];

        if (children[i].children.length != 0) {
            me.setNodeId(children[i]);
        }
    }
}

//根据NodeId查找元素
Go.prototype.getByNodeId = function(nodeId) {
    return this.allNodes[nodeId];
}

//生成Virtual DOM Tree
/**
 * 如何生成虚拟树
 * 
 */
Go.prototype.getVirtualTree = function() {

}

//diff算法
Go.prototype.diff = function(oldTree, newTree) {

}

//渲染页面
Go.prototype.patch = function() {

}


// 注册组件
Go.prototype.registerComponent = function(opt) {
    return opt;
}

/* *********************************************************************************** */

//初始化暴露API
function initGlobalAPI(Go) {
    Go.component = function(opt) {
        var Super = this;

        // 创建子类
        var Sub = function() {}
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        
        return Sub.prototype.registerComponent(opt);
    }
}



(function() {
    initGlobalAPI(Go);

    
})()

 /**
 * 有几个new Go应该如何处理id重复问题
 * 你给我一个数据，我根据这个数据生成一个全新的Virtual DOM，然后跟我上一次生成的Virtual DOM去 diff，得到一个Patch，然后把这个Patch打到浏览器的DOM上去。完事。有点像版本控制打patch的思路。假设在任意时候有，VirtualDom1 == DOM1 （组织结构相同）当有新数据来的时候，我生成VirtualDom2，然后去和VirtualDom1做diff，得到一个Patch。然后将这个Patch去应用到DOM1上，得到DOM2。如果一切正常，那么有VirtualDom2 == DOM2。
 * VBS 观察者模式
 * 
 * vue写法
 * bindText:处理{{}}
 * bindModel:处理g-model，为每个元素绑定keyup事件
 * 
 *  */ 
