import Event from './SystemEvents'
import Organized, {load, loadGenerator, generator, log} from './Organized'

export default async (file) =>{
    Event.emit('beforeLoad',file)
}

export let o = Organized

export let success = log.success

export let error = log.error

export let add = (item, index) => {
    load(item, index)
}

export let gen = generator

export let addGenerator = (item, index) => {
    loadGenerator(item, index)
}
