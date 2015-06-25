/**
 * @fileoverview Layout helper object. Guide mouse move-statement to know what is dragged well.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

/**
 * Guide class(ne.component.Layout.Guide) make helper element and move helper element by position.
 * @constructor
 */
ne.component.Layout.Guide = ne.util.defineClass(/**@lends ne.component.Layout.Guide.prototype */{
	/**
	 * Initialize guide object with options
	 * @param {object} [options]
	 * 	@param {string} [options.guideHTML] guide The html will be guide element.
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
	 * Show each dimmed layer
	 * @param {object} pos The position to initialize guide element
	 * @param {jQuerObject} $element The helper element
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
	 * Hide each dimmed layer
	 **/
	finish: function() {
		this.$dimElements.hide();
		this.$element.hide();
	},
	
	/**
	 * Move to position
	 * @param {object} pos The position to move
	 */
	moveTo: function(pos) {
		this.setPos(pos);
	},
	
	/**
	 * Set Pos for move
	 * @param {object} pos  The position to move
	 */
	setPos: function(pos) {
		this.$element.css({
			left: pos.x,	
			top: pos.y
		});
	},
	
	/**
	 * Set guide content
	 * @param {string} $content The content object to copy and append to guide element.
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
	 * Show element
	 */
	show: function() {
		if (!this.isDisable) {
			this.$element.show();
		}
	},
	
	/**
	 * Hide element
	 */
	hide: function() {
		this.$element.hide();
	},
	
	/**
	 * Disable guide
	 */
	disable: function() {
		this.isDisable = true;
	},

	/**
	 * Enable guide
	 */
	enable: function() {
		this.isDisable = false;
	},

	/**
	 * Set move target
	 * @param {object} $el The element is moving in layout.
	 */
	setMoveElement: function($el) {
		this.$moveElement = $el;
	},

	/**
	 * Get scoll left
	 * @returns {Number}
	 */
	getScrollLeft: function() {
		return (window.scrollX || $(window).scrollLeft());
	},

	/**
	 * Get scroll top
	 * @returns {Number}
	 */
	getScrollTop: function() {
		return (window.scrollY || $(window).scrollTop());
	}
});
