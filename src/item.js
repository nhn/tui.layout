ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Item = ne.util.defineClass({
	/**
	 * @param {object} options
	 **/
	init : function(options) {

		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this.setIndex(options.index);
		this._makeElement(options);
		
		// title used, and fix title (no hide)
		if (!ne.util.isBoolean(options.isClose)) {
			this.titleFix();
		}
	
		// close body(I don't like this code, are there any ways to fix it.)
		if (options.isClose) {
			this.close();
		} else {
			this.open();
		}

		this.groupInfo = options.groupInfo;
		this.$content.append($(options.contentId));
		this._setEvents();
	},

	/**
	 * set Index by group
	 **/
	setIndex: function(index) {
		this.index = index;
	},

	/**
	 * get Index
	 **/
	getIndex: function() {
		return this.index;
	},

	/**
	 * make item root element 
	 * @param {object} options item options
	 * @private
	 **/
	_makeElement: function(options) {
		var wrapperClass = options.wrapperClass || DEFAULT_WRPPER_CLASS,
			elementHTML = this._getMarkup(options.elementHTML, wrapperClass);

		this.$element = $(elementHTML);
		this.$content = this.$element.find('.' + wrapperClass);
		
		this.isDraggable = !!options.isDraggable;
		this._makeTitle(options);
	},

	/**
	 * make markup with template
	 * @param {string} html  item element html
	 * @param {string} wrapperClass content wrapper class
	 **/
	_getMarkup: function(html, wrapperClass) {
		var map = {
				number : this.index,
				wrapperClass: wrapperClass
			};

		html = html || HTML.ELEMENT;
		html = html.replace(/\{\{([^\}]+)\}\}/g, function(mstr, name) {
			return map[name];
		});

		return html;
	},

	/**
	 * make title element and elements belong to title
	 * @param {object} options item options
	 * @private
	 **/
	_makeTitle: function(options) {
		var moveButtonHTML = options.moveButtonHTML || HTML.MOVEBUTTON,
			titleHTML = options.titleHTML || HTML.TITLE;
		
		this.$titleElement = $(titleHTML);
		this.$titleElement.html(options.title || TEXT.DEFAULT_TITLE);

		if (this.isDraggable) {
			this._makeDragButton(moveButtonHTML);
		}

		this.$content.before(this.$titleElement);
		this._makeToggleButton(options.toggleButtonHTML || HTML.TOGGLEBUTTON);
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