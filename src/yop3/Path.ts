import { ArrayElementType } from "./types"

type OneKey<T extends object> = { [K in keyof T]-?:
    ({ [P in K]: T[K] } & { [P in Exclude<keyof T, K>]?: never }) extends infer O ? { [P in keyof O]: O[P] } : never
}[keyof T]

type PathEnd = ""

export type Path<T> =
    T extends any[] ? PathEnd | readonly [number, Path<ArrayElementType<T>>?] :
    T extends object ? PathEnd | OneKey<{ [P in keyof T]: Path<T[P]> }> :
    PathEnd

export function splitPath(path: string | Path<any>) {
    const segments: (string | number)[] = []
    if (typeof path === "string") {
        for (const pathElement of path.split('.')) {
            const bracketIndex = pathElement.indexOf('[')
            const property = bracketIndex !== -1 ? pathElement.slice(0, bracketIndex) : pathElement
            if (property !== "")
                segments.push(property)
            if (bracketIndex !== -1)
                segments.push(parseInt(pathElement.slice(bracketIndex + 1, -1)))
        }
    }
    else {
        let currentPath: any = path
        while (currentPath !== "") {
            if (Array.isArray(currentPath)) {
                segments.push(currentPath[0])
                currentPath = currentPath[1]
            }
            else {
                const property = Object.keys(currentPath)[0]
                segments.push(property)
                currentPath = currentPath[property]
            }
        }
    }
    return segments
}
