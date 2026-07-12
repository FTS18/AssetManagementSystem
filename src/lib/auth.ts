import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/*
 * Fallback secret is only used during early development bootstrapping 
 * to prevent server crashes if the environment files are temporarily missing.
 */
const JWT_SECRET = process.env.JWT_SECRET || "development-fallback-secret-key-998822";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
