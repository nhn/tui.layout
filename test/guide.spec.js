describe('view drag', function() {
	var drag = new ne.component.Layout.Guide({
		enableDist: 5
	});
	jasmine.getFixtures().fixturesPath = 'base';
	beforeEach(function() {
		loadFixtures('test/html/guide.html');
	});

	it('drag know range for insert', function() {
		drag.setPos({
			x: 100,
			y: 200
		});

		expect(drag.element.css('left')).toBe('100px');
		expect(drag.element.css('top')).toBe('200px');
	});
	it('set Content', function() {
		var content = 'guide content';
		drag.setContent(content);
		expect(drag.element.html()).toBe(content);
	});
	it('show with isDisable', function() {
		var status1, status2;
		drag.hide();
		drag.disable();
		drag.show();
		status1 = drag.element[0].style.display;
		drag.enable();
		drag.show();
		status2 = drag.element[0].style.display;
		expect(status1).toBe('none');
		expect(status2).not.toBe('none');
	});
	it('drag target', function() {
		var el = $('.item1'),
		target = $('.item3');
		drag.setMoveElement(el);
		drag.setTargetElement(target);
		expect(drag.figureValidTarget()).toBe(true);
		drag.setTargetElement(el);
		expect(drag.figureValidTarget()).toBe(false);
	});
	it('enable target drag zone', function() {
		var moveEl = $('.item2'),
		target = $('.item1'),
		point = {
			x : 4,
			y : 5
		};
		point2 = {
			x : 40,
			y : 50
		};
		drag.setTargetElement(target);
		drag.setMoveElement(moveEl);
		expect(drag.figureValidArea(point)).toBe(true);
		expect(drag.figureValidArea(point2)).toBe(false);
	});
	it('shadow move Element', function() {
		drag.moveTo({
			x: 100,
			y: 200
		});

		expect(drag.element.css('left')).toBe('100px');
		expect(drag.element.css('top')).toBe('200px');
	});
});