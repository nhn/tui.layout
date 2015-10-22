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
 */
var Layout = tui.util.defineClass(/**@lends Layout.prototype */{
	/**
	 * Initialize layout
	 * @param {object} opitons
	 * 	@param {array} options.grouplist The list of group options
	 * @param {JQueryObject} $element
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9ncm91cC5qcyIsInNyYy9ndWlkZS5qcyIsInNyYy9pdGVtLmpzIiwic3JjL2xheW91dC5qcyIsInNyYy9zdGF0aWNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LkxheW91dCcsIHJlcXVpcmUoJy4vc3JjL2xheW91dCcpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBsYXlvdXQgZ3JvdXAuIGdyb3VwIGluY2x1ZGUgaXRlbS5cbiAqIEBkZXBlbmRlbmN5IGNvZGUtc25pcHBldCwganF1ZXJ5MS44LjMsIGxheW91dC5qc1xuICogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbSBKZWluIFlpKGplaW4ueWlAbmhuZW50LmNvbSlcbiAqL1xuXG52YXIgc3RhdGljcyA9IHJlcXVpcmUoJy4vc3RhdGljcycpO1xudmFyIEl0ZW0gPSByZXF1aXJlKCcuL2l0ZW0nKTtcblxuLyoqXG4gKiBUaGUgZ3JvdXAgY2xhc3MgbWFrZSBsaXN0IG9mIGl0ZW0gYW5kIGdyb3VwIGVsZW1lbnQoalF1ZXJ5T2JqZWN0KS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgR3JvdXAgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgR3JvdXAucHJvdG90eXBlICove1xuXHQvKipcblx0ICogRWxlbWVudCBwb29sXG5cdCAqL1xuXHQkcG9vbDogJCgnPGRpdiBjbGFzcz1cInBvb2xcIiBzdHlsZT1cImRpc3BsYXk6bm9uZVwiPjwvZGl2PicpLFxuXHQvKipcblx0ICogSW5pdGFpbGl6ZSBkZWZhdWx0IG1lbWJlciBmaWVsZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuXHQgKiBcdEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmlkXG5cdCAqXHRAcGFyYW0ge2FycmF5fSBvcHRpb25zLml0ZW1zIGFycmF5IG9mIGl0ZW1zXG5cdCAqIFx0QHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmh0bWxdIGh0bWwgb2YgZ3JvdXAgZWxlbWVudFxuXHQgKiBcdEBwYXJhbSB7KG51bWJlcnxzdHJpbmcpfSBbb3B0aW9ucy5yYXRpb10gcmF0aW9cblx0ICovXG5cdGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihzdGF0aWNzLkVSUk9SLk9QVElPTlNfTk9UX0RFRklORUQpO1xuXHRcdH1cblxuXHRcdHRoaXMuc2l6ZSA9IG9wdGlvbnMucmF0aW8gKyAnJSc7XG5cdFx0dGhpcy5pZCA9IG9wdGlvbnMuaWQ7XG5cblx0XHR0aGlzLl9tYWtlRWxlbWVudChvcHRpb25zLmh0bWwgfHwgc3RhdGljcy5IVE1MLkdST1VQKTtcblx0XHR0aGlzLl9tYWtlSXRlbXMob3B0aW9ucy5pdGVtcyk7XG5cdFx0dGhpcy5fYXBwZW5kRGltbWVkKCk7XG5cblx0XHR0aGlzLnJlbmRlcigpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGdyb3VwIGVsZW1lbnQoSnF1ZXJ5T2JqZWN0KVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBUaGUgaHRtbCBzdHJpbmcgdG8gY3JlYXRlIHRoZSBodG1sIGVsZW1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlRWxlbWVudDogZnVuY3Rpb24oaHRtbCkge1xuXHRcdGh0bWwgPSB0aGlzLl9nZXRIdG1sKGh0bWwsIHtcblx0XHRcdCdncm91cC1pZCc6IHRoaXMuaWRcblx0XHR9KTtcblxuXHRcdHRoaXMuJGVsZW1lbnQgPSAkKGh0bWwpO1xuXHRcdHRoaXMuJGVsZW1lbnQuY3NzKHtcblx0XHRcdCdwb3NpdGlvbic6ICdyZWxhdGl2ZScsXG5cdFx0XHQnd2lkdGgnOiB0aGlzLnNpemVcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBtYXJrdXAgd2l0aCB0ZW1wbGF0ZVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBBIGl0ZW0gZWxlbWVudCBodG1sXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjaGFuZ2UgaHRtbCBzdHJpbmdcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRIdG1sOiBmdW5jdGlvbihodG1sLCBtYXApIHtcblx0XHRodG1sID0gaHRtbC5yZXBsYWNlKC9cXHtcXHsoW15cXH1dKylcXH1cXH0vZywgZnVuY3Rpb24obXN0ciwgbmFtZSkge1xuXHRcdFx0cmV0dXJuIG1hcFtuYW1lXTtcblx0XHR9KTtcblx0XHRyZXR1cm4gaHRtbDtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBsaXN0IG9mIGl0ZW0gYnkgaXRlbXNcblx0ICogQHBhcmFtIHthcnJheX0gbGlzdCBUaGUgbGlzdCBvZiBpdGVtJ3MgSURzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZUl0ZW1zOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB7XG5cdFx0XHRncm91cEluZm86IHRoaXMuaWRcblx0XHR9O1xuXHRcdHRoaXMubGlzdCA9IHR1aS51dGlsLm1hcChsaXN0LCBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHR0dWkudXRpbC5leHRlbmQoaXRlbSwgb3B0aW9ucyk7XG5cdFx0XHRyZXR1cm4gbmV3IEl0ZW0oaXRlbSk7XG5cdFx0fSwgdGhpcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgZGltbWVkIGVsZW1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlRGltbWVkOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRkaW1tZWQgPSAkKCc8ZGl2IGNsYXNzPVwiJyArIHN0YXRpY3MuRElNTUVEX0xBWUVSX0NMQVNTICsgJ1wiPjwvZGl2PicpO1xuXHRcdHRoaXMuJGRpbW1lZC5jc3Moe1xuXHRcdFx0cG9zaXRpb246ICdhYnNvbHV0ZScsXG5cdFx0XHRsZWZ0OiAwLFxuXHRcdFx0dG9wOiAwLCBcblx0XHRcdGJvdHRvbTogMCxcblx0XHRcdHJpZ2h0OiAwLFxuXHRcdFx0ZGlzcGxheTogJ25vbmUnXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFwcGVuZCBkaW1tZWQgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2FwcGVuZERpbW1lZDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLiRkaW1tZWQpIHtcblx0XHRcdHRoaXMuX21ha2VEaW1tZWQoKTtcblx0XHR9XG5cdFx0dGhpcy4kZWxlbWVudC5hcHBlbmQodGhpcy4kZGltbWVkKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVtb3ZlIGl0ZW0gYnkgaW5kZXhcblx0ICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IFRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byByZW1vdmVcblx0ICoqL1xuXHRyZW1vdmU6IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0dGhpcy5zdG9yZVBvb2wodGhpcy5saXN0W2luZGV4XSk7XG5cdFx0dGhpcy5saXN0LnNwbGljZShpbmRleCwgMSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBpdGVtIHRvIGl0ZW0gbGlzdFxuXHQgKiBAcGFyYW0ge29iamVjdH0gaXRlbSBpdGVtIG9iamVjdFxuXHQgKiBAcGFyYW0ge251bWJlcn0gW2luZGV4XSBhZGQgVGhlIGluZGV4IG9mIHRoZSBpdGVtIHRvIGFkZFxuXHQgKi9cblx0YWRkOiBmdW5jdGlvbihpdGVtLCBpbmRleCkge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0dGhpcy5saXN0LnNwbGljZShpbmRleCwgMCwgaXRlbSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubGlzdC5wdXNoKGl0ZW0pO1xuXHRcdH1cblx0XHRpdGVtLmdyb3VwSW5mbyA9IHRoaXMuaWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlYXJyYW5nZSBncm91cCBpdGVtc1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR0dWkudXRpbC5mb3JFYWNoKHRoaXMubGlzdCwgZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcblx0XHRcdHRoaXMuJGRpbW1lZC5iZWZvcmUoaXRlbS4kZWxlbWVudCk7XG5cdFx0XHRpdGVtLmluZGV4ID0gaW5kZXg7XG5cdFx0XHRpdGVtLiRlbGVtZW50LmF0dHIoe1xuXHRcdFx0XHQnZGF0YS1pbmRleCcgOiBpbmRleCxcblx0XHRcdFx0J2RhdGEtZ3JvdXBJbmZvJzogdGhpcy5pZFxuXHRcdFx0fSk7XG5cdFx0fSwgdGhpcyk7XG5cdFx0dGhpcy4kZGltbWVkLmhpZGUoKTtcblx0fSxcblxuXHQvKipcblx0ICogU3RvcmUgaXRlbXMgdG8gcG9vbFxuXHQgKiBAcGFyYW0ge29iamVjdH0gJGVsZW1lbnQgQSBKUXVlcnkgZWxlbWVudCB0byBzdG9yZSBpbiB0aGUgcG9vbFxuXHQgKi9cblx0c3RvcmVQb29sOiBmdW5jdGlvbigkZWxlbWVudCkge1xuXHRcdGlmICgkZWxlbWVudCkge1xuXHRcdFx0dGhpcy4kcG9vbC5hcHBlbmQoJGVsZW1lbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0dWkudXRpbC5mb3JFYWNoKHRoaXMubGlzdCwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHR0aGlzLiRwb29sLmFwcGVuZChpdGVtLiRlbGVtZW50KTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JvdXA7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGF5b3V0IGhlbHBlciBvYmplY3QuIEd1aWRlIG1vdXNlIG1vdmUtc3RhdGVtZW50IHRvIGtub3cgd2hhdCBpcyBkcmFnZ2VkIHdlbGwuXG4gKiBAZGVwZW5kZW5jeSBjb2RlLXNuaXBwZXQsIGpxdWVyeTEuOC4zLCBsYXlvdXQuanNcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xudmFyIHN0YXRpY3MgPSByZXF1aXJlKCcuL3N0YXRpY3MnKTtcbi8qKlxuICogR3VpZGUgY2xhc3MgbWFrZSBoZWxwZXIgZWxlbWVudCBhbmQgbW92ZSBoZWxwZXIgZWxlbWVudCBieSBwb3NpdGlvbi5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgR3VpZGUgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgR3VpZGUucHJvdG90eXBlICove1xuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBndWlkZSBvYmplY3Qgd2l0aCBvcHRpb25zXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cblx0ICogXHRAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZ3VpZGVIVE1MXSBndWlkZSBUaGUgaHRtbCB3aWxsIGJlIGd1aWRlIGVsZW1lbnQuXG5cdCAqL1xuXHRpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dGhpcy4kZWxlbWVudCA9ICQob3B0aW9ucy5ndWlkZUhUTUwgfHwgc3RhdGljcy5IVE1MLkdVSURFKTtcblx0XHR0aGlzLiRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKTtcblx0XHR0aGlzLiRlbGVtZW50LmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpO1xuXHRcdHRoaXMuJGRpbUVsZW1lbnRzID0gJCgnLicgKyAgc3RhdGljcy5ESU1NRURfTEFZRVJfQ0xBU1MpO1xuXHRcdHRoaXMuaGlkZSgpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNob3cgZWFjaCBkaW1tZWQgbGF5ZXJcblx0ICogQHBhcmFtIHtvYmplY3R9IHBvcyBUaGUgcG9zaXRpb24gdG8gaW5pdGlhbGl6ZSBndWlkZSBlbGVtZW50XG5cdCAqIEBwYXJhbSB7alF1ZXJPYmplY3R9ICRlbGVtZW50IFRoZSBoZWxwZXIgZWxlbWVudFxuXHQgKiovXG5cdHJlYWR5OiBmdW5jdGlvbihwb3MsICRlbGVtZW50KSB7XG5cdFx0dGhpcy5zZXRQb3MocG9zKTtcblx0XHR0aGlzLiRkaW1FbGVtZW50cy5zaG93KCk7XG5cblx0XHRpZiAoJGVsZW1lbnQpIHtcblx0XHRcdHRoaXMuc2V0Q29udGVudCgkZWxlbWVudCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kZWxlbWVudC5zaG93KCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogSGlkZSBlYWNoIGRpbW1lZCBsYXllclxuXHQgKiovXG5cdGZpbmlzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZGltRWxlbWVudHMuaGlkZSgpO1xuXHRcdHRoaXMuJGVsZW1lbnQuaGlkZSgpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIE1vdmUgdG8gcG9zaXRpb25cblx0ICogQHBhcmFtIHtvYmplY3R9IHBvcyBUaGUgcG9zaXRpb24gdG8gbW92ZVxuXHQgKi9cblx0bW92ZVRvOiBmdW5jdGlvbihwb3MpIHtcblx0XHR0aGlzLnNldFBvcyhwb3MpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNldCBQb3MgZm9yIG1vdmVcblx0ICogQHBhcmFtIHtvYmplY3R9IHBvcyAgVGhlIHBvc2l0aW9uIHRvIG1vdmVcblx0ICovXG5cdHNldFBvczogZnVuY3Rpb24ocG9zKSB7XG5cdFx0dGhpcy4kZWxlbWVudC5jc3Moe1xuXHRcdFx0bGVmdDogcG9zLngsXHRcblx0XHRcdHRvcDogcG9zLnlcblx0XHR9KTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTZXQgZ3VpZGUgY29udGVudFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gJGNvbnRlbnQgVGhlIGNvbnRlbnQgb2JqZWN0IHRvIGNvcHkgYW5kIGFwcGVuZCB0byBndWlkZSBlbGVtZW50LlxuXHQgKi9cblx0c2V0Q29udGVudDogZnVuY3Rpb24oJGNvbnRlbnQpIHtcblx0XHR0aGlzLiRlbGVtZW50LmVtcHR5KCk7XG5cdFx0dGhpcy4kZWxlbWVudC5hcHBlbmQoJGNvbnRlbnQuY2xvbmUoKSk7XG5cdFx0dGhpcy4kZWxlbWVudC5jc3Moe1xuXHRcdFx0d2lkdGg6ICRjb250ZW50LndpZHRoKCkgKyAncHgnLFxuXHRcdFx0aGVpZ2h0OiAkY29udGVudC5oZWlnaHQoKSArICdweCdcblx0XHR9KVxuXHR9LFxuXHRcblx0LyoqXG5cdCAqIFNob3cgZWxlbWVudFxuXHQgKi9cblx0c2hvdzogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLmlzRGlzYWJsZSkge1xuXHRcdFx0dGhpcy4kZWxlbWVudC5zaG93KCk7XG5cdFx0fVxuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEhpZGUgZWxlbWVudFxuXHQgKi9cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWxlbWVudC5oaWRlKCk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogRGlzYWJsZSBndWlkZVxuXHQgKi9cblx0ZGlzYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pc0Rpc2FibGUgPSB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBFbmFibGUgZ3VpZGVcblx0ICovXG5cdGVuYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5pc0Rpc2FibGUgPSBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0IG1vdmUgdGFyZ2V0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSAkZWwgVGhlIGVsZW1lbnQgaXMgbW92aW5nIGluIGxheW91dC5cblx0ICovXG5cdHNldE1vdmVFbGVtZW50OiBmdW5jdGlvbigkZWwpIHtcblx0XHR0aGlzLiRtb3ZlRWxlbWVudCA9ICRlbDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHNjb2xsIGxlZnRcblx0ICogQHJldHVybnMge051bWJlcn1cblx0ICovXG5cdGdldFNjcm9sbExlZnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAod2luZG93LnNjcm9sbFggfHwgJCh3aW5kb3cpLnNjcm9sbExlZnQoKSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBzY3JvbGwgdG9wXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9XG5cdCAqL1xuXHRnZXRTY3JvbGxUb3A6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAod2luZG93LnNjcm9sbFkgfHwgJCh3aW5kb3cpLnNjcm9sbFRvcCgpKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpZGU7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgbGF5b3V0IGl0ZW0uIGNvbnRhaW4gb3JpZ2luYWwgaXRlbXMuXG4gKiBAZGVwZW5kZW5jeSBjb2RlLXNuaXBwZXQsIGpxdWVyeTEuOC4zLCBsYXlvdXQuanNcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW08ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG5cbi8qKlxuICogSXRlbSBjbGFzcyBpcyBtYW5hZ2UgaXRlbSBzdGF0ZSBhbmQgdGl0bGUuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIEl0ZW0gPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIEl0ZW0ucHJvdG90eXBlICove1xuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBtZWVtYmVyIGZpbGVkIGFuZCBzdGF0ZVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuXHQgKiBcdEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmdyb3VwSW5mbyBncm91cCB0aGF0IGhhcyBpdGVtIG5hbWVcblx0ICogXHRAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5jb250ZW50SWQgY29udGVudCBlbGVtZW50IGlkXG5cdCAqIFx0QHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzQ2xvc2UgY29udGVudCBjbG9zZSBvciBub3Rcblx0ICogXHRAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbnMuaXNEcmFnZ2FibGUgZHJhZyBoZWxwZXIgZWxlbWVudCB1c2Ugb3Igbm90XG5cdCAqIFx0QHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMuaW5kZXggaW5kZXggb2YgY29udGVudCBpbiBncm91cFxuXHQgKiAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm1vdmVCdXR0b25IVE1MXSBtb3ZlIGJ1dHRvbiBIVE1MXG5cdCAqICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZWxlbWVudEhUTUxdIGl0ZW0gZWxlbWVudCBIVE1MXG5cdCAqICBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudGl0bGVIVE1MXSBpdGVtIHRpdGxlIGVsZW1lbnQgSFRNTFxuXHQgKi9cblx0aW5pdCA6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuXHRcdGlmICghb3B0aW9ucykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKHN0YXRpY3MuRVJST1IuT1BUSU9OU19OT1RfREVGSU5FRCk7XG5cdFx0fVxuXG5cdFx0Ly8gaHRtbCBzZXRcblx0XHR0dWkudXRpbC5leHRlbmQob3B0aW9ucywge1xuXHRcdFx0ZWxlbWVudEhUTUw6IG9wdGlvbnMuZWxlbWVudEhUTUwgfHwgc3RhdGljcy5IVE1MLkVMRU1FTlQsXG5cdFx0XHRtb3ZlQnV0dG9uSFRNTDogb3B0aW9ucy5tb3ZlQnV0dG9uSFRNTCB8fCBzdGF0aWNzLkhUTUwuTU9WRUJVVFRPTixcblx0XHRcdHRpdGxlSFRNTDogb3B0aW9ucy50aXRsZUhUTUwgfHwgc3RhdGljcy5IVE1MLlRJVExFLFxuXHRcdFx0dG9nZ2xlQnV0dG9uSFRNTDogb3B0aW9ucy50b2dnbGVCdXR0b25IVE1MIHx8IHN0YXRpY3MuSFRNTC5UT0dHTEVCVVRUT04sXG5cdFx0XHR0aXRsZTogb3B0aW9ucy50aXRsZSB8fCBzdGF0aWNzLlRFWFQuREVGQVVMVF9USVRMRVxuXHRcdH0pO1xuXHRcdHR1aS51dGlsLmV4dGVuZCh0aGlzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuX21ha2VFbGVtZW50KCk7XG5cdFx0XG5cdFx0Ly8gdGl0bGUgdXNlZCwgYW5kIGZpeCB0aXRsZSAobm8gaGlkZSlcblx0XHRpZiAoIXR1aS51dGlsLmlzQm9vbGVhbih0aGlzLmlzQ2xvc2UpKSB7XG5cdFx0XHR0aGlzLmZpeFRpdGxlKCk7XG5cdFx0fVxuXHRcblx0XHQvLyBjbG9zZSBib2R5KEkgZG9uJ3QgbGlrZSB0aGlzIGNvZGUsIGFyZSB0aGVyZSBhbnkgd2F5cyB0byBmaXggaXQuKVxuXHRcdGlmICh0aGlzLmlzQ2xvc2UpIHtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vcGVuKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kY29udGVudC5hcHBlbmQoJCgnIycgKyB0aGlzLmNvbnRlbnRJZCkpO1xuXHRcdHRoaXMuJGVsZW1lbnQuYXR0cignaWQnLCAnaXRlbV9pZF8nICsgdGhpcy5jb250ZW50SWQpO1xuXHRcdHRoaXMuX3NldEV2ZW50cygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgSW5kZXhcblx0ICovXG5cdGdldEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5pbmRleDtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBpdGVtIHJvb3QgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VFbGVtZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgd3JhcHBlckNsYXNzID0gdGhpcy53cmFwcGVyQ2xhc3MgfHwgc3RhdGljcy5ERUZBVUxUX1dSUFBFUl9DTEFTUyxcblx0XHRcdGVsZW1lbnRIVE1MID0gdGhpcy5fZ2V0SHRtbCh0aGlzLmVsZW1lbnRIVE1MLCB7XG5cdFx0XHRcdG51bWJlciA6IHRoaXMuaW5kZXgsXG5cdFx0XHRcdHdyYXBwZXI6IHdyYXBwZXJDbGFzc1xuXHRcdFx0fSk7XG5cblx0XHR0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50SFRNTCk7XG5cdFx0dGhpcy4kZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG5cdFx0dGhpcy4kY29udGVudCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLicgKyB3cmFwcGVyQ2xhc3MpO1xuXG5cdFx0dGhpcy5pc0RyYWdnYWJsZSA9ICEhdGhpcy5pc0RyYWdnYWJsZTtcblx0XHR0aGlzLl9tYWtlVGl0bGUoKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSB0aXRsZSBlbGVtZW50IGFuZCBlbGVtZW50cyBiZWxvbmcgdG8gdGl0bGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlVGl0bGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dGhpcy4kdGl0bGVFbGVtZW50ID0gJCh0aGlzLnRpdGxlSFRNTCk7XG5cdFx0dGhpcy4kdGl0bGVFbGVtZW50Lmh0bWwodGhpcy50aXRsZSk7XG5cblx0XHRpZiAodGhpcy5pc0RyYWdnYWJsZSkge1xuXHRcdFx0dGhpcy5fbWFrZURyYWdCdXR0b24odGhpcy5tb3ZlQnV0dG9uSFRNTCk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kY29udGVudC5iZWZvcmUodGhpcy4kdGl0bGVFbGVtZW50KTtcblx0XHR0aGlzLl9tYWtlVG9nZ2xlQnV0dG9uKHRoaXMudG9nZ2xlQnV0dG9uSFRNTCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgbWFya3VwIHdpdGggdGVtcGxhdGVcblx0ICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBpdGVtIGVsZW1lbnQgaHRtbFxuXHQgKiBAcGFyYW0ge29iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2hhbmdlIGh0bWwgc3RyaW5nXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0SHRtbDogZnVuY3Rpb24oaHRtbCwgbWFwKSB7XG5cdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXFx7XFx7KFteXFx9XSspXFx9XFx9L2csIGZ1bmN0aW9uKG1zdHIsIG5hbWUpIHtcblx0XHRcdHJldHVybiBtYXBbbmFtZV07XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgZHJhZyBidXR0b24gaW4gdGl0bGVcblx0ICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgYnV0dG9uIGh0bWxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlRHJhZ0J1dHRvbjogZnVuY3Rpb24oaHRtbCkge1xuXHRcdGh0bWwgPSB0aGlzLl9nZXRIdG1sKGh0bWwsIHtcblx0XHRcdCdpdGVtLWlkJzogJ2l0ZW1faWRfJyArIHRoaXMuY29udGVudElkXG5cdFx0fSk7XG5cdFx0dGhpcy4kdGl0bGVFbGVtZW50LmFwcGVuZCgkKGh0bWwpKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBUb2dnbGUgYnV0dG9uIGluIHRpdGxlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0b2dnbGVIVE1MXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZVRvZ2dsZUJ1dHRvbjogZnVuY3Rpb24odG9nZ2xlSFRNTCkge1xuXHRcdHRoaXMuJHRvZ2dsZUJ1dHRvbiA9ICQodG9nZ2xlSFRNTCk7XG5cdFx0dGhpcy4kdGl0bGVFbGVtZW50LmFwcGVuZCh0aGlzLiR0b2dnbGVCdXR0b24pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDbG9zZSBpdGVtIGVsZW1lbnRcblx0ICovXG5cdGNsb3NlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiR0b2dnbGVCdXR0b24uYWRkQ2xhc3MoXCJvcGVuXCIpO1xuXHRcdHRoaXMuJGNvbnRlbnQuaGlkZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBPcGVuIGl0ZW0gZWxlbWVudFxuXHQgKi9cblx0b3BlbjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kdG9nZ2xlQnV0dG9uLnJlbW92ZUNsYXNzKFwib3BlblwiKTtcblx0XHR0aGlzLiRjb250ZW50LnNob3coKTtcblx0fSxcblxuXHQvKipcblx0ICogRml4IHRpdGxlIHRvIGRvIG5vdCBoaWRlLiBBZnRlciBmaXhUaXRsZSBjYWxsZWQsIGhpZGVUaXRsZSBkbyBub3Qgd29yay5cblx0ICovXG5cdGZpeFRpdGxlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNob3dUaXRsZSgpO1xuXHRcdHRoaXMuaXNUaXRsZUZpeCA9IHRydWU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNob3cgdGl0bGVcblx0ICovXG5cdHNob3dUaXRsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kdGl0bGVFbGVtZW50LnNob3coKTtcblx0fSxcblxuXHQvKipcblx0ICogSGlkZSB0aXRsZVxuXHQgKi9cblx0aGlkZVRpdGxlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIXRoaXMuaXNUaXRsZUZpeCkge1xuXHRcdFx0dGhpcy4kdGl0bGVFbGVtZW50LmhpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBvcGVuL2Nsb3NlXG5cdCAqL1xuXHR0b2dnbGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICh0aGlzLiR0b2dnbGVCdXR0b24uaGFzQ2xhc3MoJ29wZW4nKSkge1xuXHRcdFx0dGhpcy5vcGVuKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCBhbGwgZXZlbnQgYWJvdXQgaXRlbVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kdG9nZ2xlQnV0dG9uLm9uKCdjbGljaycsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbTtcbiIsIi8qKlxuKiBAZmlsZW92ZXJ2aWV3IExheW91dCBjb21wb25lbnRcbiogQGRlcGVuZGVuY3kgY29kZS1zbmlwcGV0LmpzIGpxdWVyeS4xLjguM1xuKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtLjxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4qL1xuXG52YXIgc3RhdGljcyA9IHJlcXVpcmUoJy4vc3RhdGljcycpO1xudmFyIEdyb3VwID0gcmVxdWlyZSgnLi9ncm91cCcpO1xudmFyIEd1aWRlID0gcmVxdWlyZSgnLi9ndWlkZScpO1xuXG4vKipcbiAqIExheW91dCBjbGFzcyBtYWtlIGxheW91dCBlbGVtZW50KEpRdWVyeU9iamVjdCkgYW5kIGluY2x1ZGUgZ3JvdXBzLCBjb250cm9sIGl0ZW0gbW92ZSBhbmQgc2V0IGV2ZW50cy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgTGF5b3V0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIExheW91dC5wcm90b3R5cGUgKi97XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIGxheW91dFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb3BpdG9uc1xuXHQgKiBcdEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMuZ3JvdXBsaXN0IFRoZSBsaXN0IG9mIGdyb3VwIG9wdGlvbnNcblx0ICogQHBhcmFtIHtKUXVlcnlPYmplY3R9ICRlbGVtZW50XG5cdCAqL1xuXHRpbml0OiBmdW5jdGlvbihvcGl0b25zLCAkZWxlbWVudCkge1xuXHRcdHRoaXMuJGVsZW1lbnQgPSAkZWxlbWVudDtcblx0XHR0aGlzLl9tYWtlR3JvdXAob3BpdG9ucy5ncm91cGxpc3QpO1xuXHRcdHRoaXMuX21ha2VHdWlkZShvcGl0b25zLmd1aWRlSFRNTCk7XG5cdFx0dGhpcy5fc2V0RXZlbnRzKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgZ3JvdXBcblx0ICogQHBhcmFtIHthcnJheX0gZ3JvdXBsaXN0IFRoZSBsaXN0IG9mIGdyb3VwIG9wdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlR3JvdXA6IGZ1bmN0aW9uKGdyb3VwbGlzdCkge1xuXHRcdHZhciBncm91cDtcblx0XHR0aGlzLmdyb3VwcyA9IHt9O1xuXG5cdFx0dHVpLnV0aWwuZm9yRWFjaChncm91cGxpc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdGdyb3VwID0gdGhpcy5ncm91cHNbaXRlbS5pZF0gPSBuZXcgR3JvdXAoaXRlbSk7XG5cdFx0XHR0aGlzLiRlbGVtZW50LmFwcGVuZChncm91cC4kZWxlbWVudCk7XG5cdFx0fSwgdGhpcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBncm91cCBpdGVtXG5cdCAqIEBwYXJhbSB7KHN0cmluZ3xvYmplY3QpfSBncm91cCBUaGUgaXRlbSBJRCBvciBpbmZvcm1hdGlvbiB0byBmaW5kIGdyb3VwXG5cdCAqIEByZXR1cm5zIHsqfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEdyb3VwOiBmdW5jdGlvbihncm91cCkge1xuXHRcdGlmICh0dWkudXRpbC5pc09iamVjdChncm91cCkpIHtcblx0XHRcdGlmIChncm91cC5hdHRyKCdkYXRhLWdyb3VwJykpIHtcblx0XHRcdFx0Z3JvdXAgPSBncm91cC5hdHRyKCdkYXRhLWdyb3VwJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRncm91cCA9IGdyb3VwLnBhcmVudCgpLmF0dHIoJ2RhdGEtZ3JvdXAnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ3JvdXBzW2dyb3VwXTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBndWlkZSBvYmplY3Rcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtndWlkZUhUTUxdIGd1aWRlIFRoZSBodG1sIHdpbGwgYmUgdXNkZWQgdG8gbWFrZSBndWlkZSBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZUd1aWRlOiBmdW5jdGlvbihndWlkZUhUTUwpIHtcblx0XHR0aGlzLl9ndWlkZSA9IG5ldyBHdWlkZSh7XG5cdFx0XHRndWlkZUhUTUw6IGd1aWRlSFRNTFxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgRXZlbnRzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0RXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uTW91c2VEb3duID0gJC5wcm94eSh0aGlzLl9vbk1vdXNlRG93biwgdGhpcyk7XG5cdFx0dGhpcy5vbk1vdXNlTW92ZSA9ICQucHJveHkodGhpcy5fb25Nb3VzZU1vdmUsIHRoaXMpO1xuXHRcdHRoaXMub25Nb3VzZVVwID0gJC5wcm94eSh0aGlzLl9vbk1vdXNlVXAsIHRoaXMpO1xuXHRcdCQoJy5kcmFnLWl0ZW0tbW92ZScpLm9uKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2VEb3duKTtcblx0fSxcblxuXHQvKipcblx0ICogTW91c2UgZG93biBldmVudCBoYW5kbGVyXG5cdCAqIEBwYXJhbSBlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfb25Nb3VzZURvd246IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIgJGRvYyA9ICQoZG9jdW1lbnQpO1xuXHRcdHRoaXMuaGVpZ2h0KCRkb2MuaGVpZ2h0KCkpO1xuXHRcdHRoaXMuX3NldEd1aWRlKGUudGFyZ2V0LCBlLmNsaWVudFgsIGUuY2xpZW50WSk7XG5cdFx0JGRvYy5vbignbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG5cdFx0JGRvYy5vbignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwKTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0IGd1aWRlXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCB0byBzZXQgZ3VpZGUncyBtb3ZlLXN0YXRlbWVudCBlbGVtZW50XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFggVGhlIHBvc2l0aW9uIHggdG8gc2V0IGd1aWRlIGVsZW1lbnQgbGVmdC5cblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvaW50WSBUaGUgcG9zaXRpb24geSB0byBzZXQgZ3VpZGUgZWxlbWVudCB0b3AuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0R3VpZGU6IGZ1bmN0aW9uKHRhcmdldCwgcG9pbnRYLCBwb2ludFkpIHtcblx0XHR2YXIgJGRvYyA9ICQoZG9jdW1lbnQpLFxuXHRcdFx0aW5pdFBvcyA9IHtcblx0XHRcdFx0eDogcG9pbnRYICsgJGRvYy5zY3JvbGxMZWZ0KCkgKyAxMCxcblx0XHRcdFx0eTogcG9pbnRZICsgJGRvYy5zY3JvbGxUb3AoKSArIDEwXG5cdFx0XHR9LFxuXHRcdFx0aXRlbUlkID0gJCh0YXJnZXQpLmF0dHIoJ2RhdGEtaXRlbScpLFxuXHRcdFx0JG1vdmVFbCA9ICQoJyMnICsgaXRlbUlkKTtcblxuXHRcdHRoaXMuX2d1aWRlLnJlYWR5KGluaXRQb3MsICRtb3ZlRWwpO1xuXHRcdHRoaXMuX2d1aWRlLnNldE1vdmVFbGVtZW50KCRtb3ZlRWwpO1xuXHRcdHRoaXMuJHRlbXAgPSAkbW92ZUVsO1xuXHRcdHRoaXMuX2xvY2tUZW1wKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEl0IG1ha2UgaXRlbSBlbGVtZW50IHNlZW1zIHRvIGJlIGxvY2tlZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9sb2NrVGVtcDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGdyb3VwID0gdGhpcy5fZ2V0R3JvdXAodGhpcy4kdGVtcCksXG5cdFx0XHRpdGVtID0gZ3JvdXAubGlzdFt0aGlzLiR0ZW1wLmF0dHIoJ2RhdGEtaW5kZXgnKV07XG5cdFx0dGhpcy4kdGVtcC5jc3MoJ29wYWNpdHknLCAnMC4yJyk7XG5cdFx0dGhpcy4kdGVtcC5maW5kKCcjJyArIGl0ZW0uY29udGVudElkKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEl0IG1ha2UgaXRlbSBlbGVtZW50IHNlZW1zIHRvIGJlIHVubG9ja2VkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3VubG9ja1RlbXA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBncm91cCA9IHRoaXMuX2dldEdyb3VwKHRoaXMuJHRlbXApLFxuXHRcdFx0aXRlbSA9IGdyb3VwLmxpc3RbdGhpcy4kdGVtcC5hdHRyKCdkYXRhLWluZGV4JyldO1xuXHRcdHRoaXMuJHRlbXAuY3NzKCdvcGFjaXR5JywgJzEnKTtcblx0XHR0aGlzLiR0ZW1wLmZpbmQoJyMnICsgaXRlbS5jb250ZW50SWQpLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1vdXNlIG1vdmUgaGFuZGxlclxuXHQgKiBAcGFyYW0ge0pxdWVyeUV2ZW50fSBlIEpxdWVyeUV2ZW50IG9iamVjdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X29uTW91c2VNb3ZlOiBmdW5jdGlvbihlKSB7XG5cblx0XHR2YXIgcGFyZW50LCAkZG9jLCBwb2ludFgsIHBvaW50WSwgZ3JvdXA7XG5cblx0XHRwYXJlbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnQoKTtcblx0XHQkZG9jID0gJChkb2N1bWVudCk7XG5cdFx0cG9pbnRYID0gZS5jbGllbnRYICsgJGRvYy5zY3JvbGxMZWZ0KCk7XG5cdFx0cG9pbnRZID0gZS5jbGllbnRZICsgJGRvYy5zY3JvbGxUb3AoKTtcblx0XHRncm91cCA9IHBhcmVudC5hdHRyKCdkYXRhLWdyb3VwJyk7XG5cblx0XHR0aGlzLl9zZXRTY3JvbGxTdGF0ZShwb2ludFgsIHBvaW50WSk7XG5cdFx0dGhpcy5fbW92ZUd1aWRlKHBvaW50WCwgcG9pbnRZKTtcblxuXHRcdGlmIChncm91cCkge1xuXHRcdFx0dGhpcy5fZGV0ZWN0TW92ZShwYXJlbnQsIHBvaW50WCwgcG9pbnRZKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIElmIGVsZW1lbnQgbW92ZSBvdmVyIGFyZWEsIHNjcm9sbCBtb3ZlIHRvIHNob3cgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldFNjcm9sbFN0YXRlOiBmdW5jdGlvbih4LCB5KSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdCR3aW4gPSAkKHdpbmRvdyksXG5cdFx0XHRkb2NIZWlnaHQgPSB0aGlzLmhlaWdodCgpLFxuXHRcdFx0aGVpZ2h0ID0gJHdpbi5oZWlnaHQoKSxcblx0XHRcdHRvcCA9ICRkb2Muc2Nyb2xsVG9wKCksXG5cdFx0XHRsaW1pdCA9IGRvY0hlaWdodCAtIGhlaWdodDtcblxuXHRcdGlmIChoZWlnaHQgKyB0b3AgPCB5KSB7XG5cdFx0XHQkZG9jLnNjcm9sbFRvcChNYXRoLm1pbih0b3AgKyAoeSAtIGhlaWdodCArIHRvcCksIGxpbWl0KSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTYXZlIGRvY3VtZW50IGhlaWdodCBvciByZXR1cm4gaGVpZ2h0XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBUaGUgaGVpZ2h0IHZhbHVlIHRvIHNhdmUgX2hlaWdodCBmZWlsZFxuXHQgKi9cblx0aGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQpIHtcblx0XHRpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQoaGVpZ2h0KSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2hlaWdodDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIERldGVjdCBtb3ZlIHdpdGggZ3JvdXBcblx0ICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gY29tcGFyZSBwb3NpdGlvbiB3aXRoXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFggVGhlIHBvc2l0aW9uIHggd2lsbCBiZSBkZXRlY3Qgd2hpY2ggZWxlbWVudCBzZWxlY3RlZC5cblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvaW50WSBUaGUgcG9zaXRpb24geSB3aWxsIGJlIGRldGVjdCB3aGljaCBlbGVtZW50IHNlbGVjdGVkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2RldGVjdE1vdmU6IGZ1bmN0aW9uKGl0ZW0sIHBvaW50WCwgcG9pbnRZKSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGdyb3VwSW5zdCA9IHRoaXMuX2dldEdyb3VwKGl0ZW0pLFxuXHRcdFx0Z3JvdXAgPSBpdGVtLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcblx0XHRcdCRiZWZvcmUsXG5cdFx0XHR0b3AgPSAkZG9jLnNjcm9sbFRvcCgpLFxuXHRcdFx0bGVmdCA9ICRkb2Muc2Nyb2xsTGVmdCgpO1xuXG5cdFx0aWYgKHR1aS51dGlsLmlzRW1wdHkoZ3JvdXBJbnN0Lmxpc3QpKSB7XG5cdFx0XHRpdGVtLmFwcGVuZCh0aGlzLiR0ZW1wKTtcblx0XHRcdHRoaXMuaGVpZ2h0KCRkb2MuaGVpZ2h0KCkpO1xuXHRcdFx0dGhpcy4kdGVtcC53YXkgPSAnYWZ0ZXInO1xuXHRcdFx0dGhpcy4kdGVtcC5pbmRleCA9IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRiZWZvcmUgPSB0aGlzLl9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uKHtcblx0XHRcdFx0eDogcG9pbnRYICsgbGVmdCxcblx0XHRcdFx0eTogcG9pbnRZICsgdG9wXG5cdFx0XHR9LCBncm91cEluc3QpO1xuXG5cdFx0XHRpZiAoJGJlZm9yZSAmJiAkYmVmb3JlLndheSkge1xuXHRcdFx0XHQkYmVmb3JlWyRiZWZvcmUud2F5XSh0aGlzLiR0ZW1wKTtcblx0XHRcdFx0dGhpcy5oZWlnaHQoJGRvYy5oZWlnaHQoKSk7XG5cdFx0XHRcdHRoaXMuJHRlbXAud2F5ID0gJGJlZm9yZS53YXk7XG5cdFx0XHRcdHRoaXMuJHRlbXAuaW5kZXggPSAkYmVmb3JlLmF0dHIoJ2RhdGEtaW5kZXgnKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1vdmUgaGVscGVyIG9iamVjdFxuXHQgKiBAcGFyYW0ge251bWJlcn0geCBtb3ZlIHBvc2l0aW9uIHhcblx0ICogQHBhcmFtIHtudW1iZXJ9IHkgbW92ZSBwb3NpdGlvbiB5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbW92ZUd1aWRlOiBmdW5jdGlvbih4LCB5KSB7XG5cdFx0dGhpcy5fZ3VpZGUubW92ZVRvKHtcblx0XHRcdHg6IHggKyAxMCArICdweCcsXG5cdFx0XHR5OiB5ICsgMTAgKyAncHgnXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVjdCB0YXJnZXQgYnkgbW92ZSBlbGVtZW50IHBvc2l0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgVGhlIHBvc2l0aW9uIHRvIGRldGVjdFxuXHQgKiBAcGFyYW0ge29iamVjdH0gZ3JvdXAgVGhlIGdyb3VwIHRoYXQgaGFzIGNoaWxkIGl0ZW1zXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd8Kn1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uOiBmdW5jdGlvbihwb3MsIGdyb3VwKSB7XG5cdFx0dmFyIHRhcmdldDtcblxuXHRcdHR1aS51dGlsLmZvckVhY2goZ3JvdXAubGlzdCwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0aWYgKCF0aGlzLl9pc1ZhbGlkSXRlbShpdGVtKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXJnZXQgPSB0aGlzLl9nZXRUYXJnZXQoaXRlbSwgcG9zLCBncm91cCkgfHwgdGFyZ2V0O1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRhcmdldCBlbGVtZW50XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIFRoZSBpdGVtIHRvIGNvbXBhcmUgd2l0aCBwb3Ncblx0ICogQHBhcmFtIHtvYmplY3R9IHBvcyBUaGUgcG9zIHRvIGZpZ3VyZSB3aGV0aGVyIHRhcmdldCBvciBub3Rcblx0ICogQHBhcmFtIHtvYmplY3R9IGdyb3VwIFRoZSBncm91cCBoYXMgaXRlbVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhcmdldDogZnVuY3Rpb24oaXRlbSwgcG9zLCBncm91cCkge1xuXHRcdHZhciBib3VuZCA9IGl0ZW0uJGVsZW1lbnQub2Zmc2V0KCksXG5cdFx0XHRib3R0b20gPSB0aGlzLl9nZXRCb3R0b20oaXRlbSwgZ3JvdXApLFxuXHRcdFx0aGVpZ2h0ID0gaXRlbS4kZWxlbWVudC5oZWlnaHQoKSxcblx0XHRcdHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpICsgYm91bmQudG9wLFxuXHRcdFx0JHRhcmdldDtcblx0XHRpZiAocG9zLnkgPiB0b3AgJiYgcG9zLnkgPD0gdG9wICsgKGhlaWdodCAvIDIpKSB7XG5cdFx0XHQkdGFyZ2V0ID0gaXRlbS4kZWxlbWVudDtcblx0XHRcdCR0YXJnZXQud2F5ID0gJ2JlZm9yZSc7XG5cdFx0fSBlbHNlIGlmIChwb3MueSA+IHRvcCArIChoZWlnaHQgLyAyKSAmJiBwb3MueSA8IGJvdHRvbSkge1xuXHRcdFx0JHRhcmdldCA9IGl0ZW0uJGVsZW1lbnQ7XG5cdFx0XHQkdGFyZ2V0LndheSA9ICdhZnRlcic7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICR0YXJnZXQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgVmFpbGQgaXRlbSBvciBub3Rcblx0ICogQHBhcmFtIHtwYXJhbX0gaXRlbSBUaGUgaXRlbSBUbyBiZSBjb21wYXJlZCB3aXRoIHRlbXAuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2lzVmFsaWRJdGVtOiBmdW5jdGlvbihpdGVtKSB7XG5cdFx0cmV0dXJuIChpdGVtLiRlbGVtZW50WzBdICE9PSB0aGlzLiR0ZW1wWzBdKTtcblx0fSxcblxuXHQvKipcblx0ICogSWYgbmV4dCBlbGVtZW50IGV4aXN0LCBzZXQgYm90dG9tIG5leHQgZWxlbWVudCdzIHRvcCBwb3NpdGlvbiwgZWxzZSBzZXQgYm90dG9tIGxpbWl0KGdyb3VwIGVsZW1lbnQncyBib3R0b20gcG9zaXRpb24pIHBvc2l0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIFRoZSBvYmplY3QgdG8gZmlndXJlIGJvdHRvbSBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gZ3JvdXAgVGhlIGdyb3VwIHRvIGZpZ3VyZSBib3R0b20gcG9zaXRpb25cblx0ICogQHJldHVybnMgeyp9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0Qm90dG9tOiBmdW5jdGlvbihpdGVtLCBncm91cCkge1xuXHRcdHZhciAkbmV4dCA9IGl0ZW0uJGVsZW1lbnQubmV4dCgpLFxuXHRcdFx0Ym90dG9tLFxuXHRcdFx0JGRvYyA9ICQoZG9jdW1lbnQpLFxuXHRcdFx0Z2JvdW5kID0gZ3JvdXAuJGVsZW1lbnQub2Zmc2V0KCksXG5cdFx0XHRsaW1pdCA9ICRkb2Muc2Nyb2xsVG9wKCkgKyBnYm91bmQudG9wICsgZ3JvdXAuJGVsZW1lbnQuaGVpZ2h0KCk7XG5cdFx0aWYgKCRuZXh0Lmhhc0NsYXNzKHN0YXRpY3MuRElNTUVEX0xBWUVSX0NMQVNTKSkge1xuXHRcdFx0Ym90dG9tID0gbGltaXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJvdHRvbSA9ICRkb2Muc2Nyb2xsVG9wKCkgKyAkbmV4dC5vZmZzZXQoKS50b3A7XG5cdFx0fVxuXHRcdHJldHVybiBib3R0b207XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBhZGQgaW5kZXggYnkgJHRlbXAsICR0ZW1wLndheVxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFkZEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGVtcCA9IHRoaXMuJHRlbXAsXG5cdFx0XHRpbmRleCA9IHBhcnNlSW50KHRlbXAuaW5kZXgsIDEwKTtcblx0XHRpZiAodGVtcC53YXkgPT09ICdhZnRlcicpIHtcblx0XHRcdGluZGV4ICs9IDE7XG5cdFx0fVxuXHRcdHJldHVybiBpbmRleDtcblx0fSxcblxuXHQvKipcblx0ICogTW91c2UgdXAgaGFuZGxlclxuXHQgKiBAcGFyYW0ge0pxdWVyeUV2ZW50fSBlIEEgZXZlbnQgb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfb25Nb3VzZVVwOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIGRyYWcgPSB0aGlzLl9ndWlkZSxcblx0XHRcdCRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGdyb3VwID0gdGhpcy5fZ2V0R3JvdXAodGhpcy4kdGVtcC5hdHRyKCdkYXRhLWdyb3VwSW5mbycpKSxcblx0XHRcdCR0YXJnZXQgPSB0aGlzLl9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uKHtcblx0XHRcdFx0eDogZS5jbGllbnRYICsgJGRvYy5zY3JvbGxMZWZ0KCksXG5cdFx0XHRcdHk6IGUuY2xpZW50WSArICRkb2Muc2Nyb2xsVG9wKClcblx0XHRcdH0sIGdyb3VwKTtcblxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xuXHRcdHRoaXMuX3VubG9ja1RlbXAoKTtcblx0XHRkcmFnLmZpbmlzaCgpO1xuXG5cdFx0JGRvYy5vZmYoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuXHRcdCRkb2Mub2ZmKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgZ3JvdXBzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGVtcCA9IHRoaXMuJHRlbXAsXG5cdFx0XHRvbGRHcm91cCA9IHRoaXMuX2dldEdyb3VwKHRlbXAuYXR0cignZGF0YS1ncm91cEluZm8nKSksXG5cdFx0XHR0YXJnZXRHcm91cCA9IHRoaXMuX2dldEdyb3VwKHRlbXAucGFyZW50KCkpLFxuXHRcdFx0cmVtb3ZlSW5kZXggPSBwYXJzZUludCh0ZW1wLmF0dHIoJ2RhdGEtaW5kZXgnKSwgMTApLFxuXHRcdFx0YWRkSW5kZXggPSB0aGlzLl9nZXRBZGRJbmRleCgpLFxuXHRcdFx0aXRlbSA9IG9sZEdyb3VwLmxpc3RbcmVtb3ZlSW5kZXhdO1xuXG5cdFx0aWYgKCFpc05hTihhZGRJbmRleCkpIHtcblx0XHRcdG9sZEdyb3VwLnN0b3JlUG9vbCgpO1xuXHRcdFx0dGFyZ2V0R3JvdXAuc3RvcmVQb29sKCk7XG5cdFx0XHRvbGRHcm91cC5yZW1vdmUocmVtb3ZlSW5kZXgpO1xuXHRcdFx0dGFyZ2V0R3JvdXAuYWRkKGl0ZW0sIGFkZEluZGV4KTtcblx0XHRcdHRhcmdldEdyb3VwLnJlbmRlcigpO1xuXHRcdFx0b2xkR3JvdXAucmVuZGVyKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHN0YXRpYyB2YWx1ZXNcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgSFRNTCA6IHtcblx0XHRNT1ZFQlVUVE9OOiAnPGJ1dHRvbiBjbGFzcz1cIm1vdmUtYnV0dG9uIGRyYWctaXRlbS1tb3ZlXCIgZGF0YS1pdGVtPVwie3tpdGVtLWlkfX1cIj5tb3ZlPC9idXR0b24+Jyxcblx0XHRFTEVNRU5UOiAnPGRpdiBjbGFzcz1cIml0ZW1cIiBkYXRhLWluZGV4PVwie3tudW1iZXJ9fVwiPjxkaXYgY2xhc3M9XCJ7e3dyYXBwZXJ9fVwiPjwvZGl2PjwvZGl2PicsXG5cdFx0VElUTEU6ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48L2Rpdj4nLFxuXHRcdFRPR0dMRUJVVFRPTjogJzxidXR0b24gY2xhc3M9XCJ0b2dnbGUtYnV0dG9uXCI+dG9nZ2xlPC9idXR0b24+Jyxcblx0XHRHUk9VUCA6ICc8ZGl2IGNsYXNzPVwiZ3JvdXAgZ3Bfe3tncm91cC1pZH19XCIgZGF0YS1ncm91cD1cInt7Z3JvdXAtaWR9fVwiPjwvZGl2PicsXG5cdFx0R1VJREU6ICc8ZGl2IGNsYXNzPVwiaXRlbS1ndWlkZVwiPjwvZGl2Pidcblx0fSxcblx0VEVYVCA6IHtcblx0XHRERUZBVUxUX1RJVExFOiAnbm8gdGl0bGUnXG5cdH0sXG5cdEVSUk9SIDoge1xuXHRcdE9QVElPTlNfTk9UX0RFRklORUQgOiAnb3B0aW9ucyBhcmUgbm90IGRlZmluZWQnXG5cdH0sXG5cdERFRkFVTFRfV1JQUEVSX0NMQVNTIDogJ2l0ZW0tYm9keScsXG5cdERJTU1FRF9MQVlFUl9DTEFTUyA6ICdkaW1tZWQtbGF5ZXInXG59O1xuIl19
