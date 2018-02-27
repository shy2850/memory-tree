
export const fixPathArr = (pathname: string): string[] => pathname.match(/[^\\/]+/g) || []
export const fixPath = (pathname: string): string => fixPathArr(pathname).join('/')
