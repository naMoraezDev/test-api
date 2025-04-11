import * as dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';

dotenv.config();

const S3 = new S3Client({
  region: process.env.BUCKET_REGION || '',
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.BUCKET_SECRET_KEY || '',
  },
});

export default S3;
