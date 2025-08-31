import crypto from "crypto";
import "server-only";

const ALG = "aes-256-cbc"; //key length is 32 bytes
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

export function symmetricEncrypt(data: string) {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("encryption key not found");

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALG, Buffer.from(key, "hex"), iv);

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptCode = iv.toString("hex") + ":" + encrypted.toString("hex");
  return encryptCode;
}

export const symmetricDecrypt = (encrypted: string) => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("encryption key not found");

  const textParts = encrypted.split(":");
  const iv = Buffer.from(textParts.shift() as string, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(ALG, Buffer.from(key, "hex"), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
