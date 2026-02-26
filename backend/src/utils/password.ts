/**
 * Password hashing and verification helpers using bcrypt.
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Hashes password.
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compares password.
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
