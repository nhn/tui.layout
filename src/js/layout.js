/**
 * @fileoverview Layout component
 * @author NHN. FE dev Lab <dl_javascript@nhn.com>
 */

'use strict';

var $ = require('jquery');
var snippet = require('tui-code-snippet');

var statics = require('./statics');
var Group = require('./group');
var Guide = require('./guide');

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
