import CryptoJS from "crypto-js";
import Configstore from "configstore";
const conf = new Configstore("sstore");

export const saveSecret = async ({ name, secret, masterPassword }) => {
  const passwordCipher = CryptoJS.AES.encrypt(
    secret,
    masterPassword
  ).toString();

  if (!conf.get(name.replace(".", "\\."))) {
    conf.set(name.replace(".", "\\."), passwordCipher);
  }

  return true;
};

export const deleteSecret = async ({ name }) => {
  conf.delete(name.replace(".", "\\."));
};

export const updateSecret = async ({ name, newSecret, masterPassword }) => {
  const newSecretCipher = CryptoJS.AES.encrypt(
    newSecret,
    masterPassword
  ).toString();

  conf.set(name.replace(".", "\\."), newSecretCipher);

  return true;
};
