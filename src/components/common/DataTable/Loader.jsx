import { Skeleton } from '@/components/ui/skeleton';

const Loader = () => {
  return (
    <div className='w-full h-full p-4 space-y-4 dark:bg-[#141414]'>
      {[...new Array(10)].map((_, index) => {
        return <Skeleton key={index} className='h-[50px] dark:bg-black' />;
      })}
    </div>
  );
};

export default Loader;
