
import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
