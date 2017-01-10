var domain = 'http://www.ppmoney.com/';
var vipurl = "http://vip.ppmoney.com/";

var ProductUrl = vipurl + 'Mall/ProductDetail/';
var double11 = {};
var now = new Date();
double11.init = function(){
    //测试用
    // $('#unlogin a').eq(0).attr('href', domain + 'login?returnurl=http://cnt.ppmoney.com/special/2015/11/double11.html')
    // .siblings('a').attr('href', domain + 'register/');
    // $('#enlogin a, .get-more a').attr('href', domain + 'touzilicai/');
    if (now - new Date("2015/11/09 00:00:00") < 0) {
        $("#daily10").find(".status-t").html("即将开始");
        $("#daily16").find(".status-t").html("即将开始");
    }else if(now - new Date("2015/11/11 00:00:00") > 0){
        $("#daily10").find(".status-t").html("活动已结束");
        $("#daily16").find(".status-t").html("活动已结束");
    }else{
        //10点抢券
        beginRush("#daily10", 55);
        //16点抢券
        beginRush("#daily16", 56);
    }
    

    if (now - new Date("2015/11/11 00:00:00") < 0 || now - new Date("2015/11/12 00:00:00") > 0) {
        var mallBtnInfo = getBtnInfo(ProductList, now);
        var mallTpl = new Template(document.getElementById("mall-tpl").innerHTML);
        document.getElementById("mall-list").innerHTML = mallTpl.apply({ items: ProductList, btn: mallBtnInfo, url: false});
    } else {
        //获取积分商城列表的JSONP
        fn_prolistdata();
    }
    
    //获取任务完成情况的JSONP
    fn_missiondata();
    //投资送礼模板
    var giftsTpl = new Template(document.getElementById("gifts-tpl").innerHTML);
    document.getElementById("gifts-list").innerHTML = giftsTpl.apply({ gifts: gifts});

    var getMoreHtml = '<div class="get-more">' +
                        '<a href="http://www.ppmoney.com/touzilicai/" target="_blank" >' +
                            '<span class="more-cont">想要获得更多礼品？继续去投资吧~</span>' +
                            '<span class="btn ">去投资' +
                                '<span class="btn-mask"></span>' +
                            '</span>' +
                        '</a>' +
                    '</div>';
    $("#gifts-list").append(getMoreHtml);

    $(window).resize(function(event) {
    	if ($(window).width() < 1500)
    		$("#my-nav").hide();
    	else
    		$("#my-nav").show();
    });
    

    
};

var gifts = [{
        className: 'gift1',
        title: '200积分',
        info: '5,000'
    },{
        className: 'gift2',
        title: '3000体验金',
        info: '10,000'
    },{
        className: 'gift3',
        title: '20元现金券',
        info: '30,000'
    },{
        className: 'gift4',
        title: '2300积分',
        info: '50,000'
    },{
        className: 'gift5',
        title: '靠枕',
        info: '100,000'
    },{
        className: 'gift6',
        title: '空调毯',
        info: '200,000'
    },{
        className: 'gift7',
        title: '加湿器',
        info: '300,000'
    },{
        className: 'gift8',
        title: '100元京东E卡',
        info: '400,000'
    },{
        className: 'gift9',
        title: '酸奶机',
        info: '600,000'
    },{
        className: 'gift10',
        title: '足浴盆',
        info: '800,000'
    },{
        className: 'gift11',
        title: '200元京东E卡',
        info: '1,000,000'
    },{
        className: 'gift12',
        title: '拍立得',
        info: '1,500,000'
    },{
        className: 'gift13',
        title: '小狗除螨仪',
        info: '2,000,000'
    },{
        className: 'gift14',
        title: '智能扫地机',
        info: '2,500,000'
    },{
        className: 'gift15',
        title: '卡西欧数码相机',
        info: '3,000,000'
    },{
        className: 'gift16',
        title: 'iPad mini 4 64G',
        info: '4,000,000'
    },{
        className: 'gift17',
        title: 'iPhone 6s 64G（玫瑰金）',
        info: '5,000,000'
    }
];

