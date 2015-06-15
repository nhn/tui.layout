ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Group = ne.util.defineClass({
	/**
	 * init default field
	 **/
	init: function() {
		this.first = null;
		this.last = null;
	},
	/**
	 * @param {object} item to add
	 * @param {object} item add to
	 * @param {boolean} isPrev whether prev or not 
	 **/
	add: function(item, target, isPrev) {
		var next, prev;
		if (!this.first) {
			this.first = item;
			this.last = item;
		} else if (arguments.length < 2) {
			this.addToLast(item);
		} else {
			if (isPrev) {
				this.addToPrev(target, item);
			} else {
				this.addToNext(target, item);
			}
		}
	},
	/**
	 * add to next to target
	 * @param {object} target stand target
	 * @param {object} item to be added
	 **/
	addToNext: function(target, item) {
		var next = target.getNext();

		if (next) {			
			next.setPrev(item);
			item.setNext(next);
			target.setNext(item);
		} else {
			target.setNext(item);
			item.setPrev(target);
		}

		if (target === this.last) {
			this.last = item;
		}
		
	},
	/**
	 * add to prev to target
	 * @param {object} target stand target
	 * @param {object} item to be added
	 **/
	addToPrev: function(target, item) {
		var prev = target.getPrev();

		prev.setNext(item);
		item.setPrev(prev);
		target.setPrev(item);

		if (target === this.first) {
			this.first = item;
		}
	},
	/**
	 * add last item
	 * @param {object} item to be added
	 **/
	addToLast: function(item) {
		this.last.setNext(item);
		item.setPrev(this.last);
		this.last = item;
	},
	/**
	 * get target by index
	 * @param {number} index target index
	 **/
	getTarget: function(index) {
		var i = 0,
			temp = this.first;
		while (i < index) {
			temp = temp.getNext();
			i++;
		}
		return temp;
	},
	/**
	 * remove item
	 * @param {nubmer} index remove item index
	 **/
	remove: function(index) {
		var target = this.getTarget(index),
			prev = target.getPrev(),
			next = target.getNext();
		prev.setNext(next);
		next.setPrev(prev);
		// disconnect target from any items
		target.setNext(null);
		target.setPrev(null);
	},
	/**
	 * reset
	 **/
	reset: function() {
		this.first = null;
		this.last = null;
	}
});
