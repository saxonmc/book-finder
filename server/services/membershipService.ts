import { db } from '../db'
import { userMemberships } from '../../shared/schema'
import { eq, and } from 'drizzle-orm'

export interface AddMembership {
  userId: number
  service: string
  membershipType: string
  price?: string
  status?: string
  startDate?: number
  endDate?: number
  notes?: string
}

export interface UpdateMembership {
  membershipType?: string
  price?: string
  status?: string
  startDate?: number
  endDate?: number
  notes?: string
}

export interface UserMembership {
  id: number
  userId: number
  service: string
  membershipType: string
  price?: string
  status: string
  startDate?: number
  endDate?: number
  notes?: string
  createdAt: number
  updatedAt: number
}

export class MembershipService {
  async addMembership(data: AddMembership): Promise<UserMembership> {
    const now = Date.now()
    
    const newMembership = await db.insert(userMemberships).values({
      userId: data.userId,
      service: data.service,
      membershipType: data.membershipType,
      price: data.price || null,
      status: data.status || 'active',
      startDate: data.startDate || now,
      endDate: data.endDate || null,
      notes: data.notes || null,
      createdAt: now,
      updatedAt: now,
    }).returning()

    return {
      id: newMembership[0].id,
      userId: newMembership[0].userId,
      service: newMembership[0].service,
      membershipType: newMembership[0].membershipType,
      price: newMembership[0].price || undefined,
      status: newMembership[0].status,
      startDate: newMembership[0].startDate || undefined,
      endDate: newMembership[0].endDate || undefined,
      notes: newMembership[0].notes || undefined,
      createdAt: newMembership[0].createdAt || now,
      updatedAt: newMembership[0].updatedAt || now,
    }
  }

  async updateMembership(membershipId: number, userId: number, data: UpdateMembership): Promise<UserMembership | null> {
    const now = Date.now()
    
    const updatedMembership = await db.update(userMemberships)
      .set({
        membershipType: data.membershipType || undefined,
        price: data.price || null,
        status: data.status || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || null,
        notes: data.notes || null,
        updatedAt: now,
      })
      .where(and(
        eq(userMemberships.id, membershipId),
        eq(userMemberships.userId, userId)
      ))
      .returning()

    if (updatedMembership.length === 0) {
      return null
    }

    return {
      id: updatedMembership[0].id,
      userId: updatedMembership[0].userId,
      service: updatedMembership[0].service,
      membershipType: updatedMembership[0].membershipType,
      price: updatedMembership[0].price || undefined,
      status: updatedMembership[0].status,
      startDate: updatedMembership[0].startDate || undefined,
      endDate: updatedMembership[0].endDate || undefined,
      notes: updatedMembership[0].notes || undefined,
      createdAt: updatedMembership[0].createdAt || 0,
      updatedAt: updatedMembership[0].updatedAt || now,
    }
  }

  async getUserMemberships(userId: number): Promise<UserMembership[]> {
    const memberships = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.userId, userId))

    return memberships.map(membership => ({
      id: membership.id,
      userId: membership.userId,
      service: membership.service,
      membershipType: membership.membershipType,
      price: membership.price || undefined,
      status: membership.status,
      startDate: membership.startDate || undefined,
      endDate: membership.endDate || undefined,
      notes: membership.notes || undefined,
      createdAt: membership.createdAt || 0,
      updatedAt: membership.updatedAt || 0,
    }))
  }

  async removeMembership(membershipId: number, userId: number): Promise<boolean> {
    const result = await db.delete(userMemberships)
      .where(and(
        eq(userMemberships.id, membershipId),
        eq(userMemberships.userId, userId)
      ))

    return result.changes > 0
  }

  async getMembershipById(membershipId: number, userId: number): Promise<UserMembership | null> {
    const membership = await db
      .select()
      .from(userMemberships)
      .where(and(
        eq(userMemberships.id, membershipId),
        eq(userMemberships.userId, userId)
      ))

    if (membership.length === 0) {
      return null
    }

    return {
      id: membership[0].id,
      userId: membership[0].userId,
      service: membership[0].service,
      membershipType: membership[0].membershipType,
      price: membership[0].price || undefined,
      status: membership[0].status,
      startDate: membership[0].startDate || undefined,
      endDate: membership[0].endDate || undefined,
      notes: membership[0].notes || undefined,
      createdAt: membership[0].createdAt || 0,
      updatedAt: membership[0].updatedAt || 0,
    }
  }
} 