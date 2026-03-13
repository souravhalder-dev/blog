
import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  summary: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '/placeholder.jpg',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'pending'],
    default: 'published',
  },
}, { timestamps: true });

ArticleSchema.index({ status: 1, date: -1 });
ArticleSchema.index({ category: 1, date: -1 });
ArticleSchema.index({ isFeatured: 1, date: -1 });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
