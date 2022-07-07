export type LookupValue<K, R> =
	| R
	| ((item: K, ...param: any[]) => R | undefined);
export type KeyType = string | symbol | number;

export default class Lookup<K, R> {
	protected lookup;
	protected getKey;

	constructor(
		getKey: (item: K) => KeyType | undefined,
		lookup: { [key: KeyType]: LookupValue<K, R> } = {}
	) {
		this.lookup = lookup;
		this.getKey = getKey;
	}

	// add new handling to lookup
	handle(key: KeyType | KeyType[], value: LookupValue<K, R>): () => void {
		const keysArray = Array.isArray(key) ? key : [key];

		keysArray.forEach((key) => {
			this.lookup[key] = value;
		});

		return () => {
			this.unhandle(keysArray);
		};
	}

	// remove handling from lookup
	unhandle(key: KeyType | KeyType[]): void {
		const keysArray = Array.isArray(key) ? key : [key];

		keysArray.forEach((key: KeyType) => {
			delete this.lookup[key];
		});
	}

	// match item + params from lookup, if the lookup value is a function, run the function with the matching item + params
	match(item: K, ...param: any[]): R | undefined {
		const key = this.getKey(item);

		if (key) {
			const value = this.lookup[key];

			if (typeof value === 'function') {
				// @ts-ignore
				return value(item, ...param);
			}

			return value;
		}

		return undefined;
	}

	// match multiple items
	matchAll(items: K[], ...param: any[]): (R | undefined)[] {
		return items.map((item) => this.match(item, ...param));
	}
}
