/**
 * Shuffles the passed array _in place_, and returns the shuffled array for convenience.
 * Implementation of Fisher-Yates from StackOverflow, generalized
 * @param input The array to shuffle.
 */
export function shuffleArray<T>(input: Array<T>): Array<T> {
    let i = input.length;
    let j: number;
    let temp: T;
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1));
        temp = input[j];
        input[j] = input[i];
        input[i] = temp;
    }
    return input;
}
