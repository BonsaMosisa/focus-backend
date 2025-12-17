import mongoose from "mongoose";

const { Schema, model } = mongoose;

const GallerySchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Gallery", GallerySchema);
