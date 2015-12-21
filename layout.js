(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Layout', require('./src/layout'));

},{"./src/layout":5}],2:[function(require,module,exports){
/**
 * @fileoverview layout group. group include item.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */

var statics = require('./statics');
var Item = require('./item');

/**
 * The group class make list of item and group element(jQueryObject).
 * @constructor
 */
var Group = tui.util.defineClass(/**@lends Group.prototype */{
	/**
	 * Element pool
	 */
	$pool: $('<div class="pool" style="display:none"></div>'),
	/**
	 * Initailize default member field
	 * @param {object} options
	 * 	@param {string} options.id
	 *	@param {array} options.items array of items
	 * 	@param {string} [options.html] html of group element
	 * 	@param {(number|string)} [options.ratio] ratio
	 */
	init: function(options) {
		if (!options) {
			throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
		}

		this.size = options.ratio + '%';
		this.id = options.id;

		this._makeElement(options.html || statics.HTML.GROUP);
		this._makeItems(options.items);
		this._appendDimmed();

		this.render();
	},

	/**
	 * Make group element(JqueryObject)
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
	 * Make markup with template
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
	 * Make list of item by items
	 * @param {array} list The list of item's IDs
	 * @private
	 */
	_makeItems: function(list) {
		var options = {
			groupInfo: this.id
		};
		this.list = tui.util.map(list, function(item) {
			tui.util.extend(item, options);
			return new Item(item);
		}, this);
	},

	/**
	 * Make dimmed element
	 * @private
	 */
	_makeDimmed: function() {
		this.$dimmed = $('<div class="' + statics.DIMMED_LAYER_CLASS + '"></div>');
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
	 * Append dimmed element
	 * @private
	 */
	_appendDimmed: function() {
		if (!this.$dimmed) {
			this._makeDimmed();
		}
		this.$element.append(this.$dimmed);
	},

	/**
	 * Remove item by index
	 * @param {number} index The index of the item to remove
	 **/
	remove: function(index) {
		this.storePool(this.list[index]);
		this.list.splice(index, 1);
	},

	/**
	 * Add item to item list
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
	 * Rearrange group items
	 */
	render: function() {
		tui.util.forEach(this.list, function(item, index) {
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
	 * Store items to pool
	 * @param {object} $element A JQuery element to store in the pool
	 */
	storePool: function($element) {
		if ($element) {
			this.$pool.append($element);
		} else {
			tui.util.forEach(this.list, function(item) {
				this.$pool.append(item.$element);
			}, this);
		}
	}
});

module.exports = Group;

},{"./item":4,"./statics":6}],3:[function(require,module,exports){
/**
 * @fileoverview Layout helper object. Guide mouse move-statement to know what is dragged well.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team <dl_javascript@nhnent.com>
 */
var statics = require('./statics');
/**
 * Guide class make helper element and move helper element by position.
 * @constructor
 */
var Guide = tui.util.defineClass(/**@lends Guide.prototype */{
	/**
	 * Initialize guide object with options
	 * @param {object} [options]
	 * 	@param {string} [options.guideHTML] guide The html will be guide element.
	 */
	init: function(options) {
		options = options || {};
		this.$element = $(options.guideHTML || statics.HTML.GUIDE);
		this.$element.css('position', 'absolute');
		this.$element.appendTo(document.body);
		this.$dimElements = $('.' +  statics.DIMMED_LAYER_CLASS);
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

module.exports = Guide;

},{"./statics":6}],4:[function(require,module,exports){
/**
 * @fileoverview layout item. contain original items.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team<dl_javascript@nhnent.com>
 */

var statics = require('./statics');

/**
 * Item class is manage item state and title.
 * @constructor
 */
var Item = tui.util.defineClass(/** @lends Item.prototype */{
	/**
	 * Initialize meember filed and state
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
			throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
		}

		// html set
		tui.util.extend(options, {
			elementHTML: options.elementHTML || statics.HTML.ELEMENT,
			moveButtonHTML: options.moveButtonHTML || statics.HTML.MOVEBUTTON,
			titleHTML: options.titleHTML || statics.HTML.TITLE,
			toggleButtonHTML: options.toggleButtonHTML || statics.HTML.TOGGLEBUTTON,
			title: options.title || statics.TEXT.DEFAULT_TITLE
		});
		tui.util.extend(this, options);

		this._makeElement();
		
		// title used, and fix title (no hide)
		if (!tui.util.isBoolean(this.isClose)) {
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
	 * Get Index
	 */
	getIndex: function() {
		return this.index;
	},

	/**
	 * Make item root element
	 * @private
	 */
	_makeElement: function() {
		var wrapperClass = this.wrapperClass || statics.DEFAULT_WRPPER_CLASS,
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
	 * Make title element and elements belong to title
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
	 * Make markup with template
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
	 * Make drag button in title
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
	 * Make Toggle button in title
	 * @param {string} toggleHTML
	 * @private
	 */
	_makeToggleButton: function(toggleHTML) {
		this.$toggleButton = $(toggleHTML);
		this.$titleElement.append(this.$toggleButton);
	},

	/**
	 * Close item element
	 */
	close: function() {
		this.$toggleButton.addClass("open");
		this.$content.hide();
	},

	/**
	 * Open item element
	 */
	open: function() {
		this.$toggleButton.removeClass("open");
		this.$content.show();
	},

	/**
	 * Fix title to do not hide. After fixTitle called, hideTitle do not work.
	 */
	fixTitle: function() {
		this.showTitle();
		this.isTitleFix = true;
	},

	/**
	 * Show title
	 */
	showTitle: function() {
		this.$titleElement.show();
	},

	/**
	 * Hide title
	 */
	hideTitle: function() {
		if (!this.isTitleFix) {
			this.$titleElement.hide();
		}
	},

	/**
	 * Toggle open/close
	 */
	toggle: function() {
		if (this.$toggleButton.hasClass('open')) {
			this.open();
		} else {
			this.close();
		}
	},

	/**
	 * Set all event about item
	 * @private
	 */
	_setEvents: function() {
		this.$toggleButton.on('click', $.proxy(this.toggle, this));
	}
});

module.exports = Item;

},{"./statics":6}],5:[function(require,module,exports){
/**
* @fileoverview Layout component
* @dependency code-snippet.js jquery.1.8.3
* @author NHN entertainment FE dev team.<dl_javascript@nhnent.com>
*/

var statics = require('./statics');
var Group = require('./group');
var Guide = require('./guide');

/**
 * Layout class make layout element(JQueryObject) and include groups, control item move and set events.
 * @constructor
 * @api
 * @param {object} opitons
 * 	@param {array} options.grouplist The list of group options
 * @param {jQuery} $element
 */
var Layout = tui.util.defineClass(/**@lends Layout.prototype */{
	/**
	 * Initialize layout
	 */
	init: function(opitons, $element) {
		this.$element = $element;
		this._makeGroup(opitons.grouplist);
		this._makeGuide(opitons.guideHTML);
		this._setEvents();
	},

	/**
	 * Make group
	 * @param {array} grouplist The list of group options
	 * @private
	 */
	_makeGroup: function(grouplist) {
		var group;
		this.groups = {};

		tui.util.forEach(grouplist, function(item) {
			group = this.groups[item.id] = new Group(item);
			this.$element.append(group.$element);
		}, this);
	},

	/**
	 * Get group item
	 * @param {(string|object)} group The item ID or information to find group
	 * @returns {*}
	 * @private
	 */
	_getGroup: function(group) {
		if (tui.util.isObject(group)) {
			if (group.attr('data-group')) {
				group = group.attr('data-group');
			} else {
				group = group.parent().attr('data-group');
			}
		}
		return this.groups[group];
	},

	/**
	 * Make guide object
	 * @param {string} [guideHTML] guide The html will be usded to make guide element
	 * @private
	 */
	_makeGuide: function(guideHTML) {
		this._guide = new Guide({
			guideHTML: guideHTML
		});
	},

	/**
	 * Set Events
	 * @private
	 */
	_setEvents: function() {
		this.onMouseDown = $.proxy(this._onMouseDown, this);
		this.onMouseMove = $.proxy(this._onMouseMove, this);
		this.onMouseUp = $.proxy(this._onMouseUp, this);
		$('.drag-item-move').on('mousedown', this.onMouseDown);
	},

	/**
	 * Mouse down event handler
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
	 * Set guide
	 * @param {object} target The target to set guide's move-statement element
	 * @param {number} pointX The position x to set guide element left.
	 * @param {number} pointY The position y to set guide element top.
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
	 * It make item element seems to be locked.
	 * @private
	 */
	_lockTemp: function() {
		var group = this._getGroup(this.$temp),
			item = group.list[this.$temp.attr('data-index')];
		this.$temp.css('opacity', '0.2');
		this.$temp.find('#' + item.contentId).css('visibility', 'hidden');
	},

	/**
	 * It make item element seems to be unlocked.
	 * @private
	 */
	_unlockTemp: function() {
		var group = this._getGroup(this.$temp),
			item = group.list[this.$temp.attr('data-index')];
		this.$temp.css('opacity', '1');
		this.$temp.find('#' + item.contentId).css('visibility', 'visible');
	},

	/**
	 * Mouse move handler
	 * @param {JqueryEvent} e JqueryEvent object
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
	 * If element move over area, scroll move to show element
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
	 * Save document height or return height
     * @api
	 * @param {number} [height] The height value to save _height feild
	 */
	height: function(height) {
		if (tui.util.isUndefined(height)) {
			return this._height;
		} else {
			this._height = height;
		}
	},
	/**
	 * Detect move with group
	 * @param {object} item compare position with
	 * @param {number} pointX The position x will be detect which element selected.
	 * @param {number} pointY The position y will be detect which element selected.
	 * @private
	 */
	_detectMove: function(item, pointX, pointY) {
		var $doc = $(document),
			groupInst = this._getGroup(item),
			group = item.attr('data-group'),
			$before,
			top = $doc.scrollTop(),
			left = $doc.scrollLeft();

		if (tui.util.isEmpty(groupInst.list)) {
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
	 * Move helper object
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
	 * Detect target by move element position
	 * @param {object} pos The position to detect
	 * @param {object} group The group that has child items
	 * @returns {string|*}
	 * @private
	 */
	_detectTargetByPosition: function(pos, group) {
		var target;

		tui.util.forEach(group.list, function(item) {
			if (!this._isValidItem(item)) {
				return;
			}
			target = this._getTarget(item, pos, group) || target;
		}, this);

		return target;
	},

	/**
	 * Get target element
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
	 * Check whether Vaild item or not
	 * @param {param} item The item To be compared with temp.
	 * @returns {boolean}
	 * @private
	 */
	_isValidItem: function(item) {
		return (item.$element[0] !== this.$temp[0]);
	},

	/**
	 * If next element exist, set bottom next element's top position, else set bottom limit(group element's bottom position) position
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
		if ($next.hasClass(statics.DIMMED_LAYER_CLASS)) {
			bottom = limit;
		} else {
			bottom = $doc.scrollTop() + $next.offset().top;
		}
		return bottom;
	},

	/**
	 * Get add index by $temp, $temp.way
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
	 * Mouse up handler
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
	 * Update groups
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

module.exports = Layout;

},{"./group":2,"./guide":3,"./statics":6}],6:[function(require,module,exports){
/**
 * @fileoverview The static values
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
module.exports = {
    HTML : {
		MOVEBUTTON: '<button class="move-button drag-item-move" data-item="{{item-id}}">move</button>',
		ELEMENT: '<div class="item" data-index="{{number}}"><div class="{{wrapper}}"></div></div>',
		TITLE: '<div class="title"></div>',
		TOGGLEBUTTON: '<button class="toggle-button">toggle</button>',
		GROUP : '<div class="group gp_{{group-id}}" data-group="{{group-id}}"></div>',
		GUIDE: '<div class="item-guide"></div>'
	},
	TEXT : {
		DEFAULT_TITLE: 'no title'
	},
	ERROR : {
		OPTIONS_NOT_DEFINED : 'options are not defined'
	},
	DEFAULT_WRPPER_CLASS : 'item-body',
	DIMMED_LAYER_CLASS : 'dimmed-layer'
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9ncm91cC5qcyIsInNyYy9ndWlkZS5qcyIsInNyYy9pdGVtLmpzIiwic3JjL2xheW91dC5qcyIsInNyYy9zdGF0aWNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuTGF5b3V0JywgcmVxdWlyZSgnLi9zcmMvbGF5b3V0JykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGxheW91dCBncm91cC4gZ3JvdXAgaW5jbHVkZSBpdGVtLlxuICogQGRlcGVuZGVuY3kgY29kZS1zbmlwcGV0LCBqcXVlcnkxLjguMywgbGF5b3V0LmpzXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIEplaW4gWWkoamVpbi55aUBuaG5lbnQuY29tKVxuICovXG5cbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG52YXIgSXRlbSA9IHJlcXVpcmUoJy4vaXRlbScpO1xuXG4vKipcbiAqIFRoZSBncm91cCBjbGFzcyBtYWtlIGxpc3Qgb2YgaXRlbSBhbmQgZ3JvdXAgZWxlbWVudChqUXVlcnlPYmplY3QpLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBHcm91cCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBHcm91cC5wcm90b3R5cGUgKi97XG5cdC8qKlxuXHQgKiBFbGVtZW50IHBvb2xcblx0ICovXG5cdCRwb29sOiAkKCc8ZGl2IGNsYXNzPVwicG9vbFwiIHN0eWxlPVwiZGlzcGxheTpub25lXCI+PC9kaXY+JyksXG5cdC8qKlxuXHQgKiBJbml0YWlsaXplIGRlZmF1bHQgbWVtYmVyIGZpZWxkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG5cdCAqIFx0QHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuaWRcblx0ICpcdEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMuaXRlbXMgYXJyYXkgb2YgaXRlbXNcblx0ICogXHRAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaHRtbF0gaHRtbCBvZiBncm91cCBlbGVtZW50XG5cdCAqIFx0QHBhcmFtIHsobnVtYmVyfHN0cmluZyl9IFtvcHRpb25zLnJhdGlvXSByYXRpb1xuXHQgKi9cblx0aW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdGlmICghb3B0aW9ucykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKHN0YXRpY3MuRVJST1IuT1BUSU9OU19OT1RfREVGSU5FRCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zaXplID0gb3B0aW9ucy5yYXRpbyArICclJztcblx0XHR0aGlzLmlkID0gb3B0aW9ucy5pZDtcblxuXHRcdHRoaXMuX21ha2VFbGVtZW50KG9wdGlvbnMuaHRtbCB8fCBzdGF0aWNzLkhUTUwuR1JPVVApO1xuXHRcdHRoaXMuX21ha2VJdGVtcyhvcHRpb25zLml0ZW1zKTtcblx0XHR0aGlzLl9hcHBlbmREaW1tZWQoKTtcblxuXHRcdHRoaXMucmVuZGVyKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgZ3JvdXAgZWxlbWVudChKcXVlcnlPYmplY3QpXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIFRoZSBodG1sIHN0cmluZyB0byBjcmVhdGUgdGhlIGh0bWwgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VFbGVtZW50OiBmdW5jdGlvbihodG1sKSB7XG5cdFx0aHRtbCA9IHRoaXMuX2dldEh0bWwoaHRtbCwge1xuXHRcdFx0J2dyb3VwLWlkJzogdGhpcy5pZFxuXHRcdH0pO1xuXG5cdFx0dGhpcy4kZWxlbWVudCA9ICQoaHRtbCk7XG5cdFx0dGhpcy4kZWxlbWVudC5jc3Moe1xuXHRcdFx0J3Bvc2l0aW9uJzogJ3JlbGF0aXZlJyxcblx0XHRcdCd3aWR0aCc6IHRoaXMuc2l6ZVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIG1hcmt1cCB3aXRoIHRlbXBsYXRlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaXRlbSBlbGVtZW50IGh0bWxcblx0ICogQHBhcmFtIHtvYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNoYW5nZSBodG1sIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEh0bWw6IGZ1bmN0aW9uKGh0bWwsIG1hcCkge1xuXHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL1xce1xceyhbXlxcfV0rKVxcfVxcfS9nLCBmdW5jdGlvbihtc3RyLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbWFwW25hbWVdO1xuXHRcdH0pO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGxpc3Qgb2YgaXRlbSBieSBpdGVtc1xuXHQgKiBAcGFyYW0ge2FycmF5fSBsaXN0IFRoZSBsaXN0IG9mIGl0ZW0ncyBJRHNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlSXRlbXM6IGZ1bmN0aW9uKGxpc3QpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHtcblx0XHRcdGdyb3VwSW5mbzogdGhpcy5pZFxuXHRcdH07XG5cdFx0dGhpcy5saXN0ID0gdHVpLnV0aWwubWFwKGxpc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdHR1aS51dGlsLmV4dGVuZChpdGVtLCBvcHRpb25zKTtcblx0XHRcdHJldHVybiBuZXcgSXRlbShpdGVtKTtcblx0XHR9LCB0aGlzKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBkaW1tZWQgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VEaW1tZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGRpbW1lZCA9ICQoJzxkaXYgY2xhc3M9XCInICsgc3RhdGljcy5ESU1NRURfTEFZRVJfQ0xBU1MgKyAnXCI+PC9kaXY+Jyk7XG5cdFx0dGhpcy4kZGltbWVkLmNzcyh7XG5cdFx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHR0b3A6IDAsIFxuXHRcdFx0Ym90dG9tOiAwLFxuXHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRkaXNwbGF5OiAnbm9uZSdcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogQXBwZW5kIGRpbW1lZCBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfYXBwZW5kRGltbWVkOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRoaXMuJGRpbW1lZCkge1xuXHRcdFx0dGhpcy5fbWFrZURpbW1lZCgpO1xuXHRcdH1cblx0XHR0aGlzLiRlbGVtZW50LmFwcGVuZCh0aGlzLiRkaW1tZWQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgaXRlbSBieSBpbmRleFxuXHQgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBpdGVtIHRvIHJlbW92ZVxuXHQgKiovXG5cdHJlbW92ZTogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHR0aGlzLnN0b3JlUG9vbCh0aGlzLmxpc3RbaW5kZXhdKTtcblx0XHR0aGlzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIGl0ZW0gdG8gaXRlbSBsaXN0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIGl0ZW0gb2JqZWN0XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbaW5kZXhdIGFkZCBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gYWRkXG5cdCAqL1xuXHRhZGQ6IGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHR0aGlzLmxpc3Quc3BsaWNlKGluZGV4LCAwLCBpdGVtKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5saXN0LnB1c2goaXRlbSk7XG5cdFx0fVxuXHRcdGl0ZW0uZ3JvdXBJbmZvID0gdGhpcy5pZDtcblx0fSxcblxuXHQvKipcblx0ICogUmVhcnJhbmdlIGdyb3VwIGl0ZW1zXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHR1aS51dGlsLmZvckVhY2godGhpcy5saXN0LCBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuXHRcdFx0dGhpcy4kZGltbWVkLmJlZm9yZShpdGVtLiRlbGVtZW50KTtcblx0XHRcdGl0ZW0uaW5kZXggPSBpbmRleDtcblx0XHRcdGl0ZW0uJGVsZW1lbnQuYXR0cih7XG5cdFx0XHRcdCdkYXRhLWluZGV4JyA6IGluZGV4LFxuXHRcdFx0XHQnZGF0YS1ncm91cEluZm8nOiB0aGlzLmlkXG5cdFx0XHR9KTtcblx0XHR9LCB0aGlzKTtcblx0XHR0aGlzLiRkaW1tZWQuaGlkZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTdG9yZSBpdGVtcyB0byBwb29sXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSAkZWxlbWVudCBBIEpRdWVyeSBlbGVtZW50IHRvIHN0b3JlIGluIHRoZSBwb29sXG5cdCAqL1xuXHRzdG9yZVBvb2w6IGZ1bmN0aW9uKCRlbGVtZW50KSB7XG5cdFx0aWYgKCRlbGVtZW50KSB7XG5cdFx0XHR0aGlzLiRwb29sLmFwcGVuZCgkZWxlbWVudCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHR1aS51dGlsLmZvckVhY2godGhpcy5saXN0LCBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdHRoaXMuJHBvb2wuYXBwZW5kKGl0ZW0uJGVsZW1lbnQpO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cDtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBMYXlvdXQgaGVscGVyIG9iamVjdC4gR3VpZGUgbW91c2UgbW92ZS1zdGF0ZW1lbnQgdG8ga25vdyB3aGF0IGlzIGRyYWdnZWQgd2VsbC5cbiAqIEBkZXBlbmRlbmN5IGNvZGUtc25pcHBldCwganF1ZXJ5MS44LjMsIGxheW91dC5qc1xuICogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbSA8ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG52YXIgc3RhdGljcyA9IHJlcXVpcmUoJy4vc3RhdGljcycpO1xuLyoqXG4gKiBHdWlkZSBjbGFzcyBtYWtlIGhlbHBlciBlbGVtZW50IGFuZCBtb3ZlIGhlbHBlciBlbGVtZW50IGJ5IHBvc2l0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBHdWlkZSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBHdWlkZS5wcm90b3R5cGUgKi97XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIGd1aWRlIG9iamVjdCB3aXRoIG9wdGlvbnNcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuXHQgKiBcdEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5ndWlkZUhUTUxdIGd1aWRlIFRoZSBodG1sIHdpbGwgYmUgZ3VpZGUgZWxlbWVudC5cblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR0aGlzLiRlbGVtZW50ID0gJChvcHRpb25zLmd1aWRlSFRNTCB8fCBzdGF0aWNzLkhUTUwuR1VJREUpO1xuXHRcdHRoaXMuJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpO1xuXHRcdHRoaXMuJGVsZW1lbnQuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG5cdFx0dGhpcy4kZGltRWxlbWVudHMgPSAkKCcuJyArICBzdGF0aWNzLkRJTU1FRF9MQVlFUl9DTEFTUyk7XG5cdFx0dGhpcy5oaWRlKCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogU2hvdyBlYWNoIGRpbW1lZCBsYXllclxuXHQgKiBAcGFyYW0ge29iamVjdH0gcG9zIFRoZSBwb3NpdGlvbiB0byBpbml0aWFsaXplIGd1aWRlIGVsZW1lbnRcblx0ICogQHBhcmFtIHtqUXVlck9iamVjdH0gJGVsZW1lbnQgVGhlIGhlbHBlciBlbGVtZW50XG5cdCAqKi9cblx0cmVhZHk6IGZ1bmN0aW9uKHBvcywgJGVsZW1lbnQpIHtcblx0XHR0aGlzLnNldFBvcyhwb3MpO1xuXHRcdHRoaXMuJGRpbUVsZW1lbnRzLnNob3coKTtcblxuXHRcdGlmICgkZWxlbWVudCkge1xuXHRcdFx0dGhpcy5zZXRDb250ZW50KCRlbGVtZW50KTtcblx0XHR9XG5cblx0XHR0aGlzLiRlbGVtZW50LnNob3coKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBIaWRlIGVhY2ggZGltbWVkIGxheWVyXG5cdCAqKi9cblx0ZmluaXNoOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRkaW1FbGVtZW50cy5oaWRlKCk7XG5cdFx0dGhpcy4kZWxlbWVudC5oaWRlKCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogTW92ZSB0byBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gcG9zIFRoZSBwb3NpdGlvbiB0byBtb3ZlXG5cdCAqL1xuXHRtb3ZlVG86IGZ1bmN0aW9uKHBvcykge1xuXHRcdHRoaXMuc2V0UG9zKHBvcyk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogU2V0IFBvcyBmb3IgbW92ZVxuXHQgKiBAcGFyYW0ge29iamVjdH0gcG9zICBUaGUgcG9zaXRpb24gdG8gbW92ZVxuXHQgKi9cblx0c2V0UG9zOiBmdW5jdGlvbihwb3MpIHtcblx0XHR0aGlzLiRlbGVtZW50LmNzcyh7XG5cdFx0XHRsZWZ0OiBwb3MueCxcdFxuXHRcdFx0dG9wOiBwb3MueVxuXHRcdH0pO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNldCBndWlkZSBjb250ZW50XG5cdCAqIEBwYXJhbSB7c3RyaW5nfSAkY29udGVudCBUaGUgY29udGVudCBvYmplY3QgdG8gY29weSBhbmQgYXBwZW5kIHRvIGd1aWRlIGVsZW1lbnQuXG5cdCAqL1xuXHRzZXRDb250ZW50OiBmdW5jdGlvbigkY29udGVudCkge1xuXHRcdHRoaXMuJGVsZW1lbnQuZW1wdHkoKTtcblx0XHR0aGlzLiRlbGVtZW50LmFwcGVuZCgkY29udGVudC5jbG9uZSgpKTtcblx0XHR0aGlzLiRlbGVtZW50LmNzcyh7XG5cdFx0XHR3aWR0aDogJGNvbnRlbnQud2lkdGgoKSArICdweCcsXG5cdFx0XHRoZWlnaHQ6ICRjb250ZW50LmhlaWdodCgpICsgJ3B4J1xuXHRcdH0pXG5cdH0sXG5cdFxuXHQvKipcblx0ICogU2hvdyBlbGVtZW50XG5cdCAqL1xuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRoaXMuaXNEaXNhYmxlKSB7XG5cdFx0XHR0aGlzLiRlbGVtZW50LnNob3coKTtcblx0XHR9XG5cdH0sXG5cdFxuXHQvKipcblx0ICogSGlkZSBlbGVtZW50XG5cdCAqL1xuXHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbGVtZW50LmhpZGUoKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBEaXNhYmxlIGd1aWRlXG5cdCAqL1xuXHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmlzRGlzYWJsZSA9IHRydWU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEVuYWJsZSBndWlkZVxuXHQgKi9cblx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmlzRGlzYWJsZSA9IGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgbW92ZSB0YXJnZXRcblx0ICogQHBhcmFtIHtvYmplY3R9ICRlbCBUaGUgZWxlbWVudCBpcyBtb3ZpbmcgaW4gbGF5b3V0LlxuXHQgKi9cblx0c2V0TW92ZUVsZW1lbnQ6IGZ1bmN0aW9uKCRlbCkge1xuXHRcdHRoaXMuJG1vdmVFbGVtZW50ID0gJGVsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgc2NvbGwgbGVmdFxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfVxuXHQgKi9cblx0Z2V0U2Nyb2xsTGVmdDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh3aW5kb3cuc2Nyb2xsWCB8fCAkKHdpbmRvdykuc2Nyb2xsTGVmdCgpKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHNjcm9sbCB0b3Bcblx0ICogQHJldHVybnMge051bWJlcn1cblx0ICovXG5cdGdldFNjcm9sbFRvcDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICh3aW5kb3cuc2Nyb2xsWSB8fCAkKHdpbmRvdykuc2Nyb2xsVG9wKCkpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlkZTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBsYXlvdXQgaXRlbS4gY29udGFpbiBvcmlnaW5hbCBpdGVtcy5cbiAqIEBkZXBlbmRlbmN5IGNvZGUtc25pcHBldCwganF1ZXJ5MS44LjMsIGxheW91dC5qc1xuICogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbTxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxudmFyIHN0YXRpY3MgPSByZXF1aXJlKCcuL3N0YXRpY3MnKTtcblxuLyoqXG4gKiBJdGVtIGNsYXNzIGlzIG1hbmFnZSBpdGVtIHN0YXRlIGFuZCB0aXRsZS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgSXRlbSA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgSXRlbS5wcm90b3R5cGUgKi97XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIG1lZW1iZXIgZmlsZWQgYW5kIHN0YXRlXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG5cdCAqIFx0QHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuZ3JvdXBJbmZvIGdyb3VwIHRoYXQgaGFzIGl0ZW0gbmFtZVxuXHQgKiBcdEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbnRlbnRJZCBjb250ZW50IGVsZW1lbnQgaWRcblx0ICogXHRAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuaXNDbG9zZSBjb250ZW50IGNsb3NlIG9yIG5vdFxuXHQgKiBcdEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5pc0RyYWdnYWJsZSBkcmFnIGhlbHBlciBlbGVtZW50IHVzZSBvciBub3Rcblx0ICogXHRAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5pbmRleCBpbmRleCBvZiBjb250ZW50IGluIGdyb3VwXG5cdCAqICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubW92ZUJ1dHRvbkhUTUxdIG1vdmUgYnV0dG9uIEhUTUxcblx0ICogIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5lbGVtZW50SFRNTF0gaXRlbSBlbGVtZW50IEhUTUxcblx0ICogIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50aXRsZUhUTUxdIGl0ZW0gdGl0bGUgZWxlbWVudCBIVE1MXG5cdCAqL1xuXHRpbml0IDogZnVuY3Rpb24ob3B0aW9ucykge1xuXG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Ioc3RhdGljcy5FUlJPUi5PUFRJT05TX05PVF9ERUZJTkVEKTtcblx0XHR9XG5cblx0XHQvLyBodG1sIHNldFxuXHRcdHR1aS51dGlsLmV4dGVuZChvcHRpb25zLCB7XG5cdFx0XHRlbGVtZW50SFRNTDogb3B0aW9ucy5lbGVtZW50SFRNTCB8fCBzdGF0aWNzLkhUTUwuRUxFTUVOVCxcblx0XHRcdG1vdmVCdXR0b25IVE1MOiBvcHRpb25zLm1vdmVCdXR0b25IVE1MIHx8IHN0YXRpY3MuSFRNTC5NT1ZFQlVUVE9OLFxuXHRcdFx0dGl0bGVIVE1MOiBvcHRpb25zLnRpdGxlSFRNTCB8fCBzdGF0aWNzLkhUTUwuVElUTEUsXG5cdFx0XHR0b2dnbGVCdXR0b25IVE1MOiBvcHRpb25zLnRvZ2dsZUJ1dHRvbkhUTUwgfHwgc3RhdGljcy5IVE1MLlRPR0dMRUJVVFRPTixcblx0XHRcdHRpdGxlOiBvcHRpb25zLnRpdGxlIHx8IHN0YXRpY3MuVEVYVC5ERUZBVUxUX1RJVExFXG5cdFx0fSk7XG5cdFx0dHVpLnV0aWwuZXh0ZW5kKHRoaXMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5fbWFrZUVsZW1lbnQoKTtcblx0XHRcblx0XHQvLyB0aXRsZSB1c2VkLCBhbmQgZml4IHRpdGxlIChubyBoaWRlKVxuXHRcdGlmICghdHVpLnV0aWwuaXNCb29sZWFuKHRoaXMuaXNDbG9zZSkpIHtcblx0XHRcdHRoaXMuZml4VGl0bGUoKTtcblx0XHR9XG5cdFxuXHRcdC8vIGNsb3NlIGJvZHkoSSBkb24ndCBsaWtlIHRoaXMgY29kZSwgYXJlIHRoZXJlIGFueSB3YXlzIHRvIGZpeCBpdC4pXG5cdFx0aWYgKHRoaXMuaXNDbG9zZSkge1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm9wZW4oKTtcblx0XHR9XG5cblx0XHR0aGlzLiRjb250ZW50LmFwcGVuZCgkKCcjJyArIHRoaXMuY29udGVudElkKSk7XG5cdFx0dGhpcy4kZWxlbWVudC5hdHRyKCdpZCcsICdpdGVtX2lkXycgKyB0aGlzLmNvbnRlbnRJZCk7XG5cdFx0dGhpcy5fc2V0RXZlbnRzKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBJbmRleFxuXHQgKi9cblx0Z2V0SW5kZXg6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmluZGV4O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGl0ZW0gcm9vdCBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB3cmFwcGVyQ2xhc3MgPSB0aGlzLndyYXBwZXJDbGFzcyB8fCBzdGF0aWNzLkRFRkFVTFRfV1JQUEVSX0NMQVNTLFxuXHRcdFx0ZWxlbWVudEhUTUwgPSB0aGlzLl9nZXRIdG1sKHRoaXMuZWxlbWVudEhUTUwsIHtcblx0XHRcdFx0bnVtYmVyIDogdGhpcy5pbmRleCxcblx0XHRcdFx0d3JhcHBlcjogd3JhcHBlckNsYXNzXG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnRIVE1MKTtcblx0XHR0aGlzLiRlbGVtZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcblx0XHR0aGlzLiRjb250ZW50ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHdyYXBwZXJDbGFzcyk7XG5cblx0XHR0aGlzLmlzRHJhZ2dhYmxlID0gISF0aGlzLmlzRHJhZ2dhYmxlO1xuXHRcdHRoaXMuX21ha2VUaXRsZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIHRpdGxlIGVsZW1lbnQgYW5kIGVsZW1lbnRzIGJlbG9uZyB0byB0aXRsZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VUaXRsZTogZnVuY3Rpb24oKSB7XG5cblx0XHR0aGlzLiR0aXRsZUVsZW1lbnQgPSAkKHRoaXMudGl0bGVIVE1MKTtcblx0XHR0aGlzLiR0aXRsZUVsZW1lbnQuaHRtbCh0aGlzLnRpdGxlKTtcblxuXHRcdGlmICh0aGlzLmlzRHJhZ2dhYmxlKSB7XG5cdFx0XHR0aGlzLl9tYWtlRHJhZ0J1dHRvbih0aGlzLm1vdmVCdXR0b25IVE1MKTtcblx0XHR9XG5cblx0XHR0aGlzLiRjb250ZW50LmJlZm9yZSh0aGlzLiR0aXRsZUVsZW1lbnQpO1xuXHRcdHRoaXMuX21ha2VUb2dnbGVCdXR0b24odGhpcy50b2dnbGVCdXR0b25IVE1MKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBtYXJrdXAgd2l0aCB0ZW1wbGF0ZVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBBIGl0ZW0gZWxlbWVudCBodG1sXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjaGFuZ2UgaHRtbCBzdHJpbmdcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRIdG1sOiBmdW5jdGlvbihodG1sLCBtYXApIHtcblx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9cXHtcXHsoW15cXH1dKylcXH1cXH0vZywgZnVuY3Rpb24obXN0ciwgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG1hcFtuYW1lXTtcblx0XHR9KTtcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBkcmFnIGJ1dHRvbiBpbiB0aXRsZVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBidXR0b24gaHRtbFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VEcmFnQnV0dG9uOiBmdW5jdGlvbihodG1sKSB7XG5cdFx0aHRtbCA9IHRoaXMuX2dldEh0bWwoaHRtbCwge1xuXHRcdFx0J2l0ZW0taWQnOiAnaXRlbV9pZF8nICsgdGhpcy5jb250ZW50SWRcblx0XHR9KTtcblx0XHR0aGlzLiR0aXRsZUVsZW1lbnQuYXBwZW5kKCQoaHRtbCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIFRvZ2dsZSBidXR0b24gaW4gdGl0bGVcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRvZ2dsZUhUTUxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlVG9nZ2xlQnV0dG9uOiBmdW5jdGlvbih0b2dnbGVIVE1MKSB7XG5cdFx0dGhpcy4kdG9nZ2xlQnV0dG9uID0gJCh0b2dnbGVIVE1MKTtcblx0XHR0aGlzLiR0aXRsZUVsZW1lbnQuYXBwZW5kKHRoaXMuJHRvZ2dsZUJ1dHRvbik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsb3NlIGl0ZW0gZWxlbWVudFxuXHQgKi9cblx0Y2xvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJHRvZ2dsZUJ1dHRvbi5hZGRDbGFzcyhcIm9wZW5cIik7XG5cdFx0dGhpcy4kY29udGVudC5oaWRlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE9wZW4gaXRlbSBlbGVtZW50XG5cdCAqL1xuXHRvcGVuOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiR0b2dnbGVCdXR0b24ucmVtb3ZlQ2xhc3MoXCJvcGVuXCIpO1xuXHRcdHRoaXMuJGNvbnRlbnQuc2hvdygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBGaXggdGl0bGUgdG8gZG8gbm90IGhpZGUuIEFmdGVyIGZpeFRpdGxlIGNhbGxlZCwgaGlkZVRpdGxlIGRvIG5vdCB3b3JrLlxuXHQgKi9cblx0Zml4VGl0bGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2hvd1RpdGxlKCk7XG5cdFx0dGhpcy5pc1RpdGxlRml4ID0gdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogU2hvdyB0aXRsZVxuXHQgKi9cblx0c2hvd1RpdGxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiR0aXRsZUVsZW1lbnQuc2hvdygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIaWRlIHRpdGxlXG5cdCAqL1xuXHRoaWRlVGl0bGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc1RpdGxlRml4KSB7XG5cdFx0XHR0aGlzLiR0aXRsZUVsZW1lbnQuaGlkZSgpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVG9nZ2xlIG9wZW4vY2xvc2Vcblx0ICovXG5cdHRvZ2dsZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHRoaXMuJHRvZ2dsZUJ1dHRvbi5oYXNDbGFzcygnb3BlbicpKSB7XG5cdFx0XHR0aGlzLm9wZW4oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU2V0IGFsbCBldmVudCBhYm91dCBpdGVtXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiR0b2dnbGVCdXR0b24ub24oJ2NsaWNrJywgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtO1xuIiwiLyoqXG4qIEBmaWxlb3ZlcnZpZXcgTGF5b3V0IGNvbXBvbmVudFxuKiBAZGVwZW5kZW5jeSBjb2RlLXNuaXBwZXQuanMganF1ZXJ5LjEuOC4zXG4qIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiovXG5cbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG52YXIgR3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwJyk7XG52YXIgR3VpZGUgPSByZXF1aXJlKCcuL2d1aWRlJyk7XG5cbi8qKlxuICogTGF5b3V0IGNsYXNzIG1ha2UgbGF5b3V0IGVsZW1lbnQoSlF1ZXJ5T2JqZWN0KSBhbmQgaW5jbHVkZSBncm91cHMsIGNvbnRyb2wgaXRlbSBtb3ZlIGFuZCBzZXQgZXZlbnRzLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpXG4gKiBAcGFyYW0ge29iamVjdH0gb3BpdG9uc1xuICogXHRAcGFyYW0ge2FycmF5fSBvcHRpb25zLmdyb3VwbGlzdCBUaGUgbGlzdCBvZiBncm91cCBvcHRpb25zXG4gKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnRcbiAqL1xudmFyIExheW91dCA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBMYXlvdXQucHJvdG90eXBlICove1xuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBsYXlvdXRcblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uKG9waXRvbnMsICRlbGVtZW50KSB7XG5cdFx0dGhpcy4kZWxlbWVudCA9ICRlbGVtZW50O1xuXHRcdHRoaXMuX21ha2VHcm91cChvcGl0b25zLmdyb3VwbGlzdCk7XG5cdFx0dGhpcy5fbWFrZUd1aWRlKG9waXRvbnMuZ3VpZGVIVE1MKTtcblx0XHR0aGlzLl9zZXRFdmVudHMoKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBncm91cFxuXHQgKiBAcGFyYW0ge2FycmF5fSBncm91cGxpc3QgVGhlIGxpc3Qgb2YgZ3JvdXAgb3B0aW9uc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VHcm91cDogZnVuY3Rpb24oZ3JvdXBsaXN0KSB7XG5cdFx0dmFyIGdyb3VwO1xuXHRcdHRoaXMuZ3JvdXBzID0ge307XG5cblx0XHR0dWkudXRpbC5mb3JFYWNoKGdyb3VwbGlzdCwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0Z3JvdXAgPSB0aGlzLmdyb3Vwc1tpdGVtLmlkXSA9IG5ldyBHcm91cChpdGVtKTtcblx0XHRcdHRoaXMuJGVsZW1lbnQuYXBwZW5kKGdyb3VwLiRlbGVtZW50KTtcblx0XHR9LCB0aGlzKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IGdyb3VwIGl0ZW1cblx0ICogQHBhcmFtIHsoc3RyaW5nfG9iamVjdCl9IGdyb3VwIFRoZSBpdGVtIElEIG9yIGluZm9ybWF0aW9uIHRvIGZpbmQgZ3JvdXBcblx0ICogQHJldHVybnMgeyp9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0R3JvdXA6IGZ1bmN0aW9uKGdyb3VwKSB7XG5cdFx0aWYgKHR1aS51dGlsLmlzT2JqZWN0KGdyb3VwKSkge1xuXHRcdFx0aWYgKGdyb3VwLmF0dHIoJ2RhdGEtZ3JvdXAnKSkge1xuXHRcdFx0XHRncm91cCA9IGdyb3VwLmF0dHIoJ2RhdGEtZ3JvdXAnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdyb3VwID0gZ3JvdXAucGFyZW50KCkuYXR0cignZGF0YS1ncm91cCcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5ncm91cHNbZ3JvdXBdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGd1aWRlIG9iamVjdFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2d1aWRlSFRNTF0gZ3VpZGUgVGhlIGh0bWwgd2lsbCBiZSB1c2RlZCB0byBtYWtlIGd1aWRlIGVsZW1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlR3VpZGU6IGZ1bmN0aW9uKGd1aWRlSFRNTCkge1xuXHRcdHRoaXMuX2d1aWRlID0gbmV3IEd1aWRlKHtcblx0XHRcdGd1aWRlSFRNTDogZ3VpZGVIVE1MXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCBFdmVudHNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub25Nb3VzZURvd24gPSAkLnByb3h5KHRoaXMuX29uTW91c2VEb3duLCB0aGlzKTtcblx0XHR0aGlzLm9uTW91c2VNb3ZlID0gJC5wcm94eSh0aGlzLl9vbk1vdXNlTW92ZSwgdGhpcyk7XG5cdFx0dGhpcy5vbk1vdXNlVXAgPSAkLnByb3h5KHRoaXMuX29uTW91c2VVcCwgdGhpcyk7XG5cdFx0JCgnLmRyYWctaXRlbS1tb3ZlJykub24oJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGV2ZW50IGhhbmRsZXJcblx0ICogQHBhcmFtIGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9vbk1vdXNlRG93bjogZnVuY3Rpb24oZSkge1xuXHRcdHZhciAkZG9jID0gJChkb2N1bWVudCk7XG5cdFx0dGhpcy5oZWlnaHQoJGRvYy5oZWlnaHQoKSk7XG5cdFx0dGhpcy5fc2V0R3VpZGUoZS50YXJnZXQsIGUuY2xpZW50WCwgZS5jbGllbnRZKTtcblx0XHQkZG9jLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblx0XHQkZG9jLm9uKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgZ3VpZGVcblx0ICogQHBhcmFtIHtvYmplY3R9IHRhcmdldCBUaGUgdGFyZ2V0IHRvIHNldCBndWlkZSdzIG1vdmUtc3RhdGVtZW50IGVsZW1lbnRcblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvaW50WCBUaGUgcG9zaXRpb24geCB0byBzZXQgZ3VpZGUgZWxlbWVudCBsZWZ0LlxuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRZIFRoZSBwb3NpdGlvbiB5IHRvIHNldCBndWlkZSBlbGVtZW50IHRvcC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZXRHdWlkZTogZnVuY3Rpb24odGFyZ2V0LCBwb2ludFgsIHBvaW50WSkge1xuXHRcdHZhciAkZG9jID0gJChkb2N1bWVudCksXG5cdFx0XHRpbml0UG9zID0ge1xuXHRcdFx0XHR4OiBwb2ludFggKyAkZG9jLnNjcm9sbExlZnQoKSArIDEwLFxuXHRcdFx0XHR5OiBwb2ludFkgKyAkZG9jLnNjcm9sbFRvcCgpICsgMTBcblx0XHRcdH0sXG5cdFx0XHRpdGVtSWQgPSAkKHRhcmdldCkuYXR0cignZGF0YS1pdGVtJyksXG5cdFx0XHQkbW92ZUVsID0gJCgnIycgKyBpdGVtSWQpO1xuXG5cdFx0dGhpcy5fZ3VpZGUucmVhZHkoaW5pdFBvcywgJG1vdmVFbCk7XG5cdFx0dGhpcy5fZ3VpZGUuc2V0TW92ZUVsZW1lbnQoJG1vdmVFbCk7XG5cdFx0dGhpcy4kdGVtcCA9ICRtb3ZlRWw7XG5cdFx0dGhpcy5fbG9ja1RlbXAoKTtcblx0fSxcblxuXHQvKipcblx0ICogSXQgbWFrZSBpdGVtIGVsZW1lbnQgc2VlbXMgdG8gYmUgbG9ja2VkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2xvY2tUZW1wOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZ3JvdXAgPSB0aGlzLl9nZXRHcm91cCh0aGlzLiR0ZW1wKSxcblx0XHRcdGl0ZW0gPSBncm91cC5saXN0W3RoaXMuJHRlbXAuYXR0cignZGF0YS1pbmRleCcpXTtcblx0XHR0aGlzLiR0ZW1wLmNzcygnb3BhY2l0eScsICcwLjInKTtcblx0XHR0aGlzLiR0ZW1wLmZpbmQoJyMnICsgaXRlbS5jb250ZW50SWQpLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblx0fSxcblxuXHQvKipcblx0ICogSXQgbWFrZSBpdGVtIGVsZW1lbnQgc2VlbXMgdG8gYmUgdW5sb2NrZWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdW5sb2NrVGVtcDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGdyb3VwID0gdGhpcy5fZ2V0R3JvdXAodGhpcy4kdGVtcCksXG5cdFx0XHRpdGVtID0gZ3JvdXAubGlzdFt0aGlzLiR0ZW1wLmF0dHIoJ2RhdGEtaW5kZXgnKV07XG5cdFx0dGhpcy4kdGVtcC5jc3MoJ29wYWNpdHknLCAnMScpO1xuXHRcdHRoaXMuJHRlbXAuZmluZCgnIycgKyBpdGVtLmNvbnRlbnRJZCkuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcblx0fSxcblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBoYW5kbGVyXG5cdCAqIEBwYXJhbSB7SnF1ZXJ5RXZlbnR9IGUgSnF1ZXJ5RXZlbnQgb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfb25Nb3VzZU1vdmU6IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgcGFyZW50LCAkZG9jLCBwb2ludFgsIHBvaW50WSwgZ3JvdXA7XG5cblx0XHRwYXJlbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKTtcblx0XHQkZG9jID0gJChkb2N1bWVudCk7XG5cdFx0cG9pbnRYID0gZS5jbGllbnRYICsgJGRvYy5zY3JvbGxMZWZ0KCk7XG5cdFx0cG9pbnRZID0gZS5jbGllbnRZICsgJGRvYy5zY3JvbGxUb3AoKTtcblx0XHRncm91cCA9IHBhcmVudC5hdHRyKCdkYXRhLWdyb3VwJyk7XG5cblx0XHR0aGlzLl9zZXRTY3JvbGxTdGF0ZShwb2ludFgsIHBvaW50WSk7XG5cdFx0dGhpcy5fbW92ZUd1aWRlKHBvaW50WCwgcG9pbnRZKTtcblxuXHRcdGlmIChncm91cCkge1xuXHRcdFx0dGhpcy5fZGV0ZWN0TW92ZShwYXJlbnQsIHBvaW50WCwgcG9pbnRZKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIElmIGVsZW1lbnQgbW92ZSBvdmVyIGFyZWEsIHNjcm9sbCBtb3ZlIHRvIHNob3cgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldFNjcm9sbFN0YXRlOiBmdW5jdGlvbih4LCB5KSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdCR3aW4gPSAkKHdpbmRvdyksXG5cdFx0XHRkb2NIZWlnaHQgPSB0aGlzLmhlaWdodCgpLFxuXHRcdFx0aGVpZ2h0ID0gJHdpbi5oZWlnaHQoKSxcblx0XHRcdHRvcCA9ICRkb2Muc2Nyb2xsVG9wKCksXG5cdFx0XHRsaW1pdCA9IGRvY0hlaWdodCAtIGhlaWdodDtcblxuXHRcdGlmIChoZWlnaHQgKyB0b3AgPCB5KSB7XG5cdFx0XHQkZG9jLnNjcm9sbFRvcChNYXRoLm1pbih0b3AgKyAoeSAtIGhlaWdodCArIHRvcCksIGxpbWl0KSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTYXZlIGRvY3VtZW50IGhlaWdodCBvciByZXR1cm4gaGVpZ2h0XG4gICAgICogQGFwaVxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gVGhlIGhlaWdodCB2YWx1ZSB0byBzYXZlIF9oZWlnaHQgZmVpbGRcblx0ICovXG5cdGhlaWdodDogZnVuY3Rpb24oaGVpZ2h0KSB7XG5cdFx0aWYgKHR1aS51dGlsLmlzVW5kZWZpbmVkKGhlaWdodCkpIHtcblx0XHRcdHJldHVybiB0aGlzLl9oZWlnaHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBEZXRlY3QgbW92ZSB3aXRoIGdyb3VwXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIGNvbXBhcmUgcG9zaXRpb24gd2l0aFxuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRYIFRoZSBwb3NpdGlvbiB4IHdpbGwgYmUgZGV0ZWN0IHdoaWNoIGVsZW1lbnQgc2VsZWN0ZWQuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFkgVGhlIHBvc2l0aW9uIHkgd2lsbCBiZSBkZXRlY3Qgd2hpY2ggZWxlbWVudCBzZWxlY3RlZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9kZXRlY3RNb3ZlOiBmdW5jdGlvbihpdGVtLCBwb2ludFgsIHBvaW50WSkge1xuXHRcdHZhciAkZG9jID0gJChkb2N1bWVudCksXG5cdFx0XHRncm91cEluc3QgPSB0aGlzLl9nZXRHcm91cChpdGVtKSxcblx0XHRcdGdyb3VwID0gaXRlbS5hdHRyKCdkYXRhLWdyb3VwJyksXG5cdFx0XHQkYmVmb3JlLFxuXHRcdFx0dG9wID0gJGRvYy5zY3JvbGxUb3AoKSxcblx0XHRcdGxlZnQgPSAkZG9jLnNjcm9sbExlZnQoKTtcblxuXHRcdGlmICh0dWkudXRpbC5pc0VtcHR5KGdyb3VwSW5zdC5saXN0KSkge1xuXHRcdFx0aXRlbS5hcHBlbmQodGhpcy4kdGVtcCk7XG5cdFx0XHR0aGlzLmhlaWdodCgkZG9jLmhlaWdodCgpKTtcblx0XHRcdHRoaXMuJHRlbXAud2F5ID0gJ2FmdGVyJztcblx0XHRcdHRoaXMuJHRlbXAuaW5kZXggPSAwO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkYmVmb3JlID0gdGhpcy5fZGV0ZWN0VGFyZ2V0QnlQb3NpdGlvbih7XG5cdFx0XHRcdHg6IHBvaW50WCArIGxlZnQsXG5cdFx0XHRcdHk6IHBvaW50WSArIHRvcFxuXHRcdFx0fSwgZ3JvdXBJbnN0KTtcblxuXHRcdFx0aWYgKCRiZWZvcmUgJiYgJGJlZm9yZS53YXkpIHtcblx0XHRcdFx0JGJlZm9yZVskYmVmb3JlLndheV0odGhpcy4kdGVtcCk7XG5cdFx0XHRcdHRoaXMuaGVpZ2h0KCRkb2MuaGVpZ2h0KCkpO1xuXHRcdFx0XHR0aGlzLiR0ZW1wLndheSA9ICRiZWZvcmUud2F5O1xuXHRcdFx0XHR0aGlzLiR0ZW1wLmluZGV4ID0gJGJlZm9yZS5hdHRyKCdkYXRhLWluZGV4Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNb3ZlIGhlbHBlciBvYmplY3Rcblx0ICogQHBhcmFtIHtudW1iZXJ9IHggbW92ZSBwb3NpdGlvbiB4XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSB5IG1vdmUgcG9zaXRpb24geVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21vdmVHdWlkZTogZnVuY3Rpb24oeCwgeSkge1xuXHRcdHRoaXMuX2d1aWRlLm1vdmVUbyh7XG5cdFx0XHR4OiB4ICsgMTAgKyAncHgnLFxuXHRcdFx0eTogeSArIDEwICsgJ3B4J1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZXRlY3QgdGFyZ2V0IGJ5IG1vdmUgZWxlbWVudCBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gcG9zIFRoZSBwb3NpdGlvbiB0byBkZXRlY3Rcblx0ICogQHBhcmFtIHtvYmplY3R9IGdyb3VwIFRoZSBncm91cCB0aGF0IGhhcyBjaGlsZCBpdGVtc1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfCp9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZGV0ZWN0VGFyZ2V0QnlQb3NpdGlvbjogZnVuY3Rpb24ocG9zLCBncm91cCkge1xuXHRcdHZhciB0YXJnZXQ7XG5cblx0XHR0dWkudXRpbC5mb3JFYWNoKGdyb3VwLmxpc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdGlmICghdGhpcy5faXNWYWxpZEl0ZW0oaXRlbSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dGFyZ2V0ID0gdGhpcy5fZ2V0VGFyZ2V0KGl0ZW0sIHBvcywgZ3JvdXApIHx8IHRhcmdldDtcblx0XHR9LCB0aGlzKTtcblxuXHRcdHJldHVybiB0YXJnZXQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0YXJnZXQgZWxlbWVudFxuXHQgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBUaGUgaXRlbSB0byBjb21wYXJlIHdpdGggcG9zXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgVGhlIHBvcyB0byBmaWd1cmUgd2hldGhlciB0YXJnZXQgb3Igbm90XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBncm91cCBUaGUgZ3JvdXAgaGFzIGl0ZW1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYXJnZXQ6IGZ1bmN0aW9uKGl0ZW0sIHBvcywgZ3JvdXApIHtcblx0XHR2YXIgYm91bmQgPSBpdGVtLiRlbGVtZW50Lm9mZnNldCgpLFxuXHRcdFx0Ym90dG9tID0gdGhpcy5fZ2V0Qm90dG9tKGl0ZW0sIGdyb3VwKSxcblx0XHRcdGhlaWdodCA9IGl0ZW0uJGVsZW1lbnQuaGVpZ2h0KCksXG5cdFx0XHR0b3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKSArIGJvdW5kLnRvcCxcblx0XHRcdCR0YXJnZXQ7XG5cdFx0aWYgKHBvcy55ID4gdG9wICYmIHBvcy55IDw9IHRvcCArIChoZWlnaHQgLyAyKSkge1xuXHRcdFx0JHRhcmdldCA9IGl0ZW0uJGVsZW1lbnQ7XG5cdFx0XHQkdGFyZ2V0LndheSA9ICdiZWZvcmUnO1xuXHRcdH0gZWxzZSBpZiAocG9zLnkgPiB0b3AgKyAoaGVpZ2h0IC8gMikgJiYgcG9zLnkgPCBib3R0b20pIHtcblx0XHRcdCR0YXJnZXQgPSBpdGVtLiRlbGVtZW50O1xuXHRcdFx0JHRhcmdldC53YXkgPSAnYWZ0ZXInO1xuXHRcdH1cblxuXHRcdHJldHVybiAkdGFyZ2V0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIFZhaWxkIGl0ZW0gb3Igbm90XG5cdCAqIEBwYXJhbSB7cGFyYW19IGl0ZW0gVGhlIGl0ZW0gVG8gYmUgY29tcGFyZWQgd2l0aCB0ZW1wLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9pc1ZhbGlkSXRlbTogZnVuY3Rpb24oaXRlbSkge1xuXHRcdHJldHVybiAoaXRlbS4kZWxlbWVudFswXSAhPT0gdGhpcy4kdGVtcFswXSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIElmIG5leHQgZWxlbWVudCBleGlzdCwgc2V0IGJvdHRvbSBuZXh0IGVsZW1lbnQncyB0b3AgcG9zaXRpb24sIGVsc2Ugc2V0IGJvdHRvbSBsaW1pdChncm91cCBlbGVtZW50J3MgYm90dG9tIHBvc2l0aW9uKSBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBUaGUgb2JqZWN0IHRvIGZpZ3VyZSBib3R0b20gcG9zaXRpb25cblx0ICogQHBhcmFtIHtvYmplY3R9IGdyb3VwIFRoZSBncm91cCB0byBmaWd1cmUgYm90dG9tIHBvc2l0aW9uXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEJvdHRvbTogZnVuY3Rpb24oaXRlbSwgZ3JvdXApIHtcblx0XHR2YXIgJG5leHQgPSBpdGVtLiRlbGVtZW50Lm5leHQoKSxcblx0XHRcdGJvdHRvbSxcblx0XHRcdCRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGdib3VuZCA9IGdyb3VwLiRlbGVtZW50Lm9mZnNldCgpLFxuXHRcdFx0bGltaXQgPSAkZG9jLnNjcm9sbFRvcCgpICsgZ2JvdW5kLnRvcCArIGdyb3VwLiRlbGVtZW50LmhlaWdodCgpO1xuXHRcdGlmICgkbmV4dC5oYXNDbGFzcyhzdGF0aWNzLkRJTU1FRF9MQVlFUl9DTEFTUykpIHtcblx0XHRcdGJvdHRvbSA9IGxpbWl0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRib3R0b20gPSAkZG9jLnNjcm9sbFRvcCgpICsgJG5leHQub2Zmc2V0KCkudG9wO1xuXHRcdH1cblx0XHRyZXR1cm4gYm90dG9tO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgYWRkIGluZGV4IGJ5ICR0ZW1wLCAkdGVtcC53YXlcblx0ICogQHJldHVybnMge051bWJlcn1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRBZGRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRlbXAgPSB0aGlzLiR0ZW1wLFxuXHRcdFx0aW5kZXggPSBwYXJzZUludCh0ZW1wLmluZGV4LCAxMCk7XG5cdFx0aWYgKHRlbXAud2F5ID09PSAnYWZ0ZXInKSB7XG5cdFx0XHRpbmRleCArPSAxO1xuXHRcdH1cblx0XHRyZXR1cm4gaW5kZXg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGhhbmRsZXJcblx0ICogQHBhcmFtIHtKcXVlcnlFdmVudH0gZSBBIGV2ZW50IG9iamVjdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X29uTW91c2VVcDogZnVuY3Rpb24oZSkge1xuXHRcdHZhciBkcmFnID0gdGhpcy5fZ3VpZGUsXG5cdFx0XHQkZG9jID0gJChkb2N1bWVudCksXG5cdFx0XHRncm91cCA9IHRoaXMuX2dldEdyb3VwKHRoaXMuJHRlbXAuYXR0cignZGF0YS1ncm91cEluZm8nKSksXG5cdFx0XHQkdGFyZ2V0ID0gdGhpcy5fZGV0ZWN0VGFyZ2V0QnlQb3NpdGlvbih7XG5cdFx0XHRcdHg6IGUuY2xpZW50WCArICRkb2Muc2Nyb2xsTGVmdCgpLFxuXHRcdFx0XHR5OiBlLmNsaWVudFkgKyAkZG9jLnNjcm9sbFRvcCgpXG5cdFx0XHR9LCBncm91cCk7XG5cblx0XHR0aGlzLl91cGRhdGUoKTtcblx0XHR0aGlzLl91bmxvY2tUZW1wKCk7XG5cdFx0ZHJhZy5maW5pc2goKTtcblxuXHRcdCRkb2Mub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblx0XHQkZG9jLm9mZignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIGdyb3Vwc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3VwZGF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRlbXAgPSB0aGlzLiR0ZW1wLFxuXHRcdFx0b2xkR3JvdXAgPSB0aGlzLl9nZXRHcm91cCh0ZW1wLmF0dHIoJ2RhdGEtZ3JvdXBJbmZvJykpLFxuXHRcdFx0dGFyZ2V0R3JvdXAgPSB0aGlzLl9nZXRHcm91cCh0ZW1wLnBhcmVudCgpKSxcblx0XHRcdHJlbW92ZUluZGV4ID0gcGFyc2VJbnQodGVtcC5hdHRyKCdkYXRhLWluZGV4JyksIDEwKSxcblx0XHRcdGFkZEluZGV4ID0gdGhpcy5fZ2V0QWRkSW5kZXgoKSxcblx0XHRcdGl0ZW0gPSBvbGRHcm91cC5saXN0W3JlbW92ZUluZGV4XTtcblxuXHRcdGlmICghaXNOYU4oYWRkSW5kZXgpKSB7XG5cdFx0XHRvbGRHcm91cC5zdG9yZVBvb2woKTtcblx0XHRcdHRhcmdldEdyb3VwLnN0b3JlUG9vbCgpO1xuXHRcdFx0b2xkR3JvdXAucmVtb3ZlKHJlbW92ZUluZGV4KTtcblx0XHRcdHRhcmdldEdyb3VwLmFkZChpdGVtLCBhZGRJbmRleCk7XG5cdFx0XHR0YXJnZXRHcm91cC5yZW5kZXIoKTtcblx0XHRcdG9sZEdyb3VwLnJlbmRlcigpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSBzdGF0aWMgdmFsdWVzXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIGRldiB0ZWFtLjxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEhUTUwgOiB7XG5cdFx0TU9WRUJVVFRPTjogJzxidXR0b24gY2xhc3M9XCJtb3ZlLWJ1dHRvbiBkcmFnLWl0ZW0tbW92ZVwiIGRhdGEtaXRlbT1cInt7aXRlbS1pZH19XCI+bW92ZTwvYnV0dG9uPicsXG5cdFx0RUxFTUVOVDogJzxkaXYgY2xhc3M9XCJpdGVtXCIgZGF0YS1pbmRleD1cInt7bnVtYmVyfX1cIj48ZGl2IGNsYXNzPVwie3t3cmFwcGVyfX1cIj48L2Rpdj48L2Rpdj4nLFxuXHRcdFRJVExFOiAnPGRpdiBjbGFzcz1cInRpdGxlXCI+PC9kaXY+Jyxcblx0XHRUT0dHTEVCVVRUT046ICc8YnV0dG9uIGNsYXNzPVwidG9nZ2xlLWJ1dHRvblwiPnRvZ2dsZTwvYnV0dG9uPicsXG5cdFx0R1JPVVAgOiAnPGRpdiBjbGFzcz1cImdyb3VwIGdwX3t7Z3JvdXAtaWR9fVwiIGRhdGEtZ3JvdXA9XCJ7e2dyb3VwLWlkfX1cIj48L2Rpdj4nLFxuXHRcdEdVSURFOiAnPGRpdiBjbGFzcz1cIml0ZW0tZ3VpZGVcIj48L2Rpdj4nXG5cdH0sXG5cdFRFWFQgOiB7XG5cdFx0REVGQVVMVF9USVRMRTogJ25vIHRpdGxlJ1xuXHR9LFxuXHRFUlJPUiA6IHtcblx0XHRPUFRJT05TX05PVF9ERUZJTkVEIDogJ29wdGlvbnMgYXJlIG5vdCBkZWZpbmVkJ1xuXHR9LFxuXHRERUZBVUxUX1dSUFBFUl9DTEFTUyA6ICdpdGVtLWJvZHknLFxuXHRESU1NRURfTEFZRVJfQ0xBU1MgOiAnZGltbWVkLWxheWVyJ1xufTtcbiJdfQ==
