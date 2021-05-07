declare let dcodeIO: any;

export interface HashArgs {
    /**
     * The text to hash.
     */
    text: string;

    /**
     * The complexity of the generated hash.
     * Incrementing this value linearly increments the time it takes to generated a hash exponentially.
     */
    rounds: number;

    /**
     * An optional callback to receive status updates while hashing.
     */
    progress?: (t: number) => void;
}

/**
 * Hash a given text using the given rounds.
 *
 * @param args The arguments.
 * @returns The generated hash.
 */
export async function hash(args: HashArgs): Promise<string> {
    return new Promise((resolve, reject) => {
        dcodeIO.bcrypt.hash(
            args.text,
            args.rounds,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            },
            args.progress,
        );
    });
}

export interface CompareArgs {
    /**
     * The text to compare with.
     */
    text: string;

    /**
     * The hash to compare against.
     */
    hash: string;

    /**
     * An optional callback to receive status updates while hashing.
     */
    progress?: (t: number) => void;
}

/**
 * Compare the given has to the given text.
 *
 * @param args The arguments.
 * @returns Whether or not the text matches the hash.
 */
export async function compare(args: CompareArgs): Promise<boolean> {
    return new Promise((resolve, reject) => {
        dcodeIO.bcrypt.compare(
            args.text,
            args.hash,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            },
            args.progress,
        );
    });
}
