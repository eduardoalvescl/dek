import Event from './SystemEvents'
import Organized, {load} from './Organized'

export default async (dir, file) =>{

    Event.emit('beforeLoad',dir,file)

}

export let o = Organized

export let add = (item, index) => {
    module.exports[index] = item
    load(item, index)
}
