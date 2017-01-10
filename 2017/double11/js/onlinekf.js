var toolBar = document.createElement('div');
toolBar.className = 'g-toolbar';
toolBar.innerHTML = '<ul class="g-toolbar-nav"><li class="toolbar-item"><div class="item-tip-c item-tip-weixin"><div class="item-box"><img src="http://cnt.ppmoney.com/v4.0/img/glob/weixin-code.jpg" alt="关注微信" width="105" height="105"><div class="item-tip">PPmoney理财平台</div></div></div><u class="u-spi u-043"></u></li><li class="toolbar-item"><div class="item-tip-c item-tip-app"><div class="item-box"><img src="http://cnt.ppmoney.com/v4.0/img/glob/app-code.jpg" alt="扫码下载APP" width="105" height="105"><div class="item-tip">扫码下载APP</div></div></div><u class="u-spi u-041"></u></li><li class="toolbar-item"><a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&amp;key=XzkzODAxNTc2NF8yMTUwMzFfNDAwNzE2MDA5OF8yXw" title="在线客服" target="_blank"><div class="item-tip-c item-tip-kefu"><div class="item-box"><div class="item-tip">在线客服<br>9:00~22:00</div></div></div><u class="u-spi u-042"></u></a></li><li id="back" class="toolbar-item"><div class="item-tip-c item-tip-back"><div class="item-box"><div class="item-tip">返回顶部</div></div></div><u class="u-spi u-025"></u></li></ul>';
document.body.appendChild(toolBar);
$(function(){
    //初始化时判断
    if($(window).scrollTop()>200){
        $("#back").show();          
    }

    //回到顶部
    $(window).scroll(function(){
        if($(window).scrollTop()>200){
            $("#back").show();          
        }else{
            $("#back").hide();
        }
    });
    $("#back").click(function(){
        $("html,body").animate({"scrollTop":"0px"},1000);
    });
});