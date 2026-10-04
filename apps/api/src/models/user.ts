export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: Date;
  last_login: Date | null;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    last_login: user.last_login,
  };
}
