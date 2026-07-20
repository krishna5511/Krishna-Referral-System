import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(150, 'Subject too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(3000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

export const replySchema = z.object({
  message: z.string().min(1, 'Message is required').max(3000, 'Message too long'),
});
