import glob from 'glob'

var Organized = {}

export default Organized



export function load(index, item) {
    Organized[index] = item
}

var count = 0 

export let test = 'teste'

export async function loadAll(folders,cb){
    
    let listFiles = async (dir) => {
        return new Promise((acc, rej) => {
            glob(dir, async (er, file) => {
                acc(file)
            })
        })
    }

    let getFiles =  () => {
        return new Promise(async (acc, rej) =>{
            let filesList = []
            for(let i in folders){
                let dir = folders[i]
                let files = await listFiles(dir)
                
                files.forEach(el => {
                   filesList.push(el) 
                });
                
                if(folders.length - 1 == i){
                    acc(filesList)
                }
            }
        })
    }

    let files = await getFiles()
    
    for(let i in files){

        let file         = files[i]
        const routerFile = require(file)
        
        if(typeof routerFile == 'object' && routerFile.hasOwnProperty('default')){
            if(routerFile.hasOwnProperty('dependencies')){
                pluginIsLoaded(routerFile.dependencies,async () => {
                    await routerFile.default(Organized)
                    count++
                })
            }else{
                await routerFile.default(Organized)
                count++
            }

        }else if(typeof routerFile == 'function'){
                      
            if(routerFile.hasOwnProperty('dependencies')){
                pluginIsLoaded(routerFile.dependencies,async () => {
                    await routerFile(Organized)
                    count++                    
                })
            }else{
                await routerFile.default(Organized)
                count++
            }
        }

        if(files.length - 1 == i){
            checkDependenciesCount(files,() => {
                if(cb) cb()
            })
        }
            
        
    }
   
}

async function pluginIsLoaded(dependencies, cb){

    let dep = dependencies.filter((item) => {
        if(Organized.hasOwnProperty(item))
            return true
    })



    return new Promise((acc, rej) => {
        setTimeout(() => {
            if(dep.length == dependencies.length){
                acc()
            }else{
                rej()
            }
        },100)
    }).then(() => {
        cb()
    }).catch(async () => {
        await pluginIsLoaded(dependencies, cb)
    })
}

async function checkDependenciesCount(files, cb){
    setTimeout(async () => {
        if(files.length != count){
            checkDependenciesCount(files, count, cb)
        }else{
            await cb()
        }
    },1000)
    
}