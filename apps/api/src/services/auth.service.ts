import { User, IUser } from '../models/User';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country?: 'FR' | 'US';
  language?: 'fr' | 'en';
}

interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await User.findOne({ email: input.email.toLowerCase() });
  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    country: input.country || 'FR',
    language: input.language || 'fr',
  });

  const tokenPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { user, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokenPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { user, accessToken, refreshToken };
}

export async function refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(token);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const tokenPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
}

export async function getUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId).select('-passwordHash');
}

export async function updateUser(userId: string, data: Partial<Pick<IUser, 'firstName' | 'lastName' | 'language' | 'country'>>): Promise<IUser | null> {
  return User.findByIdAndUpdate(userId, data, { new: true }).select('-passwordHash');
}

export async function deleteUser(userId: string): Promise<void> {
  await User.findByIdAndDelete(userId);
}

function sanitizeUser(user: IUser) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}
