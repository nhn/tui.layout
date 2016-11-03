/**
 * component-layout
 * @author NHNEnt FE Development Team <dl_javascript@nhnent.com>
 * @version v1.0.0
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Layout = require('./src/layout');

tui.util.defineNamespace('tui.component', {
  Layout: Layout
});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9ncm91cC5qcyIsInNyYy9ndWlkZS5qcyIsInNyYy9pdGVtLmpzIiwic3JjL2xheW91dC5qcyIsInNyYy9zdGF0aWNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBMYXlvdXQgPSByZXF1aXJlKCcuL3NyYy9sYXlvdXQnKTtcblxudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50Jywge1xuICBMYXlvdXQ6IExheW91dFxufSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgbGF5b3V0IGdyb3VwLiBncm91cCBpbmNsdWRlIGl0ZW0uXG4gKiBAZGVwZW5kZW5jeSBjb2RlLXNuaXBwZXQsIGpxdWVyeTEuOC4zLCBsYXlvdXQuanNcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0gSmVpbiBZaShqZWluLnlpQG5obmVudC5jb20pXG4gKi9cblxudmFyIHN0YXRpY3MgPSByZXF1aXJlKCcuL3N0YXRpY3MnKTtcbnZhciBJdGVtID0gcmVxdWlyZSgnLi9pdGVtJyk7XG5cbi8qKlxuICogVGhlIGdyb3VwIGNsYXNzIG1ha2UgbGlzdCBvZiBpdGVtIGFuZCBncm91cCBlbGVtZW50KGpRdWVyeU9iamVjdCkuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIEdyb3VwID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIEdyb3VwLnByb3RvdHlwZSAqL3tcblx0LyoqXG5cdCAqIEVsZW1lbnQgcG9vbFxuXHQgKi9cblx0JHBvb2w6ICQoJzxkaXYgY2xhc3M9XCJwb29sXCIgc3R5bGU9XCJkaXNwbGF5Om5vbmVcIj48L2Rpdj4nKSxcblx0LyoqXG5cdCAqIEluaXRhaWxpemUgZGVmYXVsdCBtZW1iZXIgZmllbGRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0ICogXHRAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5pZFxuXHQgKlx0QHBhcmFtIHthcnJheX0gb3B0aW9ucy5pdGVtcyBhcnJheSBvZiBpdGVtc1xuXHQgKiBcdEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5odG1sXSBodG1sIG9mIGdyb3VwIGVsZW1lbnRcblx0ICogXHRAcGFyYW0geyhudW1iZXJ8c3RyaW5nKX0gW29wdGlvbnMucmF0aW9dIHJhdGlvXG5cdCAqL1xuXHRpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Ioc3RhdGljcy5FUlJPUi5PUFRJT05TX05PVF9ERUZJTkVEKTtcblx0XHR9XG5cblx0XHR0aGlzLnNpemUgPSBvcHRpb25zLnJhdGlvICsgJyUnO1xuXHRcdHRoaXMuaWQgPSBvcHRpb25zLmlkO1xuXG5cdFx0dGhpcy5fbWFrZUVsZW1lbnQob3B0aW9ucy5odG1sIHx8IHN0YXRpY3MuSFRNTC5HUk9VUCk7XG5cdFx0dGhpcy5fbWFrZUl0ZW1zKG9wdGlvbnMuaXRlbXMpO1xuXHRcdHRoaXMuX2FwcGVuZERpbW1lZCgpO1xuXG5cdFx0dGhpcy5yZW5kZXIoKTtcblx0fSxcblxuXHQvKipcblx0ICogTWFrZSBncm91cCBlbGVtZW50KEpxdWVyeU9iamVjdClcblx0ICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgVGhlIGh0bWwgc3RyaW5nIHRvIGNyZWF0ZSB0aGUgaHRtbCBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZUVsZW1lbnQ6IGZ1bmN0aW9uKGh0bWwpIHtcblx0XHRodG1sID0gdGhpcy5fZ2V0SHRtbChodG1sLCB7XG5cdFx0XHQnZ3JvdXAtaWQnOiB0aGlzLmlkXG5cdFx0fSk7XG5cblx0XHR0aGlzLiRlbGVtZW50ID0gJChodG1sKTtcblx0XHR0aGlzLiRlbGVtZW50LmNzcyh7XG5cdFx0XHQncG9zaXRpb24nOiAncmVsYXRpdmUnLFxuXHRcdFx0J3dpZHRoJzogdGhpcy5zaXplXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgbWFya3VwIHdpdGggdGVtcGxhdGVcblx0ICogQHBhcmFtIHtzdHJpbmd9IGh0bWwgQSBpdGVtIGVsZW1lbnQgaHRtbFxuXHQgKiBAcGFyYW0ge29iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2hhbmdlIGh0bWwgc3RyaW5nXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0SHRtbDogZnVuY3Rpb24oaHRtbCwgbWFwKSB7XG5cdFx0aHRtbCA9IGh0bWwucmVwbGFjZSgvXFx7XFx7KFteXFx9XSspXFx9XFx9L2csIGZ1bmN0aW9uKG1zdHIsIG5hbWUpIHtcblx0XHRcdHJldHVybiBtYXBbbmFtZV07XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGh0bWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgbGlzdCBvZiBpdGVtIGJ5IGl0ZW1zXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGxpc3QgVGhlIGxpc3Qgb2YgaXRlbSdzIElEc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VJdGVtczogZnVuY3Rpb24obGlzdCkge1xuXHRcdHZhciBvcHRpb25zID0ge1xuXHRcdFx0Z3JvdXBJbmZvOiB0aGlzLmlkXG5cdFx0fTtcblx0XHR0aGlzLmxpc3QgPSB0dWkudXRpbC5tYXAobGlzdCwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0dHVpLnV0aWwuZXh0ZW5kKGl0ZW0sIG9wdGlvbnMpO1xuXHRcdFx0cmV0dXJuIG5ldyBJdGVtKGl0ZW0pO1xuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGRpbW1lZCBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZURpbW1lZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZGltbWVkID0gJCgnPGRpdiBjbGFzcz1cIicgKyBzdGF0aWNzLkRJTU1FRF9MQVlFUl9DTEFTUyArICdcIj48L2Rpdj4nKTtcblx0XHR0aGlzLiRkaW1tZWQuY3NzKHtcblx0XHRcdHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuXHRcdFx0bGVmdDogMCxcblx0XHRcdHRvcDogMCwgXG5cdFx0XHRib3R0b206IDAsXG5cdFx0XHRyaWdodDogMCxcblx0XHRcdGRpc3BsYXk6ICdub25lJ1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgZGltbWVkIGVsZW1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9hcHBlbmREaW1tZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy4kZGltbWVkKSB7XG5cdFx0XHR0aGlzLl9tYWtlRGltbWVkKCk7XG5cdFx0fVxuXHRcdHRoaXMuJGVsZW1lbnQuYXBwZW5kKHRoaXMuJGRpbW1lZCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBpdGVtIGJ5IGluZGV4XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gcmVtb3ZlXG5cdCAqKi9cblx0cmVtb3ZlOiBmdW5jdGlvbihpbmRleCkge1xuXHRcdHRoaXMuc3RvcmVQb29sKHRoaXMubGlzdFtpbmRleF0pO1xuXHRcdHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgaXRlbSB0byBpdGVtIGxpc3Rcblx0ICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gaXRlbSBvYmplY3Rcblx0ICogQHBhcmFtIHtudW1iZXJ9IFtpbmRleF0gYWRkIFRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byBhZGRcblx0ICovXG5cdGFkZDogZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDAsIGl0ZW0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxpc3QucHVzaChpdGVtKTtcblx0XHR9XG5cdFx0aXRlbS5ncm91cEluZm8gPSB0aGlzLmlkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWFycmFuZ2UgZ3JvdXAgaXRlbXNcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dHVpLnV0aWwuZm9yRWFjaCh0aGlzLmxpc3QsIGZ1bmN0aW9uKGl0ZW0sIGluZGV4KSB7XG5cdFx0XHR0aGlzLiRkaW1tZWQuYmVmb3JlKGl0ZW0uJGVsZW1lbnQpO1xuXHRcdFx0aXRlbS5pbmRleCA9IGluZGV4O1xuXHRcdFx0aXRlbS4kZWxlbWVudC5hdHRyKHtcblx0XHRcdFx0J2RhdGEtaW5kZXgnIDogaW5kZXgsXG5cdFx0XHRcdCdkYXRhLWdyb3VwSW5mbyc6IHRoaXMuaWRcblx0XHRcdH0pO1xuXHRcdH0sIHRoaXMpO1xuXHRcdHRoaXMuJGRpbW1lZC5oaWRlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFN0b3JlIGl0ZW1zIHRvIHBvb2xcblx0ICogQHBhcmFtIHtvYmplY3R9ICRlbGVtZW50IEEgSlF1ZXJ5IGVsZW1lbnQgdG8gc3RvcmUgaW4gdGhlIHBvb2xcblx0ICovXG5cdHN0b3JlUG9vbDogZnVuY3Rpb24oJGVsZW1lbnQpIHtcblx0XHRpZiAoJGVsZW1lbnQpIHtcblx0XHRcdHRoaXMuJHBvb2wuYXBwZW5kKCRlbGVtZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHVpLnV0aWwuZm9yRWFjaCh0aGlzLmxpc3QsIGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdFx0dGhpcy4kcG9vbC5hcHBlbmQoaXRlbS4kZWxlbWVudCk7XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdyb3VwO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IExheW91dCBoZWxwZXIgb2JqZWN0LiBHdWlkZSBtb3VzZSBtb3ZlLXN0YXRlbWVudCB0byBrbm93IHdoYXQgaXMgZHJhZ2dlZCB3ZWxsLlxuICogQGRlcGVuZGVuY3kgY29kZS1zbmlwcGV0LCBqcXVlcnkxLjguMywgbGF5b3V0LmpzXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIDxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG4vKipcbiAqIEd1aWRlIGNsYXNzIG1ha2UgaGVscGVyIGVsZW1lbnQgYW5kIG1vdmUgaGVscGVyIGVsZW1lbnQgYnkgcG9zaXRpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIEd1aWRlID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIEd1aWRlLnByb3RvdHlwZSAqL3tcblx0LyoqXG5cdCAqIEluaXRpYWxpemUgZ3VpZGUgb2JqZWN0IHdpdGggb3B0aW9uc1xuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG5cdCAqIFx0QHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmd1aWRlSFRNTF0gZ3VpZGUgVGhlIGh0bWwgd2lsbCBiZSBndWlkZSBlbGVtZW50LlxuXHQgKi9cblx0aW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdHRoaXMuJGVsZW1lbnQgPSAkKG9wdGlvbnMuZ3VpZGVIVE1MIHx8IHN0YXRpY3MuSFRNTC5HVUlERSk7XG5cdFx0dGhpcy4kZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJyk7XG5cdFx0dGhpcy4kZWxlbWVudC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblx0XHR0aGlzLiRkaW1FbGVtZW50cyA9ICQoJy4nICsgIHN0YXRpY3MuRElNTUVEX0xBWUVSX0NMQVNTKTtcblx0XHR0aGlzLmhpZGUoKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTaG93IGVhY2ggZGltbWVkIGxheWVyXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgVGhlIHBvc2l0aW9uIHRvIGluaXRpYWxpemUgZ3VpZGUgZWxlbWVudFxuXHQgKiBAcGFyYW0ge2pRdWVyT2JqZWN0fSAkZWxlbWVudCBUaGUgaGVscGVyIGVsZW1lbnRcblx0ICoqL1xuXHRyZWFkeTogZnVuY3Rpb24ocG9zLCAkZWxlbWVudCkge1xuXHRcdHRoaXMuc2V0UG9zKHBvcyk7XG5cdFx0dGhpcy4kZGltRWxlbWVudHMuc2hvdygpO1xuXG5cdFx0aWYgKCRlbGVtZW50KSB7XG5cdFx0XHR0aGlzLnNldENvbnRlbnQoJGVsZW1lbnQpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIEhpZGUgZWFjaCBkaW1tZWQgbGF5ZXJcblx0ICoqL1xuXHRmaW5pc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGRpbUVsZW1lbnRzLmhpZGUoKTtcblx0XHR0aGlzLiRlbGVtZW50LmhpZGUoKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBNb3ZlIHRvIHBvc2l0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgVGhlIHBvc2l0aW9uIHRvIG1vdmVcblx0ICovXG5cdG1vdmVUbzogZnVuY3Rpb24ocG9zKSB7XG5cdFx0dGhpcy5zZXRQb3MocG9zKTtcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTZXQgUG9zIGZvciBtb3ZlXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgIFRoZSBwb3NpdGlvbiB0byBtb3ZlXG5cdCAqL1xuXHRzZXRQb3M6IGZ1bmN0aW9uKHBvcykge1xuXHRcdHRoaXMuJGVsZW1lbnQuY3NzKHtcblx0XHRcdGxlZnQ6IHBvcy54LFx0XG5cdFx0XHR0b3A6IHBvcy55XG5cdFx0fSk7XG5cdH0sXG5cdFxuXHQvKipcblx0ICogU2V0IGd1aWRlIGNvbnRlbnRcblx0ICogQHBhcmFtIHtzdHJpbmd9ICRjb250ZW50IFRoZSBjb250ZW50IG9iamVjdCB0byBjb3B5IGFuZCBhcHBlbmQgdG8gZ3VpZGUgZWxlbWVudC5cblx0ICovXG5cdHNldENvbnRlbnQ6IGZ1bmN0aW9uKCRjb250ZW50KSB7XG5cdFx0dGhpcy4kZWxlbWVudC5lbXB0eSgpO1xuXHRcdHRoaXMuJGVsZW1lbnQuYXBwZW5kKCRjb250ZW50LmNsb25lKCkpO1xuXHRcdHRoaXMuJGVsZW1lbnQuY3NzKHtcblx0XHRcdHdpZHRoOiAkY29udGVudC53aWR0aCgpICsgJ3B4Jyxcblx0XHRcdGhlaWdodDogJGNvbnRlbnQuaGVpZ2h0KCkgKyAncHgnXG5cdFx0fSlcblx0fSxcblx0XG5cdC8qKlxuXHQgKiBTaG93IGVsZW1lbnRcblx0ICovXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICghdGhpcy5pc0Rpc2FibGUpIHtcblx0XHRcdHRoaXMuJGVsZW1lbnQuc2hvdygpO1xuXHRcdH1cblx0fSxcblx0XG5cdC8qKlxuXHQgKiBIaWRlIGVsZW1lbnRcblx0ICovXG5cdGhpZGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsZW1lbnQuaGlkZSgpO1xuXHR9LFxuXHRcblx0LyoqXG5cdCAqIERpc2FibGUgZ3VpZGVcblx0ICovXG5cdGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaXNEaXNhYmxlID0gdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogRW5hYmxlIGd1aWRlXG5cdCAqL1xuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaXNEaXNhYmxlID0gZmFsc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCBtb3ZlIHRhcmdldFxuXHQgKiBAcGFyYW0ge29iamVjdH0gJGVsIFRoZSBlbGVtZW50IGlzIG1vdmluZyBpbiBsYXlvdXQuXG5cdCAqL1xuXHRzZXRNb3ZlRWxlbWVudDogZnVuY3Rpb24oJGVsKSB7XG5cdFx0dGhpcy4kbW92ZUVsZW1lbnQgPSAkZWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBzY29sbCBsZWZ0XG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9XG5cdCAqL1xuXHRnZXRTY3JvbGxMZWZ0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKHdpbmRvdy5zY3JvbGxYIHx8ICQod2luZG93KS5zY3JvbGxMZWZ0KCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgc2Nyb2xsIHRvcFxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfVxuXHQgKi9cblx0Z2V0U2Nyb2xsVG9wOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gKHdpbmRvdy5zY3JvbGxZIHx8ICQod2luZG93KS5zY3JvbGxUb3AoKSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aWRlO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IGxheW91dCBpdGVtLiBjb250YWluIG9yaWdpbmFsIGl0ZW1zLlxuICogQGRlcGVuZGVuY3kgY29kZS1zbmlwcGV0LCBqcXVlcnkxLjguMywgbGF5b3V0LmpzXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG52YXIgc3RhdGljcyA9IHJlcXVpcmUoJy4vc3RhdGljcycpO1xuXG4vKipcbiAqIEl0ZW0gY2xhc3MgaXMgbWFuYWdlIGl0ZW0gc3RhdGUgYW5kIHRpdGxlLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbnZhciBJdGVtID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBJdGVtLnByb3RvdHlwZSAqL3tcblx0LyoqXG5cdCAqIEluaXRpYWxpemUgbWVlbWJlciBmaWxlZCBhbmQgc3RhdGVcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0ICogXHRAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5ncm91cEluZm8gZ3JvdXAgdGhhdCBoYXMgaXRlbSBuYW1lXG5cdCAqIFx0QHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY29udGVudElkIGNvbnRlbnQgZWxlbWVudCBpZFxuXHQgKiBcdEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5pc0Nsb3NlIGNvbnRlbnQgY2xvc2Ugb3Igbm90XG5cdCAqIFx0QHBhcmFtIHtib29sZWFufSBvcHRpb25zLmlzRHJhZ2dhYmxlIGRyYWcgaGVscGVyIGVsZW1lbnQgdXNlIG9yIG5vdFxuXHQgKiBcdEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmluZGV4IGluZGV4IG9mIGNvbnRlbnQgaW4gZ3JvdXBcblx0ICogIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5tb3ZlQnV0dG9uSFRNTF0gbW92ZSBidXR0b24gSFRNTFxuXHQgKiAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmVsZW1lbnRIVE1MXSBpdGVtIGVsZW1lbnQgSFRNTFxuXHQgKiAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnRpdGxlSFRNTF0gaXRlbSB0aXRsZSBlbGVtZW50IEhUTUxcblx0ICovXG5cdGluaXQgOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihzdGF0aWNzLkVSUk9SLk9QVElPTlNfTk9UX0RFRklORUQpO1xuXHRcdH1cblxuXHRcdC8vIGh0bWwgc2V0XG5cdFx0dHVpLnV0aWwuZXh0ZW5kKG9wdGlvbnMsIHtcblx0XHRcdGVsZW1lbnRIVE1MOiBvcHRpb25zLmVsZW1lbnRIVE1MIHx8IHN0YXRpY3MuSFRNTC5FTEVNRU5ULFxuXHRcdFx0bW92ZUJ1dHRvbkhUTUw6IG9wdGlvbnMubW92ZUJ1dHRvbkhUTUwgfHwgc3RhdGljcy5IVE1MLk1PVkVCVVRUT04sXG5cdFx0XHR0aXRsZUhUTUw6IG9wdGlvbnMudGl0bGVIVE1MIHx8IHN0YXRpY3MuSFRNTC5USVRMRSxcblx0XHRcdHRvZ2dsZUJ1dHRvbkhUTUw6IG9wdGlvbnMudG9nZ2xlQnV0dG9uSFRNTCB8fCBzdGF0aWNzLkhUTUwuVE9HR0xFQlVUVE9OLFxuXHRcdFx0dGl0bGU6IG9wdGlvbnMudGl0bGUgfHwgc3RhdGljcy5URVhULkRFRkFVTFRfVElUTEVcblx0XHR9KTtcblx0XHR0dWkudXRpbC5leHRlbmQodGhpcywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLl9tYWtlRWxlbWVudCgpO1xuXHRcdFxuXHRcdC8vIHRpdGxlIHVzZWQsIGFuZCBmaXggdGl0bGUgKG5vIGhpZGUpXG5cdFx0aWYgKCF0dWkudXRpbC5pc0Jvb2xlYW4odGhpcy5pc0Nsb3NlKSkge1xuXHRcdFx0dGhpcy5maXhUaXRsZSgpO1xuXHRcdH1cblx0XG5cdFx0Ly8gY2xvc2UgYm9keShJIGRvbid0IGxpa2UgdGhpcyBjb2RlLCBhcmUgdGhlcmUgYW55IHdheXMgdG8gZml4IGl0Lilcblx0XHRpZiAodGhpcy5pc0Nsb3NlKSB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub3BlbigpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGNvbnRlbnQuYXBwZW5kKCQoJyMnICsgdGhpcy5jb250ZW50SWQpKTtcblx0XHR0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJywgJ2l0ZW1faWRfJyArIHRoaXMuY29udGVudElkKTtcblx0XHR0aGlzLl9zZXRFdmVudHMoKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IEluZGV4XG5cdCAqL1xuXHRnZXRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuaW5kZXg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgaXRlbSByb290IGVsZW1lbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9tYWtlRWxlbWVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHdyYXBwZXJDbGFzcyA9IHRoaXMud3JhcHBlckNsYXNzIHx8IHN0YXRpY3MuREVGQVVMVF9XUlBQRVJfQ0xBU1MsXG5cdFx0XHRlbGVtZW50SFRNTCA9IHRoaXMuX2dldEh0bWwodGhpcy5lbGVtZW50SFRNTCwge1xuXHRcdFx0XHRudW1iZXIgOiB0aGlzLmluZGV4LFxuXHRcdFx0XHR3cmFwcGVyOiB3cmFwcGVyQ2xhc3Ncblx0XHRcdH0pO1xuXG5cdFx0dGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudEhUTUwpO1xuXHRcdHRoaXMuJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuXHRcdHRoaXMuJGNvbnRlbnQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgd3JhcHBlckNsYXNzKTtcblxuXHRcdHRoaXMuaXNEcmFnZ2FibGUgPSAhIXRoaXMuaXNEcmFnZ2FibGU7XG5cdFx0dGhpcy5fbWFrZVRpdGxlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgdGl0bGUgZWxlbWVudCBhbmQgZWxlbWVudHMgYmVsb25nIHRvIHRpdGxlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZVRpdGxlOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuJHRpdGxlRWxlbWVudCA9ICQodGhpcy50aXRsZUhUTUwpO1xuXHRcdHRoaXMuJHRpdGxlRWxlbWVudC5odG1sKHRoaXMudGl0bGUpO1xuXG5cdFx0aWYgKHRoaXMuaXNEcmFnZ2FibGUpIHtcblx0XHRcdHRoaXMuX21ha2VEcmFnQnV0dG9uKHRoaXMubW92ZUJ1dHRvbkhUTUwpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGNvbnRlbnQuYmVmb3JlKHRoaXMuJHRpdGxlRWxlbWVudCk7XG5cdFx0dGhpcy5fbWFrZVRvZ2dsZUJ1dHRvbih0aGlzLnRvZ2dsZUJ1dHRvbkhUTUwpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIG1hcmt1cCB3aXRoIHRlbXBsYXRlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaXRlbSBlbGVtZW50IGh0bWxcblx0ICogQHBhcmFtIHtvYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNoYW5nZSBodG1sIHN0cmluZ1xuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEh0bWw6IGZ1bmN0aW9uKGh0bWwsIG1hcCkge1xuXHRcdGh0bWwgPSBodG1sLnJlcGxhY2UoL1xce1xceyhbXlxcfV0rKVxcfVxcfS9nLCBmdW5jdGlvbihtc3RyLCBuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbWFwW25hbWVdO1xuXHRcdH0pO1xuXHRcdHJldHVybiBodG1sO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGRyYWcgYnV0dG9uIGluIHRpdGxlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIGJ1dHRvbiBodG1sXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZURyYWdCdXR0b246IGZ1bmN0aW9uKGh0bWwpIHtcblx0XHRodG1sID0gdGhpcy5fZ2V0SHRtbChodG1sLCB7XG5cdFx0XHQnaXRlbS1pZCc6ICdpdGVtX2lkXycgKyB0aGlzLmNvbnRlbnRJZFxuXHRcdH0pO1xuXHRcdHRoaXMuJHRpdGxlRWxlbWVudC5hcHBlbmQoJChodG1sKSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgVG9nZ2xlIGJ1dHRvbiBpbiB0aXRsZVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdG9nZ2xlSFRNTFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VUb2dnbGVCdXR0b246IGZ1bmN0aW9uKHRvZ2dsZUhUTUwpIHtcblx0XHR0aGlzLiR0b2dnbGVCdXR0b24gPSAkKHRvZ2dsZUhUTUwpO1xuXHRcdHRoaXMuJHRpdGxlRWxlbWVudC5hcHBlbmQodGhpcy4kdG9nZ2xlQnV0dG9uKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2xvc2UgaXRlbSBlbGVtZW50XG5cdCAqL1xuXHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kdG9nZ2xlQnV0dG9uLmFkZENsYXNzKFwib3BlblwiKTtcblx0XHR0aGlzLiRjb250ZW50LmhpZGUoKTtcblx0fSxcblxuXHQvKipcblx0ICogT3BlbiBpdGVtIGVsZW1lbnRcblx0ICovXG5cdG9wZW46IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJHRvZ2dsZUJ1dHRvbi5yZW1vdmVDbGFzcyhcIm9wZW5cIik7XG5cdFx0dGhpcy4kY29udGVudC5zaG93KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZpeCB0aXRsZSB0byBkbyBub3QgaGlkZS4gQWZ0ZXIgZml4VGl0bGUgY2FsbGVkLCBoaWRlVGl0bGUgZG8gbm90IHdvcmsuXG5cdCAqL1xuXHRmaXhUaXRsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zaG93VGl0bGUoKTtcblx0XHR0aGlzLmlzVGl0bGVGaXggPSB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTaG93IHRpdGxlXG5cdCAqL1xuXHRzaG93VGl0bGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJHRpdGxlRWxlbWVudC5zaG93KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhpZGUgdGl0bGVcblx0ICovXG5cdGhpZGVUaXRsZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCF0aGlzLmlzVGl0bGVGaXgpIHtcblx0XHRcdHRoaXMuJHRpdGxlRWxlbWVudC5oaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb2dnbGUgb3Blbi9jbG9zZVxuXHQgKi9cblx0dG9nZ2xlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAodGhpcy4kdG9nZ2xlQnV0dG9uLmhhc0NsYXNzKCdvcGVuJykpIHtcblx0XHRcdHRoaXMub3BlbigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgYWxsIGV2ZW50IGFib3V0IGl0ZW1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zZXRFdmVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJHRvZ2dsZUJ1dHRvbi5vbignY2xpY2snLCAkLnByb3h5KHRoaXMudG9nZ2xlLCB0aGlzKSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEl0ZW07XG4iLCIvKipcbiogQGZpbGVvdmVydmlldyBMYXlvdXQgY29tcG9uZW50XG4qIEBkZXBlbmRlbmN5IGNvZGUtc25pcHBldC5qcyBqcXVlcnkuMS44LjNcbiogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuKi9cblxudmFyIHN0YXRpY3MgPSByZXF1aXJlKCcuL3N0YXRpY3MnKTtcbnZhciBHcm91cCA9IHJlcXVpcmUoJy4vZ3JvdXAnKTtcbnZhciBHdWlkZSA9IHJlcXVpcmUoJy4vZ3VpZGUnKTtcblxuLyoqXG4gKiBMYXlvdXQgY2xhc3MgbWFrZSBsYXlvdXQgZWxlbWVudChKUXVlcnlPYmplY3QpIGFuZCBpbmNsdWRlIGdyb3VwcywgY29udHJvbCBpdGVtIG1vdmUgYW5kIHNldCBldmVudHMuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGlcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcGl0b25zXG4gKiBcdEBwYXJhbSB7YXJyYXl9IG9wdGlvbnMuZ3JvdXBsaXN0IFRoZSBsaXN0IG9mIGdyb3VwIG9wdGlvbnNcbiAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudFxuICovXG52YXIgTGF5b3V0ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqQGxlbmRzIExheW91dC5wcm90b3R5cGUgKi97XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplIGxheW91dFxuXHQgKi9cblx0aW5pdDogZnVuY3Rpb24ob3BpdG9ucywgJGVsZW1lbnQpIHtcblx0XHR0aGlzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG5cdFx0dGhpcy5fbWFrZUdyb3VwKG9waXRvbnMuZ3JvdXBsaXN0KTtcblx0XHR0aGlzLl9tYWtlR3VpZGUob3BpdG9ucy5ndWlkZUhUTUwpO1xuXHRcdHRoaXMuX3NldEV2ZW50cygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNYWtlIGdyb3VwXG5cdCAqIEBwYXJhbSB7YXJyYXl9IGdyb3VwbGlzdCBUaGUgbGlzdCBvZiBncm91cCBvcHRpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbWFrZUdyb3VwOiBmdW5jdGlvbihncm91cGxpc3QpIHtcblx0XHR2YXIgZ3JvdXA7XG5cdFx0dGhpcy5ncm91cHMgPSB7fTtcblxuXHRcdHR1aS51dGlsLmZvckVhY2goZ3JvdXBsaXN0LCBmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRncm91cCA9IHRoaXMuZ3JvdXBzW2l0ZW0uaWRdID0gbmV3IEdyb3VwKGl0ZW0pO1xuXHRcdFx0dGhpcy4kZWxlbWVudC5hcHBlbmQoZ3JvdXAuJGVsZW1lbnQpO1xuXHRcdH0sIHRoaXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgZ3JvdXAgaXRlbVxuXHQgKiBAcGFyYW0geyhzdHJpbmd8b2JqZWN0KX0gZ3JvdXAgVGhlIGl0ZW0gSUQgb3IgaW5mb3JtYXRpb24gdG8gZmluZCBncm91cFxuXHQgKiBAcmV0dXJucyB7Kn1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRHcm91cDogZnVuY3Rpb24oZ3JvdXApIHtcblx0XHRpZiAodHVpLnV0aWwuaXNPYmplY3QoZ3JvdXApKSB7XG5cdFx0XHRpZiAoZ3JvdXAuYXR0cignZGF0YS1ncm91cCcpKSB7XG5cdFx0XHRcdGdyb3VwID0gZ3JvdXAuYXR0cignZGF0YS1ncm91cCcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Z3JvdXAgPSBncm91cC5wYXJlbnQoKS5hdHRyKCdkYXRhLWdyb3VwJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmdyb3Vwc1tncm91cF07XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2UgZ3VpZGUgb2JqZWN0XG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbZ3VpZGVIVE1MXSBndWlkZSBUaGUgaHRtbCB3aWxsIGJlIHVzZGVkIHRvIG1ha2UgZ3VpZGUgZWxlbWVudFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X21ha2VHdWlkZTogZnVuY3Rpb24oZ3VpZGVIVE1MKSB7XG5cdFx0dGhpcy5fZ3VpZGUgPSBuZXcgR3VpZGUoe1xuXHRcdFx0Z3VpZGVIVE1MOiBndWlkZUhUTUxcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogU2V0IEV2ZW50c1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vbk1vdXNlRG93biA9ICQucHJveHkodGhpcy5fb25Nb3VzZURvd24sIHRoaXMpO1xuXHRcdHRoaXMub25Nb3VzZU1vdmUgPSAkLnByb3h5KHRoaXMuX29uTW91c2VNb3ZlLCB0aGlzKTtcblx0XHR0aGlzLm9uTW91c2VVcCA9ICQucHJveHkodGhpcy5fb25Nb3VzZVVwLCB0aGlzKTtcblx0XHQkKCcuZHJhZy1pdGVtLW1vdmUnKS5vbignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gZXZlbnQgaGFuZGxlclxuXHQgKiBAcGFyYW0gZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X29uTW91c2VEb3duOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KTtcblx0XHR0aGlzLmhlaWdodCgkZG9jLmhlaWdodCgpKTtcblx0XHR0aGlzLl9zZXRHdWlkZShlLnRhcmdldCwgZS5jbGllbnRYLCBlLmNsaWVudFkpO1xuXHRcdCRkb2Mub24oJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuXHRcdCRkb2Mub24oJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNldCBndWlkZVxuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0IFRoZSB0YXJnZXQgdG8gc2V0IGd1aWRlJ3MgbW92ZS1zdGF0ZW1lbnQgZWxlbWVudFxuXHQgKiBAcGFyYW0ge251bWJlcn0gcG9pbnRYIFRoZSBwb3NpdGlvbiB4IHRvIHNldCBndWlkZSBlbGVtZW50IGxlZnQuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFkgVGhlIHBvc2l0aW9uIHkgdG8gc2V0IGd1aWRlIGVsZW1lbnQgdG9wLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldEd1aWRlOiBmdW5jdGlvbih0YXJnZXQsIHBvaW50WCwgcG9pbnRZKSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGluaXRQb3MgPSB7XG5cdFx0XHRcdHg6IHBvaW50WCArICRkb2Muc2Nyb2xsTGVmdCgpICsgMTAsXG5cdFx0XHRcdHk6IHBvaW50WSArICRkb2Muc2Nyb2xsVG9wKCkgKyAxMFxuXHRcdFx0fSxcblx0XHRcdGl0ZW1JZCA9ICQodGFyZ2V0KS5hdHRyKCdkYXRhLWl0ZW0nKSxcblx0XHRcdCRtb3ZlRWwgPSAkKCcjJyArIGl0ZW1JZCk7XG5cblx0XHR0aGlzLl9ndWlkZS5yZWFkeShpbml0UG9zLCAkbW92ZUVsKTtcblx0XHR0aGlzLl9ndWlkZS5zZXRNb3ZlRWxlbWVudCgkbW92ZUVsKTtcblx0XHR0aGlzLiR0ZW1wID0gJG1vdmVFbDtcblx0XHR0aGlzLl9sb2NrVGVtcCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJdCBtYWtlIGl0ZW0gZWxlbWVudCBzZWVtcyB0byBiZSBsb2NrZWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbG9ja1RlbXA6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBncm91cCA9IHRoaXMuX2dldEdyb3VwKHRoaXMuJHRlbXApLFxuXHRcdFx0aXRlbSA9IGdyb3VwLmxpc3RbdGhpcy4kdGVtcC5hdHRyKCdkYXRhLWluZGV4JyldO1xuXHRcdHRoaXMuJHRlbXAuY3NzKCdvcGFjaXR5JywgJzAuMicpO1xuXHRcdHRoaXMuJHRlbXAuZmluZCgnIycgKyBpdGVtLmNvbnRlbnRJZCkuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJdCBtYWtlIGl0ZW0gZWxlbWVudCBzZWVtcyB0byBiZSB1bmxvY2tlZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF91bmxvY2tUZW1wOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZ3JvdXAgPSB0aGlzLl9nZXRHcm91cCh0aGlzLiR0ZW1wKSxcblx0XHRcdGl0ZW0gPSBncm91cC5saXN0W3RoaXMuJHRlbXAuYXR0cignZGF0YS1pbmRleCcpXTtcblx0XHR0aGlzLiR0ZW1wLmNzcygnb3BhY2l0eScsICcxJyk7XG5cdFx0dGhpcy4kdGVtcC5maW5kKCcjJyArIGl0ZW0uY29udGVudElkKS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGhhbmRsZXJcblx0ICogQHBhcmFtIHtKcXVlcnlFdmVudH0gZSBKcXVlcnlFdmVudCBvYmplY3Rcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9vbk1vdXNlTW92ZTogZnVuY3Rpb24oZSkge1xuXHRcdHZhciBwYXJlbnQsICRkb2MsIHBvaW50WCwgcG9pbnRZLCBncm91cDtcblxuXHRcdHBhcmVudCA9ICQoZS50YXJnZXQpLnBhcmVudCgpO1xuXHRcdCRkb2MgPSAkKGRvY3VtZW50KTtcblx0XHRwb2ludFggPSBlLmNsaWVudFggKyAkZG9jLnNjcm9sbExlZnQoKTtcblx0XHRwb2ludFkgPSBlLmNsaWVudFkgKyAkZG9jLnNjcm9sbFRvcCgpO1xuXHRcdGdyb3VwID0gcGFyZW50LmF0dHIoJ2RhdGEtZ3JvdXAnKTtcblxuXHRcdHRoaXMuX3NldFNjcm9sbFN0YXRlKHBvaW50WCwgcG9pbnRZKTtcblx0XHR0aGlzLl9tb3ZlR3VpZGUocG9pbnRYLCBwb2ludFkpO1xuXG5cdFx0aWYgKGdyb3VwKSB7XG5cdFx0XHR0aGlzLl9kZXRlY3RNb3ZlKHBhcmVudCwgcG9pbnRYLCBwb2ludFkpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogSWYgZWxlbWVudCBtb3ZlIG92ZXIgYXJlYSwgc2Nyb2xsIG1vdmUgdG8gc2hvdyBlbGVtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0U2Nyb2xsU3RhdGU6IGZ1bmN0aW9uKHgsIHkpIHtcblx0XHR2YXIgJGRvYyA9ICQoZG9jdW1lbnQpLFxuXHRcdFx0JHdpbiA9ICQod2luZG93KSxcblx0XHRcdGRvY0hlaWdodCA9IHRoaXMuaGVpZ2h0KCksXG5cdFx0XHRoZWlnaHQgPSAkd2luLmhlaWdodCgpLFxuXHRcdFx0dG9wID0gJGRvYy5zY3JvbGxUb3AoKSxcblx0XHRcdGxpbWl0ID0gZG9jSGVpZ2h0IC0gaGVpZ2h0O1xuXG5cdFx0aWYgKGhlaWdodCArIHRvcCA8IHkpIHtcblx0XHRcdCRkb2Muc2Nyb2xsVG9wKE1hdGgubWluKHRvcCArICh5IC0gaGVpZ2h0ICsgdG9wKSwgbGltaXQpKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNhdmUgZG9jdW1lbnQgaGVpZ2h0IG9yIHJldHVybiBoZWlnaHRcbiAgICAgKiBAYXBpXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSBUaGUgaGVpZ2h0IHZhbHVlIHRvIHNhdmUgX2hlaWdodCBmZWlsZFxuXHQgKi9cblx0aGVpZ2h0OiBmdW5jdGlvbihoZWlnaHQpIHtcblx0XHRpZiAodHVpLnV0aWwuaXNVbmRlZmluZWQoaGVpZ2h0KSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2hlaWdodDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIERldGVjdCBtb3ZlIHdpdGggZ3JvdXBcblx0ICogQHBhcmFtIHtvYmplY3R9IGl0ZW0gY29tcGFyZSBwb3NpdGlvbiB3aXRoXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBwb2ludFggVGhlIHBvc2l0aW9uIHggd2lsbCBiZSBkZXRlY3Qgd2hpY2ggZWxlbWVudCBzZWxlY3RlZC5cblx0ICogQHBhcmFtIHtudW1iZXJ9IHBvaW50WSBUaGUgcG9zaXRpb24geSB3aWxsIGJlIGRldGVjdCB3aGljaCBlbGVtZW50IHNlbGVjdGVkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2RldGVjdE1vdmU6IGZ1bmN0aW9uKGl0ZW0sIHBvaW50WCwgcG9pbnRZKSB7XG5cdFx0dmFyICRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGdyb3VwSW5zdCA9IHRoaXMuX2dldEdyb3VwKGl0ZW0pLFxuXHRcdFx0Z3JvdXAgPSBpdGVtLmF0dHIoJ2RhdGEtZ3JvdXAnKSxcblx0XHRcdCRiZWZvcmUsXG5cdFx0XHR0b3AgPSAkZG9jLnNjcm9sbFRvcCgpLFxuXHRcdFx0bGVmdCA9ICRkb2Muc2Nyb2xsTGVmdCgpO1xuXG5cdFx0aWYgKHR1aS51dGlsLmlzRW1wdHkoZ3JvdXBJbnN0Lmxpc3QpKSB7XG5cdFx0XHRpdGVtLmFwcGVuZCh0aGlzLiR0ZW1wKTtcblx0XHRcdHRoaXMuaGVpZ2h0KCRkb2MuaGVpZ2h0KCkpO1xuXHRcdFx0dGhpcy4kdGVtcC53YXkgPSAnYWZ0ZXInO1xuXHRcdFx0dGhpcy4kdGVtcC5pbmRleCA9IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRiZWZvcmUgPSB0aGlzLl9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uKHtcblx0XHRcdFx0eDogcG9pbnRYICsgbGVmdCxcblx0XHRcdFx0eTogcG9pbnRZICsgdG9wXG5cdFx0XHR9LCBncm91cEluc3QpO1xuXG5cdFx0XHRpZiAoJGJlZm9yZSAmJiAkYmVmb3JlLndheSkge1xuXHRcdFx0XHQkYmVmb3JlWyRiZWZvcmUud2F5XSh0aGlzLiR0ZW1wKTtcblx0XHRcdFx0dGhpcy5oZWlnaHQoJGRvYy5oZWlnaHQoKSk7XG5cdFx0XHRcdHRoaXMuJHRlbXAud2F5ID0gJGJlZm9yZS53YXk7XG5cdFx0XHRcdHRoaXMuJHRlbXAuaW5kZXggPSAkYmVmb3JlLmF0dHIoJ2RhdGEtaW5kZXgnKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1vdmUgaGVscGVyIG9iamVjdFxuXHQgKiBAcGFyYW0ge251bWJlcn0geCBtb3ZlIHBvc2l0aW9uIHhcblx0ICogQHBhcmFtIHtudW1iZXJ9IHkgbW92ZSBwb3NpdGlvbiB5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbW92ZUd1aWRlOiBmdW5jdGlvbih4LCB5KSB7XG5cdFx0dGhpcy5fZ3VpZGUubW92ZVRvKHtcblx0XHRcdHg6IHggKyAxMCArICdweCcsXG5cdFx0XHR5OiB5ICsgMTAgKyAncHgnXG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVjdCB0YXJnZXQgYnkgbW92ZSBlbGVtZW50IHBvc2l0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBwb3MgVGhlIHBvc2l0aW9uIHRvIGRldGVjdFxuXHQgKiBAcGFyYW0ge29iamVjdH0gZ3JvdXAgVGhlIGdyb3VwIHRoYXQgaGFzIGNoaWxkIGl0ZW1zXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd8Kn1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uOiBmdW5jdGlvbihwb3MsIGdyb3VwKSB7XG5cdFx0dmFyIHRhcmdldDtcblxuXHRcdHR1aS51dGlsLmZvckVhY2goZ3JvdXAubGlzdCwgZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0aWYgKCF0aGlzLl9pc1ZhbGlkSXRlbShpdGVtKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR0YXJnZXQgPSB0aGlzLl9nZXRUYXJnZXQoaXRlbSwgcG9zLCBncm91cCkgfHwgdGFyZ2V0O1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRhcmdldCBlbGVtZW50XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIFRoZSBpdGVtIHRvIGNvbXBhcmUgd2l0aCBwb3Ncblx0ICogQHBhcmFtIHtvYmplY3R9IHBvcyBUaGUgcG9zIHRvIGZpZ3VyZSB3aGV0aGVyIHRhcmdldCBvciBub3Rcblx0ICogQHBhcmFtIHtvYmplY3R9IGdyb3VwIFRoZSBncm91cCBoYXMgaXRlbVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhcmdldDogZnVuY3Rpb24oaXRlbSwgcG9zLCBncm91cCkge1xuXHRcdHZhciBib3VuZCA9IGl0ZW0uJGVsZW1lbnQub2Zmc2V0KCksXG5cdFx0XHRib3R0b20gPSB0aGlzLl9nZXRCb3R0b20oaXRlbSwgZ3JvdXApLFxuXHRcdFx0aGVpZ2h0ID0gaXRlbS4kZWxlbWVudC5oZWlnaHQoKSxcblx0XHRcdHRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpICsgYm91bmQudG9wLFxuXHRcdFx0JHRhcmdldDtcblx0XHRpZiAocG9zLnkgPiB0b3AgJiYgcG9zLnkgPD0gdG9wICsgKGhlaWdodCAvIDIpKSB7XG5cdFx0XHQkdGFyZ2V0ID0gaXRlbS4kZWxlbWVudDtcblx0XHRcdCR0YXJnZXQud2F5ID0gJ2JlZm9yZSc7XG5cdFx0fSBlbHNlIGlmIChwb3MueSA+IHRvcCArIChoZWlnaHQgLyAyKSAmJiBwb3MueSA8IGJvdHRvbSkge1xuXHRcdFx0JHRhcmdldCA9IGl0ZW0uJGVsZW1lbnQ7XG5cdFx0XHQkdGFyZ2V0LndheSA9ICdhZnRlcic7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICR0YXJnZXQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgVmFpbGQgaXRlbSBvciBub3Rcblx0ICogQHBhcmFtIHtwYXJhbX0gaXRlbSBUaGUgaXRlbSBUbyBiZSBjb21wYXJlZCB3aXRoIHRlbXAuXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2lzVmFsaWRJdGVtOiBmdW5jdGlvbihpdGVtKSB7XG5cdFx0cmV0dXJuIChpdGVtLiRlbGVtZW50WzBdICE9PSB0aGlzLiR0ZW1wWzBdKTtcblx0fSxcblxuXHQvKipcblx0ICogSWYgbmV4dCBlbGVtZW50IGV4aXN0LCBzZXQgYm90dG9tIG5leHQgZWxlbWVudCdzIHRvcCBwb3NpdGlvbiwgZWxzZSBzZXQgYm90dG9tIGxpbWl0KGdyb3VwIGVsZW1lbnQncyBib3R0b20gcG9zaXRpb24pIHBvc2l0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBpdGVtIFRoZSBvYmplY3QgdG8gZmlndXJlIGJvdHRvbSBwb3NpdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gZ3JvdXAgVGhlIGdyb3VwIHRvIGZpZ3VyZSBib3R0b20gcG9zaXRpb25cblx0ICogQHJldHVybnMgeyp9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0Qm90dG9tOiBmdW5jdGlvbihpdGVtLCBncm91cCkge1xuXHRcdHZhciAkbmV4dCA9IGl0ZW0uJGVsZW1lbnQubmV4dCgpLFxuXHRcdFx0Ym90dG9tLFxuXHRcdFx0JGRvYyA9ICQoZG9jdW1lbnQpLFxuXHRcdFx0Z2JvdW5kID0gZ3JvdXAuJGVsZW1lbnQub2Zmc2V0KCksXG5cdFx0XHRsaW1pdCA9ICRkb2Muc2Nyb2xsVG9wKCkgKyBnYm91bmQudG9wICsgZ3JvdXAuJGVsZW1lbnQuaGVpZ2h0KCk7XG5cdFx0aWYgKCRuZXh0Lmhhc0NsYXNzKHN0YXRpY3MuRElNTUVEX0xBWUVSX0NMQVNTKSkge1xuXHRcdFx0Ym90dG9tID0gbGltaXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJvdHRvbSA9ICRkb2Muc2Nyb2xsVG9wKCkgKyAkbmV4dC5vZmZzZXQoKS50b3A7XG5cdFx0fVxuXHRcdHJldHVybiBib3R0b207XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBhZGQgaW5kZXggYnkgJHRlbXAsICR0ZW1wLndheVxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFkZEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGVtcCA9IHRoaXMuJHRlbXAsXG5cdFx0XHRpbmRleCA9IHBhcnNlSW50KHRlbXAuaW5kZXgsIDEwKTtcblx0XHRpZiAodGVtcC53YXkgPT09ICdhZnRlcicpIHtcblx0XHRcdGluZGV4ICs9IDE7XG5cdFx0fVxuXHRcdHJldHVybiBpbmRleDtcblx0fSxcblxuXHQvKipcblx0ICogTW91c2UgdXAgaGFuZGxlclxuXHQgKiBAcGFyYW0ge0pxdWVyeUV2ZW50fSBlIEEgZXZlbnQgb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfb25Nb3VzZVVwOiBmdW5jdGlvbihlKSB7XG5cdFx0dmFyIGRyYWcgPSB0aGlzLl9ndWlkZSxcblx0XHRcdCRkb2MgPSAkKGRvY3VtZW50KSxcblx0XHRcdGdyb3VwID0gdGhpcy5fZ2V0R3JvdXAodGhpcy4kdGVtcC5hdHRyKCdkYXRhLWdyb3VwSW5mbycpKSxcblx0XHRcdCR0YXJnZXQgPSB0aGlzLl9kZXRlY3RUYXJnZXRCeVBvc2l0aW9uKHtcblx0XHRcdFx0eDogZS5jbGllbnRYICsgJGRvYy5zY3JvbGxMZWZ0KCksXG5cdFx0XHRcdHk6IGUuY2xpZW50WSArICRkb2Muc2Nyb2xsVG9wKClcblx0XHRcdH0sIGdyb3VwKTtcblxuXHRcdHRoaXMuX3VwZGF0ZSgpO1xuXHRcdHRoaXMuX3VubG9ja1RlbXAoKTtcblx0XHRkcmFnLmZpbmlzaCgpO1xuXG5cdFx0JGRvYy5vZmYoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuXHRcdCRkb2Mub2ZmKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgZ3JvdXBzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGVtcCA9IHRoaXMuJHRlbXAsXG5cdFx0XHRvbGRHcm91cCA9IHRoaXMuX2dldEdyb3VwKHRlbXAuYXR0cignZGF0YS1ncm91cEluZm8nKSksXG5cdFx0XHR0YXJnZXRHcm91cCA9IHRoaXMuX2dldEdyb3VwKHRlbXAucGFyZW50KCkpLFxuXHRcdFx0cmVtb3ZlSW5kZXggPSBwYXJzZUludCh0ZW1wLmF0dHIoJ2RhdGEtaW5kZXgnKSwgMTApLFxuXHRcdFx0YWRkSW5kZXggPSB0aGlzLl9nZXRBZGRJbmRleCgpLFxuXHRcdFx0aXRlbSA9IG9sZEdyb3VwLmxpc3RbcmVtb3ZlSW5kZXhdO1xuXG5cdFx0aWYgKCFpc05hTihhZGRJbmRleCkpIHtcblx0XHRcdG9sZEdyb3VwLnN0b3JlUG9vbCgpO1xuXHRcdFx0dGFyZ2V0R3JvdXAuc3RvcmVQb29sKCk7XG5cdFx0XHRvbGRHcm91cC5yZW1vdmUocmVtb3ZlSW5kZXgpO1xuXHRcdFx0dGFyZ2V0R3JvdXAuYWRkKGl0ZW0sIGFkZEluZGV4KTtcblx0XHRcdHRhcmdldEdyb3VwLnJlbmRlcigpO1xuXHRcdFx0b2xkR3JvdXAucmVuZGVyKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXQ7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHN0YXRpYyB2YWx1ZXNcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgSFRNTCA6IHtcblx0XHRNT1ZFQlVUVE9OOiAnPGJ1dHRvbiBjbGFzcz1cIm1vdmUtYnV0dG9uIGRyYWctaXRlbS1tb3ZlXCIgZGF0YS1pdGVtPVwie3tpdGVtLWlkfX1cIj5tb3ZlPC9idXR0b24+Jyxcblx0XHRFTEVNRU5UOiAnPGRpdiBjbGFzcz1cIml0ZW1cIiBkYXRhLWluZGV4PVwie3tudW1iZXJ9fVwiPjxkaXYgY2xhc3M9XCJ7e3dyYXBwZXJ9fVwiPjwvZGl2PjwvZGl2PicsXG5cdFx0VElUTEU6ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48L2Rpdj4nLFxuXHRcdFRPR0dMRUJVVFRPTjogJzxidXR0b24gY2xhc3M9XCJ0b2dnbGUtYnV0dG9uXCI+dG9nZ2xlPC9idXR0b24+Jyxcblx0XHRHUk9VUCA6ICc8ZGl2IGNsYXNzPVwiZ3JvdXAgZ3Bfe3tncm91cC1pZH19XCIgZGF0YS1ncm91cD1cInt7Z3JvdXAtaWR9fVwiPjwvZGl2PicsXG5cdFx0R1VJREU6ICc8ZGl2IGNsYXNzPVwiaXRlbS1ndWlkZVwiPjwvZGl2Pidcblx0fSxcblx0VEVYVCA6IHtcblx0XHRERUZBVUxUX1RJVExFOiAnbm8gdGl0bGUnXG5cdH0sXG5cdEVSUk9SIDoge1xuXHRcdE9QVElPTlNfTk9UX0RFRklORUQgOiAnb3B0aW9ucyBhcmUgbm90IGRlZmluZWQnXG5cdH0sXG5cdERFRkFVTFRfV1JQUEVSX0NMQVNTIDogJ2l0ZW0tYm9keScsXG5cdERJTU1FRF9MQVlFUl9DTEFTUyA6ICdkaW1tZWQtbGF5ZXInXG59O1xuIl19