var ProductList = [{
        Id: '',
        Name: '《电商那些事儿》书籍',
        SalePrice: '1990',
        MarketPrice: '7960',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images1.jpg'
    },{
        Id: '',
        Name: '《互联网金融平台投资理财》书籍',
        SalePrice: '2450',
        MarketPrice: '9800',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images2.jpg'
    },{
        Id: '',
        Name: '小P“约吗”笔记本',
        SalePrice: '2000',
        MarketPrice: '8000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images3.jpg'
    },{
        Id: '',
        Name: '小P珍藏版U盘',
        SalePrice: '6000',
        MarketPrice: '24000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images4.jpg'
    },{
        Id: '',
        Name: '18000元体验金',
        SalePrice: '2000',
        MarketPrice: '5000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images8.jpg'
    },{
        Id: '',
        Name: '3500元体验金',
        SalePrice: '400',
        MarketPrice: '1000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images7.jpg'
    },{
        Id: '',
        Name: '0.5%加息券',
        SalePrice: '1250',
        MarketPrice: '5000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images9.jpg'
    },{
        Id: '',
        Name: '1%加息券',
        SalePrice: '2500',
        MarketPrice: '10000',
        Stock: 10,
        ImageUrl: 'img/double11/productlist/images10.jpg'
    }];

function beginRush(ele, activityId){
    var $rush = $(ele);
    var daily_data = ["5元现金券", "10元现金券", "20元现金券", "30元现金券", "50元现金券", "100元现金券","0.3%加息券","0.5%加息券","1%加息券"];
    var id = 0; var count = 0; var temp = 0; var di = 0;
    var ing_c = $(".ing-c",ele);
    var html = "";
    // var activityDay = "2015-09-17";
    //if (day == activityDay && hour < 11) {
    //    activityId = 47;//0917 9:30 抢券
    //} else if (day == activityDay && hour >= 11) {
    //    activityId = 48;//0917 12：30抢券
    //} else {
    //    activityId = 51;// 平时抢券
    //}

    $(".d-status-default",ele).on("click", function () {
        $(this).find(".status-t").hide();
        $(".d-status-ing").show();
        for (var i = 0; i < daily_data.length - 1; i++) {
            html += '<div class="status-t d-status-ing">' + daily_data[i] + '</div>';
        }
        ing_c.html(html);
        id = setInterval(status_ing, 20);

        function status_ing() {//开始抽奖
            count++;
            di -= 10;
            ing_c.css("margin-top", di);
            if (parseInt(ing_c.css("margin-top")) + 40 < 0) {
                ing_c.children().eq(0).appendTo(ing_c);
                ing_c.css("margin-top", 0);
                di = 0;
            }
        }
        $.ajax({
            url: domain + '/LotteryCenter/Lottery?activityId=' + activityId,
            type: 'get',
            dataType: 'jsonp',
            success: function (result) {
                if (result.State == 0) {
                    $rush.html("<div class='d-status d-status-ing'>已经抢完了</div>").addClass("info");;
                    clearInterval(id);
                    return;
                }
                if (result.State == 2) {
                    $rush.html("<div class='d-status d-status-ing'>你已经抢过啦~</div>").addClass("info");;
                    clearInterval(id);
                    return;
                }
                if (result.State == 3) {
                    $rush.html("<div class='d-status d-status-ing'><a target='_blank' href='"+ domain +"/login?returnurl=http://cnt.ppmoney.com/special/2015/11/double11.html'>立即登录</a>|<a target='_blank' href='"+ domain +"/register'>免费注册</a></div>").addClass("em");
                    clearInterval(id);
                    return;
                }
                if (result.State == 4) {
                    $rush.html("<div class='d-status d-status-ing'>活动未开始</div>").addClass("info");;
                    clearInterval(id);
                    return;
                }
                if (result.State == 5) {
                    $rush.html("<div class='d-status d-status-ing'>请求频繁，请休息2分钟</div>").addClass("info");;
                    clearInterval(id);
                    return;
                }

                if (result.State == 6) {
                    $rush.html("<div class='d-status d-status-ing'>本场次已结束</div>").addClass("info");;
                    clearInterval(id);
                    return;
                }

                if (result.State == 8) {
                    $rush.html("<div class='d-status d-status-ing'><a href='"+ domain +"/customer/partner?open_from=floating_window' target='_blank'>立即开通PP合伙人</a></div>").addClass("em");
                    clearInterval(id);
                    return;
                }

                // 停止滚动
                setTimeout(function () {
                    switch (result.State) {
                        case 1: $rush.html("<div class='d-status d-status-ing'>恭喜，您抽中" + result.Tis + "</div>");
                            break;
                        default:
                            $rush.html("<div class='d-status d-status-ing'>本场次已抢完</div>").addClass("info");
                            break;
                    }
                    ing_c.hide();
                    clearInterval(id);
                }, 2500);
            },
            // 抢理财基金异常处理
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // 停止滚动
                setTimeout(function () {
                    $rush.html("<div class='d-status d-status-ing'>本场次已抢完</div>").addClass("info");
                    ing_c.hide();
                    clearInterval(id);
                }, 500);
            }
        })
    });
}

