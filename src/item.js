/**
 * @fileoverview layout item. contain original items.
 * @dependency code-snippet, jquery1.8.3, layout.js
 */
ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Item = ne.util.defineClass({
	/**
	 * initialize
	 * @param {object} options
	 * 	@param {string} options.groupInfo group that has item name
	 * 	@param {string} options.contentId content element id
	 * 	@param {boolean} options.isClose content close or not
	 * 	@param {boolean} options.isDraggable drag helper element use or not
	 * 	@param {number} options.index index of content in group
	 *  @param {string} [options.moveButtonHTML] move button HTML
	 *  @param {string} [options.elementHTML] item element HTML
	 *  @param {string} [options.titleHTML] item title element HTML
	 **/
	init : function(options) {

		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		// html 들을 정리한다
		ne.util.extend(options, {
			elementHTML: options.elementHTML || HTML.ELEMENT,
			moveButtonHTML: options.moveButtonHTML || HTML.MOVEBUTTON,
			titleHTML: options.titleHTML || HTML.TITLE,
			toggleButtonHTML: options.toggleButtonHTML || HTML.TOGGLEBUTTON,
			title: options.title || TEXT.DEFAULT_TITLE
		});
		ne.util.extend(this, options);

		this._makeElement();
		
		// title used, and fix title (no hide)
		if (!ne.util.isBoolean(this.isClose)) {
			this.titleFix();
		}
	
		// close body(I don't like this code, are there any ways to fix it.)
		if (this.isClose) {
			this.close();
		} else {
			this.open();
		}

		this.$content.append($('#' + this.contentId));
		this.$element.attr('id', 'item_id_' + this.contentId);
		this._setEvents();
	},

	/**
	 * get Index
	 **/
	getIndex: function() {
		return this.index;
	},

	/**
	 * make item root element
	 * @private
	 **/
	_makeElement: function() {
		var wrapperClass = this.wrapperClass || DEFAULT_WRPPER_CLASS,
			elementHTML = this._getMarkup(this.elementHTML, wrapperClass);

		this.$element = $(elementHTML);
		this.$element.css('position', 'relative');
		this.$content = this.$element.find('.' + wrapperClass);

		this.isDraggable = !!this.isDraggable;
		this._makeTitle();
	},

	/**
	 * make title element and elements belong to title
	 * @private
	 **/
	_makeTitle: function() {

		this.$titleElement = $(this.titleHTML);
		this.$titleElement.html(this.title);

		if (this.isDraggable) {
			this._makeDragButton(this.moveButtonHTML);
		}

		this.$content.before(this.$titleElement);
		this._makeToggleButton(this.toggleButtonHTML);
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

		html = html.replace(/\{\{([^\}]+)\}\}/g, function(mstr, name) {
			return map[name];
		});

		return html;
	},

	/**
	 * make drag button 
	 * @param {string} html button html
	 * @private
	 **/
	_makeDragButton: function(html) {
		html = html.replace(/{{item-id}}/g, 'item_id_' + this.contentId);
		this.$titleElement.append($(html));
	},

	/**
	 * make Toggle button
	 * @private
	 **/
	_makeToggleButton: function(toggleHTML) {
		this.$toggleButton = $(toggleHTML);
		this.$titleElement.append(this.$toggleButton);
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