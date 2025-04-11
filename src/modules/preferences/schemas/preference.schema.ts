import * as dynamoose from 'dynamoose';

export const PreferenceSchema = new dynamoose.Schema(
  {
    uid: {
      type: String,
      hashKey: true,
      required: true,
    },
    loyaltyUserId: {
      type: Number,
      required: false,
    },
    team: {
      type: String,
      required: false,
    },
    cpf: {
      type: String,
      default: 'N/A',
      required: false,
      index: {
        type: 'global',
        name: 'CpfIndex',
      },
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    termsAccepted: {
      type: Boolean,
      default: true,
      required: true,
    },
    newsletterAccepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    likedPosts: {
      type: Array,
      default: [],
      required: true,
      schema: [String],
    },
    loyaltyActiveSubscription: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
