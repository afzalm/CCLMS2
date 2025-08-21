import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Database } from 'sqlite3';
import path from 'path';

// Define user type
interface DbUser {
  id: string;
  name: string | null;
  email: string;
  password: string | null;
  role: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

// Create a SQLite database connection
const dbPath = path.join(process.cwd(), 'src', 'lib', 'prisma', 'dev.db');
const db = new Database(dbPath);

// Helper function to query the database
const queryDb = (sql: string, params: unknown[] = []): Promise<DbUser[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows as DbUser[]);
    });
  });
};

// Helper function to get a single row
const getRow = (sql: string, params: unknown[] = []): Promise<DbUser | null> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row as DbUser | null);
    });
  });
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getRow(
            'SELECT * FROM User WHERE email = ?',
            [credentials.email]
          );

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (isValid) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.avatar
            };
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }

        return null;
      }
    })
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Add role to token if it exists on user
        if ('role' in user) {
          token.role = (user as { role: string }).role;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};