import { Link } from '@tanstack/react-router';
import { Route as indexRoute } from '../../routes/_authentication';

const PageNotFound = () => {
  return (
    <div className='h-dvh w-full px-4 esm:px-6 sm:px-8 md:px-10 lg:px-[50px] xl:px-[60px] flex flex-col gap-y-2 md:gap-y-4 items-center justify-center'>
      <p className='text-6xl md:text-7xl lap:text-8xl font-bold dark:text-white text-black'>404</p>
      <p className='max-w-xl text-center text-base md:text-lg lap:text-xl font-medium dark:text-white text-black'>
        Sorry, we couldn't find this page. But don't worry, you can find plenty of other things on our{' '}
        <Link to={indexRoute.to} className='text-[#39a6ff] font-semibold underline'>
          homepage.
        </Link>
      </p>
    </div>
  );
};

export default PageNotFound;
