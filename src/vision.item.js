/**
 * @fileoverview Vision item class
 **/
Asdf.Core.namespace('weget.Vision.Item');

var type = Asdf.O;

weget.Vision.Item = Asdf.Base.Class({
	/**
	 * init Item object
	 * @param options
	 **/
	initialize: function(options) {
		this.width = options.width;
		this.group = options.group;
		this.title = options.title || 'Vision Default';
		this.type = options.type || 'default';
		this.isOpen = type.isBoolean(options.isOpen) ? options.isOpen : true;
		this.line = options.line || 1;
		this.visible = type.isBoolean(options.isVisible) ? options.isVisible : true;
		this.grpIndex = options.grpIndex;
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