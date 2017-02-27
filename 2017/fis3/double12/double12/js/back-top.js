$(function(){
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

