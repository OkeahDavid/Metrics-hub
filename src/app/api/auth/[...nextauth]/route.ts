import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Only export the handler functions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };