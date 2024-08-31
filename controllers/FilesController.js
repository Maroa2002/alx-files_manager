import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.getDb().collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const userFile = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : new ObjectId(parentId),
    };

    if (type === 'folder') {
      await dbClient.getDb().collection('files').insertOne(userFile);
      return res.status(201).json(userFile);
    }

    const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(FOLDER_PATH)) {
      fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    const localPath = `${FOLDER_PATH}/${uuidv4()}`;
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    userFile.localPath = localPath;
    await dbClient.getDb().collection('files').insertOne(userFile);

    return res.status(201).json(userFile);
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;

    try {
      const file = await dbClient.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
      if (!file) return res.status(404).json({ error: 'Not found' });
      return res.json(file);
    } catch (err) {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    try {
      const pipeline = [
        { $match: { parentId: parentId === '0' ? 0 : ObjectId(parentId), userId: ObjectId(userId) } },
        { $skip: page * pageSize },
        { $limit: pageSize },
      ];

      const files = await dbClient.collection('files').aggregate(pipeline).toArray();
      return res.json(files);
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
