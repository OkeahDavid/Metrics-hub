
export async function isAdminCredentials(username: string, password: string): Promise<boolean> {
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      return false;
    }
    
    return username === process.env.ADMIN_USERNAME && 
           password === process.env.ADMIN_PASSWORD;
  }

export function isAdminUser(user: { isSuperUser?: boolean }): boolean {
  return !!user.isSuperUser;
}