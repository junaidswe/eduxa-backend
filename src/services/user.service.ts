import { prisma } from "../config/db";
import { redis } from "../config/redis";
import { ApiError } from "../utils/ApiError";

const PROFILE_CACHE_TTL_SECONDS = 60;
const profileCacheKey = (userId: string) => `user:profile:${userId}`;

export const getUserProfile = async (userId: string) => {
  const cached = await redis.get(profileCacheKey(userId));
  if (cached) return JSON.parse(cached);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, first_name: true, last_name: true, role: true, createdAt: true },
  });
  if (!user) throw ApiError.notFound("User not found");

  await redis.set(profileCacheKey(userId), JSON.stringify(user), "EX", PROFILE_CACHE_TTL_SECONDS);
  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: { first_name?: string; last_name?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, first_name: true, last_name: true, role: true, createdAt: true },
  });
  await redis.del(profileCacheKey(userId));
  return user;
};

export const listUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, first_name: true, last_name: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};
