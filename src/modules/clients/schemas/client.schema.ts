import * as dynamoose from 'dynamoose';

export const ClientSchema = new dynamoose.Schema(
  {
    clientId: {
      type: String,
      hashKey: true,
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    redirectUri: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
