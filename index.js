const _ = require('lodash')
const OPTIONS = {
    onSet: (path, data) => data,
    onGet: (path, data) => data
}

module.exports = (options) => {
    const {onSet, onGet} = _.extend({}, OPTIONS, options)
    let store = {}
    return {
        set: (path, data) => _.set(store, path, onSet(path, data)),
        get: (path) => onGet(path, path ? _.get(store, path) : store)
    }
}
