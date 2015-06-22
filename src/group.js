/**
 * @fileoverview layout group. group include item.
 * @dependency code-snippet, jquery1.8.3, layout.js
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 */
ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Group = ne.util.defineClass({
	/**
	 * pool element
	 */
	$pool: $('<div class="pool" style="display:none"></div>'),
	/**
	 * init default field
	 * @param {object} options
	 * 	@param {string} options.id
	 *	@param {array} options.items array of items
	 * 	@param {string} [options.html] html of group element
	 * 	@param {(number|string)} [options.ratio] ratio
	 */
	init: function(options) {
		if (!options) {
			throw new Error(ERROR.OPTIONS_NOT_DEFINED);
		}

		this.size = options.ratio || '10';
		this.id = options.id;

		this._makeElement(options.html || HTML.GROUP);
		this._makeItems(options.items);
		this._appendDimmed();

		this.render();
	},

	/**
	 * make group element
	 * @param {string} html The html string to create the html element
	 * @private
	 */
	_makeElement: function(html) {
		html = html.replace(/{{group-id}}/g, this.id);
		html = html.replace(/{{width}}/g, this.size);
		this.$element = $(html);
		this.$element.css('position', 'relative');
	},

	/**
	 * make item list by items
	 * @param {array} list The list of item's IDs
	 * @private
	 */
	_makeItems: function(list) {
		var options = {
			groupInfo: this.id
		};
		this.list = ne.util.map(list, function(item) {
			ne.util.extend(item, options);
			return new ne.component.Layout.Item(item);
		}, this);
	},

	/**
	 * make dimmed element
	 * @private
	 */
	_makeDimmed: function() {
		this.$dimmed = $('<div class="' + DIMMED_LAYER_CLASS + '"></div>');
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
	 * append dimmed element
	 * @private
	 */
	_appendDimmed: function() {
		if (!this.$dimmed) {
			this._makeDimmed();
		}
		this.$element.append(this.$dimmed);
	},

	/**
	 * remove item by index
	 * @param {number} index The index of the item to remove
	 **/
	remove: function(index) {
		this.storePool(this.list[index]);
		this.list.splice(index, 1);
	},

	/**
	 * add item
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
	 * rearrange group items
	 */
	render: function() {
		ne.util.forEach(this.list, function(item, index) {
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
	 * store items to pool
	 * @param {object} $element A JQuery element to store in the pool
	 */
	storePool: function($element) {
		if ($element) {
			this.$pool.append($element);
		} else {
			ne.util.forEach(this.list, function(item) {
				this.$pool.append(item.$element);
			}, this);
		}
	}
});

