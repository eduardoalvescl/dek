import glob from 'glob'
import debug from 'debug'
import colors from 'colors/safe'

var Organized = {}

let success = (text) => {
    if(process.env.DEBUG == 'true')
        console.log(colors.green(text))
}

let error = (text) => {
    if(process.env.DEBUG == 'true')
        console.log(colors.red(text))
}

export let log = {
    success:success,
    error:error
}

export default Organized

export let generator = {}

export function load(index, item) {
    Organized[index] = item
}

export function loadGenerator(index, item) {
    generator[index] = item
}

export function installPackages(packages){
    var child_process = require('child_process');

    (function install(modules, callback) {
        if (modules.length == 0) {
            if (callback) callback(null);
            return;
        }
        var module = modules.shift();
        child_process.exec(
            'npm install ' + module,
            {},
            function(error, stdout, stderr) {
                process.stdout.write(stdout + '\n');
                process.stderr.write(stderr + '\n');
                if (error !== null) {
                    if (callback) callback(error);
                }
                else {
                    install(modules, callback);
                }
            });
    })(packages)

}

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
   
}

var argv = require('minimist')(process.argv.slice(2));

export async function loadCli(folders,cb){

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
                success(plugin)
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

export async function loadNpmDependencies(folders,cb){

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

function resolve(graph) {
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