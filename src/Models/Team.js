import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    meetingDay: { type: String },
    meetingTime: { type: String },
    teamImage: { type: String },
    teamLeaderName: { type: String },
    members: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

export default model("Team", TeamSchema);
