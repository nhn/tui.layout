describe('vm item', function() {
	var item,
		Item = ne.component.Layout.Item;

	beforeEach(function() {
		item = new Item({
			width: 300,
			group: 'top',
			title: 'vision title',
			type : 'typeA'
		});
	});


	it('item has essential options', function() {
		expect(item.width).toBe(300);
		expect(item.group).toBe('top');
		expect(item.title).toBe('vision title');
		expect(item.type).toBe('typeA');
	});

	it('open toggle', function() {
		item.toggle();
		expect(item.isOpen).toBe(false);
		item.toggle();
		expect(item.isOpen).toBe(true);
	});

	it('setLine', function() {
		item.setLine(2);
		expect(item.line).toBe(2);
	});

	it('setGroup', function() {
		item.setGroup('bottomL');
		expect(item.group).toBe('bottomL');
	});

	it('hide', function() {
		item.hide();
		expect(item.visible).toBe(false);
	});
	
	it('show', function() {
		item.show();
		expect(item.visible).toBe(true);
	});
});