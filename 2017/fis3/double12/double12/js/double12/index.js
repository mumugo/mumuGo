var domain = "http://192.168.1.97:8032";
var double12 = {};
var $proBox = $("#pro-box");
var $turntableBtn = $("#turntable-btn");
var inTimerange;
double12.init = function() {

    //用于测试
    $('.get-new .btn-goInvest, .get-old .btn-goInvest').attr("href", domain + "/touzilicai");
    $('.get-new .btn-checkCoupons, .get-old .btn-checkCoupons').attr("href", domain + "/Coupon/MyCoupons");
    $('.customers a').attr("href", domain + "/touzilicai");

    //设置基准时间点；
    inTimerange = timeTrigger(new Date());

    //碎片
    getPrizeList();
    //绑定密令事件
    $("#submitSecret").click(function() {
        var tokenVal = $(this).siblings('input').val();
        getPrize(tokenVal);
    });
    //小p课堂
    $("#collecting-dropdown").find('[data-drop]').click(function() {
        $(this).addClass('hide').siblings('[data-drop]').removeClass('hide');
        $("#collecting-rule").toggleClass('show-total');
    })
    //
    $("#btn-wechat").click(function() {
        $("#dialog-wechat").show();
    });

    if (inTimerange("2015/12/09 00:00:00", "2015/12/17 00:00:00")) {
        //积分抽奖
        lotteryModule.init();
    }

    //高收益标
    proModule.init();

    //dialog关闭事件
    $('.dialog-close').click(function() {
        $(this).parents('.dialog-wrap').hide();
    });

    //判断是否到了领红包的时间
    checkRedPaper();

    //绑定领红包事件
    $('#btn-receive').click(function() {
        getRedPaper();
    });

    lazyLoad();
}

//碎片
var getPrizeList = function() {
    //未到时间点不能输入密令
    if (inTimerange("", "2015/12/16 10:00:00")) {
        $('#collecting-rule').find('.unlog').text("敬请期待！");
    } else if (inTimerange("2015/12/16 12:00:00")) {
        $('#collecting-rule').find('.unlog').text("活动已结束！");
    }

    $('#collecting-rule .collect3 input:eq(0)').keyup(function() {
        var _this = $(this);
        _this.val(limitInput(_this.val(), 4));
    });

    $.ajax({
        url: domain + '/ActivityCenter/GetPrizeList?idList=229,228,227,226,225,224,218,217',
        dataType: "jsonp",
        jsonp: "callback",
        success: function(data) {
            if (data.State !== 1) return;

            //已登录
            //碎片收集情况
            var $collectList = $('#collecting-box').find(".login .c-spi");
            for (var i = 0, len = data.Data.length; i < len; i++) {
                var index = data.Data[i].CardName.match(/^碎片(\d)$/)[1] - 1;
                $collectList.eq(index).addClass('collected');
            }

            //碎片显示
            $('#collecting-box').find('.unlog').hide().siblings('.login').show();
            //密令显示
            if (inTimerange("2015/12/16 10:00:00", "2015/12/16 12:00:00")) {
                $('#collecting-rule').find('.unlog').hide().siblings('.login').show();
            }

        }
    });
}

//密令
var getPrize = function(tokenVal) {
    //已经获得4号碎片，无需再请求密令
    if ($('#collecting-box').find(".login .c-spi").eq(3).hasClass('collected')) {
        $("#dialog-collect").show().find(".dialog-bd").addClass('got').removeClass('success fail').find('p').text("您已成功获得④号碎片，快加油集齐所有碎片抽大奖吧！");
        return;
    }

    //请求密令
    $.ajax({
        url: domain + '/ActivityCenter/GuessToken?token=' + tokenVal,
        dataType: "jsonp",
        jsonp: "callback",
        success: function(data) {
            var $dialogCollectBd = $("#dialog-collect").show().find(".dialog-bd");

            if (data.State === 1) {
                $dialogCollectBd.addClass('success').removeClass('got fail').find('p').text("");
                getPrizeList();
                return;
            }

            if (data.State === 2) {
                $("#dialog-collect").show().find(".dialog-bd").addClass('got').removeClass('success fail').find('p').text("您已成功获得④号碎片，快加油集齐所有碎片抽大奖吧！");
                return;
            }

            $dialogCollectBd.addClass('fail').removeClass('got success').find('p').text(data.Message);

        }
    });
}

