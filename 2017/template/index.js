//解析XML文件
var loadXML = function(xmlFile){
    var xmlDoc=null;
    //判断浏览器的类型
    //支持IE浏览器
    if(!window.DOMParser && window.ActiveXObject){
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        for(var i = 0; i < xmlDomVersions.length; i++){
            try{
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                break;
            }catch(e){
            }
        }
    } else if(document.implementation && document.implementation.createDocument){
    	//支持Mozilla，opera浏览器
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
        }catch(e){  
            //chrome，safari不支持load()方法，故用http协议，XMLHttpRequest对象。
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET",xmlFile,false);   //创建一个新的http请求，并指定此请求的方法、URL以及验证信息
            xmlhttp.send(null);
            var xmlDom = new DOMParser().parseFromString(xmlhttp.responseText, "text/xml");  //字符串转xml
            console.log(xmlDom)
            return xmlDom;
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
        if(typeof fileSrc != 'undefined') {
            if (/\.goo$/.test(fileSrc.value)) {
                var xmldoc = loadXML(fileSrc.value);
                var elements = xmldoc.getElementsByTagName("root");
                me.compile(xmldoc);
            }
        }
    }
}

Go.prototype.compile = function(xmldoc) {
    var me = this,
        target;
    console.log(xmldoc)
    // document.body.appendChild();
    // var $template = document.getElementsByTagName('template');
    // console.log($template);



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





