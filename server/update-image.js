import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from './src/models/Product.js';

dotenv.config();

const updateImage = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere');
    console.log('Connected to MongoDB');

    // A real handbag image from unsplash
    const handbagImage = 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809'; 
    // Wait, let's use a definite handbag image:
    const realHandbag = 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800';

    await Product.updateOne(
      { title: "Women's Designer Handbag" },
      { $set: { 'images.0.url': realHandbag } }
    );
    
    console.log('Successfully updated handbag image!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating image:', error);
    process.exit(1);
  }
};

updateImage();