//高收益标模块
var proModule = (function() {
    var day = "2015/12/12",
        times = ["00:30", "01:00", "02:00", "09:00", "12:12", "15:00", "17:00", "21:00", "22:00", "23:00"];
    for (var i = 0, len = times.length; i < len; i++) {
        times[i] = day + " " + times[i] + ":00";
    }

    var timeAxis = function(date) {
        date = (date) ? newDate(date) : new Date();
        var $moments = $("#time-axis").find(".moment-l span, .moment-r span");
        var axisInTimerange = timeTrigger(date);

        if (axisInTimerange("2015/12/12 12:12:00", "2015/12/12 15:00:00")) {
            $("#time-axis").find(".s-double12").show();
            $("#time-bullet").hide();
            $moments.removeClass('active');
            return;
        }

        for (var i = 0, len = $moments.length; i < len; i++) {
            var time = "2015/12/12 " + $moments.eq(i).text() + ":00",
                nextTime = (i+1 == len)? "" : ("2015/12/12 " + $moments.eq(i+1).text() + ":00");

            if (axisInTimerange(time, nextTime)) {
                $("#time-bullet").removeClass('b0').addClass('b'+i);
                $moments.removeClass('active').eq(i).addClass('active');
                break;
            }
        }
    }

    var indexOfTimes = function() {
        var inTimerange = timeTrigger(new Date());
        for (i = 0, l = times.length; i < l; i++) {
            if (inTimerange(times[i], times[i + 1])) {
                return i;
            }
        }
        return 0;
    }

    var getProjectStatus = function() {
        //活动尚未开始
        if (inTimerange("", "2015/12/12 00:00:00")) {
            return;
        }

        //活动已结束
        if (inTimerange("2015/12/13 00:00:00")) {
            $('.pro-grey-box').text("活动已结束！");
            return;
        }

        $.ajax({
            url: domain + "/project/GetPrjListByCouponTypeJsonp/1/1/8",
            dataType: "jsonp",
            // jsonpCallback: "projectCB",
            success: function(data) {
                // intervaler(data)();
                projectCB(data);
            },
            error: function(data) {
                alert("亲，加载出错了。");
            }
        });
    }

    // var getCurrentPro = function (list, index, norecurs) {
    //     var len = list.length;
    //     index = (typeof index === "undefined")? indexOfTimes() : index;

    //     while (len--) {
    //         if (new Date(list[len].beginTime).getTime() === new Date(times[index]).getTime()) {
    //             console.log(list);
    //             //标未融满
    //             if (list[len].progress < 100 || norecurs) {
    //                 return list[len];
    //             }
    //             //获取下一个标，并返回
    //             return getCurrentPro(list, index+1, true);
    //         }
    //     }

    //     //未找到符合条件的标
    //     if (index) {
    //         return getCurrentPro(list, index-1, true);
    //     }

    //     return false;
    // }

    // var intervaler = function (data) {
    //     var t;
    //     var index = 0;
    //     var wTime = 1200000;    //默认20分钟
    //     var timeout = function () {
    //         //清除上一次的timeout
    //         if (t) {
    //             clearTimeout(t);
    //         }
    //         //当前时间对应的times index
    //         var i = indexOfTimes();

    //         //设定下次执行的时间
    //         if (times[i+1]) {
    //             wTime =  Math.max(new Date(times[i+1]).getTime() - new Date().getTime(), 1000);
    //         }
    //         //执行
    //         if (i !== index) {
    //             index = i;
    //             projectCB(data);
    //         }
    //         // console.log(wTime);

    //         t = setTimeout(function() {
    //             timeout();
    //         }, wTime);
            
    //     };
    //     return timeout;
    // };

    var projectCB = function(data) {
        var d = data.Data[0];
        timeAxis(d.beginTime);
        // //无符合条件的标处理
        // if (!(data.Data && (d = getCurrentPro(data.Data)))) {
        //     return;
        // }

        var proTpl = new Template(document.getElementById("pro-tpl").innerHTML);
        document.getElementById("pro-box").innerHTML = proTpl.apply({
            d: d
        });
        $("#pro-box").show();
        $('.pro-grey-box').hide();

        var $proBtn = $("#pro-btn"),
            $proText = $("#pro-text");

        //该项目已结束
        if (d.progress < 100 && (newDate(d.endTime).getTime() - newDate(new Date().getTime()).getTime() < 0)) {
            $proBtn.addClass('btn-disable');
            $proText.text("该项目已结束");
            return;
        }
        //立即投资
        if (d.status == 1 && (newDate(d.beginTime).getTime() - newDate(new Date().getTime()).getTime() <= 0)) {
            return;
        }
        //已满额
        if (d.progress >= 100) {
            $proBtn.addClass('btn-disable');
            $proText.text("已满额");
            return;
        }
        //倒计时
        // status = '<a id="prj' + d.prjId + '" href="' + url + d.link + '" class="btn-countdown" target="_blank">倒计时</a>';
        if (newDate(d.beginTime).getTime() > newDate(new Date().getTime()).getTime()) {
            /**/
            new PPCountDown({
                from: new Date().getTime(),
                to: d.beginTime,
                refresh: function(elem, time) {
                    var minsecond = new Date(d.beginTime).getTime() - new Date().getTime();
                    //抢投
                    if (d.isReservationPrj && minsecond < 900 * 1000) {
                        $proText.html(time).css('margin-left', '-50px');
                        $proBtn.addClass('btn-grab');
                    } else {
                        $proText.html('倒计时' + time);
                    }
                },
                callback: function() {
                    $proText.html('立即抢投').css('margin-left', 'auto');
                    $proBtn.removeClass('btn-grab');
                }
            }).start();
        }
    };

    return {
        init: getProjectStatus
    }

})()


