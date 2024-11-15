const Error = () => {
  return (
    <div className='h-[calc(100dvh-57px)] lap:h-[calc(100dvh-67px)] w-full px-4 esm:px-6 sm:px-8 md:px-10 lg:px-[50px] xl:px-[60px] flex flex-col gap-y-2 md:gap-y-4 items-center justify-center'>
      <p className='text-6xl md:text-7xl lap:text-8xl font-bold text-red-500'>Error</p>
      <p className='max-w-xl text-center text-base md:text-lg lap:text-xl text-red-400 font-medium'>Something went wrong, please try again later !</p>
    </div>
  );
};

export default Error;
