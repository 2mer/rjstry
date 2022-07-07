import EventEmitter from './EventEmitter';
import Matcher from './Matcher';

export default class Registry<K, R> {
	protected matchers = [] as Matcher<K, R>[];

	readonly onChange = new EventEmitter();

	constructor(...matchers: Matcher<K, R>[]) {
		this.add(...matchers);
		this.onChange.emit();

		this.match = this.match.bind(this);
	}

	// adds a matcher to the registry
	// returns a function to remove added item (cleanup function)
	protected _add(matcher: Matcher<K, R>) {
		this.matchers.push(matcher);

		return () => {
			this.remove(matcher);
		};
	}

	// add all matchers to registry
	add(...matchers: Matcher<K, R>[]) {
		const cleanups = matchers.map((m) => this._add(m));
		this.onChange.emit();

		return () => {
			cleanups.forEach((c) => c());
			this.onChange.emit();
		};
	}

	protected _remove(matcher: Matcher<K, R>) {
		const index = this.matchers.indexOf(matcher);

		if (index !== -1) {
			this.matchers.splice(index, 1);
		}
	}

	// remove matcher from the registry
	remove(...matchers: Matcher<K, R>[]) {
		matchers.forEach((m) => this._remove(m));
		this.onChange.emit();
	}

	// try to match item to extended item, if none exist returns undefined
	match(item: K, ...param: any[]): R | undefined {
		let found = undefined;

		this.matchers.find((matcher) => {
			if (typeof matcher === 'function') {
				found = matcher(item, ...param);
			} else {
				found = matcher.match(item, ...param);
			}

			return found;
		});

		return found;
	}

	// match multiple items
	matchAll(items: K[], ...param: any[]): (R | undefined)[] {
		return items.map((item) => this.match(item, ...param));
	}
}
