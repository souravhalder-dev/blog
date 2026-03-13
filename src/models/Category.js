
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  showInMenu: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

CategorySchema.index({ showInMenu: 1, order: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
