(function($, f) {
	function Carousel(){
		var me = this;
		me.o = {
			init: 0,
			content: [],
			delay: 3000,
			autoplay: true,
			pause: true,
			temp: '<li>'+
						'<p class="item-hd">{{user}}</p>'+
						'<p class="item-bd">{{content}}</p>'+
				  '</li>'
		};

		me.i = 0;
	}

	Carousel.prototype.init = function (ele, o) {
		var me = this;

		me.ele = ele;
		me.o = $.extend(me.o, o);
		me.o.delay = Math.max(me.o.delay, 1000);

		var o = me.o;

		//初始化模板
		me.temp(o.temp);
		var html = '';
		if (o.content.length) {
			$.each(o.content, function (i, item) {
				html += me.temp(item);
			});
			ele.find("ul").html(html);

			if (o.content.length > 2) {
				o.autoplay && setTimeout(function() {
					if (o.delay | 0) {
						me.play();

						if (o.pause) {
							ele.on('mouseover mouseout', function(e) {
								me.stop();
								e.type == 'mouseout' && me.play();
							});
						};
					};
				}, o.init | 0);
			}
			
		} else {
			html = '<p class="warm-tip">暂时还没有人发表看法哦</p>';
			ele.find("ul").html(html);
		}
	}

	Carousel.prototype.play = function () {
		var me = this;

		me.t = setInterval(function() {
			if (me.i === me.o.content.length)
				me.i = 0;
			me.to(me.i++);
		}, me.o.delay | 0);
	}

	Carousel.prototype.stop = function () {
		var me = this;
		me.t = clearInterval(me.t);
	}

	Carousel.prototype.to = function (i) {
		var me = this;
		var index = i;
		me.ele.find("li").eq(0).addClass('animated').end().eq(1).addClass('marginB');
		setTimeout(function () {
			var html = me.temp(me.o.content[index]);
			me.ele.find("ul").append(html).find('li').eq(0).remove();
		}, 750);

	}

	Carousel.prototype.temp = function (template) {
		var me = this;
		this.temp = function () {
			var data = arguments[0];
			return template.replace(/{{(\w*)}}/g, function (match, $1, pos, original) {
				return data[$1];
			});
		}
	}

	//  Create a jQuery plugin
	$.fn.carousel = function(o) {
		var len = this.length;

		return this.each(function(index) {
			var me = $(this),
				key = 'unslider' + (len > 1 ? '-' + ++index : ''),
				instance = (new Carousel).init(me, o);

			me.data(key, instance).data('key', key);
		});
	};
})(jQuery, false);
