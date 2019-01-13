import EventEmitter from 'events'
import oz, {load, loadAll} from './Organized'

const event = new EventEmitter()

let beforeLoad = async function(dir, file){
    await loadAll([dir + '/plugins/*/main.js'], async () => {
        const BeforeLoad = require(`${dir}/loaders/BeforeLoad`)
        await BeforeLoad.default()
        event.emit('loadSystem', dir, file)
    })

}

let loadSystem = async function(dir, file){
    const Main = require(`${dir}/${file}`)
    await Main.default()
    event.emit('afterLoad', dir, file)
}

let afterLoad = async function(dir, file){
    const AfterLoad = require(`${dir}/loaders/AfterLoad`)
    await AfterLoad.default()
}

event.on('beforeLoad', beforeLoad)
event.on('loadSystem', loadSystem)
event.on('afterLoad', afterLoad)

export default event