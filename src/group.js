ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Group = ne.util.defineClass({
	/**
	 * init default field
	 **/
	init: function(options) {
		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this.size = options.width;
		this.type = options.type;
		this.$element = $(options.html || HTML.GROUP);

		this._makeItems(options.items);
	},
	/**
	 * make item list by items
	 * @param {array} list item ids
	 **/
	_makeItems: function(list) {
		this.list = ne.util.map(list, function(item, index) {
			return new ne.component.Layout.Item({
				id: item.id,
				contentID: item.contentID,
				groupInfo: this.type,
				isDraggable: item.isDraggable,
				isClose: item.isClose,
				title: item.title,
				index: index
			});
		});
	},
	/**
	 * remove item by index
	 * @param {number} index remove item index
	 **/
	remove: function(index) {
		this.list.splice(index, 1);
	},
	/**
	 * add item
	 * @param {number} [index] add item position
	 **/
	add: function(item, index) {
		if (arguments.length > 1) {
			this.list.splice(index, 0, item);
		} else {
			this.list.push(item);
		}
	}
});

