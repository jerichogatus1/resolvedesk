const {setGlobalOptions} = require("firebase-functions/v2");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

setGlobalOptions({maxInstances: 10});

admin.initializeApp();

exports.createUserAccount = onCall(
    {cors: true, invoker: "public"},
    async (request) => {
      const callerEmail = request.auth?.token?.email;

      if (!request.auth || callerEmail !== "master@admin.com") {
        throw new HttpsError(
            "permission-denied",
            "Only the Master Admin can create user accounts.",
        );
      }

      const email = request.data?.email;
      const password = request.data?.password;
      const role = request.data?.role;
      const department = request.data?.department;
      const name = request.data?.name;

      if (!email || !password || !role || !department || !name) {
        throw new HttpsError(
            "invalid-argument",
            "Missing required user fields.",
        );
      }

      try {
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
      } catch (error) {
        console.error("createUserAccount error:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        const message = error?.message ||
          "Internal error creating user account.";
        const code =
          error?.code === "auth/email-already-exists" ?
            "already-exists" :
            "internal";
        throw new HttpsError(code, message);
      }
    },
);

exports.resetUserPassword = onCall(
    {cors: true, invoker: "public"},
    async (request) => {
      const callerEmail = request.auth?.token?.email;

      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Authentication is required.",
        );
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

      const uid = request.data?.uid;
      if (!uid) {
        throw new HttpsError(
            "invalid-argument",
            "Target user UID is required.",
        );
      }

      try {
        await admin.auth().updateUser(uid, {password: "rsd123"});

        await admin.firestore().collection("users").doc(uid).set(
            {
              passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
              passwordResetBy: callerEmail,
              temporaryPassword: "rsd123",
            },
            {merge: true},
        );

        return {
          uid: uid,
          temporaryPassword: "rsd123",
        };
      } catch (error) {
        console.error("resetUserPassword error:", error);
        if (error instanceof HttpsError) {
          throw error;
        }
        const message = error?.message ||
          "Internal error resetting password.";
        throw new HttpsError("internal", message);
      }
    },
);
