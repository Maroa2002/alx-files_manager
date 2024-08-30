import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  // POST /users endpoint
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Checking if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const db = dbClient.getDb(); // Getting the database client
      const usersCollection = db.collection('users');

      // Checking if the email already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hashing the password using SHA1
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Creating and inserting the new user
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Returning the new user with id and email
      return res.status(201).json({
        id: result.insertedId.toString(),
        email,
      });
    } catch (error) {
      console.error('Error in postNew:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
