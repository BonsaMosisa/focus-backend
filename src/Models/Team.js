import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    meetingDay: { type: String },
    meetingTime: { type: String },
    teamImage: { type: String },
    publicId: { type: String },
    teamLeader: {
      name: { type: String },
      phone: { type: String },
    },
    // members are no longer stored separately; put member details in `notes`
    notes: { type: String },
  },
  { timestamps: true }
);

export default model("Team", TeamSchema);

