import { model } from 'mongoose';
import { Schema } from 'mongoose';
import express,{Application,Request,Response} from 'express';

import { noteRoutes } from './app/controler/node.controler';


const app: Application = express()

app.use(express.json())

app.use("/notes",noteRoutes)


app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})


export default app;