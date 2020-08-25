import * as _ from 'lodash'
import { fixPathArr } from './utils'
import { MemoryTree } from './interface';

export default function (options: MemoryTree.Options): MemoryTree.Store {
    const { onGet } = options
    let o = {}
    let buildings = 0
    let listeners = []
    const store: MemoryTree.Store = {
        isBuilding: () => buildings > 0,
        onBuildingChange: (listener) => {
            listeners.push(listener)
        },
        setBuilding: (n) => {
            buildings = Math.max(buildings + n, 0);
            listeners.forEach(listener => listener(buildings > 0))
        },
        _get (path) {
            return path ? _.get(o, fixPathArr(path)) : o
        },
        load (path) {
            return onGet(path, store._get(path), store)
        },
        _set (path, value) {
            path && _.set(o, fixPathArr(path), value)
        }
    }
    return store
}