const path = require('path')
const MemoryTree = require('../dist/index').default

const src = path.join(__dirname, '../')
const target = path.join(__dirname, '../../memory-tree-out')

const memory = MemoryTree({ watch: !true })

memory.input('', true).then(() => memory.output(target))
