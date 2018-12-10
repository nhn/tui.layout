/*!
 * tui-layout.js
 * @version 2.1.1
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"), require("tui-code-snippet"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery", "tui-code-snippet"], factory);
	else if(typeof exports === 'object')
		exports["Layout"] = factory(require("jquery"), require("tui-code-snippet"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["Layout"] = factory(root["$"], (root["tui"] && root["tui"]["util"]));
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layout component
	 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
	 */

	'use strict';

	var $ = __webpack_require__(1);
	var snippet = __webpack_require__(2);

	var statics = __webpack_require__(3);
	var Group = __webpack_require__(4);
	var Guide = __webpack_require__(6);

	/**
	 * Layout class make layout element and include groups, control item move and set events.
	 * @class Layout
	 * @param {jQuery|HTMLElement|string} container - Wrapper element or id selector
	 * @param {object} options
	 *     @param {array} options.grouplist - The list of group options.
	 *         @param {string} options.grouplist.id - The group id
	 *         @param {number} [options.grouplist.ratio] - The group ratio
	 *         @param {array} options.grouplist.items - The items that the group includes
	 *             @param {string} options.grouplist.items.id - The item id
	 *             @param {string} options.grouplist.items.contentId - The content id
	 *             @param {string} options.grouplist.items.title - The item's title
	 *             @param {string} [options.grouplist.items.isClose] - Whether the item is closed or not
	 *             @param {string} [options.grouplist.items.isDraggable] - Whether the item is draggable or not
	 *     @param {Boolean} [options.usageStatistics=true|false] send hostname to google analytics [default value is true]
	 * @example
	 * var container = document.getElementById('layout');
	 * var Layout = tui.Layout; // or require('tui-layout');
	 * var instance = new Layout(container, {
	 *      grouplist: [{
	 *          id: 'g1',
	 *          ratio: 50,
	 *          items: [{
	 *              id: 'item-lifeStyle',
	 *              contentId: 'lifeStyle',
	 *              title: 'Life Style Seciton',
	 *              isClose: false,
	 *              isDraggable: true
	 *          }, {
	 *              id: 'item-calendar',
	 *              contentId: 'calendar',
	 *              title: 'Calendar Seciton',
	 *              isClose: false,
	 *              isDraggable: true
	 *          }, {
	 *              id: 'item-todoList',
	 *              contentId: 'todoList',
	 *              title: 'TodoList Seciton',
	 *              isClose: false,
	 *              isDraggable: true
	 *         }]
	 *     }, {
	 *          id: 'g2',
	 *          ratio: 50,
	 *          items: [{
	 *              id: 'item-weather',
	 *              contentId: 'weather',
	 *              title: 'Weather Seciton',
	 *              isClose: false,
	 *              isDraggable: true
	 *          }, {
	 *              id: 'item-news',
	 *              contentId: 'news',
	 *              title: 'News Seciton',
	 *              isClose: true,
	 *              isDraggable: true
	 *          }]
	 *     }]
	 * });
	 */
	var Layout = snippet.defineClass(/** @lends Layout.prototype */ {
	    init: function(container, options) {
	        options = snippet.extend({
	            usageStatistics: true
	        }, options);

	        /**
	         * Container element
	         * @type {jQuery}
	         * @private
	         */
	        this.$element = null;

	        this._initContainer(container);
	        this._makeGroup(options.grouplist);
	        this._makeGuide(options.guideHTML);
	        this._setEvents();

	        if (options.usageStatistics) {
	            snippet.sendHostname('layout', 'UA-129987462-1');
	        }
	    },

	    /**
	     * Initialize container
	     * @param {jQuery|Element|string} container - Wrapper element or id selector
	     * @private
	     */
	    _initContainer: function(container) {
	        if (snippet.isString(container)) {
	            this.$element = $('#' + container);
	        } else {
	            this.$element = $(container);
	        }
	    },

	    /**
	     * Make group
	     * @param {Array} grouplist The list of group options
	     * @private
	     */
	    _makeGroup: function(grouplist) {
	        var group;

	        this.groups = {};

	        snippet.forEach(grouplist, function(item) {
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
	        if (snippet.isObject(group)) {
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
	     * @param {MouseEvent} e - Event object
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
	        var $doc = $(document);
	        var initPos = {
	            x: pointX + $doc.scrollLeft() + 10,
	            y: pointY + $doc.scrollTop() + 10
	        };
	        var itemId = $(target).attr('data-item');
	        var $moveEl = $('#' + itemId);

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
	        var group = this._getGroup(this.$temp);
	        var item = group.list[this.$temp.attr('data-index')];

	        this.$temp.css('opacity', '0.2');
	        this.$temp.find('#' + item.contentId).css('visibility', 'hidden');
	    },

	    /**
	     * It make item element seems to be unlocked.
	     * @private
	     */
	    _unlockTemp: function() {
	        var group = this._getGroup(this.$temp);
	        var item = group.list[this.$temp.attr('data-index')];

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
	     * @param {number} x - X position
	     * @param {number} y - Y position
	     * @private
	     */
	    _setScrollState: function(x, y) {
	        var $doc = $(document);
	        var $win = $(window);
	        var docHeight = this.height();
	        var height = $win.height();
	        var top = $doc.scrollTop();
	        var limit = docHeight - height;

	        if (height + top < y) {
	            $doc.scrollTop(Math.min(top + (y - height + top), limit));
	        }
	    },

	    /**
	     * Save document height or return height
	     * @param {number} [height] The height value to save _height feild
	     * @returns {number} Current height
	     * @ignore
	     */
	    height: function(height) {
	        var result = false;

	        if (snippet.isUndefined(height)) {
	            result = this._height;
	        } else {
	            this._height = height;
	        }

	        return result;
	    },

	    /**
	     * Detect move with group
	     * @param {object} item compare position with
	     * @param {number} pointX The position x will be detect which element selected.
	     * @param {number} pointY The position y will be detect which element selected.
	     * @private
	     */
	    _detectMove: function(item, pointX, pointY) {
	        var $doc = $(document);
	        var groupInst = this._getGroup(item);
	        var top = $doc.scrollTop();
	        var left = $doc.scrollLeft();
	        var $before;

	        if (snippet.isEmpty(groupInst.list)) {
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

	        snippet.forEach(group.list, function(item) {
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
	     * @returns {jQuery} Target element
	     * @private
	     */
	    _getTarget: function(item, pos, group) {
	        var bound = item.$element.offset();
	        var bottom = this._getBottom(item, group);
	        var height = item.$element.height();
	        var top = $(document).scrollTop() + bound.top;
	        var $target;

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
	     * If next element exist, set bottom next element's top position,
	     * else set bottom limit(group element's bottom position) position
	     * @param {object} item The object to figure bottom position
	     * @param {object} group The group to figure bottom position
	     * @returns {*}
	     * @private
	     */
	    _getBottom: function(item, group) {
	        var $next = item.$element.next();
	        var $doc = $(document);
	        var gbound = group.$element.offset();
	        var limit = $doc.scrollTop() + gbound.top + group.$element.height();
	        var bottom;

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
	     * @private
	     */
	    _onMouseUp: function() {
	        var drag = this._guide;
	        var $doc = $(document);

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
	            oldGroup = this._getGroup(temp.attr('data-groupinfo')),
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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/**
	 * @fileoverview The static values
	 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
	 */

	'use strict';

	module.exports = {
	    HTML: {
	        MOVEBUTTON: '<button class="move-button drag-item-move" data-item="{{item-id}}">move</button>',
	        ELEMENT: '<div class="item" data-index="{{number}}"><div class="{{wrapper}}"></div></div>',
	        TITLE: '<div class="title"></div>',
	        TOGGLEBUTTON: '<button class="toggle-button">toggle</button>',
	        GROUP: '<div class="group gp_{{group-id}}" data-group="{{group-id}}"></div>',
	        GUIDE: '<div class="item-guide"></div>'
	    },
	    TEXT: {
	        DEFAULT_TITLE: 'no title'
	    },
	    ERROR: {
	        OPTIONS_NOT_DEFINED: 'options are not defined'
	    },
	    DEFAULT_WRPPER_CLASS: 'item-body',
	    DIMMED_LAYER_CLASS: 'dimmed-layer'
	};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview layout group. group include item.
	 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
	 */

	'use strict';

	var $ = __webpack_require__(1);
	var snippet = __webpack_require__(2);

	var statics = __webpack_require__(3);
	var Item = __webpack_require__(5);

	/**
	 * The group class make list of item and group element(jQueryObject).
	 * @class Group
	 * @param {object} options - option
	 *     @param {string} options.id
	 *     @param {array} options.items array of items
	 *     @param {string} [options.html] html of group element
	 *     @param {(number|string)} [options.ratio] ratio
	 * @ignore
	 */
	var Group = snippet.defineClass(/** @lends Group.prototype */ {
	    /**
	     * Element pool
	     */
	    $pool: $('<div class="pool" style="display:none"></div>'),

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

	    /* eslint-disable no-useless-escape */
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
	    /* eslint-enable no-useless-escape */

	    /**
	     * Make list of item by items
	     * @param {array} list The list of item's IDs
	     * @private
	     */
	    _makeItems: function(list) {
	        var options = {
	            groupInfo: this.id
	        };
	        this.list = snippet.map(list, function(item) {
	            snippet.extend(item, options);

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
	        snippet.forEach(this.list, function(item, index) {
	            this.$dimmed.before(item.$element);
	            item.index = index;
	            item.$element.attr({
	                'data-index': index,
	                'data-groupinfo': this.id
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
	            snippet.forEach(this.list, function(item) {
	                this.$pool.append(item.$element);
	            }, this);
	        }
	    }
	});

	module.exports = Group;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview layout item. contain original items.
	 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
	 */

	'use strict';

	var $ = __webpack_require__(1);
	var snippet = __webpack_require__(2);

	var statics = __webpack_require__(3);

	/**
	 * Item class is manage item state and title.
	 * @class Item
	 * @param {object} options
	 *     @param {string} options.groupInfo group that has item name
	 *     @param {string} options.contentId content element id
	 *     @param {boolean} options.isClose content close or not
	 *     @param {boolean} options.isDraggable drag helper element use or not
	 *     @param {number} options.index index of content in group
	 *     @param {string} [options.moveButtonHTML] move button HTML
	 *     @param {string} [options.elementHTML] item element HTML
	 *     @param {string} [options.titleHTML] item title element HTML
	 * @ignore
	 */
	var Item = snippet.defineClass(/** @lends Item.prototype */ {
	    /* eslint-disable complexity */
	    init: function(options) {
	        if (!options) {
	            throw new Error(statics.ERROR.OPTIONS_NOT_DEFINED);
	        }

	        // html set
	        snippet.extend(options, {
	            elementHTML: options.elementHTML || statics.HTML.ELEMENT,
	            moveButtonHTML: options.moveButtonHTML || statics.HTML.MOVEBUTTON,
	            titleHTML: options.titleHTML || statics.HTML.TITLE,
	            toggleButtonHTML: options.toggleButtonHTML || statics.HTML.TOGGLEBUTTON,
	            title: options.title || statics.TEXT.DEFAULT_TITLE
	        });
	        snippet.extend(this, options);

	        this._makeElement();

	        // title used, and fix title (no hide)
	        if (!snippet.isBoolean(this.isClose)) {
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
	    /* eslint-enable complexity */

	    /**
	     * Get Index
	     * @returns {number} Current index
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
	                number: this.index,
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

	    /* eslint-disable no-useless-escape */
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
	    /* eslint-enable no-useless-escape */

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
	     * @param {string} toggleHTML - Toggled html contents
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
	        this.$toggleButton.addClass('open');
	        this.$content.hide();
	    },

	    /**
	     * Open item element
	     */
	    open: function() {
	        this.$toggleButton.removeClass('open');
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layout helper object. Guide mouse move-statement to know what is dragged well.
	 * @author NHN Ent. FE dev Lab <dl_javascript@nhnent.com>
	 */

	'use strict';

	var $ = __webpack_require__(1);
	var snippet = __webpack_require__(2);

	var statics = __webpack_require__(3);
	/**
	 * Guide class make helper element and move helper element by position.
	 * @classGuide
	 * @param {object} [options]
	 *     @param {string} [options.guideHTML] guide The html will be guide element.
	 * @ignore
	 */
	var Guide = snippet.defineClass(/** @lends Guide.prototype */ {
	    init: function(options) {
	        options = options || {};
	        this.$element = $(options.guideHTML || statics.HTML.GUIDE);
	        this.$element.css('position', 'absolute');
	        this.$element.appendTo(document.body);
	        this.$dimElements = $('.' + statics.DIMMED_LAYER_CLASS);
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
	        });
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


/***/ })
/******/ ])
});
;