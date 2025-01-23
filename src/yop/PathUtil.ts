
export function splitPath(path: string) {
    const segments: (string | number)[] = []

    let state: '.' | '[' | '["' | ']' | '\'' | '"' | undefined = undefined,
        escape = false,
        segment = ""

    for (let i = 0; i < path.length; i++) {
        let c = path.charAt(i)

        switch (c) {

            case '\\':
                if (state !== '\'' && state !== '"')
                    return undefined
                if (escape)
                    segment += '\\'
                escape = !escape
                continue
        
            case ' ': case '\t': case '\r': case '\n':
                if (state === '\'' || state === '"')
                    segment += c
                else {
                    while (++i < path.length && ((c = path.charAt(i)) === ' ' || c === '\t' || c === '\r' || c === '\n'))
                        ;
                    --i
                }
                break

            case '.':
                if (escape || state === '\'' || state === '"')
                    segment += c
                else if (state === ']') {
                    if (segment)
                        return undefined
                    state = '.'
                }
                else if (state === undefined || state === '.') {
                    if (!segment)
                        return undefined
                    segments.push(segment)
                    segment = ""
                    state = '.'
                }
                else
                    return undefined
                break
            
            case '[':
                if (escape || state === '\'' || state === '"')
                    segment += c
                else if (state === '.') {
                    if (!segment)
                        return undefined
                    segments.push(segment)
                    segment = ""
                    state = c
                }
                else if (state === undefined || state === ']') {
                    if (segment) {
                        segments.push(segment)
                        segment = ""
                    }
                    state = c
                }
                else
                    return undefined
                break
            
            case ']':
                if (escape || state === '\'' || state === '"')
                    segment += c
                else if (state === '[') {
                    if (!segment)
                        return undefined
                    segments.push(parseInt(segment))
                    segment = ""
                    state = ']'
                }
                else if (state === '["') {
                    segments.push(segment)
                    segment = ""
                    state = ']'
                }
                else
                    return undefined
                break
            case '\'': case '"':
                if (escape)
                    segment += c
                else if (state === c)
                    state = '["'
                else if (state === '\'' || state === '"')
                    segment += c
                else if (state === '[' && segment === "")
                    state = c
                else
                    return undefined
                break

            default:
                if (state === '["' || (state === '[' && (c < '0' || c > '9')))
                    return undefined
                segment += c
                break
        }    
        
        escape = false
    }

    if (state === undefined) {
        if (segment)
            segments.push(segment)
        return segments
    }

    if (state === ']') {
        if (segment)
            return undefined
        return segments
    }

    if (state === '.') {
        if (segment === "")
            return undefined
        segments.push(segment)
        return segments
    }

    return undefined
}
