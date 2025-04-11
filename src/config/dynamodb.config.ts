import * as dynamoose from 'dynamoose';

export function setupDynamoDB(): void {
  const ddb = new dynamoose.aws.ddb.DynamoDB({
    region: process.env.DYNAMODB_REGION ?? '',
    credentials: {
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY ?? '',
    },
  });

  dynamoose.aws.ddb.set(ddb);
}
