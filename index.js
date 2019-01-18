import Event from './SystemEvents'
import Organized, {load, loadGenerator, generator, log} from './Organized'
import dotenv from 'dotenv'

dotenv.config({ path: `${process.cwd()}/.env` })

export default async (file) =>{
    Event.emit('beforeLoad',file, Organized)
}

export let o = Organized
export let success = log.success
export let danger  = log.danger
export let warning = log.warning
export let info    = log.info

export let add = (item, index) => {
    load(item, index)
}

export let gen = generator

export let addGenerator = (item, index) => {
    loadGenerator(item, index)
}
