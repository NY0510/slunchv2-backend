declare module 'bun' {
	interface Env {
		PORT: number | undefined;
		NEIS_API_KEY: string;
		MONGO_URI: string;
	}
}
