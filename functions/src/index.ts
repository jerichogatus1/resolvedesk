import { setGlobalOptions } from 'firebase-functions';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

export const createUserAccount = onCall({ cors: true }, async (request) => {
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

export const resetUserPassword = onCall({ cors: true }, async (request) => {
  const callerEmail = request.auth?.token?.email;

  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const callerRecord = await admin.firestore().collection('users').doc(request.auth.uid).get();
  const callerRole = callerRecord.exists ? callerRecord.data()?.role : null;
  const isMasterAdmin = callerEmail === 'master@admin.com';

  if (!isMasterAdmin && callerRole !== 'it') {
    throw new HttpsError('permission-denied', 'Only IT staff or Master Admin can reset passwords.');
  }

  const { uid } = request.data ?? {};
  if (!uid) {
    throw new HttpsError('invalid-argument', 'Target user UID is required.');
  }

  await admin.auth().updateUser(uid, { password: 'rsd123' });

  await admin.firestore().collection('users').doc(uid).set(
    {
      passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
      passwordResetBy: callerEmail,
      temporaryPassword: 'rsd123',
    },
    { merge: true }
  );

  return {
    uid,
    temporaryPassword: 'rsd123',
  };
});
