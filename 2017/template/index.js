

function createDocument() {
    if(typeof arguments.callee.activeXString != 'string') {
        var versions = ['MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.3.0', 'MSXML2.DOMDocument.2.0'],
            i, len;

        for (i = 0; len = versions.length; i++) {
            try {
                new ActiveXObject(versions[i]);
                arguments.callee.activeXString = versions[i];
                break;
            } catch(ex) {}
        }
    }
}

function parseXml(xml) {
    var xmldom = null;

    if (typeof DOMParser != 'undefined') {
        /**
         * DOMParser IE9、Safari、Chrome、Opera均支持
         * 将XML解析为DOM文档，但是DOMParser只能解析格式良好的XML，不能把HTML解析为HTML文档。
         * 在发生错误的时候，会从parseFromString()中返回一个Document对象，这个对象的文档元素是<parsererror>，文档元素的内容是对解析错误的描述
         */
        xmldom = (new DOMParser()).parseFromString(xml, 'text/xml');  
        var errors = xmldom.getElementsByTagName('parsererror');
        if (errors.length) {
            throw new Error('XML parsing error:' + errors[0].textContent);
        }
    } else if (typeof ActiveXObject != 'undefined') {
        /**
         * IE8以及之前的版本
         */
        xmldom = createDocument();
        xmldom.loadXML(xml);
        if (xmldom.parseError != 0) {
            throw new Error('XML parsing error:' + xmldom.parseError.reason);
        }
    } else {
        throw new Error('No XML parser available');
    }
    return xmldom;
}

var Go = function(opt) {
    this.opt = opt;
};

Go.prototype.init = function() {
    this.compile();
}

Go.prototype.compile = function() {
    var me = this,
        ele = me.opt.ele,
        target;

    var scriptFlie = document.getElementsByTagName('script');
    // var scriptSrc = scriptFlie.attributes['src'].value;
    // console.log(scriptFlie)
    // console.log(scriptFlie.attributes['src'].value)

    if(typeof scriptFlie.attributes['src'].value != 'undefined') {
        if (/\.go$/.test(scriptFlie.attributes['src'].value)) {
            console.log(56)
        }
    }

    if(/^\#/.test(ele)) {
        target = document.getElementById(ele.slice(1, ele.length));    
    } else if(/^\./.test(ele)) {
        target = document.getElementsByClassName(ele.slice(1, ele.length));    
    }
    
    var $template = document.getElementsByTagName('template');
    var aa = parseXml(target);

    console.log(target);
    console.log($template);
    console.log(aa)


}

// (function() {

// })()





