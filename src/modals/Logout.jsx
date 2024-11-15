import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

import { useNavigate } from '@tanstack/react-router';
import { Route as LoginRoute } from '../routes/_authentication/index';
import Cookies from 'js-cookie';
import { ADMIN_COOKIE } from '@/lib/constant';
import { toast } from 'react-toastify';

const Logout = ({ children }) => {
  const navigate = useNavigate();
  const [isLogout, setIsLogout] = useState(false);

  const logout = () => {
    setIsLogout(false);
    Cookies.remove(ADMIN_COOKIE);
    toast.success('Logout successfully');
    navigate({ to: LoginRoute.to });
  };

  return (
    <Dialog open={isLogout} onOpenChange={e => setIsLogout(e)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-[90%] md:max-w-xl p-6 pt-4 rounded-2xl'>
        <div className='size-[120px] mx-auto my-4 flex justify-center items-center ring-[10px] dark:ring-white/10 rounded-full'>
          <svg className='size-14 stroke-bg_main' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M40.6914 34.1134L46.6647 28.1401L40.6914 22.1667' strokeWidth='4' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round' />
            <path d='M22.7715 28.14H46.5015' strokeWidth='4' stroke-miterlimit='10' stroke-linecap='round' stroke-linejoin='round' />
            <path
              d='M27.4381 46.6666C17.1248 46.6666 8.77148 39.6666 8.77148 27.9999C8.77148 16.3333 17.1248 9.33325 27.4381 9.33325'
              strokeWidth='4'
              stroke-miterlimit='10'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        </div>
        <DialogHeader className='space-y-2 my-6 text-center'>
          <DialogTitle className='text-center text-3xl font-semibold dark:text-[#F5F5F5]'>Sign Out</DialogTitle>
          <p className='text-center text-lg dark:text-input_text'>Are you sure you want to sign out?</p>
        </DialogHeader>
        <DialogFooter className='xs:mt-4 gap-y-4 md:gap-x-6'>
          <DialogClose className='w-full py-3.5 font-semibold rounded-xl text-xl dark:bg-input_bg dark:text-white'>Cancel</DialogClose>
          <Button className='w-full font-semibold py-3.5 rounded-xl text-xl' onClick={logout}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Logout;
