ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Drag = ne.util.defineClass({
	init: function(options) {
		options = options || {};
		this.element = $(options.guideHTML || HTML.GUIDE);
		this.element.css('position', 'absolute');
		this.element.appendTo(document.body);
		this.element.hide();
	},
	/**
	 * show each dimmed layer
	 * @param {object} pos position to init guide element
	 **/
	ready: function(pos) {
		this.element.css({
			left: pos.x,
			top: pos.y
		});
		$('.' +  DIMMED_LAYER_CLASS).show();
		this.element.show();
	},
	/**
	 * hide each dimmed layer
	 **/
	finish: function() {
		$('.' +  DIMMED_LAYER_CLASS).hide();
		this.element.hide();
	},
	/**
	 * @param {object} pos position to move
	 **/
	moveTo: function(pos) {
		this.setPos(pos);
	},
	/**
	 * setPos for move
	 * @param {object} pos 
	 **/
	setPos: function(pos) {
		this.element.css({
			left: pos.x,	
			top: pos.y
		});
	},
	/**
	 * set guide content
	 * @param {string} content 
	 **/
	setContent: function(content) {
		this.element.html(content);
	},
	/**
	 * 
	 **/
	show: function() {
		if (!this.isDisable) {
			this.element.show();
		}
	},
	/**
	 * 
	 **/
	hide: function() {
		this.element.hide();
	},
	/**
	 * 
	 **/
	disable: function() {
		this.isDisable = true;
	},
	/**
	 * 
	 **/
	enable: function() {
		this.isDisable = false;
	},
	/**
	 * set move target
	 * @param {object} move element
	 **/
	setMoveElement: function($el) {
		this.moveElement = $el;
	},
	/**
	 * set target element 
	 * @param {object} target element
	 **/
	setTargetElement: function($el) {
		this.targetElement = $el;
	},
	/**
	 * check correct target
	 **/
	figureValidTarget: function() {
		var m = this.moveElement,
			t = this.targetElement;
		if (m[0] !== t[0]) {
			return true;
		} else {
			return false;
		}
	},
	/**
	 * check valid position
	 * @param {object} point 
	 **/
	figureValidArea: function(point) {
		var bound = this.targetElement[0].getBoundingClientRect(),
			left = (window.scrollX || $(window).scrollLeft()) + bound.left,
			top = (window.scrollY || $(window).scrollTop()) + bound.top,
			targetEl = this.targetElement,
			moveEl = this.moveElement,
			isTopArea = (targetEl[0] !== moveEl.next()[0] && point.y < top + 5);
			isBottomArea = (point.y > top + bound.height - 5 && targetEl[0] !== moveEl.prev()[0]);
		if (targetEl[0] !== moveEl[0] && (isTopArea || isBottomArea)) {
			if (point.y < top + 5) {
				this.part = 'top';
				return 'top';
			} else {
				this.part = 'bottom';
				return 'bottom';
			}
		} else {
			this.part = null;
			return false;
		}
	},
	/**
	 * get scoll left 
	 **/
	getScrollLeft: function() {
		return (window.scrollX || $(window).scrollLeft());
	},
	/**
	 * get scroll top 
	 **/
	getScrollTop: function() {
		return (window.scrollY || $(window).scrollTop());
	},
	/**
	 * check items in group
	 **/
	figureInterval: function(point, group) {
		var bound,
			result,
			top,
			bottom;

		if (!group || !group.list) {
			return;
		}

		ne.util.forEach(group.list, function(item) {
			bound = item.$element[0].getBoundingClientRect();
			next = item.$element.next()[0];

			if (!next) {
				return;
			}
			
			top = this.getScrollTop() + bound.top + bound.height,
			bottom = next.getBoundingClientRect().top;
			// check mached target
			if (point.y > top && point.y < bottom) {
				if (item.$element[0] !== this.targetElement[0] && item.$element[0] !== this.targetElement.prev()[0]) {
					result = item.$element;
					this.part = 'bottom';
				}
			}
		}, this);
		if (!result) {
			this.part = null;
		}
		return result;
	}
});
