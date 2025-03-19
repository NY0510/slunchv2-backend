import cron, { Patterns } from '@elysiajs/cron';
import { db } from './db';
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('serviceAccountKey.json'),
});

const collection = db.openDB({ name: 'fcm' });

export const sendFcm = cron({
  name: 'sendFcm',
  pattern: Patterns.EVERY_MINUTE,
  async run() {
    const currentTime = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    const tokens = collection
      .getKeys()
      .map((token) => collection.get(token))
      .filter((token) => token.time === currentTime);

    for (const token of tokens) {
      await sendNotification(token.value, 'title', 'body');
    }
  },
});

async function sendNotification(token: string, title: string, message: string) {
  const payload = {
    notification: {
      title,
      body: message,
    },
    token: token,
  };

  try {
    await admin.messaging().send(payload);
    console.log(`Notification sent to ${token} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`Error sending notification to ${token}:`, error);
  }
}
