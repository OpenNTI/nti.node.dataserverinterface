import toArray from '../toarray';

describe('toArray', ()=> {
	let abc = ['a', 'b', 'c'];
	let empty3 = new Array(3);
	let empty = [];

	let a = {0: 'a', 1: 'b', 2: 'c', length: 3};
	let b = {length: 3};

	it('should convert object with length to array of length', ()=> {
		expect(toArray(a)).toEqual(abc);
		expect(toArray(b)).toEqual(empty3);

		expect(toArray('abc')).toEqual(abc);
		expect(toArray({})).toEqual(empty);
	});


	it('should return [] for invalid input', ()=> {
		expect(toArray(1)).toEqual(empty);
		expect(toArray(true)).toEqual(empty);
		expect(toArray(false)).toEqual(empty);
		expect(toArray(NaN)).toEqual(empty);
		expect(toArray(undefined)).toEqual(empty);
		expect(toArray(null)).toEqual(empty);
		expect(toArray()).toEqual(empty);
	});

});
