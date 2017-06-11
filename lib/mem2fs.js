const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const OPTIONS = {
    outputFilter: (pathname, data) => 1,
    outputRename: (pathname, data) => pathname,
    get: () => 0
}

module.exports = (root, options) => new Promise((resolve, reject) => {
    const {get, outputFilter, outputRename} = Object.assign({}, OPTIONS, options)
    const build = function build (pathname) {
        if (!outputFilter(pathname)) {
            return
        }
        const data = get(pathname)
        let absolutePath
        try {
            absolutePath = path.resolve(root, pathname)
        } catch (e) {
            reject(e)
        }

        if (_.isPlainObject(data)) {
            let absolutePathRename = outputRename(absolutePath)
            if (!fs.existsSync(absolutePathRename)) {
                fs.mkdirSync(absolutePathRename)
            }
            Object.keys(data).map(file => build(path.join(pathname, file)))
        } else if (Object.prototype.toString.call(data) === '[object Promise]') {
            data.then(d => {
                outputFilter(pathname, d) && fs.writeFileSync(outputRename(absolutePath, d), d, 'utf-8')
            })
        } else {
            outputFilter(pathname, data) && fs.writeFileSync(outputRename(absolutePath, data), data, 'utf-8')
        }
    }
    build('')
    resolve()
})
