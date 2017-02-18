(function() {
    Array.prototype.replaceValue=function(oldValue,newValue){
        var index = this.indexOf(oldValue);
        if (index > -1) {
            this[index] = newValue;
        }
    }
    // 在数组中的指定位置后插入值
    Array.prototype.insertAfter = function(index,value){
        this.splice(index, 0, value);
        return index;
    }
    var stage = function (opts){
        this.title = opts.title;
        this.headNodeId = -1;
        this.allNodes = this.translateIntoNodeList([]);
        this.preOrderArr = [];
        this.debug = opts.debug;
        this.currentNodeId = (!!opts.basicId && !isNaN(opts.basicId))?opts.basicId:0;
        this.supportedEventList = ["onabort","onblur","onchange","onclick","ondblclick","onerror","onfocus","onkeydown","onkeypress","onkeyup","onload","onmousedown","onmousemove","onmouseout","onmouseover","onmouseup","onreset","onresize","onselect","onsubmit","onunload"];
    };
    stage.prototype.createNode = function (opts) {
        if (!opts.tagName || !opts.groupName || opts.isGroupHead == undefined || opts.groupHeadNodeId == undefined) {
            this.console("创建nodeObj的参数不完整");
            return false;
        }
        opts.stage = this;
        opts.nodeId = this.currentNodeId;
        this.currentNodeId++;
        return new nodeObj(opts);
    };
    stage.prototype.removeNode = function (nodeId) {
        var stage = this;
        var thisNode = this.$(nodeId);
        var thisNodeArr = this.getPreOrderArr(nodeId);
        var parentNode = this.$(thisNode.parentNodeId);
        if (!!parentNode && parentNode!=-1) {
            parentNode.childNodeIds = _.without(parentNode.childNodeIds,nodeId);
            _.each(parentNode.childNodeIds,function(val){
                if(stage.$(val).index > thisNode.index) {
                    stage.$(val).index--;
                }
            });
        }
        _.each(thisNodeArr,function(val){delete stage.allNodes[val.nodeId];});
        this.allNodes.nodeListNodeIds = _.difference(this.allNodes.nodeListNodeIds,_.pluck(thisNodeArr, 'nodeId'));
        this.allNodes.length = this.allNodes.nodeListNodeIds.length;
        if (stage.headNodeId == nodeId) {
            stage.headNodeId = -1;
        }
    };
    stage.prototype.createObj = function(obj) {
        if(arguments.length == 0) {
            this.console("需要传入一个node对象");
            return false;
        }
        if(!this.isNodeObj(obj)) {
            this.console("stage注册对象参数需为nodeObj对象");
            return false;
        }

        var _this = this;
        var createNewObj = function() {
            this.nodeId = _this.currentNodeId;
            _this.currentNodeId++;
        }
        createNewObj.prototype = obj;
        return new createNewObj(); 
    }
    stage.prototype.getById = function (id) {
        return _.find(this.allNodes,function(val,key){return val.id == id;});
    };
    stage.prototype.getByNodeId = function (nodeId) {
        return this.allNodes[nodeId];
    };
    stage.prototype.$ = function (arg) {
        if (isNaN(arg)) {
            return this.getById(arg);
        } else {
            return this.getByNodeId(arg);
        }
    };
    stage.prototype.dir = function () {
        if (this.headNodeId == -1) {
            return false;
        }
        return this.buildTree(this.headNodeId);
    };
    stage.prototype.buildTree = function (nodeId) {
        var thisNode = this.$(nodeId);
        var childNodeIds = thisNode.childNodeIds;
        var childNodes = [];
        for (var i = 0; i < childNodeIds.length; i++) {
            var childNode = this.buildTree(childNodeIds[i]);
            childNodes.push(childNode);
        }
        return {
            "nodeId": nodeId,
            "childNodes": childNodes
        };
    };
    stage.prototype.isNodeObj = function (obj) {
        if (!!obj) {
            return obj.constructor == nodeObj;
        }
    };
    stage.prototype.isNodeList = function (obj) {
        return obj.constructor == nodeList;
    };
    stage.prototype.getPreOrderArr = function (nId) {
        var stage = this;
        stage.preOrderArr = [];
        nId = !!nId?nId:stage.headNodeId;
        preOrder(nId);
        function preOrder (nodeId) {
            var thisNodeId = nodeId;
            var thisNode = stage.$(nodeId);
            stage.preOrderArr.push(thisNode);
            for (var i = 0;i < thisNode.childNodeIds.length; i++) {
                //确保index升序
                preOrder(_.find(thisNode.childNodeIds,function(nodeid) {return stage.$(nodeid).index == i;}));
            }
        }
        return stage.preOrderArr;
    };
    stage.prototype.translateIntoNodeList = function (nodeArr) {
        return new nodeList(nodeArr);
    };
    stage.prototype.console = function (text) {
        if (this.debug) {
            console.log(text);
        }
    };
    var nodeObj = function (opts) {
        this.stage = opts.stage;
        this.nodeId = opts.nodeId;
        this.id = opts.id;
        this.tagName = opts.tagName;
        this.className = !!opts.className ? opts.className : '';
        //this.classList = !!opts.classList?opts.classList:[];
        this.style = typeof(opts.style) == "object"?opts.style:{};
        this.attributes = typeof(opts.attributes) == "object"?opts.attributes:{};
        this.eventList = typeof(opts.eventList) == "object"?opts.eventList:{};
        this.groupName = opts.groupName;
        this.isGroupHead = opts.isGroupHead;
        this.groupHeadNodeId = opts.groupHeadNodeId;
        this.parentNodeId = !!opts.parentNodeId ? opts.parentNodeId : -1;
        this.childNodeIds = !!opts.childNodeIds ? opts.childNodeIds : [];
        this.index =!!opts.index ? opts.index : -1;
    };
    //这段代码ie8不兼容
    //Object.defineProperty(nodeObj.prototype, "className", {
    //    get:function() {
    //        return this._className;
    //    },
    //    set:function(newValue) {
    //        if(typeof(newValue) == "string") {
    //            this._className = newValue;
    //            this.classList = this._className.split(" ");
    //        }
    //    }
    //});
    nodeObj.prototype.insertBefore = function (arg) {
        if (!arg) {
            //没有传参
            var node = undefined;
        } else if (!isNaN(arg)) {
            //参数为nodeId
            var node = this.stage.$(arg);

        } else if (typeof(arg) == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
        }
        var me = this;
        if (node == undefined && this.stage.headNodeId == -1) {
            this.stage.headNodeId = this.nodeId;
            this.stage.allNodes[this.nodeId] = this;
            this.stage.allNodes.nodeListNodeIds.push(this.nodeId);
            this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
            this.index = 0;
        } else if (this.stage.isNodeObj(node) && !this.stage.$(this.nodeId)) {
            var parentNode = this.stage.$(node.parentNodeId);
            if (this.stage.isNodeObj(parentNode)) {
                var this_index = node.index;
                _.each(parentNode.childNodeIds,function(val){
                    var x_node = me.stage.$(val);
                    if (x_node.index >= this_index) {
                        x_node.index++;
                    }
                });
                this.index = this_index;
                this.parentNodeId = parentNode.nodeId;
                this.stage.allNodes[this.nodeId] = this;
                this.stage.allNodes.nodeListNodeIds.push(this.nodeId);
                this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
                parentNode.childNodeIds.push(this.nodeId);
            } else {
                return false;
            }
        }
    };
    nodeObj.prototype.insertAfter = function (arg) {
        if (!isNaN(arg)) {
            //参数为nodeId
            var node = this.stage.$(arg);
        } else if (typeof arg == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
        }
        var me = this;
        if (node == undefined && this.stage.headNodeId == -1) {
            this.stage.headNodeId = this.nodeId;
            this.stage.allNodes[this.nodeId] = this;
            this.stage.allNodes.nodeListNodeIds.push(this.nodeId);
            this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
            this.index = 0;
        } else if (this.stage.isNodeObj(node) && !this.stage.$(this.nodeId)) {
            var parentNode = this.stage.$(node.parentNodeId);
            if (this.stage.isNodeObj(parentNode)) {
                var this_index = node.index + 1;
                _.each(parentNode.childNodeIds,function(val){
                    var x_node = me.stage.$(val);
                    if (x_node.index >= this_index) {
                        x_node.index++;
                    }
                });
                this.index = this_index;
                this.parentNodeId = parentNode.nodeId;
                this.stage.allNodes[this.nodeId] = this;
                this.stage.allNodes.nodeListNodeIds.push(this.nodeId);
                this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
                parentNode.childNodeIds.push(this.nodeId);
            } else{
                return false;
            }
        }
    };
    nodeObj.prototype.prepend = function (arg) {
        if (!isNaN(arg)) {
            //参数为nodeId
            var node = this.stage.$(arg);
        } else if (typeof arg == "object" && this.stage.isNodeList(arg)) {
            //参数为nodeList
            var nodeList = arg;
        } else if (typeof arg == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
            var nodeList = false;
        }
        var me = this;
        if (this.stage.isNodeObj(node) && !this.stage.$(node.nodeId)) {
            _.each(this.childNodeIds,function(val){
                var x_node = me.stage.$(val);
                x_node.index++;
            });
            node.index = 0;
            node.parentNodeId = this.nodeId;
            this.stage.allNodes[node.nodeId] = node;
            this.stage.allNodes.nodeListNodeIds.push(node.nodeId);
            this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
            this.childNodeIds.push(node.nodeId);
        } else if (!!nodeList) {
            _.each(this.childNodeIds,function(val){
                var x_node = me.stage.$(val);
                x_node.index++;
            });
            var headNode = nodeList.getHeadNode();
            headNode.index = 0;
            headNode.parentNodeId = this.nodeId;
            this.childNodeIds.push(headNode.nodeId);
            _.each(nodeList.nodeListNodeIds,function(val,key){
                me.stage.allNodes[val] = nodeList[val];
                me.stage.allNodes.nodeListNodeIds.push(val);
                me.stage.allNodes.length = me.stage.allNodes.nodeListNodeIds.length;
            });
        }
    };
    nodeObj.prototype.append = function (arg) {
        if (!isNaN(arg)) {
            //参数为nodeId
            var node = this.stage.$(arg);
        } else if (typeof arg == "object" && this.stage.isNodeList(arg)) {
            var nodeList = arg;
        } else if (typeof arg == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
            var nodeList = false;
        }
        var me = this;
        if (this.stage.isNodeObj(node) && !this.stage.$(node.nodeId)) {
            node.index = this.childNodeIds.length;
            node.parentNodeId = this.nodeId;
            this.stage.allNodes[node.nodeId] = node;
            this.stage.allNodes.nodeListNodeIds.push(node.nodeId);
            this.stage.allNodes.length = this.stage.allNodes.nodeListNodeIds.length;
            this.childNodeIds.push(node.nodeId);
        } else if (!!nodeList) {
            var headNode = nodeList.getHeadNode();
            headNode.index = 0;
            headNode.parentNodeId = this.nodeId;
            this.childNodeIds.push(headNode.nodeId);
            _.each(nodeList.nodeListNodeIds,function(val,key){
                me.stage.allNodes[val] = nodeList[val];
                me.stage.allNodes.nodeListNodeIds.push(val);
                me.stage.allNodes.length = me.stage.allNodes.nodeListNodeIds.length;
            });
        }
    };
    nodeObj.prototype.clone = function(flag) {
        if(flag) {
            var nodeArr = [];
            cloneNodeList(this);
            return this.stage.translateIntoNodeList(nodeArr);
        } else {
            return cloneNode(this);
        }
        function cloneNodeList (node,parentNode) {
            var thisNode = cloneNode(node);
            if (!parentNode) {
                thisNode.index = 0;
                thisNode.parentNodeId = -1;
            } else {
                thisNode.index = node.index;
                thisNode.parentNodeId = parentNode.nodeId;
                parentNode.childNodeIds.push(thisNode.nodeId);
            }
            nodeArr.push(thisNode);
            _.each(node.childNodeIds,function(val){
                cloneNodeList(node.stage.$(val),thisNode);
            });
        }
        function cloneNode(node) {
            var newNode = node.stage.createNode({
                id: !!node.id?node.id+"+":node.id,
                tagName: node.tagName,
                className: node.className,
                //classList: node.classList.slice(),
                style: _.pick(node.style,function(){return true;}),
                attributes: _.pick(node.attributes,function(){return true;}),
                eventList: _.pick(node.eventList,function(){return true;}),
                isGroupHead: node.isGroupHead,
                groupName: node.groupName,
                groupHeadNodeId: node.groupHeadNodeId
            });
            return newNode;
        }
    };
    nodeObj.prototype.remove = function() {
        this.stage.removeNode(this.nodeId);
    };
    nodeObj.prototype.clear = function() {
        var thisNode = this;
        for (var i = 0; i < thisNode.childNodeIds.length; i++) {
            thisNode.stage.removeNode(thisNode.childNodeIds[i]);
            i--;
        }
    };
    nodeObj.prototype.next = function() {
        var thisNode = this;
        if(!thisNode.stage.isNodeObj(thisNode.stage.$(thisNode.parentNodeId))) {
            thisNode.stage.console("此节点是根节点，没有下一个nodeObj");
        }else{
            var siblingsNodeIds = thisNode.stage.$(thisNode.parentNodeId).childNodeIds;
            nextNodeId = _.filter(siblingsNodeIds,function(val){return thisNode.stage.$(val).index == thisNode.index + 1});
            if (nextNodeId.length != 0) {
                return thisNode.stage.$(nextNodeId);
            } else {
                thisNode.stage.console("未找到后一个nodeObj");
                return false;
            }
        }
    };
    nodeObj.prototype.prev = function() {
        var thisNode = this;
        if(!this.stage.isNodeObj(thisNode.stage.$(thisNode.parentNodeId))) {
            thisNode.stage.console("此节点是根节点，没有前一个nodeObj");
        }else{
            var siblingsNodeIds = thisNode.stage.$(thisNode.parentNodeId).childNodeIds;
            prevNodeId = _.filter(siblingsNodeIds,function(val){return thisNode.stage.$(val).index == thisNode.index - 1});
            if (prevNodeId.length != 0) {
                return thisNode.stage.$(prevNodeId);
            } else {
                thisNode.stage.console("未找到后一个nodeObj");
                return false;
            }
        }
    };
    nodeObj.prototype.getAllChild = function(){
        return this.stage.getPreOrderArr(this.nodeId).length-1;
    };
    var nodeList = function (arr) {
        this.nodeListNodeIds = [];
        this.length = arr.length;
        var me = this;
        var root = [];
        _.each(arr,function(val){
            me[val.nodeId] = val;
            me.nodeListNodeIds.push(val.nodeId);
            if (_.indexOf(_.pluck(arr, 'nodeId'),val.parentNodeId) == -1) {
                root.push(val);
            }
        });
        _.each(root,function(val){
            val.index = -1;
            val.parentNodeId = -1;
        });
    };
    nodeList.prototype.getHeadNode = function () {
        var me = this;
        var headNodeId = _.find(this.nodeListNodeIds,function(val){return me[val].parentNodeId == -1;})
        if (headNodeId != undefined) {
            return this[headNodeId];
        } else {
            return false;
        }
    };
    nodeList.prototype.insertBefore = function (arg) {
        var me = this;
        if (me.length == 0) {
            return false;
        }
        var stage = me[me.nodeListNodeIds[0]].stage;
        if (!arg) {
            //没有传参
            var node = undefined;
        } else if (!isNaN(arg)) {
            //参数为nodeId
            var node = stage.$(arg);

        } else if (typeof(arg) == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
        }
        if (node == undefined && stage.headNodeId == -1) {
            stage.headNodeId = this.getHeadNode().nodeId;
            this.getHeadNode().index = 0;
            pushInAllNodes();
        } else if (stage.isNodeObj(node) && !stage.$(this.getHeadNode().nodeId)) {
            var parentNode = stage.$(node.parentNodeId);
            var headNode = this.getHeadNode();
            if (stage.isNodeObj(parentNode)) {
                var this_index = node.index;
                _.each(parentNode.childNodeIds,function(val){
                    var x_node = stage.$(val);
                    if (x_node.index >= this_index) {
                        x_node.index++;
                    }
                });
                headNode.index = this_index;
                headNode.parentNodeId = parentNode.nodeId;
                pushInAllNodes();
                parentNode.childNodeIds.push(headNode.nodeId);
            } else {
                return false;
            }
        }
        function pushInAllNodes () {
            _.each(me.nodeListNodeIds,function(val){
                stage.allNodes[val] = me[val];
                stage.allNodes.nodeListNodeIds.push(val);
                stage.allNodes.length = stage.allNodes.nodeListNodeIds.length;
            });
        }
    };
    nodeList.prototype.insertAfter = function (arg) {
        var me = this;
        if (me.length == 0) {
            return false;
        }
        var stage = me[me.nodeListNodeIds[0]].stage;
        if (!arg) {
            //没有传参
            var node = undefined;
        } else if (!isNaN(arg)) {
            //参数为nodeId
            var node = stage.$(arg);

        } else if (typeof(arg) == "object") {
            //参数为nodeObj
            var node = arg;
        } else {
            var node = false;
        }
        if (node == undefined && stage.headNodeId == -1) {
            stage.headNodeId = this.getHeadNode().nodeId;
            this.getHeadNode().index = 0;
            pushInAllNodes();
        } else if (stage.isNodeObj(node) && !stage.$(this.getHeadNode().nodeId)) {
            var parentNode = stage.$(node.parentNodeId);
            var headNode = this.getHeadNode();
            if (stage.isNodeObj(parentNode)) {
                var this_index = node.index + 1;
                _.each(parentNode.childNodeIds,function(val){
                    var x_node = stage.$(val);
                    if (x_node.index >= this_index) {
                        x_node.index++;
                    }
                });
                headNode.index = this_index;
                headNode.parentNodeId = parentNode.nodeId;
                pushInAllNodes();
                parentNode.childNodeIds.push(headNode.nodeId);
            } else {
                return false;
            }
        }
        function pushInAllNodes () {
            _.each(me.nodeListNodeIds,function(val){
                stage.allNodes[val] = me[val];
                stage.allNodes.nodeListNodeIds.push(val);
                stage.allNodes.length = stage.allNodes.nodeListNodeIds.length;
            });
        }
    };
    window.stage = stage;
    window.nodeObj = nodeObj;
}());
/****************************以上为stage.js核心功能代码*****************************/
/****************************以下为stage.js扩展功能代码*****************************/
nodeObj.prototype.css = function(attr, value) {
    var thisNode = this;
    if(arguments.length == 1) {
        if (typeof(attr) == "string") {
            if(thisNode.style[attr] != undefined) {
                return thisNode.style[attr]; 
            }else {
                thisNode.stage.console("该CSS属性不存在！");
            }
        } else if (typeof(attr) == "object") {
            for (var x in attr) {
                thisNode.style[x] = attr[x];
            }
            return thisNode;
        } else {
            thisNode.stage.console("传入的参数不正确");
            return false;
        }
    } else if(arguments.length == 2){
        thisNode.style[attr] = value;
        return thisNode;
    } else {
        thisNode.stage.console("传入的参数个数应为1个或2个");
        return false;
    }
};
nodeObj.prototype.attr = function(attrName, attrValue) {
    var thisNode = this;
    if(arguments.length == 1) {
        if(typeof(attrName) == "string") {
            if(thisNode.attributes[attrName] != undefined) {
                return thisNode.attributes[attrName]; 
            }else {
                thisNode.stage.console("该属性不存在！");
            }
        }else if (typeof(attrName) == "object") {
            for (var x in attrName) {
                thisNode.attributes[x] = attrName[x];
            }
            return thisNode;
        } else {
            thisNode.stage.console("传入的参数不正确");
            return false;
        }
    } else if(arguments.length == 2){
        thisNode.attributes[attrName] = attrValue;
        return thisNode;
    } else {
        thisNode.stage.console("传入的参数个数应为1个或2个");
        return false;
    }
};
nodeObj.prototype.addClass = function(classname) {
    if(!this.hasClass(classname)) {
        var classList = this.className.split(" ");
        classList.push(classname);
        this.className = classList.join(" ");
        return this;
    } else {
        this.stage.console('此class已存在！');
        return false;
    }
};
nodeObj.prototype.removeClass = function(classname) {
    if(this.hasClass(classname)) {
        var classList = this.className.split(" ");
        classList = _.without(classList,classname);
        this.className = classList.join(" ");
        return this;
    } else {
        this.stage.console('找不到此class');
        return false;
    }
};
nodeObj.prototype.toggleClass = function(classname) {
    if(this.hasClass(classname)) {
        this.removeClass(classname);
    } else {
        this.addClass(classname);
    }
};
nodeObj.prototype.hasClass = function(classname) {
    var thisNode = this;
    var classList = this.className.split(" ");
    if(typeof(classname) == "string"){
        if (classname.match(new RegExp('^[a-zA-Z_&-]+[\\w&-]*$'))) {
            for(var i = 0; i < classList.length; i++) {
                if(classList[i] == classname) {
                    return true;
                }
            }
            return false;
        } else {
            thisNode.stage.console("传入的参数不正确");
            return false;
        }
    } else {
        thisNode.stage.console("传入的参数必须为一个字符串");
        return false;
    }
};
nodeObj.prototype.update = function (domArr) {
    this.clear();
    for (var i = 0; i < domArr.length; i++) {
        var nodeList = this.stage.domTreeToStageTree(domArr[i], this.groupName);
        this.append(nodeList);
    }
};
stage.prototype.domTreeToStageTree = function (dom,groupName) {
    if(!groupName){return false;}
    var nodeArr = [];
    var topNodeId = this.currentNodeId;
    var currentNodeId = topNodeId;
    var stage = this;
    domToNodeObj(dom);
    return stage.translateIntoNodeList(nodeArr);
    function domToNodeObj (dom,parentNode) {
        if (dom.nodeType == 3) {
            var tagName = "text";
        } else if (dom.nodeType == 8) {
            var tagName = "comment";
        } else {
            var tagName = dom.tagName;
        }
        var newNode = stage.createNode({
            tagName: tagName,
            groupName: groupName,
            isGroupHead: currentNodeId==topNodeId,
            groupHeadNodeId: 0
        })
        if (dom.nodeType==1) {
            newNode.id = dom.id;
            newNode.className = dom.className;
            for (var i = 0; i < dom.style.length; i++) {
                var cssName = dom.style[i];
                if (cssName == "background-image") {
                    var backgroundString = dom.style[cssName];
                    backgroundString += !!dom.style['background-color']?' '+dom.style['background-color']:'';
                    backgroundString += !!dom.style['background-size']?' '+dom.style['background-size']:'';
                    //backgroundString += !!dom.style['background-attachment']?' '+dom.style['background-attachment']:'';
                    //backgroundString += !!dom.style['background-clip']?' '+dom.style['background-clip']:'';
                    backgroundString += !!dom.style['background-origin']?' '+dom.style['background-origin']:'';
                    backgroundString += !!dom.style['background-repeat-x']?' '+dom.style['background-repeat-x']:'';
                    backgroundString += !!dom.style['background-repeat-y']?' '+dom.style['background-repeat-y']:'';
                    backgroundString += !!dom.style['background-position-x']?' '+dom.style['background-position-x']:'';
                    backgroundString += !!dom.style['background-position-y']?' '+dom.style['background-position-y']:'';
                    newNode.style['background'] = backgroundString;
                } else {
                    newNode.style[cssName] = dom.style[cssName];
                }
            }
            for (var i = 0; i < dom.attributes.length; i++) {
                var attrName = dom.attributes[i].nodeName;
                var attrValue= dom.attributes[i].nodeValue;
                if (attrName != "id" && attrName != "class" && attrName != "style") {
                    newNode.attributes[attrName] = attrValue;
                }
            }
            for (var i = 0; i < stage.supportedEventList.length; i++) {
                if (!!dom[stage.supportedEventList[i]]) {
                    newNode["eventList"][stage.supportedEventList[i]] = dom[stage.supportedEventList[i]];
                }
            }
        } else {
            newNode.textContent = dom.textContent;
        }
        if (!!parentNode) {
            newNode.index = parentNode.childNodeIds.length;
            newNode.parentNodeId = parentNode.nodeId;
            parentNode.childNodeIds.push(newNode.nodeId);
        } else {
            newNode.index = 0;
            newNode.parentNodeId = -1;
        }
        nodeArr.push(newNode);
        if (newNode.attributes["no-render"]!=undefined) {
            newNode.innerHTML = dom.innerHTML;
        } else {
            for (var i = 0; i < dom.childNodes.length; i++) {
                if (dom.childNodes[i].nodeType == 1 || ((dom.childNodes[i].nodeType == 3 || dom.childNodes[i].nodeType == 8) && dom.childNodes[i].textContent.replace(/\s/g,'')!='')) {
                    domToNodeObj(dom.childNodes[i],newNode);
                }
            }
        }
    }
};
stage.prototype.stageTreeToDomTree = function (nodeList) {
    for(var i = 0; i < nodeList.nodeListNodeIds.length; i++){
        if(nodeList[nodeList.nodeListNodeIds[i]] !=null && nodeList[nodeList.nodeListNodeIds[i]].parentNodeId == -1){
            nodeObjToDom(nodeList[nodeList.nodeListNodeIds[i]])
        }
    };
    var headDom;
    function nodeObjToDom(nodeObj,parentDom) {
        if (nodeObj.tagName == "text") {
            var textContent = nodeObj.textContent == undefined ? "":nodeObj.textContent;
            var newDom = document.createTextNode(textContent);
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            }
        } else if (nodeObj.tagName == "comment") {
            var newDom = document.createComment(nodeObj.textContent);
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            }
        } else {
            var newDom = document.createElement(nodeObj.tagName);
            if (!!nodeObj.id) {
                newDom.setAttribute("id", nodeObj.id);
            }
            newDom.className = nodeObj.className;
            for (var x in nodeObj.style) {
                newDom.style[x] = nodeObj.style[x];
            }
            for (var x in nodeObj.attributes) {
                if (x === "title" && nodeObj.attributes[x] === "按住鼠标进行拖动，右键调整样式") {
                    continue;
                }
                var newAttr = document.createAttribute(x);
                newAttr.nodeValue = nodeObj.attributes[x];
                newDom.setAttributeNode(newAttr);
            }
            for (var x in nodeObj.eventList) {
                newDom[x] = nodeObj.eventList[x];
            }
            if (nodeObj.attributes["no-render"]!=undefined) {
                newDom.innerHTML = nodeObj.innerHTML == undefined ? "": nodeObj.innerHTML;
            }
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            } else {
                headDom = newDom;
            }
            for (var i = 0; i < nodeObj.childNodeIds.length; i++) {
                for (var j = 0; j < nodeObj.childNodeIds.length; j++) {
                    var thisChildNode;
                    for (var k = 0; k < nodeList.nodeListNodeIds.length; k ++) {
                        if (nodeList[nodeList.nodeListNodeIds[k]]!=null && nodeList.nodeListNodeIds[k] == nodeObj.childNodeIds[j]) {
                            thisChildNode = nodeList[nodeList.nodeListNodeIds[k]];
                        }
                    }
                    if (thisChildNode.index == i) {
                        nodeObjToDom(thisChildNode,newDom);
                    }
                }
            }
        }
    }
    return headDom;
};
stage.prototype.stageTreeToDomTreeEditor = function (nodeList) {
    for(var i = 0; i < nodeList.nodeListNodeIds.length; i++){
        if(nodeList[nodeList.nodeListNodeIds[i]] !=null && nodeList[nodeList.nodeListNodeIds[i]].parentNodeId == -1){
            nodeObjToDom(nodeList[nodeList.nodeListNodeIds[i]],nodeList.nodeListNodeIds[i])
        }
    };
    var headDom;
    function nodeObjToDom(nodeObj,parentDom) {
        var nodeObj = arguments[0];
        var index = arguments[1];
        var parentDom = arguments[2];
        if (nodeObj.tagName == "text") {
            var newDom = document.createTextNode("{{nodeList["+index+"].textContent}}");
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            }
        } else if (nodeObj.tagName == "comment") {
            var newDom = document.createComment(nodeObj.textContent);
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            }
        } else {
            var newDom = document.createElement(nodeObj.tagName);
            newDom.setAttribute("node-id",index);

            if (!!nodeObj.id) {
                newDom.setAttribute("id","{{nodeList["+index+"].id}}");
            }
            //var classList="";
            //for (var i = 0; i < nodeObj.classList.length; i++) {
            //    classList+=" {{nodeList["+index+"].classList["+i+"]}}";
            //    // newDom.classList.add("{{nodeList["+index+"].className["+i+"]}}");
            //}
            //新版
            newDom.className = "{{nodeList["+index+"].className}}";
            //绑定style
            var styleList=" ";
            for (var x in nodeObj.style) {
                styleList+=x+":{{nodeList["+index+"].style['"+x+"']}};"
            }
            var newAttr1=document.createAttribute("style");
            newAttr1.nodeValue=styleList;
            newDom.setAttributeNode(newAttr1);

            for (var x in nodeObj.attributes) {
                var newAttr = document.createAttribute(x);
                newAttr.nodeValue = nodeObj.attributes[x];
                newDom.setAttributeNode(newAttr);
            }
            for (var x in nodeObj.eventList) {
                newDom[x] = nodeObj.eventList[x];
            }
            if (nodeObj.attributes["no-render"] != undefined) {
                newDom.innerHTML = nodeObj.innerHTML;
            }
            if (!!parentDom) {
                parentDom.appendChild(newDom);
            } else {
                headDom = newDom;
            }
            for (var i = 0; i < nodeObj.childNodeIds.length; i++) {
                for (var j = 0; j < nodeObj.childNodeIds.length; j++) {
                    var thisChildNode;
                    for (var k = 0; k < nodeList.nodeListNodeIds.length; k ++) {
                        if (nodeList[nodeList.nodeListNodeIds[k]]!=null && nodeList.nodeListNodeIds[k] == nodeObj.childNodeIds[j]) {
                            thisChildNode = nodeList[nodeList.nodeListNodeIds[k]];
                        }
                    }
                    if (thisChildNode.index == i) {
                        nodeObjToDom(thisChildNode,thisChildNode.nodeId,newDom);
                    }
                }
            }
        }
    }
    return headDom;
};      
stage.prototype.stageTreeToJson = function (nodeList) {
    var nodeArr = [];
    for (var i = 0; i < nodeList.length; i++) {
        if(nodeList[nodeList.nodeListNodeIds[i]] != null){
            var obj = {};
            obj.nodeId = nodeList[nodeList.nodeListNodeIds[i]].nodeId;
            obj.id = nodeList[nodeList.nodeListNodeIds[i]].id;
            obj.tagName = nodeList[nodeList.nodeListNodeIds[i]].tagName;
            obj.classList = nodeList[nodeList.nodeListNodeIds[i]].classList;
            obj.className = nodeList[nodeList.nodeListNodeIds[i]].className;
            obj.style = nodeList[nodeList.nodeListNodeIds[i]].style;
            obj.attributes = nodeList[nodeList.nodeListNodeIds[i]].attributes;
            obj.eventList = nodeList[nodeList.nodeListNodeIds[i]].eventList;
            obj.groupName = nodeList[nodeList.nodeListNodeIds[i]].groupName;
            obj.isGroupHead = nodeList[nodeList.nodeListNodeIds[i]].isGroupHead;
            obj.groupHeadNodeId = nodeList[nodeList.nodeListNodeIds[i]].groupHeadNodeId;
            obj.parentNodeId = nodeList[nodeList.nodeListNodeIds[i]].parentNodeId;
            obj.childNodeIds = nodeList[nodeList.nodeListNodeIds[i]].childNodeIds;
            obj.index = nodeList[nodeList.nodeListNodeIds[i]].index;
            if (!!nodeList[nodeList.nodeListNodeIds[i]].textContent) {
                obj.textContent = nodeList[nodeList.nodeListNodeIds[i]].textContent;
            }
            if (!!nodeList[nodeList.nodeListNodeIds[i]].innerHTML) {
                obj.innerHTML = nodeList[nodeList.nodeListNodeIds[i]].innerHTML;
            }
            nodeArr.push(obj);
        }else{
            nodeArr.push(null);
        }
        
    }
    var json = {
        nodeObjs: nodeArr
    };
    return json;
};
stage.prototype.jsonToStageTree = function (json) {
    var nodeArr = [];
    for (var i = 0; i < json.nodeObjs.length; i++) {
        if(json.nodeObjs[i]==null){
            nodeArr.push(null);
        }else{
            var obj = json.nodeObjs[i];
            var newNode = this.createNode({
                id: obj.id,
                tagName: obj.tagName,
                groupName: obj.groupName,
                isGroupHead: obj.isGroupHead,
                groupHeadNodeId: obj.groupHeadNodeId
            })
            newNode.nodeId = obj.nodeId;
            newNode.parentNodeId = obj.parentNodeId;
            for (var j = 0; j < obj.childNodeIds.length; j++) {
                newNode.childNodeIds.push(obj.childNodeIds[j]);
            }
            newNode.index = obj.index;
            if (newNode.tagName != "text" && newNode.tagName != "comment") {
                newNode.className = obj.className;
                //重复class
                //for (var j = 0; j < obj.classList.length; j++) {
                //    newNode.classList.push(obj.classList[j]);
                //}
                for (var j in obj.style) {
                    // var cssName = obj.style[j];
                    newNode.style[j] = obj.style[j];
                }
                for (var j in obj.attributes) {
                    var attrName = j;
                    var attrValue= obj.attributes[j];
                    if (attrName != "id" && attrName != "class" && attrName != "style") {
                        newNode.attributes[attrName] = attrValue;
                    }
                }
                for (var j = 0; j < this.supportedEventList.length; j++) {
                    if (!!obj[this.supportedEventList[j]]) {
                        newNode["eventList"][this.supportedEventList[j]] = obj[this.supportedEventList[j]];
                    }
                }
            } else {
                newNode.textContent = obj.textContent;
            }

            if (newNode.attributes["no-render"] !=undefined) {
                newNode.innerHTML = obj.innerHTML;
            }
            nodeArr.push(newNode);
        }
        
    }
    return this.translateIntoNodeList(nodeArr);
};
//当保存时重新排列nodeList
stage.prototype.resetNode=function(){
    //console.log(this.allNodes)
    //var myAllNodes = {};
    //myAllNodes.nodeListNodeIds = [];
    //var me = this;
    //var index = 0;
    //for (var i = 0;i<this.allNodes.length;i++){
    //    if(this.allNodes[this.allNodes.nodeListNodeIds[i]].parentNodeId==-1){
    //        pushNewNodes(this.allNodes[this.allNodes.nodeListNodeIds[i]])
    //    }
    //}
    ////去除不需要的node
    //function pushNewNodes(oldNode){
    //    var node = oldNode;
    //    var myNodeId = node.nodeId;
    //    // node.nodeId = index;
    //    // for(var i = 0;i<node.childNodeIds.length;i++){
    //    //     node.childNodeIds[i] = node.childNodeIds[i]-(myNodeId-index);
    //    // }
    //    index++;
    //    myAllNodes[myNodeId] = node;
    //    myAllNodes.nodeListNodeIds.push(myNodeId);
    //    for (var i = 0 ;i<node.childNodeIds.length;i++){
    //        pushNewNodes(me.allNodes[node.childNodeIds[i]])
    //    }
    //}
    //myAllNodes.length = index;
    //console.log(myAllNodes)
    return this.allNodes;
}