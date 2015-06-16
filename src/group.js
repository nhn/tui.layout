ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Group = ne.util.defineClass({
	/**
	 * pool element
	 **/
	$pool: $('<div class="pool" style="display:none"></div>'),
	/**
	 * init default field
	 **/
	init: function(options) {
		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this.size = options.width;
		this.id = options.id;
		this.$element = $(options.html || HTML.GROUP);

		this._makeItems(options.items);
		this.render();
	},
	/**
	 * make item list by items
	 * @param {array} list item ids
	 **/
	_makeItems: function(list) {
		var options = {
			groupInfo: this.id
		}
		this.list = ne.util.map(list, function(item, index) {
			ne.util.extend(item, options);
			return new ne.component.Layout.Item(item);
		}, this);	
	},
	/**
	 * remove item by index
	 * @param {number} index remove item index
	 **/
	remove: function(index) {
		this.list.splice(index, 1);
		this.render();
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
		item.groupInfo = this.id;
		this.render();
	},
	/**
	 * re arrange group
	 **/
	render: function() {
		this._storePool();
		ne.util.forEach(this.list, function(item) {
			this.$element.append(item.$element);
		}, this);
	},
	/**
	 * store items to pool
	 **/
	_storePool: function() {
		ne.util.forEach(this.list, function(item) {
			this.$pool.append(item.$element);
		}, this);
	}
});

