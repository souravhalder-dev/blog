
import mongoose from 'mongoose';

const PhotoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['url', 'upload'],
    default: 'url',
  },
  date: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
