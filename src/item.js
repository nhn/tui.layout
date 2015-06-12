/**
 * @fileoverview Vision item class
 **/
ne.util.defineNamespace('ne.component.Layout');

ne.component.Layout.Item = ne.util.defineClass({
	/**
	 * init Item object
	 * @param options
	 **/
	init: function(options) {
		this.width = options.width;
		this.group = options.group;
		this.title = options.title || 'Vision Default';
		this.type = options.type || 'default';
		this.isOpen = ne.util.isBoolean(options.isOpen) ? options.isOpen : true;
		this.line = options.line || 1;
		this.visible = ne.util.isBoolean(options.isVisible) ? options.isVisible : true;
		this.grpIndex = options.grpIndex;
		this.index = options.index;
	},
	/**
	 * @param view
	 **/
	observe: function(view) {
		this.view = view;
	},
	/**
	 * @param key change key
	 * @param value change value 
	 **/
	set: function(key, value) {
		this[key] = value;
		this.notify();
	},
	/**
	 * view updated
	 **/
	notify: function() {
		this.view.update();
	},
	/**
	 * 
	 **/
	toggle: function() {
		this.isOpen = !this.isOpen;
	},
	/**
	 * @param {number} line 라인 번호
	 **/
	setLine: function(line) {
		this.line = line;
	},
	/**
	 * @param {string} group 
	 **/
	setGroup: function(group) {
		this.group = group;
	},
	/**
	 * hide
	 **/
	hide: function() {
		this.visible = false;
	},
	/**
	 * show
	 **/
	show: function() {
		this.visible = true;
	}
});