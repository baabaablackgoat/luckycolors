export function numberToPosition(x: number): string {
    const tensDigit = x % 10;
    const hundredsDigits = x % 100;
    if (tensDigit === 1 && hundredsDigits !== 11) {
        return `${x}st`;
    }
    if (tensDigit === 2 && hundredsDigits !== 12) {
        return `${x}nd`;
    }
    if (tensDigit === 3 && hundredsDigits !== 13) {
        return `${x}rd`;
    }
    return `${x}th`;
}
