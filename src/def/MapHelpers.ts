export function objectToMap<T>(obj: Record<string, T>): Map<string, T> {
    return new Map(Object.entries(obj));
}

export function mapToObject<T>(map: Map<string, T>): Record<string, T> {
    return Object.fromEntries(map);
}

export function jsonToMap(json: string) {
    return objectToMap(JSON.parse(json));
}

export function mapToJson(map: Map<string, any>): string {
    return JSON.stringify(mapToObject(map));
}
