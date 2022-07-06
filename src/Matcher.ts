export type MatchFunction<K, R> = (item: K, ...param: any[]) => R | undefined;

type Matcher<K, R> = { match: MatchFunction<K, R> } | MatchFunction<K, R>;

export default Matcher;
