
function xsgetdata(e) {

    $(".bid-list").empty(), null != e && void 0 != e && $.each(e.PackageList.Data, function(e, a) {
        var t = a,
            s = "",
            i = "",
            n = "",
            r = "",
            l = "",
            p = formatCurrency(t.monetary - t.investedMoney);
        var highProfit = false;
        if (t.profit > 25) {
            t.profit = "25.0";
            highProfit = true;
        }
        if (t.displayRewardRate > 0) {
            var s = '<span class="percentage">' +
                formatCurrency(t.profit - t.displayRewardRate, null, 1) +
                '<span class="sign">+' + formatCurrency(t.displayRewardRate, null, 1) + '%</span></span>';
        } else var s = '<span class="percentage">' + formatCurrency(t.profit, null, 1) + "</span>";
        i = newDate(t.endTime).getTime() - newDate((new Date).getTime()).getTime() < 0 && 0 == t.timeLimit ? "以协议为准" : t.isDayPrj ? t.timeLimit + "<small>天</small>" : t.timeLimit + "<small>月</small>", t.progress < 100 && newDate(t.endTime).getTime() - newDate((new Date).getTime()).getTime() < 0 ? n = '<a href="' + url + t.link + '" class="btn-invalid" target="_blank">该项目已结束</a>' : 1 == t.status && newDate(t.beginTime).getTime() - newDate((new Date).getTime()).getTime() <= 0 ? n = '<a href="' + url + t.link + '" class="btn-invest" target="_blank">立即投资</a>' : t.progress >= 100 ? (n = '<a href="' + url + t.link + '" class="btn-invalid" target="_blank">已满额</a>', p = "") : n = t.isReservationPrj ? '<a id="prj' + t.prjId + '" class="btn-invest" href="' + url + t.link +'"></a>' : '<a id="prj' + t.prjId + '" href="' + url + t.link + '" class="btn-invest" target="_blank">倒计时</a>', l = t.monetary >= 1e4 ? formatCurrency(t.monetary / 1e4) + "<small>万元</small>" : formatCurrency(t.monetary) + "<small>元</small>";
        var r = '<li><div class="question"><p>投资送体验金</p></div><div class="bid-rate"><div class="main">' + s + '</div><p class="side-btm">%' + ((highProfit) ? '+' : '') + '</p><p class="side-top">年化</p></div><p class="bid-time">项目期限：<span>' + i + '</span></p>' + '<div class="bid-list-bd"><h3 class="bid-type">' + t.type + '</h3><p><span>' + t.monetaryLimit + '</span>元起投金额，每人限投<span>' + t.SingleInvestmentAmount + '</span>元</p>' + n + '</div><div class="bid-tips"><p>在活动期间注册用户可享受<span class="yellow">首次投资≥1万元即送等额体验金</span>活动，投多少送多少</p></div></li>';
        $(".bid-list").append(r), newDate(t.beginTime).getTime() > newDate((new Date).getTime()).getTime() && new PPCountDown({
            from: (new Date).getTime(),
            to: t.beginTime,
            refresh: function(e, a) {
                $("#prj" + t.prjId).html("倒计时 " + a)
            },
            callback: function() {
                fn_xsgetData();
            }
        }).start()
    })
}
var domain = "http://192.168.1.97:8032",
    url = "http://www.ppmoney.com",
    init = function() {
        fn_xsgetData();
        $(".fir").delegate(".question", "mouseover mouseout", function(e) {
            if ("mouseover" == e.type) {
                var a = $(this).index(".question");
                $(".bid-tips").eq(a).show();
            } else "mouseout" == e.type && $(".bid-tips").hide()
        })

        //领取红包
        $('#btn-getRed').click(function() {
            getRedPaper(isLogin);
        });
    };
fn_xsgetData = function() {
    $.ajax({
        url: domain + "/project/prjlistjsonp/-1/1/3/all/true/true/xstyb",
        type: "get",
        dataType: "jsonp",
        jsonpCallback: "xsgetdata",
        error: function() {
            PPmoney.dialog.quickClose("亲，加载出错了。")
        }
    })
};

function getRedPaper(callback){
    $.ajax({
        url: domain+"/ActivityCenter/GetPrize",
        type: "get",
        dataType:"jsonp",
        data: {
            activityname:"2015Double12"
        },
        success: function(data) {
            callback(data);
        },
        // error: function (XMLHttpRequest, textStatus, errorThrown) {  
        // }
    });
}

function isLogin(data){
    if(data.Status == 0) {
        //未登录-->去注册
        location.href = domain + "/register?returnurl=" + window.location.href;
    } else {
        //已登录
        location.href = "http://192.168.100.112:8080/double12.html#sec";
    }
}