var timeTrigger = function(now) {
    return function(beforeDate, afterDate) {
        var before = (beforeDate === "") ? (now.getTime() - 1) : new Date(beforeDate).getTime(),
            after = (afterDate === "" || typeof afterDate === "undefined") ? (now.getTime() + 1) : new Date(afterDate).getTime();

        if (now.getTime() >= before && now.getTime() < after) {
            return true;
        }

        return false;
    }
}

//积分抽奖模块
var lotteryModule = (function() {
    var rewardItem = [{
        name: '1888元体验金',
        className: 'reward01',
        angle: 40
    }, {
        name: '爱马仕女士休闲真丝丝巾',
        className: 'reward02',
        angle: 80
    }, {
        name: '小米移动电源',
        className: 'reward03',
        angle: 120
    }, {
        name: '0.5%加息券',
        className: 'reward04',
        angle: 160
    }, {
        name: 'Dior 金色经典logo项链',
        className: 'reward05',
        angle: 200
    }, {
        name: 'iPhone 6s plus 64G',
        className: 'reward06',
        angle: 240
    }, {
        name: '1%加息券',
        className: 'reward07',
        angle: 280
    }, {
        name: '九号平衡车',
        className: 'reward08',
        angle: 320
    }, {
        name: 'GoPro',
        className: 'reward09',
        angle: 360
    }];

    var turntableRun = function() {
        var animating = false;
        return function() {
            if (animating) return;
            animating = true;

            $("#lotteryBg").rotate({
                angle: 0,
                duration: 2000,
                animateTo: 720, //angle是图片上各奖项对应的角度
                callback: function(data) {
                    //弹窗
                    if (data && data.State == 0) {
                        $("#dialog-lotery").show();
                    } else {
                        $("#dialog-collect").show();
                    }

                    animating = false;
                    getUserScore();
                }
            });
            var flag = false;
            var t = setTimeout(function() {
                $("#dialog-collect").find(".dialog-bd").removeClass('got success').addClass('fail').find('p').text("系统繁忙，请稍后重新抽奖！");
                $("#lotteryBg").setReady(0, {State: 1});
                flag = true;
            }, 4000);

            // ajax lottery
            $.ajax({
                url: domain + '/LotteryCenter/ScoreLottery',
                data: {
                   activitykey: '2015double12'
                },
                dataType: "jsonp",
                jsonp: "callback",
                success: function(data) {
                    clearTimeout(t);
                    //success
                    if (flag === true) {
                        flag = false;
                        return;
                    }
                    if (data.State == 0) {
                        for (var i = 0, len = rewardItem.length; i < len; i++) {
                            if (rewardItem[i].name == data.Tis) {
                                $("#dialog-lotery").find("[data-name]").text(rewardItem[i].name).end().find(".dialog-bottom").removeClass().addClass(rewardItem[i].className + " dialog-bottom");
                                $("#lotteryBg").setReady(rewardItem[i].angle, data);
                                return;
                            }
                        }
                    } else {
                        //error
                        $("#dialog-collect").find(".dialog-bd").addClass('fail').find('p').text(data.Tis);
                        $("#lotteryBg").setReady(0, data);
                    }

                },
                error: function(data) {
                    $("#dialog-collect").find(".dialog-bd").addClass('fail').find('p').text("服务器连接异常，请重新抽奖！");
                    $("#lotteryBg").setReady(0, data);
                }
            });

        }
    }

    var getUserScore = function() {
        $.ajax({
            url: domain + '/LotteryCenter/UserScore',
            dataType: "jsonp",
            success: function(data) {

                if (data.State == 0) {
                    var times = Math.floor(data.Score / 1000);
                    $("#credit").text(data.Score);
                    $("#lottery-time").text(times);
                    if (times === 0) {
                        //未有抽奖机会
                        $turntableBtn.find('.nochance').show().siblings().hide();
                        $("#lotteryR").addClass('nochance');
                        $(".thi").addClass('login-bg');
                        return;
                    }

                    if (times >= 1) {
                        //有抽奖机会
                        $turntableBtn.find('.havechance').show().siblings().hide();
                        $("#lotteryR").addClass('havechance');
                        $(".thi").addClass('login-bg');
                        return;
                    }
                    return;
                }

                // if (data.State == 3) {
                //     //未登录
                //     $turntableBtn.find('.unlog').css("display", "block").siblings().hide();
                //     return;
                // }

            }
        });

    }

    return {
        init: function() {
            //未登录
            $turntableBtn.find('.unlog').css("display", "block").siblings().hide();

            //幸运九宫格绑定cilck事件
            $("#lottery-btn").bind('click', turntableRun());
            //判断幸运九宫格剩余次数
            getUserScore();
        }
    }
})();

