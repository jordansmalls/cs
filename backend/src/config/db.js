import mongoose from 'mongoose';

const connectDB = async () => {
  try {

    if (!process.env.MONGO_URI) {
      console.error('❌ Error: The MONGO_URI environment variable is not defined.');
      process.exit(1);
    }

    // attempt establishing a connection to mongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // log a success message with the connected host
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // listener for when the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected!');
    });

    // listener for any connection errors after the initial connection is established
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

  } catch (error) {
    // log a failure message with a detailed error and exit the process
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
