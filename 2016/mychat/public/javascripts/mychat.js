
var Mychat = function() {
    this.socket = null;
}

Mychat.prototype.init = function() {
    
    $('#sendBtn').click(Mychat.sendMsg);
}

Mychat.prototype.sendMsg = function() {

}

$(function () {
    var status = $('#status');
});