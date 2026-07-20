import { z } from 'zod';

export const withdrawalSchema = z.object({
  points: z.coerce.number().min(100, 'Minimum withdrawal is 100 points'),
  paymentMethod: z.enum(['UPI', 'BANK'], { required_error: 'Payment method is required' }),
});
