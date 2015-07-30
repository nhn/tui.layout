/*!component-layout v1.0.0 | NHN Entertainment*/
(function() {

var HTML = {
		MOVEBUTTON: '<button class="move-button drag-item-move" data-item="{{item-id}}">move</button>',
		ELEMENT: '<div class="item" data-index="{{number}}"><div class="{{wrapper}}"></div></div>',
		TITLE: '<div class="title"></div>',
		TOGGLEBUTTON: '<button class="toggle-button">toggle</button>',
		GROUP : '<div class="group gp_{{group-id}}" data-group="{{group-id}}"></div>',
		GUIDE: '<div class="item-guide"></div>'
	},
	TEXT = {
		DEFAULT_TITLE: 'no title'
	},
	ERROR = {
		OPTIONS_NOT_DEFINED : 'options are not defined'
	},
	DEFAULT_WRPPER_CLASS = 'item-body',
	DIMMED_LAYER_CLASS = 'dimmed-layer';
/**
* @fileoverview layout component
* @dependency code-snippet.js jquery.1.8.3
* @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
*/
ne.util.defineNamespace('ne.component');

/**
 * make layout element and include groups, controll item move and set events
 * @constructor
 */
ne.component.Layout = ne.util.defineClass(/**@lends ne.component.Layout.prototype */{
	/**
	 * initialize layout
	 * @param {object} opitons
	 * 	@param {array} options.grouplist group option list
	 * @param {JQueryObject} $element
	 */
	init: function(opitons, $element) {
		this.$element = $element;
		this._makeGroup(opitons.grouplist);
		this._makeGuide(opitons.guideHTML);
		this._setEvents();
	},

	/**
	 * make group
	 * @param {array} grouplist The list of group options
	 * @private
	 */
	_makeGroup: function(grouplist) {
		var group;
		this.groups = {};

		ne.util.forEach(grouplist, function(item) {
			group = this.groups[item.id] = new ne.component.Layout.Group(item);
			this.$element.append(group.$element);
		}, this);
	},

	/**
	 * get group item
	 * @param {(string|object)} group The item id or information to find group
	 * @returns {*}
	 * @private
	 */
	_getGroup: function(group) {
		if (ne.util.isObject(group)) {
			if (group.attr('data-group')) {
				group = group.attr('data-group');
			} else {
				group = group.parent().attr('data-group');
			}
		}
		return this.groups[group];
	},

	/**
	 * make guide object
	 * @param {string} [guideHTML] guide element html
	 * @private
	 */
	_makeGuide: function(guideHTML) {
		this._guide = new ne.component.Layout.Guide({
			guideHTML: guideHTML
		});
	},

	/**
	 * set Events
	 * @private
	 */
	_setEvents: function() {
		this.onMouseDown = $.proxy(this._onMouseDown, this);
		this.onMouseMove = $.proxy(this._onMouseMove, this);
		this.onMouseUp = $.proxy(this._onMouseUp, this);
		$('.drag-item-move').on('mousedown', this.onMouseDown);
	},

	/**
	 * mouse down event handler
	 * @param e
	 * @private
	 */
	_onMouseDown: function(e) {
		var $doc = $(document);
		this.height($doc.height());
		this._setGuide(e.target, e.clientX, e.clientY);
		$doc.on('mousemove', this.onMouseMove);
		$doc.on('mouseup', this.onMouseUp);
	},

	/**
	 * set guide
	 * @param {object} target guide target
	 * @param {number} pointX
	 * @param {number} pointY
	 * @private
	 */
	_setGuide: function(target, pointX, pointY) {
		var $doc = $(document),
			initPos = {
				x: pointX + $doc.scrollLeft() + 10,
				y: pointY + $doc.scrollTop() + 10
			},
			itemId = $(target).attr('data-item'),
			$moveEl = $('#' + itemId);

		this._guide.ready(initPos, $moveEl);
		this._guide.setMoveElement($moveEl);
		this.$temp = $moveEl;
		this._lockTemp();
	},

	/**
	 *
	 * @private
	 */
	_lockTemp: function() {
		var group = this._getGroup(this.$temp),
			item = group.list[this.$temp.attr('data-index')];
		this.$temp.css('opacity', '0.2');
		this.$temp.find('#' + item.contentId).css('visibility', 'hidden');
	},

	/**
	 *
	 * @private
	 */
	_unlockTemp: function() {
		var group = this._getGroup(this.$temp),
			item = group.list[this.$temp.attr('data-index')];
		this.$temp.css('opacity', '1');
		this.$temp.find('#' + item.contentId).css('visibility', 'visible');
	},

	/**
	 * mouse move handler
	 * @param {JqueryEvent} e event object
	 * @private
	 */
	_onMouseMove: function(e) {

		var parent, $doc, pointX, pointY, group;

		parent = $(e.target).parent();
		$doc = $(document);
		pointX = e.clientX + $doc.scrollLeft();
		pointY = e.clientY + $doc.scrollTop();
		group = parent.attr('data-group');

		this._setScrollState(pointX, pointY);
		this._moveGuide(pointX, pointY);

		if (group) {
			this._detectMove(parent, pointX, pointY);
		}
	},

	/**
	 * if element move over area, scroll move to show element
	 * @private
	 */
	_setScrollState: function(x, y) {
		var $doc = $(document),
			$win = $(window),
			docHeight = this.height(),
			height = $win.height(),
			top = $doc.scrollTop(),
			limit = docHeight - height;

		if (height + top < y) {
			$doc.scrollTop(Math.min(top + (y - height + top), limit));
		}
	},

	/**
	 * save document height or return height
	 * @param {number} height
	 */
	height: function(height) {
		if (ne.util.isUndefined(height)) {
			return this._height;
		} else {
			this._height = height;
		}
	},
	/**
	 * detect move with group
	 * @param {object} item compare position with
	 * @param {number} pointX x position
	 * @param {number} pointY y position
	 * @private
	 */
	_detectMove: function(item, pointX, pointY) {
		var $doc = $(document),
			groupInst = this._getGroup(item),
			group = item.attr('data-group'),
			$before,
			top = $doc.scrollTop(),
			left = $doc.scrollLeft();

		if (ne.util.isEmpty(groupInst.list)) {
			item.append(this.$temp);
			this.height($doc.height());
			this.$temp.way = 'after';
			this.$temp.index = 0;
		} else {
			$before = this._detectTargetByPosition({
				x: pointX + left,
				y: pointY + top
			}, groupInst);

			if ($before && $before.way) {
				$before[$before.way](this.$temp);
				this.height($doc.height());
				this.$temp.way = $before.way;
				this.$temp.index = $before.attr('data-index');
			}
		}
	},

	/**
	 * move drag effect element
	 * @param {number} x move position x
	 * @param {number} y move position y
	 * @private
	 */
	_moveGuide: function(x, y) {
		this._guide.moveTo({
			x: x + 10 + 'px',
			y: y + 10 + 'px'
		});
	},

	/**
	 * detect target by move element position
	 * @param {object} pos position to detect
	 * @param {object} group  group that has child
	 * @returns {string|*}
	 * @private
	 */
	_detectTargetByPosition: function(pos, group) {
		var target;

		ne.util.forEach(group.list, function(item) {
			if (!this._isValidItem(item)) {
				return;
			}
			target = this._getTarget(item, pos, group) || target;
		}, this);

		return target;
	},

	/**
	 * get target element
	 * @param {object} item The item to compare with pos
	 * @param {object} pos The pos to figure whether target or not
	 * @param {object} group The group has item
	 * @private
	 */
	_getTarget: function(item, pos, group) {
		var bound = item.$element.offset(),
			bottom = this._getBottom(item, group),
			height = item.$element.height(),
			top = $(document).scrollTop() + bound.top,
			$target;
		if (pos.y > top && pos.y <= top + (height / 2)) {
			$target = item.$element;
			$target.way = 'before';
		} else if (pos.y > top + (height / 2) && pos.y < bottom) {
			$target = item.$element;
			$target.way = 'after';
		}

		return $target;
	},

	/**
	 * check whether Vaild item or not
	 * @param {param} item
	 * @returns {boolean}
	 * @private
	 */
	_isValidItem: function(item) {
		return (item.$element[0] !== this.$temp[0]);
	},

	/**
	 * if next element exist, set bottom next element's top position, else set bottom limit(group element's bottom position) position
	 * @param {object} item The object to figure bottom position
	 * @param {object} group The group to figure bottom position
	 * @returns {*}
	 * @private
	 */
	_getBottom: function(item, group) {
		var $next = item.$element.next(),
			bottom,
			$doc = $(document),
			gbound = group.$element.offset(),
			limit = $doc.scrollTop() + gbound.top + group.$element.height();
		if ($next.hasClass(DIMMED_LAYER_CLASS)) {
			bottom = limit;
		} else {
			bottom = $doc.scrollTop() + $next.offset().top;
		}
		return bottom;
	},

	/**
	 * get add index by $temp, $temp.way
	 * @returns {Number}
	 * @private
	 */
	_getAddIndex: function() {
		var temp = this.$temp,
			index = parseInt(temp.index, 10);
		if (temp.way === 'after') {
			index += 1;
		}
		return index;
	},

	/**
	 * mouse up handler
	 * @param {JqueryEvent} e A event object
	 * @private
	 */
	_onMouseUp: function(e) {
		var drag = this._guide,
			$doc = $(document),
			group = this._getGroup(this.$temp.attr('data-groupInfo')),
			$target = this._detectTargetByPosition({
				x: e.clientX + $doc.scrollLeft(),
				y: e.clientY + $doc.scrollTop()
			}, group);

		this._update();
		this._unlockTemp();
		drag.finish();

		$doc.off('mousemove', this.onMouseMove);
		$doc.off('mouseup', this.onMouseUp);
	},

	/**
	 * update groups
	 * @private
	 */
	_update: function() {
		var temp = this.$temp,
			oldGroup = this._getGroup(temp.attr('data-groupInfo')),
			targetGroup = this._getGroup(temp.parent()),
			removeIndex = parseInt(temp.attr('data-index'), 10),
			addIndex = this._getAddIndex(),
			item = oldGroup.list[removeIndex];

		if (!isNaN(addIndex)) {
			oldGroup.storePool();
			targetGroup.storePool();
			oldGroup.remove(removeIndex);
			targetGroup.add(item, addIndex);
			targetGroup.render();
			oldGroup.render();
		}
	}
});
/**
 * @fileoverview layout group. group include item.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

/**
 * make item list and group element
 * @constructor
 */
ne.component.Layout.Group = ne.util.defineClass(/**@lends ne.component.Layout.Group.prototype */{
	/**
	 * pool element
	 */
	$pool: $('<div class="pool" style="display:none"></div>'),
	/**
	 * init default field
	 * @param {object} options
	 * 	@param {string} options.id
	 *	@param {array} options.items array of items
	 * 	@param {string} [options.html] html of group element
	 * 	@param {(number|string)} [options.ratio] ratio
	 */
	init: function(options) {
		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this.size = options.ratio + '%';
		this.id = options.id;

		this._makeElement(options.html || HTML.GROUP);
		this._makeItems(options.items);
		this._appendDimmed();

		this.render();
	},

	/**
	 * make group element
	 * @param {string} html The html string to create the html element
	 * @private
	 */
	_makeElement: function(html) {
		html = this._getHtml(html, {
			'group-id': this.id
		});

		this.$element = $(html);
		this.$element.css({
			'position': 'relative',
			'width': this.size
		});
	},

	/**
	 * make markup with template
	 * @param {string} html A item element html
	 * @param {object} map The map to change html string
	 * @returns {string}
	 * @private
	 */
	_getHtml: function(html, map) {
		html = html.replace(/\{\{([^\}]+)\}\}/g, function(mstr, name) {
			return map[name];
		});
		return html;
	},

	/**
	 * make item list by items
	 * @param {array} list The list of item's IDs
	 * @private
	 */
	_makeItems: function(list) {
		var options = {
			groupInfo: this.id
		};
		this.list = ne.util.map(list, function(item) {
			ne.util.extend(item, options);
			return new ne.component.Layout.Item(item);
		}, this);
	},

	/**
	 * make dimmed element
	 * @private
	 */
	_makeDimmed: function() {
		this.$dimmed = $('<div class="' + DIMMED_LAYER_CLASS + '"></div>');
		this.$dimmed.css({
			position: 'absolute',
			left: 0,
			top: 0, 
			bottom: 0,
			right: 0,
			display: 'none'
		});
	},

	/**
	 * append dimmed element
	 * @private
	 */
	_appendDimmed: function() {
		if (!this.$dimmed) {
			this._makeDimmed();
		}
		this.$element.append(this.$dimmed);
	},

	/**
	 * remove item by index
	 * @param {number} index The index of the item to remove
	 **/
	remove: function(index) {
		this.storePool(this.list[index]);
		this.list.splice(index, 1);
	},

	/**
	 * add item
	 * @param {object} item item object
	 * @param {number} [index] add The index of the item to add
	 */
	add: function(item, index) {
		if (arguments.length > 1) {
			this.list.splice(index, 0, item);
		} else {
			this.list.push(item);
		}
		item.groupInfo = this.id;
	},

	/**
	 * rearrange group items
	 */
	render: function() {
		ne.util.forEach(this.list, function(item, index) {
			this.$dimmed.before(item.$element);
			item.index = index;
			item.$element.attr({
				'data-index' : index,
				'data-groupInfo': this.id
			});
		}, this);
		this.$dimmed.hide();
	},

	/**
	 * store items to pool
	 * @param {object} $element A JQuery element to store in the pool
	 */
	storePool: function($element) {
		if ($element) {
			this.$pool.append($element);
		} else {
			ne.util.forEach(this.list, function(item) {
				this.$pool.append(item.$element);
			}, this);
		}
	}
});


/**
 * @fileoverview layout guide. to help watch move element.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

/**
 * make helper element
 * @constructor
 */
ne.component.Layout.Guide = ne.util.defineClass(/**@lends ne.component.Layout.Guide.prototype */{
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

/**
 * @fileoverview layout item. contain original items.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

/**
 * make item element
 * @constructor
 */
ne.component.Layout.Item = ne.util.defineClass(/** @lends ne.component.Layout.Item.prototype */{
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
	 */
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
			this.fixTitle();
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
	 */
	getIndex: function() {
		return this.index;
	},

	/**
	 * make item root element
	 * @private
	 */
	_makeElement: function() {
		var wrapperClass = this.wrapperClass || DEFAULT_WRPPER_CLASS,
			elementHTML = this._getHtml(this.elementHTML, {
				number : this.index,
				wrapper: wrapperClass
			});

		this.$element = $(elementHTML);
		this.$element.css('position', 'relative');
		this.$content = this.$element.find('.' + wrapperClass);

		this.isDraggable = !!this.isDraggable;
		this._makeTitle();
	},

	/**
	 * make title element and elements belong to title
	 * @private
	 */
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
	 * @param {string} html A item element html
	 * @param {object} map The map to change html string
	 * @returns {string}
	 * @private
	 */
	_getHtml: function(html, map) {
		html = html.replace(/\{\{([^\}]+)\}\}/g, function(mstr, name) {
			return map[name];
		});
		return html;
	},

	/**
	 * make drag button 
	 * @param {string} html button html
	 * @private
	 */
	_makeDragButton: function(html) {
		html = this._getHtml(html, {
			'item-id': 'item_id_' + this.contentId
		});
		this.$titleElement.append($(html));
	},

	/**
	 * make Toggle button
	 * @param {string} toggleHTML
	 * @private
	 */
	_makeToggleButton: function(toggleHTML) {
		this.$toggleButton = $(toggleHTML);
		this.$titleElement.append(this.$toggleButton);
	},

	/**
	 * close Element
	 */
	close: function() {
		this.$toggleButton.addClass("open");
		this.$content.hide();
	},

	/**
	 * open Element
	 */
	open: function() {
		this.$toggleButton.removeClass("open");
		this.$content.show();
	},

	/**
	 * title fix to do not hide 
	 */
	fixTitle: function() {
		this.showTitle();
		this.isTitleFix = true;
	},

	/**
	 * show title
	 */
	showTitle: function() {
		this.$titleElement.show();
	},

	/**
	 * hide title
	 */
	hideTitle: function() {
		if (!this.isTitleFix) {
			this.$titleElement.hide();
		}
	},

	/**
	 * toggle open/close
	 */
	toggle: function() {
		if (this.$toggleButton.hasClass('open')) {
			this.open();
		} else {
			this.close();
		}
	},

	/**
	 * set all event about item
	 * @private
	 */
	_setEvents: function() {
		this.$toggleButton.on('click', $.proxy(this.toggle, this));
	}
});
})();