namespace MemoryTree {
    export type DataBuffer = Buffer | string | {}
    export interface Build {
        (pathname: string, withbuilding?: boolean): Promise<any>
    }
    export interface BuildProvider {
        (options: Options, store: Store): Build
    }
    export interface Store {
        setBuilding: {
            (num: 1|-1): void
        }
        isBuilding: {
            ():boolean
        }
        _set: {
            (path: string, data: DataBuffer): void
        }
        _get: {
            (path: string): DataBuffer
        }
        load: {
            (path: string): Promise<DataBuffer>
        }
    }
    export interface Options {
        root: string
        dest?: string
        watch: boolean
        // if can be built
        buildFilter?: {
            (pathname: string): boolean
        }
        // fired on file(s) changed
        buildWatcher?: {
            (pathname: string, eventType: string, build: Build, store: Store): void
        }
        // save data into memory by result.outputPath & result.data
        onSet: {
            (pathname: string, data: DataBuffer, store: Store): Promise<{ data: DataBuffer, outputPath: string, originPath: string }>
        }
        // get data from memory 
        onGet: {
            (pathname: string, data: DataBuffer, store: Store): Promise<DataBuffer>
        }
        // if can be persisted
        outputFilter?: {
            (pathname: string): boolean
        }
    }
}
interface MemoryTree {
    store: MemoryTree.Store,
    input: MemoryTree.Build,
    output: MemoryTree.Build
}
