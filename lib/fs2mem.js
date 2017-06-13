const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const mime = require('mime')

const isTXT = filename => mime.charsets.lookup(mime.lookup(filename))

const OPTIONS = {
    buildFilter: (pathname, data) => 1,
    buildWatcher: (eventType, filename) => 0,
    set: () => 0,
    watch: false
}

module.exports = (root, options) => new Promise((resolve, reject) => {
    const {set, buildFilter, buildWatcher, watch} = Object.assign({}, OPTIONS, options)
    const build = function build (pathname = '') {
        const absolutePath = path.resolve(root, pathname)
        const stats = fs.statSync(absolutePath)
        if (!buildFilter(pathname)) {
            return
        }
        if (!stats) {
            reject(new Error('no stats'))
        }
        if (stats.isDirectory()) {
            set(pathname, {})
            fs.readdirSync(absolutePath).map(filename => build(path.join(pathname, filename)))
        } else if (stats.isFile()) {
            let data = fs.readFileSync(absolutePath, isTXT(pathname) ? 'utf-8' : undefined)
            if (buildFilter(pathname, data)) {
                set(pathname, data)
            }
        }
    }

    const watcher = _.debounce((eventType, filename) => {
        switch (eventType) {
        case 'change':
            build(filename)
            break
        }
        buildWatcher(eventType, filename, build)
    }, 300)
    const beginWatch = () => fs.watch(root, {
        recursive: true
    }, (eventType, filename) => buildFilter(filename) && watcher(eventType, filename))
    build()
    resolve()
    watch && beginWatch()
})
