describe('layout view', function() {
	var layout;

	beforeEach(function() {
		layout = new ne.component.Layout.View.Layout({
			element: $('#layout'),
			type: 'A'
		});
	});

	it('layout created', function() {
		expect(layout).toBeDefined();
	});

});