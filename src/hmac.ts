import { createHash, createHmac } from "crypto";

const hmacSecret = process.env.API_HMAC_SECRET!;

export function verifyHMAC(
  authorization: string | undefined,
  url: string,
  method: string,
  body: string
) {
  if (!authorization) return false;
  const [name, rest] = authorization.split(" ");
  if (name !== "HMAC") return false;

  const [time, ...restDigest] = rest.split(":");

  const digest = restDigest.join(":");

  const hmac = createHmac("sha256", hmacSecret);

  hmac.update(time);
  hmac.update(method);
  hmac.update(url);

  if (body) {
    const contentHash = createHash("md5");
    contentHash.update(body);
    hmac.update(contentHash.digest("hex"));
  }

  return digest === hmac.digest("hex");
}
