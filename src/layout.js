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