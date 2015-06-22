ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Drag = ne.util.defineClass({
	init: function(options) {
		options = options || {};
		this.$elmeent = $(options.guideHTML || HTML.GUIDE);
		this.$elmeent.css('position', 'absolute');
		this.$elmeent.appendTo(document.body);
		this.$elmeent.hide();
	},
	/**
	 * show each dimmed layer
	 * @param {object} pos position to init guide element
	 **/
	ready: function(pos) {
		this.$elmeent.css({
			left: pos.x,
			top: pos.y
		});
		$('.' +  DIMMED_LAYER_CLASS).show();
		this.$elmeent.show();
	},
	/**
	 * hide each dimmed layer
	 **/
	finish: function() {
		$('.' +  DIMMED_LAYER_CLASS).hide();
		this.$elmeent.hide();
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
		this.$elmeent.css({
			left: pos.x,	
			top: pos.y
		});
	},
	/**
	 * set guide content
	 * @param {string} content 
	 **/
	setContent: function(content) {
		this.$elmeent.html(content);
	},
	/**
	 * 
	 **/
	show: function() {
		if (!this.isDisable) {
			this.$elmeent.show();
		}
	},
	/**
	 * 
	 **/
	hide: function() {
		this.$elmeent.hide();
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
		this.$moveElement = $el;
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
	}
});
