export type EventListener<T> = (e: T) => void;

export default class EventEmitter<T = void> {
	listeners: EventListener<T>[] = [];

	subscribe(handler: (e: T) => void) {
		this.listeners.push(handler);

		return () => {
			this.unsubscribe(handler);
		};
	}

	unsubscribe(handler: EventListener<T>) {
		const index = this.listeners.indexOf(handler);

		if (index !== -1) {
			this.listeners.splice(index, 1);
		}
	}

	emit(event: T) {
		this.listeners.forEach((handler) => handler(event));
	}
}
