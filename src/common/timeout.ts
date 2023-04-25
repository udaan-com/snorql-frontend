
export const withTimeout = <R> (fn: () => Promise<R>, taskName: string, ms: number): Promise<R> => {
    return new Promise<R> ((resolve, reject) => {
        setTimeout(() => reject(`Timed out while performing task: ${taskName}`), ms);
        fn().then(resolve, reject);
    });
};
