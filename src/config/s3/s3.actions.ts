import S3 from './s3.config';
import * as dotenv from 'dotenv';
import { GetObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

export default async function getObject(filename: string) {
  try {
    const result: any = await S3.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_BUCKET_NAME,
        Key: process.env.BUCKET_PATH + filename,
      }),
    );

    return result.Body.transformToString();
  } catch (err) {
    console.error(err);
  }
}
