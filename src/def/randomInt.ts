/**
 * Returns a random integer between the given numbers.
 * @param min Inclusive minimum value
 * @param max Exclusive maximum value (this value will never be rolled!)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}
