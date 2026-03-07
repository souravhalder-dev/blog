
import mongoose from 'mongoose';

// Delete the model if it exists to force recompilation with new schema
if (mongoose.models.HomepageSetting) {
  delete mongoose.models.HomepageSetting;
}

const HomepageSettingSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    // Enum removed to allow dynamic categories
  },
  type: {
    type: String,
    enum: ['static', 'category'],
    default: 'static',
  },
  categorySlug: {
    type: String, // Only used if type is 'category'
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.model('HomepageSetting', HomepageSettingSchema);
