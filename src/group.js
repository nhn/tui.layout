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

		this.size = options.ratio || '10d';
		this.id = options.id;

		this._makeElement(options.html || HTML.GROUP);

		this._makeItems(options.items);
		this.render();
	},
	/**
	 * make group element
	 * @param {string} html 
	 **/
	_makeElement: function(html) {
		html = html.replace(/{{group-id}}/g, this.id);
		html = html.replace(/{{width}}/g, this.size);
		this.$element = $(html);
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
		this._storePool(this.list[index]);
		this.list.splice(index, 1);
		console.log(this.list);
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
		console.log(this.list);
	},
	/**
	 * re arrange group
	 **/
	render: function() {
		this._storePool();
		this.$element.empty();
		ne.util.forEach(this.list, function(item, index) {
			this.$element.append(item.$element);
			item.$element.attr('data-index', index);
		}, this);
	},
	/**
	 * store items to pool
	 * @param {object} $element object
	 **/
	_storePool: function($element) {
		if ($element) {
			this.$pool.append($element);
		} else {
			ne.util.forEach(this.list, function(item) {
				this.$pool.append(item.$element);
			}, this);
		}
	}
});

