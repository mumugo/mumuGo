

function createDocument() {
    if(typeof arguments.callee.activeXString != 'string') {
        var versions = ['MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.3.0', 'MSXML2.DOMDocument.2.0'],
            i, len;
        
        /**
         * 迭代可能的ActiveX版本。
         */
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

var Go = function() {

}

Go.prototype.compile = function() {

}


//var target = document.getElementsByTagName()

/**
 * 实现方式:
 * 类似handlebars var mallTpl = new Template(document.getElementById("mall-tpl").innerHTML);
 * 类似vue
 * 
 */

