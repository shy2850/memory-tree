import { REG, emptyFn, catchFn } from './defaults'
import { join } from 'path'
import { writeFile, existsSync, mkdirSync } from 'fs'
import { fixPath } from './utils'
import { isPlainObject } from 'lodash'

export const outputProvider: MemoryTree.BuildProvider = (options, store) => {
    const { outputFilter, dest } = options

    return function build(pathname = '', withbuilding = true) {
        pathname = fixPath(pathname)
        let fn = emptyFn
        if (outputFilter(pathname) && dest) {
            fn = (resolve, reject) => {
                store.load(pathname).then(data => {
                    let absolutePathname = join(dest, pathname)
                    if (isPlainObject(data)) {
                        if (!existsSync(absolutePathname)) {
                            mkdirSync(absolutePathname)
                        }
                        Promise.all(Object.keys(data).map(file => build(join(pathname, file))))
                            .then(resolve)
                            .catch(catchFn(reject))
                    } else {
                        writeFile(absolutePathname, data, (err) => {
                            if (err) {
                                catchFn(reject)(err)
                            } else {
                                resolve()
                            }
                        })
                    }
                })
            }
        }
        return new Promise(fn)
    }
}

export default outputProvider