import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import Cookies from 'js-cookie';
import { ADMIN_COOKIE } from '@/lib/constant';
import { Route as LoginRoute } from '@/routes/_authentication';

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: ({ location }) => {
    const admin = Cookies.get(ADMIN_COOKIE);

    try {
      const { token = null } = JSON.parse(admin);
      if (!token) {
        Cookies.remove(ADMIN_COOKIE);
        throw redirect({ to: LoginRoute.to });
      }
    } catch (error) {
      Cookies.remove(ADMIN_COOKIE);
      throw redirect({ to: LoginRoute.to, search: { cb: location.href } });
    }
  }
});

function Layout() {
  return (
    <>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header />
        <div className='h-full flex flex-col dark:bg-black overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </>
  );
}
