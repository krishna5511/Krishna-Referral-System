import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name too short').max(50, 'Name too long').optional().or(z.literal('')),
  userName: z.string().min(3, 'Username too short').max(20, 'Username too long').regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores').optional().or(z.literal('')),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number').optional().or(z.literal('')),
  upiId: z.string().regex(/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format').optional().or(z.literal('')),
  accountHolderName: z.string().min(3).max(50).optional().or(z.literal('')),
  accountNumber: z.string().min(8).max(20).regex(/^[0-9]+$/, 'Only digits').optional().or(z.literal('')),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').optional().or(z.literal('')),
  bankName: z.string().min(2).max(50).optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
