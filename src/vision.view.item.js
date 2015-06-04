/**
 * @fileoverview Vision item view class
 **/
Asdf.Core.namespace('weget.Vision.View');

weget.Vision.View.Item = Asdf.Base.Class({
	/**
	 * initialize with options
	 **/
	initialize: function(options) {
		this._vm = options.vm;
		this._makeElement();
	},
	/**
	 * make element with vm properties
	 **/
	_makeElement: function() {
		var vm = this._vm;
		this._element = document.createElement('DIV');
		this._element.setAttribute('group', vm.group);
		this._element.setAttribute('group-index', vm.grpIndex);
	}
});