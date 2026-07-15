# MNG Squad Absensi System

Modern attendance tracking system built with Next.js 16, TypeScript, Supabase, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.110-green)

## Features

✅ **Authentication & Authorization**
- JWT-based session management
- bcrypt password hashing
- Role-based access control (Admin/User)
- Secure HTTP-only cookies with SameSite protection

✅ **Attendance Management**
- Upload attendance proof (image)
- Text-based excuse/permission submission (Izin) with validation
- Strict double check-in prevention
- Camera capture support (WebCam/Mobile)
- Drag & drop file upload
- Server-side file validation
- Automatic image optimization

✅ **Admin Panel**
- User management (Add/Edit/Delete members)
- Password management
- Global broadcast announcements
- MVP rankings system
- Attendance history with filtering
- CSV export functionality
- Real-time "Missing In Action" tracker

✅ **Security Features**
- Rate limiting (login, upload, admin actions)
- Input validation with Zod schemas
- File type and size validation
- SQL injection protection
- XSS protection
- CSRF protection (built-in with Next.js App Router)

✅ **Code Quality**
- TypeScript with strict mode
- Error boundaries for graceful error handling
- Loading states with Suspense
- Proper error handling
- Clean architecture with separation of concerns

✅ **UI/UX**
- Dark/Light theme support
- Responsive design (Mobile-first)
- Modern minimalist design
- Toast notifications with auto-dismiss
- Loading skeletons
- Smooth animations

## Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT (jose)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm/yarn/pnpm/bun
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd absensi-valo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   JWT_SECRET=your-secret-key-min-32-chars
   ```

5. Run database migrations (see `supabase/migrations/README.md`)

6. Create storage bucket in Supabase:
   - Go to Storage → Create bucket named `image`
   - Make it public
   - Set up appropriate policies

7. Run development server:
   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000)

### First Time Setup

1. Run the database migrations from `supabase/migrations/`
2. Create admin account through Supabase dashboard or SQL:
   ```sql
   INSERT INTO squad_members (nama, password, role)
   VALUES ('ADMIN', '$2a$10$...', 'admin');
   ```
3. Login with admin credentials and add team members

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── absen/             # Attendance page
│   │   ├── admin/             # Admin panel
│   │   ├── login/             # Login page
│   │   ├── riwayat/           # History page
│   │   ├── actions/           # Server actions
│   │   ├── error.tsx          # Error boundary
│   │   ├── global-error.tsx   # Global error handler
│   │   └── loading.tsx        # Loading state
│   ├── components/            # React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Navbar.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── lib/                   # Utilities & configs
│   │   ├── constants.ts       # App constants
│   │   ├── file-utils.ts      # File validation
│   │   ├── password.ts        # Password hashing
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── session.ts         # JWT management
│   │   ├── supabase.ts        # Supabase client
│   │   └── validations.ts     # Zod schemas
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Auth middleware
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── ...config files
```

## API Routes (Server Actions)

### Authentication (`src/app/actions/auth.ts`)
- `login(formData)` - User authentication
- `logout()` - User logout

### Admin (`src/app/actions/admin.ts`)
- `addMember(formData)` - Add new member
- `updatePassword(formData)` - Update member password
- `deleteMember(formData)` - Delete member
- `broadcastAnnouncement(formData)` - Send announcement
- `clearAnnouncement()` - Clear announcements
- `updateMVPs(formData)` - Update MVP rankings
- `clearMVPs()` - Clear MVP rankings

### Attendance (`src/app/actions.ts`)
- `uploadAbsensi(formData)` - Upload attendance (image proof)
- `submitIzin(formData)` - Submit text-based excuse (Izin)

## Security Best Practices

1. **Never commit `.env.local`** - Credentials are in `.gitignore`
2. **Rotate secrets regularly** - Especially JWT_SECRET
3. **Use strong passwords** - Minimum 6 characters (configurable)
4. **Monitor rate limits** - Adjust in `src/lib/constants.ts`
5. **Review audit logs** - Check `audit_logs` table regularly
6. **Keep dependencies updated** - Run `npm audit` regularly

## Rate Limits

Default rate limits (configurable in `src/lib/constants.ts`):
- Login: 5 attempts per 15 minutes
- Upload: 10 uploads per hour
- Admin actions: 30 actions per hour

## Database Schema

See `supabase/migrations/` for full schema:
- `squad_members` - User accounts
- `schedules` - Active schedules / meeting times
- `absensi` - Attendance & excuse records
- `announcements` - Broadcast messages
- `mvps` - MVP rankings
- `audit_logs` - Audit trail

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is private and proprietary to MNG Squad.

## Support

For issues or questions, contact the development team.

---

**Built with ❤️ by MNG Squad Development Team**
