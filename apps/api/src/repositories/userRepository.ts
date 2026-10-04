import bcrypt from "bcryptjs";
import { query } from "../lib/db";
import { logger } from "../lib/logger";
import { CreateUserDTO, User } from "../models/user";

const SALT_ROUNDS = 10;

export async function createUser(data: CreateUserDTO): Promise<User> {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const rows = await query<User>(
    `INSERT INTO users (email, username, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.email.toLowerCase(), data.username, passwordHash, data.display_name || null]
  );

  const user = rows[0];

  // Initialize user stats
  await query(
    `INSERT INTO user_stats (user_id)
     VALUES ($1)`,
    [user.id]
  );

  logger.info(`User created: ${user.username} (${user.email})`);
  return user;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await query<User>(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
  return rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const rows = await query<User>(`SELECT * FROM users WHERE username = $1`, [username]);
  return rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const rows = await query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

export async function updateLastLogin(userId: string): Promise<void> {
  await query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [userId]);
}

export async function emailExists(email: string): Promise<boolean> {
  const rows = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`,
    [email.toLowerCase()]
  );
  return rows[0]?.exists || false;
}

export async function usernameExists(username: string): Promise<boolean> {
  const rows = await query<{ exists: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`,
    [username]
  );
  return rows[0]?.exists || false;
}
