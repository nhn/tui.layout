/**
 * @fileoverview layout guide. to help watch move element.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Guide = ne.util.defineClass({
	/**
	 * initialize group
	 * @param {object} [options]
	 * 	@param {string} [options.guideHTML] guide elementHTML
	 */
	init: function(options) {
		options = options || {};
		this.$element = $(options.guideHTML || HTML.GUIDE);
		this.$element.css('position', 'absolute');
		this.$element.appendTo(document.body);
		this.$dimElements = $('.' +  DIMMED_LAYER_CLASS);
		this.hide();
	},
	
	/**
	 * show each dimmed layer
	 * @param {object} pos position to init guide element
	 * @param {jQuerObject} $element for helper
	 **/
	ready: function(pos, $element) {
		this.setPos(pos);
		this.$dimElements.show();

		if ($element) {
			this.setContent($element);
		}

		this.$element.show();
	},
	
	/**
	 * hide each dimmed layer
	 **/
	finish: function() {
		this.$dimElements.hide();
		this.$element.hide();
	},
	
	/**
	 * move to position
	 * @param {object} pos position to move
	 */
	moveTo: function(pos) {
		this.setPos(pos);
	},
	
	/**
	 * setPos for move
	 * @param {object} pos 
	 */
	setPos: function(pos) {
		this.$element.css({
			left: pos.x,	
			top: pos.y
		});
	},
	
	/**
	 * set guide content
	 * @param {string} $content
	 */
	setContent: function($content) {
		this.$element.empty();
		this.$element.append($content.clone());
		this.$element.css({
			width: $content.width() + 'px',
			height: $content.height() + 'px'
		})
	},
	
	/**
	 * show element
	 */
	show: function() {
		if (!this.isDisable) {
			this.$element.show();
		}
	},
	
	/**
	 * hide element
	 */
	hide: function() {
		this.$element.hide();
	},
	
	/**
	 * disable guide
	 */
	disable: function() {
		this.isDisable = true;
	},

	/**
	 * enable guide
	 */
	enable: function() {
		this.isDisable = false;
	},

	/**
	 * set move target
	 * @param {object} move element
	 */
	setMoveElement: function($el) {
		this.$moveElement = $el;
	},

	/**
	 * get scoll left
	 * @returns {Number}
	 */
	getScrollLeft: function() {
		return (window.scrollX || $(window).scrollLeft());
	},

	/**
	 * get scroll top
	 * @returns {Number}
	 */
	getScrollTop: function() {
		return (window.scrollY || $(window).scrollTop());
	}
});
