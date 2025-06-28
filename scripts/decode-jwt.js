// Usage: node scripts/decode-jwt.js <JWT>
const [, , token] = process.argv;
if (!token) {
  console.error("Usage: node scripts/decode-jwt.js <JWT>");
  process.exit(1);
}
const [header, payload] = token.split(".");
function decode(str) {
  return Buffer.from(str, "base64").toString("utf8");
}
console.log("Header:", decode(header));
console.log("Payload:", decode(payload));
