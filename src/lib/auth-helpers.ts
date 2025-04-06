import bcrypt from "bcrypt";

export async function isAdminCredentials(username: string, password: string): Promise<boolean> {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return false;
  }
  
  return username === process.env.ADMIN_USERNAME && 
         await bcrypt.compare(password, await bcrypt.hash(process.env.ADMIN_PASSWORD, 10));
}

export function isAdminUser(user: { isSuperUser?: boolean }): boolean {
  return !!user.isSuperUser;
}