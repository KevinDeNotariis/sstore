import CryptoJS from "crypto-js";

const decryptSecret = (secretCipher, masterPassword) => {
  return CryptoJS.AES.decrypt(secretCipher, masterPassword).toString(
    CryptoJS.enc.Utf8
  );
};

export default decryptSecret;
