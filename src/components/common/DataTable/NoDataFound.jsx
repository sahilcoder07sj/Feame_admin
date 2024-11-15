import { NORECORD } from '@/lib/images';

const NoDataFound = () => {
  return (
    <div className='w-full h-full p-4 flex flex-col justify-center items-center gap-y-4 dark:bg-[#141414]'>
      <img className='w-full max-w-xs' src={NORECORD} alt='no record' />
      <p className='dark:text-text_main text-xl font-semibold text-center'>No data found on this page.</p>
    </div>
  );
};

export default NoDataFound;
