import Event from './SystemEvents';
import dotenv from 'dotenv';

Event.emit('loadCli', process.cwd());
