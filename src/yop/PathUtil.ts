
const DOT = 1
const OPEN_BRACKET = 2
const SINGLE_QUOTE = 3
const DOUBLE_QUOTE = 4
const CLOSE_QUOTE = 5
const CLOSE_BRACKET = 6

type State = typeof DOT | typeof OPEN_BRACKET | typeof SINGLE_QUOTE | typeof DOUBLE_QUOTE | typeof CLOSE_QUOTE | typeof CLOSE_BRACKET | undefined

export type Path = (string | number)[]

const identifier = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u
function isValidIdentifier(segment: string): boolean {
    return identifier.test(segment)
}

export function splitPath(path: string, cache?: Map<string, Path>): Path | undefined {

    if (cache != null) {
        const cached = cache.get(path)
        if (cached != null)
            return cached.slice()
    }

    const segments = []

    let state: State = undefined,
        escape = false,
        segment = ""

    for (let i = 0; i < path.length; i++) {
        let c = path.charAt(i)

        switch (c) {

            case '\\':
                if (state !== SINGLE_QUOTE && state !== DOUBLE_QUOTE)
                    return undefined
                if (escape)
                    segment += '\\'
                escape = !escape
                continue
        
            case ' ': case '\t': case '\r': case '\n':
                if (state === SINGLE_QUOTE || state === DOUBLE_QUOTE)
                    segment += c
                else {
                    while (++i < path.length && ((c = path.charAt(i)) === ' ' || c === '\t' || c === '\r' || c === '\n'))
                        ;
                    if (state === OPEN_BRACKET && path.charAt(i) !== ']' && segment)
                        return undefined
                    --i
                }
                break

            case '.':
                if (escape || state === SINGLE_QUOTE || state === DOUBLE_QUOTE)
                    segment += c
                else if (state === CLOSE_BRACKET) {
                    if (segment)
                        return undefined
                    state = DOT
                }
                else if (state === undefined || state === DOT) {
                    if (!isValidIdentifier(segment))
                        return undefined
                    segments.push(segment)
                    segment = ""
                    state = DOT
                }
                else
                    return undefined
                break
            
            case '[':
                if (escape || state === SINGLE_QUOTE || state === DOUBLE_QUOTE)
                    segment += c
                else if (state === DOT) {
                    if (!isValidIdentifier(segment))
                        return undefined
                    segments.push(segment)
                    segment = ""
                    state = OPEN_BRACKET
                }
                else if (state === CLOSE_BRACKET) {
                    if (segment)
                        return undefined
                    state = OPEN_BRACKET
                }
                else if (state === undefined) {
                    if (segment) {
                        if (!isValidIdentifier(segment))
                            return undefined
                        segments.push(segment)
                        segment = ""
                    }
                    state = OPEN_BRACKET
                }
                else
                    return undefined
                break
            
            case ']':
                if (escape || state === SINGLE_QUOTE || state === DOUBLE_QUOTE)
                    segment += c
                else if (state === OPEN_BRACKET) {
                    if (!segment)
                        return undefined
                    segments.push(parseInt(segment, 10))
                    segment = ""
                    state = CLOSE_BRACKET
                }
                else if (state === CLOSE_QUOTE) {
                    segments.push(segment)
                    segment = ""
                    state = CLOSE_BRACKET
                }
                else
                    return undefined
                break

            case '\'':
                if (escape || state === DOUBLE_QUOTE)
                    segment += c
                else if (state === SINGLE_QUOTE)
                    state = CLOSE_QUOTE
                else if (state === OPEN_BRACKET && !segment)
                    state = SINGLE_QUOTE
                else
                    return undefined
                break

            case '"':
                if (escape || state === SINGLE_QUOTE)
                    segment += c
                else if (state === DOUBLE_QUOTE)
                    state = CLOSE_QUOTE
                else if (state === OPEN_BRACKET && !segment)
                    state = DOUBLE_QUOTE
                else
                    return undefined
                break

            default:
                if (state === CLOSE_QUOTE || (state === OPEN_BRACKET && (c < '0' || c > '9')))
                    return undefined
                segment += c
                break
        }    
        
        escape = false
    }

    switch (state) {
        case undefined:
            if (segment) {
                if (!isValidIdentifier(segment))
                    return undefined
                segments.push(segment)
            }
            break
        case CLOSE_BRACKET:
            if (segment)
                return undefined
            break
        case DOT:
            if (!isValidIdentifier(segment))
                return undefined
            segments.push(segment)
            break
        default:
            return undefined
    }

    if (cache != null) {
        if (cache.size >= 500)
            cache.clear()
        cache.set(path, segments.slice())
    }
    
    return segments
}

export function joinPath(segments: Path): string {
    let path = ""
    for (let segment of segments) {
        if (typeof segment === "number")
            path += "[" + segment + "]"
        else if (isValidIdentifier(segment))
            path += (path ? "." : "") + segment
        else
            path += "['" + segment.replaceAll("'", "\\'") + "']"
    }
    return path
}
