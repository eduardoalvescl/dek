import glob from 'glob'
import colors from 'colors/safe'
import minimist from 'minimist'
import clone from 'git-clone'

var argv = minimist(process.argv.slice(2))

var Organized = {}

export default Organized

export let generator = {}

export let log = {
    success:(text) => {
            console.log(colors.black.bgGreen('  '),colors.bold.green('-> '+text))
            console.log('')
    },
    danger:(text) => {
            console.log(colors.black.bgRed('  '), colors.bold.red('-> '+text))
            console.log('')
    },
    warning:(text) => {
            console.log(colors.black.bgYellow('  '),colors.bold.yellow('-> '+text))
            console.log('')
    },
    info:(text) => {
            console.log(colors.black.bgCyan('  '), colors.bold.cyan('-> '+text))
            console.log('')
    }
}

export let load = (index, item) => {
    Organized[index] = item
}

export let loadGenerator = (index, item) => {
    generator[index] = item
}

export let installPackages = (packages) => {
    var child_process = require('child_process');

    (function install(modules, callback) {
        if (modules.length == 0) {
            if (callback) callback(null);
            return;
        }
        var moduleName = modules.join(" ");
        
        child_process.exec(
            'npm install ' + moduleName,
            {},
            function(error, stdout, stderr) {
                process.stdout.write(stdout + '\n');
                process.stderr.write(stderr + '\n');
                if (error !== null) {
                    if (callback) callback(error);
                }
                else {
                    if(callback) callback();
                }
            });
    })(packages)

}

export let loadAll = async (folders,cb) => {
    
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
    let order = {}
    let listOfFiles = {}
    if(files.length > 0){
        for(let i in files){

            let file         = files[i]
            const routerFile = require(file)
            order[routerFile.name] = routerFile.dependencies
            listOfFiles[routerFile.name] = routerFile
            
    
           if(files.length - 1 == i){
                
               let orderOfPlugins = resolve(order)
    
               for(let j in orderOfPlugins){
                    
                    let plugin = orderOfPlugins[j]
                    if(typeof routerFile == 'object' && routerFile.hasOwnProperty('default'))
                        await listOfFiles[plugin].default(Organized)
                    else if(typeof routerFile == 'function')
                        await listOfFiles[plugin](Organized)
    
                    if(orderOfPlugins.length - 1 == j){
                        if(cb) cb()
                    }
    
               }
                
           }
                
            
        }
    }else{
        if(cb) cb()
    }
 
   
}

export let loadCli = async (folders,cb) => {

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
    let order = {}
    let listOfFiles = {}

    for(let i in files){

        let file         = files[i]
        const routerFile = require(file)
        order[routerFile.name] = routerFile.dependencies
        listOfFiles[routerFile.name] = routerFile
        

       if(files.length - 1 == i){

           let orderOfPlugins = resolve(order)

           for(let j in orderOfPlugins){
                
                let plugin = orderOfPlugins[j]
                let cliService = process.argv[2]
                log.success(plugin)
                if(listOfFiles[plugin].hasOwnProperty('cli') && plugin == cliService){
                    await listOfFiles[plugin].cli(argv)
                }
                    
                if(orderOfPlugins.length - 1 == j){
                    if(cb) cb()
                }

           }
            
       }
            
        
    }
   
}

export let loadNpmDependencies = async (folders,cb) => {

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
    
    let dependencies = []

    for(let i in files){

        let file         = files[i]
        const routerFile = require(file)
        

       if(routerFile){

            routerFile.npm.forEach((pkg) => {
                dependencies.push(pkg)
            })
            
       }
            
        
    }
    
    installPackages(dependencies)
   
}

export let cloneRepositoryList = async (list,cb) => {
    let getRepositoryName = (name) => name.replace('https://github.com/','').split("/")
    let repository        = list.shift()
    let repositoryName    = getRepositoryName(repository)[1]
    
    clone(repository, `${process.cwd()}/plugins/${repositoryName}`, (err) => {
        if(err)
            log.warning(`Repositório ${repositoryName} já foi instalado anteriormente!`)
        else
            log.warning(`Repositório ${repositoryName} instalado com sucesso!`)    
        
        if(list.length > 0) 
            cloneRepositoryList(list, cb)
        else
            if(cb) cb()
    })
}

export let cloneSkeleton = (name = null) => {
    
    let folder

    if(name)
        folder = `${process.cwd()}/${name}`
    else
        folder = `${process.cwd()}/dek-skeleton`

    clone('https://github.com/vigiadepreco/dek-skeleton', folder, (err) => {

        if(err){
            log.warning(`Não foi possível iniciar a aplicação DEK`)
            console.log(err)
        }else{
            log.warning(`Aplicação DEK iniciada com sucesso`)    
        }
            
    })
}

let resolve = (graph) => {
    var sorted  = [], // sorted list of IDs ( returned value )
        visited = {}; // hash: id of already visited node => true
  
    // 2. topological sort
    Object.keys(graph).forEach(function visit(name, ancestors) {
      if (!Array.isArray(ancestors)) ancestors = [];
      ancestors.push(name);
      visited[name] = true;
        if(graph[name]){
            graph[name].forEach(function(dep) {
                if (ancestors.indexOf(dep) >= 0)  // if already in ancestors, a closed chain exists.
                    throw new Error('Circular dependency "' +  dep + '" is required by "' + name + '": ' + ancestors.join(' -> '));
        
                // if already exists, do nothing
                if (visited[dep]) return;
                visit(dep, ancestors.slice(0)); // recursive call
            });
        }else{
            console.log(`ERROR: Não foi possível iniciar o serviço pois a dependência '${name}' não está instalada`)
            process.exit(1)
        }

  
      if(sorted.indexOf(name)<0) sorted.push(name);
    });
  
    return sorted;
}