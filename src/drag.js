ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Drag = ne.util.defineClass({
	init: function(options) {
		options = options || {};
		this.element = $('<div class="' + (options.className || 'guilde') + '"></div>');
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
	setMoveElement: function($el) {
		this.moveElement = $el;
	},
	setTargetElement: function($el) {
		this.targetElement = $el;
	},
	figureValidTarget: function() {
		var m = this.moveElement,
			t = this.targetElement;
		if (m[0] !== t[0]) {
			return true;
		} else {
			return false;
		}
	},
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
				return true;
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
});
