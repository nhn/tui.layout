ne.util.defineNamespace('ne.component');

ne.component.Layout = ne.util.defineClass({
	init: function(opitons, $element) {
		this.$element = $element;
		this._makeGroup(opitons.grouplist);
	},
	/**
	 * make group
	 * @param {array} grouplist list of group options
	 **/
	_makeGroup: function(grouplist) {
		var group;

		this.groups = ne.util.map(grouplist, function(item) {
			group =  new ne.component.Layout.Group(item);
			this.$element.append(group.$element);
			return group;
		}, this);
	}
});