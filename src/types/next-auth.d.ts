import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      id: string;
      username: string;
      isSuperUser: boolean;
    };
  }

  interface User {
    id: string;
    username: string;
    isSuperUser: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    isSuperUser: boolean;
  }
}