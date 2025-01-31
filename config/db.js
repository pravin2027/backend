import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 45000,
        });

        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.error('Connection string:', process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@'));
        process.exit(1);
    }
};

export default connectDB; 