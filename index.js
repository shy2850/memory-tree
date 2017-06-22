const _ = require('lodash')
const fs2mem = require('./lib/fs2mem')
const mem2fs = require('./lib/mem2fs')

const OPTIONS = {
    /**
     * 存储数据时触发
     * @param  {string} pathname 对应路径, 会根据 `\/` 分割
     * @param  {string/buffer} data 从文件系统获取的源数据
     * @return {string/buffer} 返回修改后的数据
     */
    onSet: (pathname, data) => data,
    /**
     * 获取数据时触发
     * @param  {string} pathname 对应路径, 会根据 `\/` 分割
     * @param  {string/buffer} data 之前存入的数据
     * @return {string/buffer} 返回修改后的数据
     */
    onGet: (pathname, data) => data,
    /**
     * 文件修改时触发检查  `fs.watch` 的 callback
     * @param  {string} eventType 修改类型 如: 'change'
     * @param  {string} pathname 事件触发的文件路径
     */
    buildWatcher: (eventType, pathname) => console.log(eventType, pathname),
    /**
     * 允许加载到内存的资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 (注: 检查路径等时刻, data未设置, 参考 lib/fs2mem.js)
     * @return {boolean}         是否允许加载到内存
     */
    buildFilter: (pathname, data) => (!data || data.length < 64 * 1024) && !/node_modules|([\\/]|^)\./.test(pathname),
    /**
     * 允许从内存中保存到文件系统的资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 (注: 检查路径等时刻, data未设置, 参考 lib/mem2fs.js)
     * @return {boolean}         是否允许保存到文件
     */
    outputFilter: (pathname, data) => (!data || data.length < 64 * 1024) && !/node_modules|([\\/]|^)\./.test(pathname),
    /**
     * 输出时重命名资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 【可以根据内容md5重命名】
     * @return {string}          重命名结果
     */
    outputRename: (pathname, data) => pathname
}

const fixPath = pathname => pathname.match(/[^\\/]+/g)

module.exports = (options) => {
    const {
        onSet,
        onGet,
        buildFilter,
        buildWatcher,
        outputFilter
    } = Object.assign({}, OPTIONS, options)
    let store = {}
    function setStore (data) {
        store = data || {}
        Object.defineProperties(store, {
            '_set': {value: (pathname, v) => _.set(store, fixPath(pathname), v)},
            '_get': {value: pathname => _.get(store, fixPath(pathname))}
        })
    }
    setStore({})

    const set = (pathname, data) => {
        if (!pathname) {
            setStore(data)
        } else {
            let res = onSet(pathname, data, store)
            if (Object.prototype.toString.call(res) === '[object Promise]') {
                res.next(data => _.set(store, fixPath(pathname), data))
            } else {
                _.set(store, fixPath(pathname), res)
            }
        }
    }
    const opt = {set, buildFilter, buildWatcher}
    const get = (pathname) => onGet(pathname, pathname ? _.get(store, fixPath(pathname)) : store, store)
    const input = (src, watch) => fs2mem.input(src, Object.assign(opt, {watch}))
    const output = (target, pathname) => pathname ? mem2fs.build(target, {get, outputFilter})(pathname) : mem2fs.output(target, {get, outputFilter})
    const build = (src, target, watch) => input(src, watch).then(() => output(target))
    const getWithInput = (pathname, src) => get(pathname) || fs2mem.build(src, opt)(pathname)

    return {
        set,
        get,
        getWithInput,
        input,
        output,
        build,
        copy: build
    }
}
