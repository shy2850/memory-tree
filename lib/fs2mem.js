const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mime = require('mime')
const chokidar = require('chokidar')

const isTXT = filename => mime.charsets.lookup(mime.lookup(filename))

const OPTIONS = {
    buildFilter: (pathname, data) => 1,
    buildWatcher: (eventType, filename) => 0,
    set: () => 0,
    get: () => 0,
    watch: false
}
const fixPath = pathname => {
    const match = pathname.match(/[^\\/]+/g)
    return match ? match.join('/') : ''
}
const buildProvider = exports.build = (root, options) => {
    const {get, set, buildFilter} = Object.assign({}, OPTIONS, options)
    const build = function build (pathname = '', useCache) {
        pathname = fixPath(pathname)
        if (pathname && !buildFilter(pathname)) {
            return
        }
        if (useCache && get(pathname)) {
            return
        }
        const absolutePath = path.join(root, pathname)
        const stats = fs.statSync(absolutePath)
        if (!stats) {
            return null
        }
        if (stats.isDirectory()) {
            set(pathname, {})
            fs.readdirSync(absolutePath).map(filename => build(path.join(pathname, filename), useCache))
        } else if (stats.isFile()) {
            let data = fs.readFileSync(absolutePath, isTXT(pathname) ? 'utf-8' : undefined)
            if (buildFilter(pathname, data)) {
                set(pathname, data)
            }
            return data
        }
    }
    return build
}

exports.input = (root, options) => new Promise((resolve, reject) => {
    const {buildWatcher, watch} = Object.assign({}, OPTIONS, options)
    const build = buildProvider(root, options)
    const watcher = _.debounce((eventType, filename) => {
        switch (eventType) {
        case 'change':
            build(filename)
            break
        }
        buildWatcher(eventType, filename, build)
    }, 300)
    const beginWatch = () => chokidar.watch(root)
        .on('all', (eventType, filename) => watcher(eventType, filename.replace(root, '').match(/[^\\/]+/g).join('/')))
    build('')
    resolve()
    watch && beginWatch()
})
