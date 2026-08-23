/**
 * auth-service/utils/jwt.utils.js
 *
 * JWT signing and verification using `jose`.
 * `jose` is used because it works in both Node.js and Next.js Edge runtime
 * (required for src/middleware.js cookie-based route protection).
 *
 * Token lifetime: 7 days
 * Algorithm: HS256
 */

import { SignJWT, jwtVerify } from "jose";

const DEFAULT_SECRET = "smart_waste_ai_jwt_secret_key_development_2026_secure_token";

function getSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Signs a JWT with the given payload.
 * @param {object} payload - e.g. { userId: string, role: string }
 * @returns {Promise<string>} signed JWT string
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/**
 * Verifies a JWT and returns its payload.
 * Throws if the token is invalid or expired.
 * @param {string} token
 * @returns {Promise<object>} JWT payload
 */
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
