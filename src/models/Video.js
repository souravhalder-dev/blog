
import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
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
    enum: ['youtube', 'upload'],
    default: 'youtube',
  },
  date: {
    type: String,
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
}, { timestamps: true });

VideoSchema.index({ isFeatured: 1, date: -1 });
VideoSchema.index({ date: -1 });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
