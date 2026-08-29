import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  switch (user.role) {
    case 'ADMIN':
      redirect('/admin/dashboard');
    case 'FACULTY':
      redirect('/faculty/dashboard');
    case 'STUDENT':
      redirect('/student/dashboard');
    default:
      redirect('/login');
  }
}
