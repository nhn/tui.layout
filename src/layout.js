ne.util.defineNamespace('ne.component');

ne.component.Layout = ne.util.defineClass({
	init: function(opitons, $element) {
		this.$element = $element;
		this._makeGroup(opitons.grouplist);
		this._makeDragAndDrop(opitons.guideHTML);
		this._setEvents();
		this._pos = {};
	},
	/**
	 * make group
	 * @param {array} grouplist list of group options
	 **/
	_makeGroup: function(grouplist) {
		var group;
		this.groups = {};

		ne.util.forEach(grouplist, function(item) {
			group = this.groups[item.id] = new ne.component.Layout.Group(item);
			this.$element.append(group.$element);
		}, this);
	},
	/**
	 * @param {(string|object)} object group item id or information to find group
	 **/
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
	 * make drag and drop event
	 * @param {string} [guideHTML] guide element html
	 **/
	_makeDragAndDrop: function(guideHTML) {
		this._drag = new ne.component.Layout.Drag({
			guideHTML: guideHTML
		});
	},
	/**
	 * set Event 
	 **/
	_setEvents: function() {
		this.onMouseDown = $.proxy(this._onMouseDown, this);
		$('.drag-item-move').on('mousedown', this.onMouseDown);
	},
	/**
	 * mouse down event handler
	 * @param {JqueryEvent} e event object
	 **/
	_onMouseDown: function(e) {
		this._pos.x = e.clientX + this.getX() + 10;
		this._pos.y = e.clientY + this.getY() + 10;
		this._drag.ready(this._pos);
		this.onMouseMove = $.proxy(this._onMouseMove, this);
		this.onMouseUp = $.proxy(this._onMouseUp, this);
		this._drag.setMoveElement($('#' + e.target.getAttribute('data-item')));
		this.$temp = this._drag.moveElement; 
		this.$temp.addClass('drag-clone');
		$(document).on('mousemove', this.onMouseMove);
		$(document).on('mouseup', this.onMouseUp);
	},
	/**
	 * mouse move handler
	 * @param {JqueryEvent} e event object
	 **/
	_onMouseMove: function(e) {		
		var parent = $(e.target).parent(),
			x = this.getX(),
			y = this.getY(),
			pointX = e.clientX + this.getX(),
			pointY = e.clientY + this.getY(),
			pos = this._pos,
			flow,
			drag = this._drag,
			group = parent.attr('data-group'),
			groupInst,
			$before;

		drag.moveTo({
			x: pos.x + (e.clientX + x -pos.x) + 10 + 'px',
			y: pos.y + (e.clientY + y-pos.y) + 10 + 'px'
		});


		if (!group) {
			return;
		}

		groupInst = this._getGroup(group);

		if (ne.util.isEmpty(groupInst.list)) {
			parent.append(this.$temp);
			this.$temp.way = 'after';
			this.$temp.index = 0;
		} else {
			$before = this._detectTargetByPosition({
				x: pos.x + (e.clientX +  x - pos.x),
				y: pos.y + (e.clientY + y - pos.y)
			}, groupInst);

			if ($before && $before.way) {
				$before[$before.way](this.$temp);
				this.$temp.way = $before.way;
				this.$temp.index = $before.attr('data-index');
			}
		}
	},
	/**
	 * detect target by move element position
	 * @param {object} pos position to detect
	 * @param {object} group  group that has child
	 * @return {object} target detected target
	 **/
	_detectTargetByPosition: function(pos, group) {
		var target, 
			bound,
			next, 
			bottom,
			top,
			height;

		ne.util.forEach(group.list, function(item) {
			if (!this._isValidItem(item)) {
				return;
			}

			bound = item.$element[0].getBoundingClientRect();
			bottom = this._getBottom(item, group);
			height = item.$element.height();
			// 요소 높이의 반을 기준으로 타겟을 선정한
			top = this.getY() + bound.top;
			if (pos.y > top && pos.y <= top + (height / 2)) {
				target = item.$element;
				target.way = 'before';
			} else if (pos.y > top + (height / 2) && pos.y < bottom) {
				target = item.$element;
				target.way = 'after';
			}

		}, this);

		return target;
	},
	/**
	 * check is Vaild item
	 **/
	_isValidItem: function(item) {
		return !!(item.$element[0] !== this.$temp[0]);
	},
	/**
	 * 다음요소가 있을 경우, 비교할 bottom 값으로 다음요소 top값을 넣어줌, 다음요소가 없으면 마지막 요소로 판단하여 limit(그룹의 bottom)값을 넣어줌
	 * @param {object} item
	 * @param {object} group
	 **/
	_getBottom: function(item, group) {
		var next = item.$element.next(),
			bottom,
			gbound = group.$element[0].getBoundingClientRect(),
			limit = this.getY() + gbound.top + group.$element.height();
		if (next.hasClass(DIMMED_LAYER_CLASS)) {
			bottom = limit;
		} else {
			bottom = this.getY() + next[0].getBoundingClientRect().top;
		}
		return bottom;
	},
	/**
	 * get add index by $temp, $temp.way 
	 **/
	_getAddIndex: function() {
		var temp = this.$temp,
			index = parseInt(temp.index, 10);
		if (temp.way === 'after') {
			index += 1;
		}
		return index;
	},
	/**
	 * get scrollX
	 **/
	getX: function() {
		return (window.scrollX || $(window).scrollLeft());
	},
	/**
	 * get scrollY
	 **/
	getY: function() {
		return (window.scrollY || $(window).scrollTop());
	},
	/**
	 * mouse up handler
	 * @param {JqueryEvent} e event object
	 **/
	_onMouseUp: function(e) {
		var drag = this._drag,
			temp = this.$temp,
			oldGroup = this._getGroup(temp.attr('data-groupInfo')),
			targetGroup = this._getGroup(temp.parent()),
			removeIndex = parseInt(temp.attr('data-index'), 10),
			addIndex = this._getAddIndex(),
			item = oldGroup.list[removeIndex];

		if (addIndex) {
			oldGroup.remove(removeIndex);
			targetGroup.add(item, addIndex);
			targetGroup.render();
			oldGroup.render();
		}		

		drag.finish();

		$(document).off('mousemove', this.onMouseMove);
		$(document).off('mouseup', this.onMouseUp);
	}
});