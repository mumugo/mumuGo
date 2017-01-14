

// function createDocument() {
//     if(typeof arguments.callee.activeXString != 'string') {
//         var versions = ['MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.3.0', 'MSXML2.DOMDocument.2.0'],
//             i, len;

//         for (i = 0; len = versions.length; i++) {
//             try {
//                 new ActiveXObject(versions[i]);
//                 arguments.callee.activeXString = versions[i];
//                 break;
//             } catch(ex) {
//                 console.log(ex)
//             }
//         }
//     }

//     return new ActiveXObject(arguments.callee.activeXString);
// }

// function parseXml(xml) {
//     var xmldom = null;

//     if (typeof DOMParser != 'undefined') {
//         /**
//          * DOMParser IE9、Safari、Chrome、Opera均支持
//          * 将XML解析为DOM文档，但是DOMParser只能解析格式良好的XML，不能把HTML解析为HTML文档。
//          * 在发生错误的时候，会从parseFromString()中返回一个Document对象，这个对象的文档元素是<parsererror>，文档元素的内容是对解析错误的描述
//          */
//         // xmldom = (new DOMParser()).parseFromString(xml, 'text/xml');  
//         // var errors = xmldom.getElementsByTagName('parsererror');
//         // if (errors.length) {
//         //     throw new Error('XML parsing error:' + errors[0].textContent);
//         // }

//         xmlhttp=new XMLHttpRequest();
//         xmlhttp.open("GET",xml,false);
//         xmlhttp.send();

//     } else if (typeof ActiveXObject != 'undefined') {
//         /**
//          * IE8以及之前的版本
//          */
//         xmldom = createDocument();
//         xmldom.loadXML(xml);
//         if (xmldom.parseError != 0) {
//             throw new Error('XML parsing error:' + xmldom.parseError.reason);
//         }
//     } else {
//         throw new Error('No XML parser available');
//     }
//     return xmldom;
// }

//解析XML文件
var loadXML = function(xmlFile){
    var xmlDoc=null;
    //判断浏览器的类型
    //支持IE浏览器
    if(!window.DOMParser && window.ActiveXObject){
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
        for(var i = 0; i < xmlDomVersions.length; i++){
            try{
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                break;
            }catch(e){
            }
        }
    } else if(document.implementation && document.implementation.createDocument){
    	//支持Mozilla浏览器
        try{
            /* document.implementation.createDocument('','',null); 方法的三个参数说明
                * 第一个参数是包含文档所使用的命名空间URI的字符串； 
                * 第二个参数是包含文档根元素名称的字符串； 
                * 第三个参数是要创建的文档类型（也称为doctype）
                */
            xmlDoc = document.implementation.createDocument('','',null);
        }catch(e){
        }
    } else{
        return null;
    }

    if(xmlDoc!=null){
        try{
            xmlDoc.asyc = false;   //是否异步调用
            xmlDoc.load(xmlFile);  //文件路径
        }catch(e){  //chrome不支持load()方法，得使用XMLHttpRequest
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET",xmlFile,false);   //创建一个新的http请求，并指定此请求的方法、URL以及验证信息
                xmlhttp.send(null);
                xmlDoc = xmlhttp.responseText;
                var returnXML = new DOMParser().parseFromString(xmlDoc, "text/xml")
                return returnXML;
        }
    }
    return xmlDoc;
}

var Go = function(opt) {
    this.opt = opt;
};

Go.prototype.init = function() {
    var me = this;
    

    var scriptFlie = document.getElementsByTagName('script');
    

    for(var i = 0; i < scriptFlie.length; i++) {
        var fileSrc = scriptFlie[i].attributes['src'];
        // if(typeof fileSrc != 'undefined') {
        //     if (/\.goo$/.test(fileSrc.value)) {
                // var xmldoc=loadXML(fileSrc.value);
                var xmldoc=loadXML('test.goo');
                console.log(xmldoc)
                var elements = xmldoc.getElementsByTagName("root");
                console.log(elements)
                // me.compile();
                // console.log(fileSrc.value)
                // var xmldom = createDocument();
                // xmldom.async = false;
                // xmldom.load(fileSrc.value);
            }
        // }
    // }
}

Go.prototype.compile = function() {
    var me = this,
        target;
    
    var $template = document.getElementsByTagName('template');
    console.log($template);



    // if(/^\#/.test(ele)) {
    //     target = document.getElementById(ele.slice(1, ele.length));    
    // } else if(/^\./.test(ele)) {
    //     target = document.getElementsByClassName(ele.slice(1, ele.length));    
    // }
    
    // var $template = document.getElementsByTagName('template');
    // var aa = parseXml(target);

    // console.log(target);
    // console.log($template);
    // console.log(aa)


}

// (function() {

// })()





