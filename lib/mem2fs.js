const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const OPTIONS = {
    outputFilter: (pathname, data) => 1,
    outputRename: (pathname, data) => pathname,
    get: () => 0
}
const fixPath = pathname => {
    const match = pathname.match(/[^\\/]+/g)
    return match ? match.join('/') : ''
}
const build = exports.build = (root, options) => {
    const {get, outputFilter, outputRename} = Object.assign({}, OPTIONS, options)
    const build = function build (pathname) {
        pathname = fixPath(pathname)
        if (!outputFilter(pathname)) {
            return
        }
        const data = get(pathname)

        if (_.isPlainObject(data)) {
            let absolutePathRename = path.join(root, outputRename(pathname))
            if (!fs.existsSync(absolutePathRename)) {
                fs.mkdirSync(absolutePathRename)
            }
            Object.keys(data).map(file => build(path.join(pathname, file)))
        } else if (Object.prototype.toString.call(data) === '[object Promise]') {
            data.then(d => {
                outputFilter(pathname, d) && fs.writeFileSync(path.join(root, outputRename(pathname, d)), d, 'utf-8')
            })
        } else {
            outputFilter(pathname, data) && fs.writeFileSync(path.join(root, outputRename(pathname, data)), data, 'utf-8')
        }
    }
    return build
}
exports.output = (root, options) => new Promise((resolve, reject) => {
    build(root, options)('')
    resolve()
})
