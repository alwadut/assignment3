"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteRoutes = void 0;
const node_model_1 = require("./../models/node.model");
const express_1 = require("express");
// import app from "../../app";
const node_model_2 = require("../models/node.model");
exports.noteRoutes = (0, express_1.Router)();
exports.noteRoutes.post("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    //  const myNote = new Note({
    //     title:"learning Mongoss",
    //     author:"I am Learning MongoDB via mongoose",
    //     genre : "FANTASY",
    //     isbn:"1232432358",
    //     descrption:"An overview of cosmology and black holes.",
    //     copies:5,
    //     available:true
    const data = yield node_model_2.Note.create(body);
    res.status(201).json({
        success: true,
        message: "Book created successfully",
        data
    });
}));
exports.noteRoutes.get("/api/books", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const body = req.body;
    //   const note = await Note.find({genre:"SCIENCE"});
    //   const note = await Note.find({ genre: { $exists: true } }).sort({ genre: 1 }).limit(10);
    const { filter, sortBy = "genre", sort = "asc", limit = "10" } = req.query;
    //build filter object 
    const filterObj = {};
    if (filter) {
        filterObj.genre = filter;
    }
    else {
        filterObj.genre = { $exists: true };
    }
    const sortOrder = sort === "desc" ? -1 : 1;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    // Parse limit
    const limitNum = parseInt(limit, 10);
    // Query
    const data = yield node_model_2.Note.find(filterObj).sort(sortObj).limit(limitNum);
    res.status(201).json({
        success: true,
        message: "Books retrieved successfully",
        data
    });
}));
exports.noteRoutes.get("/api/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.bookId;
        const data = yield node_model_2.Note.findById(bookId);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving book",
            error: error.message
        });
    }
}));
exports.noteRoutes.put("/api/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookId = req.params.bookId;
        const updates = req.body;
        const data = yield node_model_2.Note.findByIdAndUpdate(bookId, updates, {
            new: true, // Return the updated document
            runValidators: true // Ensure updates are validated against the schema
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving book",
            error: error.message
        });
    }
}));
exports.noteRoutes.delete("/api/books/:bookId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookId = req.params.bookId;
    const data = yield node_model_2.Note.findByIdAndDelete(bookId);
    res.status(201).json({
        success: true,
        message: "Book deleted successfully",
        data: null
    });
}));
exports.noteRoutes.post("/api/borrow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { book, quantity, dueDate } = req.body;
        const data = yield node_model_2.Note.findById(book);
        if (!data) {
            res.status(404).json({ success: false, message: "Book not found" });
            return;
        }
        yield data.borrow(quantity);
        const borrowRecord = yield node_model_1.Borrow.create({
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}));
exports.noteRoutes.get("/api/borrow", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield node_model_1.Borrow.aggregate([
            {
                $lookup: {
                    from: "notes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookDetails"
                },
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
                        title: "$bookDetails.title",
                        isbn: "$bookDetails.isbn"
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving borrowed books summary",
            error: error.message
        });
    }
}));
//  await myNote.save(body)
