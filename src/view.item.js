/**
 * @fileoverview Vision item view class
 **/
ne.util.defineNamespace('ne.component.Layout.View');


var ELEMENT_CLASS = {
		ITEM: 'item',
		TITLE: 'title',
		BODY: 'body'
	},
	ELEMENT_TEMPLATE = '<div class="{{itemClass}} {{selector}}" grp-name="{{group}}" item-index="{{index}}">' +
				'<div class="{{titleClass}}">item1 Title<button item-name="{{selector}}">MOVE</button></div>' +
				'<div class="{{bodyClass}}"></div>' + 
			'</div>',
	ELEMENT_POOL = document.createDocumentFragment(),
	FORMWORK = document.createElement('div');

ne.component.Layout.View.Item = ne.util.defineClass({
	/**
	 * initialize with options
	 **/
	init: function(options) {
		this._vm = options.vm;
		this._makeElement();
		this._vm.observe(this);
	},
	/**
	 * make element with vm properties
	 **/
	_makeElement: function() {
		FORMWORK.innerHTML = this._getHTML();
		this._element = FORMWORK.firstChild
		ELEMENT_POOL.appendChild(this._element);
	},
	/**
	 * get html by vm data
	 **/
	_getHTML: function() {
		var vm = this._vm,
			replaceMap = {
				itemClass: vm.itemClass || ELEMENT_CLASS.ITEM,
				selector: (vm.itemClass || ELEMENT_CLASS.ITEM) + vm.index,
				index: vm.index,
				group: vm.group,
				titleClass: vm.titleClass || ELEMENT_CLASS.TITLE
			},
			html = ELEMENT_TEMPLATE.replace(/\{\{([^\}]+)\}\}/g, function(matchedString, name) {
                return replaceMap[name] || '';
            });
		return html;
	},
	/**
	 * updated from vm notify
	 **/
	update: function() {
        FORMWORK.innerHTML = this._getHTML();
        ELEMENT_POOL.removeChild(this._element);
        this._element = FORMWORK.firstChild;
        ELEMENT_POOL.appendChild(this._element);
	}
});