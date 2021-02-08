import { defaultOptions } from './defaults'
import ProviderInput from './ProviderInput'
import ProviderOutput from './ProviderOutput'
import Store from './store'
import { extend } from 'lodash'
import { MemoryTree } from './interface';
export * from './interface'

export { defaultOptions }

export default (options: MemoryTree.Options): MemoryTree.MemoryTree => {
    options = extend({}, defaultOptions, options)
    const store = Store(options)
    const input = ProviderInput(options, store)
    const output = ProviderOutput(options, store)
    return {
        store,
        input,
        output
    }
}