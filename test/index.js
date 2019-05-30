const path = require('path')
const MemoryTree = require('../dist/index')

const src = path.join(__dirname, '../')
const target = path.join(__dirname, '../../memory-tree-out')

const { defaultOptions: { buildWatcher } } = MemoryTree
const memory = MemoryTree.default({
    // watch: true,
    dest: target,
    buildWatcher (pathname, eventType) {
        buildWatcher(pathname, eventType)
        memory.output(pathname)
    }
})
memory.input('', true).then(() => {
    memory.output()
})
