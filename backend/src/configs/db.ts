import mongoose,{ConnectOptions} from "mongoose";

const MONGO_URI:string |undefined =process.env.MONGODB_URI;
if (!MONGO_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}

const connectDB = async (): Promise<void> => {
    try {
      await mongoose.connect(MONGO_URI, {
      } as ConnectOptions);
      console.log('Database Connected.');
      
    } catch (err) {
      console.error("Error connecting to MongoDB:", err);
      process.exit(1); 
    } 
};

export default connectDB;