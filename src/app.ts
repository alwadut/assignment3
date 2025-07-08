import express,{Application,Request,Response} from 'express';
import { model, Schema } from 'mongoose';
import { noteRoutes } from './app/controler/node.controler';


const app: Application = express()

app.use(express.json())

app.use("/notes",noteRoutes)


app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})


export default app;