const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

setGlobalOptions({maxInstances: 10});
admin.initializeApp();

exports.createUserAccount = onCall({cors: true}, async (request) => {
  const callerEmail = request.auth &&
    request.auth.token &&
    request.auth.token.email;

  if (!request.auth || callerEmail !== "master@admin.com") {
    throw new HttpsError(
        "permission-denied",
        "Only the Master Admin can create user accounts.",
    );
  }

  const data = request.data || {};
  const email = data.email;
  const password = data.password;
  const role = data.role;
  const department = data.department;
  const name = data.name;

  if (!email || !password || !role || !department || !name) {
    throw new HttpsError("invalid-argument", "Missing required user fields.");
  }

  const userRecord = await admin.auth().createUser({
    email: email,
    password: password,
    displayName: name,
  });

  await admin.firestore().collection("users").doc(userRecord.uid).set({
    email: email,
    role: role,
    department: department,
    name: name,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: callerEmail,
  });

  return {
    uid: userRecord.uid,
    email: email,
  };
});

exports.resetUserPassword = onCall({cors: true}, async (request) => {
  const callerEmail = request.auth &&
    request.auth.token &&
    request.auth.token.email;

  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const callerDoc = await admin
      .firestore()
      .collection("users")
      .doc(request.auth.uid)
      .get();
  const callerRole = callerDoc.exists ? callerDoc.data().role : null;
  const isMasterAdmin = callerEmail === "master@admin.com";

  if (!isMasterAdmin && callerRole !== "it") {
    throw new HttpsError(
        "permission-denied",
        "Only IT staff or Master Admin can reset passwords.",
    );
  }

  const data = request.data || {};
  const uid = data.uid;
  if (!uid) {
    throw new HttpsError("invalid-argument", "Target user UID is required.");
  }

  await admin.auth().updateUser(uid, {password: "rsd123"});

  await admin.firestore().collection("users").doc(uid).set({
    passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
    passwordResetBy: callerEmail,
    temporaryPassword: "rsd123",
  }, {merge: true});

  return {
    uid: uid,
    temporaryPassword: "rsd123",
  };
});
