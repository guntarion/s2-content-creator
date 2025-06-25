
import NextAuth, { User, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI as string)

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      await client.connect()
      const usersCollection = client.db("blog_post_fabrik").collection("users")
      const existingUser = await usersCollection.findOne({ email: user.email })

      if (!existingUser) {
        await usersCollection.insertOne({
          email: user.email,
          name: user.name,
          image: user.image,
          role: "planner", // Default role
          createdAt: new Date(),
        })
      }

      return true
    },
    async session({ session }: { session: Session }) {
      await client.connect()
      const usersCollection = client.db("blog_post_fabrik").collection("users")
      if (session.user) {
        const user = await usersCollection.findOne({ email: session.user.email })
        session.user.role = user?.role
      }
      
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
