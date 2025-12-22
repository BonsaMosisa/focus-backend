import mongoose from "mongoose";

const { Schema, model } = mongoose;

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    publicId: { type: String },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model("Announcement", AnnouncementSchema);
