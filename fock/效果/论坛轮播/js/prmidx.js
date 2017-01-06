
$(function(){
	$(".showDialog").click(function(e){		
		
		//$("html,body").animate({"scrollTop":"0px"},500);			
		//$(".mod-dialog-wrap").css({"top":top,"z-index":2});
		$("<span class='close-dialog' style='cursor:pointer'></span>").prependTo(".login");
		$(".login").prependTo(".mod-dialog-wrap");		
		$(".mod-dialog-wrap").show();
		$(".login .login-r img").attr("src","http://www.ppmoney.com/AuthCode/CreateSafeCodeForEgou1000?height=29&width=70&R="+Math.random());
		gray();
		
		$(".close-dialog").click(function(){
			$(".login").prependTo(".login-wrap");
			$(".mod-dialog-wrap").hide();
			grayHide();
		});
	});
	
	
	//弹出灰色浮层
	function gray() {
		$('#showGray').css({
			'width': $(document.body).width(),
			'height': $(document.body).height()
		}).show();
		$(window).resize(function() {
			if ($('#showGray').is(':visible')) {
				$('#showGray').css({
					'width': $(document.body).width(),
					'height': $(document.body).height()
				}).show();
			}
		});
	}
	//关闭灰色浮层
	function grayHide() {
		$('#showGray').fadeOut(100);
	}
	
	//回到顶部
	$(window).scroll(function(){
		if($(window).scrollTop()>200){
			$(".back").show();			
		}else{
			$(".back").hide();
		}
	});
	$(".back").click(function(){
		$("html,body").animate({"scrollTop":"0px"},1000);
	});		
	var phoneReg = new RegExp("^[1][3,4,5,8][0-9]{9}$");
	$("#loginForm .register").click(function(){		
		var phone = $("#loginForm .phone").val();
		var password = $("#loginForm .password").val();
		var surePW = $("#loginForm .surePW").val();
		var code = $("#loginForm .code").val();
		var warm = $("#loginForm .warm");
		
		if(phone == ""){
			warm.html("*请输入手机号");
		}else if(!(phone.length == 11 && phoneReg.test(phone))){
			warm.html("*手机号格式不对喔");
		}else if(password == ""){
			warm.html("*请输入密码");
		}else if(surePW == ""){
			warm.html("*请输入确认密码");
		}else if(code == ""){
			warm.html("*请输入验证码");
		}else if(password.length<6){
			warm.html("*密码长度小于6");
		}else if(password != surePW){
			warm.html("*密码不一致");
		}else{
			//验证码
			//验证成功
			$("#loginForm").submit();
		}
	});
	
	
	$(".login .login-r img").click(function(){
		$(this).attr("src","http://www.ppmoney.com/AuthCode/CreateSafeCodeForEgou1000?height=29&width=70&R="+Math.random());
	});		
	
	UtmRegStorage.set();
	UtmRegStorage.maskRegSrc();	
	
});