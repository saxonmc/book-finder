import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { users } from '../../shared/schema'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface UserRegistration {
  email: string
  password: string
  name: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface UserProfile {
  id: number
  email: string
  name: string
  createdAt: number
}

export class AuthService {
  async registerUser(userData: UserRegistration): Promise<UserProfile> {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email))
    
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Create user
    const now = Date.now()
    const newUser = await db.insert(users).values({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return {
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      createdAt: newUser[0].createdAt || now,
    }
  }

  async loginUser(loginData: UserLogin): Promise<{ user: UserProfile; token: string }> {
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, loginData.email))
    
    if (user.length === 0) {
      throw new Error('Invalid email or password')
    }

    const foundUser = user[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(loginData.password, foundUser.password)
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt || 0,
      },
      token,
    }
  }

  async verifyToken(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      const user = await db.select().from(users).where(eq(users.id, decoded.userId))
      
      if (user.length === 0) {
        throw new Error('User not found')
      }

      const foundUser = user[0]
      
      return {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt || 0,
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  async getUserById(userId: number): Promise<UserProfile | null> {
    const user = await db.select().from(users).where(eq(users.id, userId))
    
    if (user.length === 0) {
      return null
    }

    const foundUser = user[0]
    
    return {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt || 0,
    }
  }
} 