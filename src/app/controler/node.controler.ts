import { Borrow } from './../models/node.model';
import express, { Router, Request, Response } from "express";
// import app from "../../app";
import { Note } from "../models/node.model";

export const noteRoutes = Router();

noteRoutes.post("/api", async (req: Request, res: Response) => {
  const body = req.body;

  //  const myNote = new Note({
  //     title:"learning Mongoss",
  //     author:"I am Learning MongoDB via mongoose",
  //     genre : "FANTASY",
  //     isbn:"1232432358",
  //     descrption:"An overview of cosmology and black holes.",
  //     copies:5,
  //     available:true

  const data = await Note.create(body);

  res.status(201).json({
    success: true,
    message: "Book created successfully",
    data
  });
});

noteRoutes.get("/api/books", async (req: Request, res: Response) => {
//   const body = req.body;

//   const note = await Note.find({genre:"SCIENCE"});
//   const note = await Note.find({ genre: { $exists: true } }).sort({ genre: 1 }).limit(10);
const {filter,sortBy="genre",sort = "asc", limit ="10"} = req.query;

//build filter object 
const filterObj:any = {};
if(filter){
    filterObj.genre= filter;
} else{
    filterObj.genre = {$exists:true}
}
const sortOrder = sort === "desc" ? -1 : 1;
  const sortObj: any = {};
  sortObj[sortBy as string] = sortOrder;

  // Parse limit
  const limitNum = parseInt(limit as string, 10);

  // Query
  const data = await Note.find(filterObj).sort(sortObj).limit(limitNum);



  res.status(201).json({
    success: true,
    message: "Books retrieved successfully",
    data
  });
});


noteRoutes.get("/api/books/:bookId", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const data = await Note.findById(bookId);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Book not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: (error as Error).message
    });
  }
});


noteRoutes.put("/api/books/:bookId", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.bookId;
    const updates = req.body;
    const data = await Note.findByIdAndUpdate(bookId, updates, {
      new: true,            // Return the updated document
      runValidators: true   // Ensure updates are validated against the schema
    });

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Book not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Book retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving book",
      error: (error as Error).message
    });
  }
});


noteRoutes.delete("/api/books/:bookId", async (req: Request, res: Response): Promise<void> => {

    const bookId = req.params.bookId;
  
    const data = await Note.findByIdAndDelete(bookId);

    res.status(201).json({
      success: true,
      message: "Book deleted successfully",
      data: null
    });
  }
);

noteRoutes.post("/api/borrow", async (req: Request, res: Response) => {
  try {
    const { book, quantity, dueDate } = req.body;
    const data = await Note.findById(book);
    if (!data) {
      res.status(404).json({ success: false, message: "Book not found" });
      return;
    }

    await (data as any).borrow(quantity);

    const borrowRecord = await Borrow.create({
      book,
      quantity,
      dueDate,
      borrowedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: borrowRecord
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

noteRoutes.get("/api/borrow", async (req: Request, res: Response) => {
  try {
    const data = await Borrow.aggregate([
      {
        $lookup: {
          from: "notes",              // collection name
          localField: "book",         // field in Borrow referencing Note._id
          foreignField: "_id",        // Note._id
          as: "bookDetails"
        }
      },
      { $unwind: "$bookDetails" },
      {
        $group: {
          _id: {
            title: "$bookDetails.title",
            isbn: "$bookDetails.isbn"
          },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $project: {
          _id: 0,
          book: {
            title: "$_id.title",
            isbn: "$_id.isbn"
          },
          totalQuantity: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Borrowed books summary retrieved successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving borrowed books summary",
      error: (error as Error).message
    });
  }
});


//  await myNote.save(body)
