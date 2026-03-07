
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

// Pre-save middleware to generate slug
VideoSchema.pre('save', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
