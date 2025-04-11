import * as sendpulseApi from 'sendpulse-api';

const TOKEN_STORAGE = '/tmp/';
const API_SECRET = process.env.SENDPULSE_API_SECRET;
const API_USER_ID = process.env.SENDPULSE_API_USER_ID;

export function sendpulseInit(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!API_USER_ID || !API_SECRET) {
      reject(new Error('SendPulse API credentials are missing'));
      return;
    }

    sendpulseApi.init(API_USER_ID, API_SECRET, TOKEN_STORAGE, () => {
      resolve();
    });
  });
}