//获取积分商城列表的JSONP
var fn_prolistdata = function() {
    $.ajax({
        type: 'get',
        cache: false,
        url: vipurl + 'Data/ProductListJsonp',
        data: {
            page: 1,
            pageSize: 8
        },
        dataType: 'jsonp',
        jsonpCallback: 'OnGetProductListByjsonp'
    });
};

function OnGetProductListByjsonp(data) {
    //没有商品
    if (data.ProductList.length <= 0) {
        return;
    }
    else {
        var mallBtnInfo = getBtnInfo(data.ProductList, now);
        var mallTpl = new Template(document.getElementById("mall-tpl").innerHTML);
        document.getElementById("mall-list").innerHTML = mallTpl.apply({ items: data.ProductList, btn: mallBtnInfo, url: ProductUrl});
    }
}

//根据日期确定积分商城商品默认的btn状态
var getBtnInfo =  function (items, time) {
    var now = time || new Date();

    if (now - new Date("2015/11/11 00:00:00") < 0) {
        return {
            type: 'btn-disable',
            text: '即将开始'
        }
    }
    if (now - new Date("2015/11/12 00:00:00") > 0) {
        return {
            type: 'btn-disable',
            text: '活动已结束'
        }
    }
    return {
        type: '',
        text: '立即兑换'
    }
}

//获取任务完成情况的JSONP
var fn_missiondata = function () {
    $.ajax({
        type: 'get',
        cache: false,
        url: domain + 'ActivityCenter/GetMissionCalculator',
        data: {
            missionId: '494bc2f4-c9a8-4742-9089-3559520ab8c1'
        },
        dataType: 'jsonp',
        jsonpCallback: 'OnGetMissionCalculatorByjsonp'
    });
};

function OnGetMissionCalculatorByjsonp(data) {
    if (data < 0) {
        //未登录
        return;
    }

    var $enlogin = $('#enlogin');
    var $giftsItem = $("#gifts-list li .unget-gift");

    $enlogin.show().siblings("#unlogin").hide();
    for (var i = 0; i < gifts.length; i++) {
        if (data < gifts[i].info.replace(/,/g, '')) {
            break;
        }
        $giftsItem.eq(i).addClass('get-gift');
    }
    if (i == gifts.length) {
        $enlogin.find('[data-total]').html(formatCurrency(data)).end().find('.gap').hide();
        return;
    }
    //距下一级还相差的金额
    var insufficient =  gifts[i].info.replace(/,/g, '') - data;
    $enlogin.find('[data-total]').html(formatCurrency(data)).end().find('[data-insuficient]').html(formatCurrency(insufficient));
}