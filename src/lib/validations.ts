import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const addMemberSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['admin', 'user']).default('user'),
});

export const updatePasswordSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const deleteMemberSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

// Upload schema
export const uploadAbsensiSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  file: z.any().refine((file) => file instanceof File, 'File wajib diupload'),
  schedule_id: z.string().uuid('ID Jadwal tidak valid'),
});

// Broadcast schema
export const broadcastSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(500, 'Pesan maksimal 500 karakter'),
});

// MVP schema
export const mvpSchema = z.object({
  rank: z.number().int().min(1).max(3),
  nama: z.string().min(1),
  pts: z.number().int().min(0),
});

export const mvpArraySchema = z.array(mvpSchema).max(3);

export type LoginInput = z.infer<typeof loginSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>;
export type UploadAbsensiInput = z.infer<typeof uploadAbsensiSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type MVPInput = z.infer<typeof mvpSchema>;

export const submitIzinSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  schedule_id: z.string().uuid('ID Jadwal tidak valid'),
  alasan: z.string().min(10, 'Alasan terlalu singkat. Jelaskan dengan detail!'),
});

export type SubmitIzinInput = z.infer<typeof submitIzinSchema>;
