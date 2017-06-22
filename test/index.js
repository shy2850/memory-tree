const path = require('path')
const MemoryTree = require('../index')

const src = path.join(__dirname, '../')
const target = path.join(__dirname, '../../memory-tree-out')

const memory = MemoryTree({
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
    buildWatcher: (eventType, pathname) => {
        memory.output(target, pathname)
    },
    /**
     * 允许加载到内存的资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 (注: 检查路径等时刻, data未设置, 参考 lib/fs2mem.js)
     * @return {boolean}         是否允许加载到内存
     */
    buildFilter: (pathname, data) => (!data || data.length < 4 * 1024) && !/node_modules|([\\\/]|^)\./.test(pathname),
    /**
     * 允许从内存中保存到文件系统的资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 (注: 检查路径等时刻, data未设置, 参考 lib/mem2fs.js)
     * @return {boolean}         是否允许保存到文件
     */
    outputFilter: (pathname, data) => (!data || data.length < 64 * 1024) && !/node_modules|([\\\/]|^)\./.test(pathname),
    /**
     * 输出时重命名资源
     * @param  {string} pathname 待检查资源路径
     * @param  {string/buffer} data     资源内容 【可以根据内容md5重命名】
     * @return {string}          重命名结果
     */
    outputRename: (pathname, data) => pathname
})

let eslint = memory.getWithInput('/lodash/fp/__.js', path.join(__dirname, '../node_modules'))
console.log(eslint + '')

memory.copy(src, target, true).then(e => {
    console.log('copy ok!')
}).catch(e => {
    console.log(e)
})
