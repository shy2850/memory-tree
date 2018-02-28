export const thenFn = (data?:any) => (resolve, reject) => resolve(data)
export const catchFn = reject => err => reject(err) || console.trace(err)

export const REG = {
    ignored: /node_modules|(^|\\|\/)\./
}

export const defaultOptions: MemoryTree.Options = {
    root: process.cwd(),
    watch: false,
    buildFilter: (pathname) => !REG.ignored.test(pathname),
    buildWatcher: (pathname, eventType) => console.log(new Date().toLocaleTimeString(), eventType, pathname),
    onSet: (pathname, data) => new Promise((resolve, reject) => resolve({ data, originPath: pathname, outputPath: pathname })),
    onGet: (pathname, data) => new Promise((resolve, reject) => resolve(data)),
    outputFilter: (pathname) => !/\btest\b/.test(pathname)
}
