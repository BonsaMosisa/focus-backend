import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TeachingSchema = new Schema(
  {
    title: { type: String },
    verses: { type: String },
    description: { type: String },
    teacher: { type: String },
    otherNotes: { type: String },
    mediaUrl: { type: String },
  },
  { timestamps: true }
);

export default model("Teaching", TeachingSchema);
