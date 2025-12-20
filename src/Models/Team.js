import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    meetingDay: { type: String },
    meetingTime: { type: String },
    teamImage: { type: String },
    teamLeader: {
      name: { type: String },
      phone1: { type: String },
      phone2: { type: String },
      phone3: { type: String },
    },
    members: [
      {
        name: { type: String },
        phone1: { type: String },
        phone2: { type: String },
        phone3: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export default model("Team", TeamSchema);

