import { Server } from 'http';
import app from './app';
import mongoose from 'mongoose';


let server : Server;

const port = 5000;

async function main(){
    try {
          await mongoose.connect('mongodb+srv://mongodb:todoapp@cluster0.4nzmshr.mongodb.net/assignment?retryWrites=true&w=majority&appName=Cluster0');
          console.log("connected to mongodb ");

        server = app.listen(port,()=>{
            console.log(`App is listing on port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}

main()