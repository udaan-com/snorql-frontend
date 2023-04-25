
export class APIClient {

    private readonly prefix: string;

    constructor (prefix: string) {
        this.prefix = prefix;
    }

    fetch = (input: RequestInfo, init?: RequestInit) => {
        if (typeof input === 'string' && input.startsWith("/")) {
            return fetch(`${this.prefix}${input}`, init);
        }
        if (typeof input === 'object' && typeof input.url === 'string' && input.url.startsWith("/")) {
            return fetch({
                ...input,
                url: `${this.prefix}${input.url}`,
            }, init);
        }
        return fetch(input, init);
    };

}
