import mongoose from "mongoose";
import CryptoJS from "crypto-js";

const Schema = mongoose.Schema;

const SecretSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  secretCipher: {
    type: String,
    required: true,
  },
});

SecretSchema.methods.decryptSecret = function (masterPassword) {
  return CryptoJS.AES.decrypt(this.secretCipher, masterPassword).toString(
    CryptoJS.enc.Utf8
  );
};

export default mongoose.model("Secret", SecretSchema);
