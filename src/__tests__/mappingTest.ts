import Lookup from '../Lookup';
import Registry from '../Registry';

const testItemA = { id: 'a' };
const testItemB = { id: 'b' };
const testItemC = { id: 'c' };
const testItemD = { id: 'd' };
const mapping1 = {
	a: { message: 'ma1' },
	c: { message: 'mc1' },
};
const mapping2 = {
	b: { message: 'mb2' },
	c: { message: 'mc2' },
};
const match1 = (o: any) => {
	if (o.id in mapping1) {
		const x = (mapping1 as any)[o.id];
		return { ...o, ...x };
	}

	return undefined;
};
const match2 = (o: any) => {
	if (o.id in mapping2) {
		const x = (mapping2 as any)[o.id];
		return { ...o, ...x, second: true };
	}

	return undefined;
};

test('Empty matching', () => {
	const root = new Registry();
	expect(root.match(testItemA)).toBeUndefined();
});

test('Test direct matching', () => {
	const reg1 = new Registry(match1);

	expect(reg1.match(testItemA)).toEqual({
		id: testItemA.id,
		message: mapping1.a.message,
	});
});

test('Test indirect matching', () => {
	const reg1 = new Registry(match1);
	const root = new Registry(reg1);

	expect(root.match(testItemA)).toEqual({
		id: testItemA.id,
		message: mapping1.a.message,
	});
});

test('Test second matching', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);
	const root = new Registry(reg1, reg2);

	expect(root.match(testItemB)).toEqual({
		id: testItemB.id,
		message: mapping2.b.message,
		second: true,
	});
});

test('Test priority matching', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);

	const root = new Registry(reg1, reg2);

	expect(root.match(testItemC)).toEqual({
		id: testItemC.id,
		message: mapping1.c.message,
	});
});

test('Test cleanup removal', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);

	const root = new Registry(reg2);

	const cleanup = root.add(reg1);

	cleanup();

	expect(root.match(testItemA)).toBeUndefined();
});

test('Test direct removal', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);

	const root = new Registry();

	root.add(reg1, reg2);
	root.remove(reg1);

	expect(root.match(testItemA)).toBeUndefined();
});

test('Test priority matching after removal', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);

	const root = new Registry();

	const cleanup = root.add(reg1);
	root.add(reg2);

	cleanup();

	expect(root.match(testItemC)).toEqual({
		id: testItemC.id,
		message: mapping2.c.message,
		second: true,
	});
});

test('Test removal empty', () => {
	const reg1 = new Registry(match1);
	const reg2 = new Registry(match2);

	const root = new Registry();

	root.add(reg1, reg2);
	root.remove(reg1, reg2);

	expect(root.match(testItemB)).toBeUndefined();
});

test('Test removal empty', () => {
	const root = new Registry(
		new Lookup((x: any) => x.id, {
			a: 'aa',
			c: 'cc',
			d: (x: any) => ({ ...x, test: 'dd' }),
		})
	);

	expect(root.match(testItemA)).toBe('aa');
	expect(root.match(testItemB)).toBeUndefined();
	expect(root.match(testItemC)).toBe('cc');
	expect(root.match(testItemD)).toEqual({ id: 'd', test: 'dd' });
});

test('Test emission', () => {
	const root = new Registry();

	const mockHandler = jest.fn(() => {});

	root.onChange.sub(mockHandler);

	const cleanup = root.add(() => {});

	expect(mockHandler.mock.calls.length).toBe(1);

	cleanup();

	expect(mockHandler.mock.calls.length).toBe(2);

	const h = () => {};
	root.add(h);

	expect(mockHandler.mock.calls.length).toBe(3);

	root.remove(h);

	expect(mockHandler.mock.calls.length).toBe(4);
});
