import { REG, thenFn, catchFn } from './defaults'
import { fixPath } from './utils'
import { join } from 'path'
import { readFile, statSync, readdirSync } from 'fs'
import * as chokidar from 'chokidar'
import { MemoryTree } from './interface';

export const inputProvider: MemoryTree.BuildProvider = (options, store) => {
    const { buildFilter, onSet, root } = options
    
    return function build(pathname = '', withbuilding = true) {
        pathname = fixPath(pathname)
        const absolutePath = join(root, pathname)
        const stats = statSync(absolutePath)
        
        let fn = thenFn()
        
        if (pathname && (!buildFilter || !buildFilter(pathname))) {
            fn = thenFn()
        } else if (stats.isDirectory()) {
            fn = (resolve, reject) => {
                onSet(pathname, {}, store).then(({data, outputPath}) => {
                    store._set(outputPath, {})
                    Promise.all(readdirSync(absolutePath).map(filename => build(join(pathname, filename), false)))
                        .then(resolve)
                        .catch(catchFn(reject))
                }).catch(catchFn(reject))
            }
        } else if (stats.isFile()) {
            fn = (resolve, reject) => {
                readFile(absolutePath, function (err, data) {
                    onSet(pathname, data, store).then(({ data, outputPath }) => {
                        store._set(outputPath, data)
                        resolve({ data, outputPath })
                    }).catch(catchFn(reject))
                })
            }
        }

        const res = new Promise(fn)
        //  BUGS: remove
        if (withbuilding) {
            store.setBuilding(1)
            let timeout = setTimeout(function () {
                store.setBuilding(-1)
            }, 5000);
            res.then(() => {
                clearTimeout(timeout)
                store.setBuilding(-1)
            }).catch(() => {
                clearTimeout(timeout)
                store.setBuilding(-1)
            })
        }
        return res
    }
}

const inputProviderWithWatcher: MemoryTree.BuildProvider = (options, store) => {
    const build = inputProvider(options, store)
    const { buildWatcher, root, watch, buildFilter } = options
    if (watch && buildWatcher) {
        const watcher = (filename: string, eventType: string) => {
            switch (eventType) {
                case 'add':
                    if(!store._get(filename)) {
                        build(filename)
                    }
                    break
                case 'change':
                    build(filename)
                    break
            }
            buildWatcher(filename, eventType, build, store)
        }
        chokidar.watch(root, {
            ignored: [(filename: string) => {
                const p = fixPath(fixPath(filename).replace(fixPath(root), ''))
                return !buildFilter(p)
            }]
        }).on('all', (eventType, filename) => watcher(
            fixPath(fixPath(filename).replace(fixPath(root), '')),
            eventType
        ))
    }
    return build
}
export default inputProviderWithWatcher