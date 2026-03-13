
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

PhotoSchema.index({ isFeatured: 1, date: -1 });
PhotoSchema.index({ date: -1 });

export default mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
