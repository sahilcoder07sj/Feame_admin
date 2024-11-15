import useAxios from '@/axios/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { GETSINGLEDISCOUNTLIST } from '@/lib/endpoint';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router';
import parse from 'html-react-parser';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { EMAIL_ICON } from '@/lib/images';
import { convertUTCToLocalTime } from '@/lib/helper';


export const Route = createFileRoute('/_layout/discount/$discount_id')({
  component: DiscountDetails
});

function DiscountDetails() {
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  
  const { privateAxios } = useAxios();

  const { data, isFetching } = useQuery({
    queryKey: [GETSINGLEDISCOUNTLIST, params.event_id],
    queryFn: () => privateAxios({ url: GETSINGLEDISCOUNTLIST, data: { event_id: params.event_id } }),
    refetchOnMount: true,
    enabled: typeof params.event_id === 'string'
  });

  return (
    <div className='h-full flex flex-col bg-[#0A0A0A] overflow-hidden'>
      <ScrollArea className='p-6'>
        <div className='space-y-4'>
          {isFetching ? (
            <Skeleton className='w-full max-w-[320px] h-auto rounded-lg aspect-[312/176] dark:bg-input_bg' />
          ) : (
            <div className='w-full max-w-[320px]'>
              <img className='w-full h-auto rounded-lg aspect-[312/176]' src={data.data.event_profile} alt='event image' />
            </div>
          )}
          {isFetching ? <Skeleton className='max-w-[320px] h-9 dark:bg-input_bg' /> : <h5 className='text-3xl dark:text-text_main'>{search.name}</h5>}
          <Separator orientation='horizontal' className='h-[1px] mb-6 dark:bg-[#231E28]' />
        </div>
        <div className='w-full py-6 overflow-x-hidden'>
          <ul className='mt-5 space-y-4'>
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M10.0004 11.1916C11.4363 11.1916 12.6004 10.0275 12.6004 8.59158C12.6004 7.15564 11.4363 5.99158 10.0004 5.99158C8.56445 5.99158 7.40039 7.15564 7.40039 8.59158C7.40039 10.0275 8.56445 11.1916 10.0004 11.1916Z'
                  stroke='#FF944E'
                  strokeWidth='1.25'
                />
                <path
                  d='M3.01675 7.07496C4.65842 -0.141705 15.3501 -0.133372 16.9834 7.08329C17.9417 11.3166 15.3084 14.9 13.0001 17.1166C11.3251 18.7333 8.67508 18.7333 6.99175 17.1166C4.69175 14.9 2.05842 11.3083 3.01675 7.07496Z'
                  stroke='#FF944E'
                  strokeWidth='1.25'
                />
              </svg>
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <span className='dark:text-input_text'>{data.data.location}</span>
              )}
            </li>
          </ul>
        </div>
      
  
        
      </ScrollArea>
    </div>
  );
}
