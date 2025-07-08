
import { promises } from "dns";
import mongoose, { model, Schema } from "mongoose"


// create borrow instance 

const borrowSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  quantity: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  borrowedAt: { type: Date, default: Date.now }
}, {
  timestamps: true 
});

const noteSchema = new Schema({
    title: {type:String,require:true, trim:true},
    author: {type:String, default:''},
    genre: {
        type:String,
        require:true,
        enum:['FICTION', 'NON_FICTION', 'SCIENCE', 'HISTORY', 'BIOGRAPHY', 'FANTASY'],
        default:"FANTASY"
    },
    isbn:{type:String,require:true,unique:true},
    description:{type:String},
    copies:{type:Number},
    available:{
        type:Boolean
    }

},{
    versionKey: false,
    timestamps: true,
})

interface INote extends mongoose.Document {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  description?: string;
  copies: number;
  available: boolean;
  borrow(quantity: number): Promise<void>;
}

noteSchema.methods.borrow = async function (this: INote, quantity: number): Promise<void>  {
  if (this.copies < quantity) {
    throw new Error("Not enough copies available");
  }
  this.copies -= quantity;
  if (this.copies === 0) {
    this.available = false;
  }
  await this.save();
};

export const Note = model("Note",noteSchema)
export const Borrow = model("Borrow",borrowSchema)