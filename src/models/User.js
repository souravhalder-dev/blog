
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: 'Admin',
  },
  photo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'admin',
  },
}, { 
  timestamps: true,
  collection: 'user' // Explicitly set collection name to 'user' to match MongoDB Atlas
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
