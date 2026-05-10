import { setGlobalOptions } from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

export const createUserAccount = onCall(async (request) => {
  const callerEmail = request.auth?.token?.email;

  if (!request.auth || callerEmail !== 'master@admin.com') {
    throw new HttpsError('permission-denied', 'Only the Master Admin can create user accounts.');
  }

  const { email, password, role, department, name } = request.data ?? {};

  if (!email || !password || !role || !department || !name) {
    throw new HttpsError('invalid-argument', 'Missing required user fields.');
  }

  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName: name,
  });

  await admin.firestore().collection('users').doc(userRecord.uid).set({
    email,
    role,
    department,
    name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: callerEmail,
  });

  return {
    uid: userRecord.uid,
    email,
  };
});
