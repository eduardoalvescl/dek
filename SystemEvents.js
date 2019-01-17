import EventEmitter from 'events'
import {loadAll, loadCli, generator, log, installPackages, loadNpmDependencies, cloneRepositoryList, cloneSkeleton} from './Organized'
import minimist from 'minimist'

const event = new EventEmitter()
const dir = process.cwd()

var argv = minimist(process.argv.slice(2));
var {success, error} = log

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
    
    let cliFunc       = argv['_'].hasOwnProperty(0) ? argv['_'][0] : false
    let generatorFunc = argv['_'].hasOwnProperty(1) ? argv['_'][1] : false
    
    if(cliFunc && cliFunc == 'install'){
        log.info('Instalando dependências')
        let list = require(`${process.cwd()}/dependencies.json`)

        cloneRepositoryList(list.plugins,() => {
            loadNpmDependencies([dir + '/plugins/*/npm.js'])
        })
        
    }else if(cliFunc && cliFunc == 'init'){
        if(generatorFunc)
            cloneSkeleton(generatorFunc)
        else
            cloneSkeleton()
    }else{
        loadAll([dir + '/plugins/*/main.js'], async () => {

    
            if(cliFunc && cliFunc == 'new'){
                if(generator.hasOwnProperty(generatorFunc)){
                    generator[generatorFunc](argv)
                }else{
                    error('Não existe esse generator')
                }
                    
            }else{
                loadCli([dir + '/plugins/*/main.js'])
            }
                
            
        })
    }

}

event.on('beforeLoad', beforeLoad)
event.on('loadSystem', loadSystem)
event.on('afterLoad', afterLoad)
event.on('loadCli', loadCliFunc)

export default event