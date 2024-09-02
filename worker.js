import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const fileDocument = await dbClient.collection('files').findOne({ _id: fileId, userId });

  if (!fileDocument) throw new Error('File not found');

  const filePath = path.join('/tmp/files_manager/', fileDocument.name);

  if (!fs.existsSync(filePath)) throw new Error('File not found');

  const sizes = [500, 250, 100];
  const thumbnailPromises = sizes.map(async (size) => {
    try {
      const thumbnail = await imageThumbnail(filePath, { width: size });
      const thumbnailPath = path.join('/tmp/files_manager/', `${fileDocument.name}_${size}`);
      fs.writeFileSync(thumbnailPath, thumbnail);
    } catch (error) {
      throw new Error(`Error generating thumbnail for size ${size}: ${error.message}`);
    }
  });

  await Promise.all(thumbnailPromises);
});
