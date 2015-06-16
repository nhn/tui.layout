ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Item = ne.util.defineClass({
	/**
	 * @param {object} options
	 **/
	init : function(options) {

		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this._makeElement(options.index);
		
		// use title case, make title element
		this.isDraggable = !!options.isDraggable;
		this._makeTitle(options);

		// title used, and fix title (no hide)
		if (!ne.util.isBoolean(options.isClose)) {
			this.titleFix();
		}

		this._makeToggleButton(options.toggleButtonHTML || HTML.TOGGLEBUTTON);
	

		// close body
		if (options.isClose) {
			this.close();
		} else {
			this.open();
		}

		this.$content.append($(options.contentID));
		this._setEvents();
	},
	/**
	 * make item root element 
	 * @param {nubmer} index item index of group
	 * @private
	 **/
	_makeElement: function(index) {
		this.$element = $(HTML.ELEMENT.replace('{{number}}', index));
		this.$content = this.$element.find('.item-body');
	},
	/**
	 * make title element
	 * @param {object} options item options
	 * @private
	 **/
	_makeTitle: function(options) {
		var moveButtonHTML = options.moveButtonHTML || HTML.MOVEBUTTON;
		var titleHTML = options.titleHTML || HTML.TITLE;
		
		this.$titleElement = $(titleHTML);
		this.$titleElement.html(options.title || TEXT.DEFAULT_TITLE);

		if (this.isDraggable) {
			this._makeDragButton(moveButtonHTML);
		}

		this.$content.before(this.$titleElement);
	},
	/**
	 * make drag button 
	 * @param {string} html button html
	 * @private
	 **/
	_makeDragButton: function(html) {
		this.$titleElement.append($(html));
	},
	/**
	 * make Toggle button
	 * @private
	 **/
	_makeToggleButton: function(toggleHTML) {
		this.$toggleButton = $(toggleHTML);
	},
	/**
	 * close Element
	 **/
	close: function() {
		this.$toggleButton.addClass("open");
		this.$content.hide();
	},
	/**
	 * open Element
	 **/
	open: function() {
		this.$toggleButton.removeClass("open");
		this.$content.show();
	},
	/**
	 * title fix to do not hide 
	 **/
	titleFix: function() {
		this.titleOn();
		this.isTitleFix = true;
	},
	/**
	 * show title
	 **/
	titleOn: function() {
		this.$titleElement.show();
	},
	/**
	 * hide title
	 **/
	titleOff: function() {
		if (!this.isTitleFix) {
			this.$titleElement.hide();
		}
	},
	/**
	 * toggle open/close
	 **/
	toggle: function() {
		if (this.$toggleButton.hasClass('open')) {
			this.open();
		} else {
			this.close();
		}
	},
	/**
	 * set all event about item
	 **/
	_setEvents: function() {
		this.$toggleButton.on('click', $.proxy(this.toggle, this));
	}
});