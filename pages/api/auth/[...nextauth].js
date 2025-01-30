import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const adminEmails = ["vadimdyachenko000@gmail.com"];

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({ session, token, user }) => {
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
};

export default NextAuth(authConfig);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authConfig);
  if (!adminEmails.includes(session?.user?.email)) {
    throw "not an admin";
  }
}
