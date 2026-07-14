export type SquadMember = {
  id: string;
  nama: string;
  password?: string;
  role: 'admin' | 'user';
  created_at: string;
};
