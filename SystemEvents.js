import EventEmitter from 'events'
import oz, {load, loadAll, loadCli} from './Organized'

const event = new EventEmitter()
const dir = process.cwd()

let beforeLoad = async function(file){
    
    await loadAll([dir + '/plugins/*/main.js'], async () => {
        const BeforeLoad = require(`${dir}/loaders/BeforeLoad`)
        await BeforeLoad.default()
        event.emit('loadSystem', file)
    })

}

let loadSystem = async function(file){
    const Main = require(`${dir}/${file}`)
    await Main.default()
    event.emit('afterLoad', file)
}

let afterLoad = async function(file){
    const AfterLoad = require(`${dir}/loaders/AfterLoad`)
    await AfterLoad.default()
}

let loadCliFunc = async function(dir){
    await loadAll([dir + '/plugins/*/main.js'], async () => {
        await loadCli([dir + '/plugins/*/main.js'])
    })
}

event.on('beforeLoad', beforeLoad)
event.on('loadSystem', loadSystem)
event.on('afterLoad', afterLoad)
event.on('loadCli', loadCliFunc)

export default event