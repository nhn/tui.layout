$(window).ready(function() {
	var element = $('#layout'),
	guide = $('<div class="copyobject"></div>'),
	temp = $('<div class="temp"></div>'),
	body = $(document);
	guide.css({
		width: 100 + 'px',
		height: 100 + 'px'
	});
	body.find('body').append(guide);
	movers = element.find('h1 button'),
	pos = {};
	movers.on('mousedown', function(e) {
		e.preventDefault();
		var target = $('.' + e.target.getAttribute('item-name'));
		target.addClass('disable');
		guide.css({
			position: 'absolute',
			left: e.clientX + (window.scrollX || $(window).scrollLeft()) + 10 + 'px',
			top: e.clientY + (window.scrollY || $(window).scrollTop()) + 10 + 'px',
			backgroundColor: '#eee'
		});
		guide.show();
		$('.item').find('.dimmed').show();
		pos.x = e.clientX + (window.scrollX || $(window).scrollLeft()) + 10;
		pos.y = e.clientY + (window.scrollY || $(window).scrollTop()) + 10;
		var parent = null,
		bound,
		left,
		top,
		groupClass;
		body.on('mousemove', function(e) {
			//그룹을 확인하기위해 dimmed의 부모를 체크한다
			parent = $(e.target).parent();
			if (!parent.attr('grp-name')) {
				return;
			}
			groupClass = '.' + parent.attr('grp-name');
			// 부모의 자식들의 위치와 마우스 위치를 확인한다. 
			bound = parent[0].getBoundingClientRect();
			left = (window.scrollX || $(window).scrollLeft()) + bound.left;
			top = (window.scrollY || $(window).scrollTop()) + bound.top;
			pointX = e.clientX + (window.scrollX || $(window).scrollLeft());
			pointY = e.clientY + (window.scrollY || $(window).scrollTop());
			// EXID title 판별하여 어디에 보더를 줄건지 결정
			if (parent[0] !== target[0] && ((parent[0] !== target.next()[0] && pointY < top + 5) || (pointY > top + bound.height - 5 && parent[0] !== target.prev()[0]))) {
				if (pointY < top + 5) {
					parent.before(temp);
					temp.show();
				} else {
					parent.after(temp);
					temp.show();
				}
			} else {
				temp.hide();
			}
			guide.css({
				left: pos.x + (e.clientX + (window.scrollX || $(window).scrollLeft())-pos.x) + 10 + 'px',
				top: pos.y + (e.clientY + (window.scrollY || $(window).scrollTop())-pos.y) + 10 + 'px'
			});
		});
		body.on('mouseup', function(e) {
			body.off('mousemove');
			body.off('mouseup');
			target.removeClass('disable');
			temp = $(groupClass).find('.temp');
			temp.hide();
			guide.hide();
			$('.item').find('.dimmed').hide();
		});
	});
});