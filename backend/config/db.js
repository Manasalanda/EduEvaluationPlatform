const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Remove useNewUrlParser and useUnifiedTopology
    // These options are not supported in Mongoose 7+
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;