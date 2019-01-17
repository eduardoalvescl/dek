import Event from './SystemEvents'
import dotenv from 'dotenv'
dotenv.config({ path: `${process.cwd()}/.env` })
Event.emit('loadCli',process.cwd())