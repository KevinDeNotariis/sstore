import CryptoJS from "crypto-js";
import Secret from "../models/SecretModel.mjs";

export const saveSecret = async ({ name, secret, masterPassword }) => {
  const passwordCipher = CryptoJS.AES.encrypt(
    secret,
    masterPassword
  ).toString();

  const secretDoc = new Secret({
    name: name,
    secretCipher: passwordCipher,
  });

  try {
    await secretDoc.save();
  } catch (e) {
    throw new Error(e);
  }
  return true;
};

export const deleteSecret = async ({ name }) => {
  try {
    await Secret.deleteOne({ name });
  } catch (e) {
    throw new Error(e);
  }
};

export const updateSecret = async ({ name, newSecret, masterPassword }) => {
  const newSecretCipher = CryptoJS.AES.encrypt(
    newSecret,
    masterPassword
  ).toString();

  try {
    await Secret.updateOne(
      {
        name: name,
      },
      {
        secretCipher: newSecretCipher,
      }
    );
    return true;
  } catch (e) {
    throw new Error(e);
  }
};
