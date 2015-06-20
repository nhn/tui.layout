ne.util.defineNamespace('ne.component');

ne.component.Layout = ne.util.defineClass({
	init: function(opitons, $element) {
		this.$element = $element;
		this._makeGroup(opitons.grouplist);
		this._makeDragAndDrop();
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
		var id;
		if (ne.util.isObject(group)) {
			if (group.attr('data-group')) {
				id = group.attr('data-group');
			} else {
				id = group.parent().attr('data-group');
			}
		}
		return this.groups[id];
	},
	/**
	 * make drag and drop event
	 **/
	_makeDragAndDrop: function() {
		this._drag = new ne.component.Layout.Drag({

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
		this.$temp = this._drag.moveElement.clone(); 
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
			drag = this._drag;
		drag.moveTo({
			x: pos.x + (e.clientX + x -pos.x) + 10 + 'px',
			y: pos.y + (e.clientY + y-pos.y) + 10 + 'px'
		});
		if (parent.attr('data-index')) {
			this._drag.setTargetElement(parent);
			if (parent.hasClass('drag-clone')) {
				this._drag.setTargetElement(parent.next());
				// parent.find('.drag-clone')
			} else {
				flow = drag.figureValidTarget() && drag.figureValidArea({
					x: pointX,
					y: pointY
				});
			}
			this._appendTemp(parent, flow);
		} else if($(e.target).attr('data-group')) {
			var target = drag.figureInterval({
				x: pointX,
				y: pointY
			}, this._getGroup($(e.target).attr('data-group')));

			if (target) {
				target.after(this.$temp);
			} 
		} else {
			this.$temp.hide();
		}
		console.log(drag.part);
	},
	/**
	 * attemped append temp element
	 * @param {object} parent target to append element
	 * @param {string} flow flow value (bottom || top)
	 **/
	_appendTemp: function(parent, flow) {
		if(flow === 'top') {
			this.$temp.show();
			parent.before(this.$temp);
		} else if (flow === 'bottom') {
			this.$temp.show();
			parent.after(this.$temp);
		}
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
			oldGroup = this._getGroup(drag.moveElement),
			targetGroup = this._getGroup(drag.targetElement);
			console.log(oldGroup, targetGroup),
			removeIndex = parseInt(drag.moveElement.attr('data-index'), 10),
			addIndex = parseInt(drag.targetElement.attr('data-index'), 10),
			item = oldGroup.list[removeIndex];

		addIndex = (drag.part === 'bottom') ? addIndex + 1 : addIndex;
		console.log(addIndex);
		oldGroup.remove(removeIndex);
		targetGroup.add(item, addIndex);
		oldGroup.render();
		targetGroup.render();
		drag.finish();

		$(document).off('mousemove', this.onMouseMove);
		$(document).off('mouseup', this.onMouseUp);
	}
});