var checkRedPaper = function() {
    //活动尚未开始
    if (inTimerange("", "2015/12/09 00:00:00")) {
        $('#btn-invalid').html('敬请期待<span class="btn-mask"></span>').show().siblings().hide();
        return;
    }

    //活动已结束
    if (inTimerange("2015/12/17 00:00:00")) {
        $('#btn-invalid').html('活动已结束<span class="btn-mask"></span>').show().siblings().hide();
    }

    //活动期间
    if (inTimerange("2015/12/09 00:00:00", "2015/12/17 00:00:00")) {
        checkLogin();
    }
}

//判断是否登录
var checkLogin = function() {
    window.fnLoginResult = function(data) {
        var _status = data.Status;
        if (data.State !== 1) {
            login_url = domain + "/login?returnurl=" + window.location.href;
            register_url = domain + "/register?returnurl=" + window.location.href
            // 尚未登录显示“登陆领取|注册领取”
            $('#btn-login').show().html('<a class="btn-loginurl" href="' + login_url + '">登录领取</a><a class="btn-regurl" href="' + register_url + '">注册领取</a>').siblings().hide();
        } else {
            //去领取
            $('#btn-receive').show().siblings().hide();
        }        
        }

    $.ajax({
        url: domain + "/ActivityCenter/GetPrizeList?idList=251,252,254,255,257,258,259,260",
        type: "get",
        dataType: "jsonp",
        jsonpCallback: "fnLoginResult"
            // error: function (XMLHttpRequest, textStatus, errorThrown) {  
            // }
        });
}

var getRedPaper = function() {
    // 测试数据
    // data = {"status":2,"IsNewUser":true};
            window.fnGetRedPaper = function(data) {
        if (data.Status == 1) {
            //领取成功
            if (data.isNewUser) {
                $('.get-old').hide();
                $('.get-redPacket').show();
            } else {
                $('.get-new').hide();
                $('.get-redPacket').show();
            }
        } else if(data.Status == 2){
            $('#btn-receive').hide();
            $('#btn-invalid').html('已领取<span class="btn-mask"></span>').show();
        }else {
            // 获取活动信息失败或者活动名称不正确
            alert("加载出错了");
        }
    }
    $.ajax({
        url: domain + "/ActivityCenter/GetPrize",
        type: "get",
        dataType: "jsonp",
        data: {
            ActivityName: "2015Double12"
        },
        jsonpCallback: "fnGetRedPaper"
        // error: function (XMLHttpRequest, textStatus, errorThrown) {  
        // }
    });
}

//限制输入字符个数
var limitInput = function(val, num) {
    if (val.length > num) {
        return val.slice(0, num);
    }
    return val;
}

//背景图片延迟加载
var lazyLoad = function() {
    var lazys = $('.lazyele');
    $(window).on("scroll", function() {
        // setTimeout(function() {     
            for(var i = 0; i < lazys.length; i++) {
                if($(window).height() + $(document).scrollTop()-300 >= $(lazys[i]).offset().top){
                    $(lazys[i]).addClass('lazyload')
                }
            }
        // }, 300)      
    })
}
