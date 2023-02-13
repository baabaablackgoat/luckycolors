export function isAlphanumericString(str: string) {
    return /^[\w\s]+$/.test(str);
}