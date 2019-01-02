
export const fixPathArr = (pathname: string): string[] => pathname ? (pathname.match(/[^\\/]+/g) || []) : []
export const fixPath = (pathname: string): string => fixPathArr(pathname).join('/')
