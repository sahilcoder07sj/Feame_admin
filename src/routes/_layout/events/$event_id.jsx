import useAxios from '@/axios/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { GETSINGLEEVENTLIST } from '@/lib/endpoint';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router';
import parse from 'html-react-parser';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { EMAIL_ICON } from '@/lib/images';
import { convertUTCToLocalTime } from '@/lib/helper';

export const Route = createFileRoute('/_layout/events/$event_id')({
  component: EventDetails
});

function EventDetails() {
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const { privateAxios } = useAxios();

  const { data, isFetching } = useQuery({
    queryKey: [GETSINGLEEVENTLIST, params.event_id],
    queryFn: () => privateAxios({ url: GETSINGLEEVENTLIST, data: { event_id: params.event_id } }),
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
          <h6 className='text-lg font-semibold dark:text-text_main'>Event Description</h6>
          {isFetching ? (
            <Skeleton className='max-w-[320px] h-6 mt-2 dark:bg-input_bg' />
          ) : (
            <p className='max-w-7xl mt-2 dark:text-input_text'>{data.data.description}</p>
          )}
          <ul className='mt-5 space-y-4'>
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M18.476 4.10952C18.4749 4.10952 18.4737 4.10938 18.4727 4.10938H13.6914V3.58203C13.6914 2.7097 12.9817 2 12.1094 2H7.89062C7.01829 2 6.30859 2.70973 6.30859 3.58203V4.10938H1.52734C1.23372 4.10938 1 4.34998 1 4.63672V16.2383C1 17.1106 1.70973 17.8203 2.58203 17.8203H17.418C18.2903 17.8203 19 17.1106 19 16.2383V4.64579C18.9798 4.29943 18.7668 4.11141 18.476 4.10952ZM7.36328 3.58203C7.36328 3.29129 7.59988 3.05469 7.89062 3.05469H12.1094C12.4001 3.05469 12.6367 3.29129 12.6367 3.58203V4.10938H7.36328V3.58203ZM17.741 5.16406L16.1033 10.0769C16.0684 10.1819 16.0013 10.2733 15.9116 10.3381C15.8218 10.4028 15.7139 10.4376 15.6032 10.4375H12.6367V9.91016C12.6367 9.61889 12.4006 9.38281 12.1094 9.38281H7.89062C7.59936 9.38281 7.36328 9.61889 7.36328 9.91016V10.4375H4.39683C4.28614 10.4376 4.17823 10.4028 4.08845 10.3381C3.99866 10.2733 3.93157 10.1819 3.8967 10.0769L2.25905 5.16406H17.741ZM11.582 10.4375V11.4922H8.41797V10.4375H11.582ZM17.9453 16.2383C17.9453 16.529 17.7087 16.7656 17.418 16.7656H2.58203C2.29129 16.7656 2.05469 16.529 2.05469 16.2383V7.88635L2.89612 10.4104C3.0008 10.7256 3.20215 10.9998 3.47155 11.1939C3.74095 11.3881 4.0647 11.4925 4.3968 11.4922H7.36328V12.0195C7.36328 12.3108 7.59936 12.5469 7.89062 12.5469H12.1094C12.4006 12.5469 12.6367 12.3108 12.6367 12.0195V11.4922H15.6032C15.9353 11.4925 16.259 11.3882 16.5284 11.194C16.7978 10.9998 16.9992 10.7256 17.1039 10.4104L17.9453 7.88635V16.2383Z'
                  fill='#FF944E'
                />
              </svg>
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <span className='dark:text-input_text'>{data.data.organized_by}</span>
              )}
            </li>
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M6.66699 1.66663V4.16663' stroke='#FF944E' strokeWidth='1.25' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M13.333 1.66663V4.16663' stroke='#FF944E' strokeWidth='1.25' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M2.91699 7.57495H17.0837' stroke='#FF944E' strokeWidth='1.25' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                <path
                  d='M17.5 7.08329V14.1666C17.5 16.6666 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6666 2.5 14.1666V7.08329C2.5 4.58329 3.75 2.91663 6.66667 2.91663H13.3333C16.25 2.91663 17.5 4.58329 17.5 7.08329Z'
                  stroke='#FF944E'
                  strokeWidth='1.25'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path d='M13.0791 11.4167H13.0866' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M13.0791 13.9167H13.0866' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M9.99607 11.4167H10.0036' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M9.99607 13.9167H10.0036' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6.91209 11.4167H6.91957' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path d='M6.91209 13.9167H6.91957' stroke='#FF944E' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <span className='dark:text-input_text'>{data.data.event_date}</span>
              )}
            </li>
            <li className='flex items-center gap-x-2'>
              <img className='w-5' src={EMAIL_ICON} alt="" />
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <span className='dark:text-input_text'>{data.data.email}</span>
              )}
            </li>
            {/* <li className='flex items-center gap-x-2'> */}
              {/* <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M18.3337 9.99996C18.3337 14.6 14.6003 18.3333 10.0003 18.3333C5.40033 18.3333 1.66699 14.6 1.66699 9.99996C1.66699 5.39996 5.40033 1.66663 10.0003 1.66663C14.6003 1.66663 18.3337 5.39996 18.3337 9.99996Z'
                  stroke='#FF944E'
                  strokeWidth='1.25'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M13.0914 12.65L10.5081 11.1083C10.0581 10.8416 9.69141 10.2 9.69141 9.67497V6.2583'
                  stroke='#FF944E'
                  strokeWidth='1.25'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg> */}
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <></>
                // <span className='dark:text-input_text'>
                //   {convertUTCToLocalTime(data.data.start_time, data.data.data.utc_start_date).localTime} - {convertUTCToLocalTime(data.data.end_time, data.data.utc_end_date).localTime ?? 'No endtime'} {' '}
                //   {convertUTCToLocalTime(data.data.end_time, data.data.utc_end_date).localTime ? `- ${parseInt(data.data.end_time?.split(':')[0]) - parseInt(data.data.start_time?.split(':')[0])} hrs` : null}
                // </span>
              )}
            {/* </li> */}
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M18.3375 4.33125L16.0875 2.08125C15.6486 1.58918 15.0331 1.29041 14.375 1.25H12.5C12.3343 1.25 12.1753 1.31585 12.0581 1.43306C11.9409 1.55027 11.875 1.70924 11.875 1.875C11.875 2.8625 10.625 3.125 10 3.125C9.37501 3.125 8.12501 2.8625 8.12501 1.875C8.12501 1.70924 8.05916 1.55027 7.94195 1.43306C7.82474 1.31585 7.66577 1.25 7.50001 1.25H5.62501C4.97817 1.29254 4.37214 1.58102 3.93126 2.05625L1.66251 4.33125C1.52195 4.47166 1.41687 4.64355 1.35601 4.83268C1.29514 5.0218 1.28023 5.22271 1.31251 5.41875L1.72501 7.91875C1.75912 8.12522 1.84451 8.31982 1.97337 8.48471C2.10222 8.6496 2.27041 8.7795 2.46251 8.8625C2.65415 8.94418 2.86316 8.97668 3.07055 8.95703C3.27794 8.93738 3.47713 8.86622 3.65001 8.75L3.75001 8.6875V16.875C3.75001 17.3723 3.94756 17.8492 4.29919 18.2008C4.65082 18.5525 5.12773 18.75 5.62501 18.75H14.375C14.8723 18.75 15.3492 18.5525 15.7008 18.2008C16.0525 17.8492 16.25 17.3723 16.25 16.875V8.66875L16.35 8.73125C16.5229 8.84747 16.7221 8.91863 16.9295 8.93828C17.1369 8.95793 17.3459 8.92543 17.5375 8.84375C17.7296 8.76075 17.8978 8.63085 18.0267 8.46596C18.1555 8.30107 18.2409 8.10647 18.275 7.9L18.6875 5.4C18.7167 5.2069 18.7003 5.00964 18.6395 4.82404C18.5787 4.63844 18.4753 4.46967 18.3375 4.33125ZM17.0438 7.69375L15.9688 6.98125C15.8765 6.92157 15.7702 6.88726 15.6605 6.88177C15.5507 6.87628 15.4415 6.89982 15.3438 6.95C15.2416 7.00145 15.1556 7.07994 15.095 7.17692C15.0343 7.2739 15.0015 7.38565 15 7.5V16.875C15 17.0408 14.9342 17.1997 14.817 17.3169C14.6997 17.4342 14.5408 17.5 14.375 17.5H5.62501C5.45925 17.5 5.30028 17.4342 5.18307 17.3169C5.06586 17.1997 5.00001 17.0408 5.00001 16.875V7.5C4.99971 7.38693 4.96874 7.27607 4.91041 7.17921C4.85208 7.08236 4.76856 7.00314 4.66876 6.95C4.57103 6.89982 4.4618 6.87628 4.35207 6.88177C4.24234 6.88726 4.136 6.92157 4.04376 6.98125L2.95626 7.69375L2.54376 5.19375L4.83751 2.91875C5.04499 2.69398 5.32265 2.54633 5.62501 2.5H6.95626C7.64376 5 12.3563 5 13.0438 2.5H14.375C14.6876 2.54841 14.9731 2.70555 15.1813 2.94375L17.4563 5.2125L17.0438 7.69375Z'
                  fill='#FF944E'
                />
              </svg>
              {isFetching ? (
                <Skeleton className='w-full max-w-[290px] h-6 dark:bg-input_bg' />
              ) : (
                <span className='dark:text-input_text'>{data.data.dress_code}</span>
              )}
            </li>
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
        <div className='w-full space-y-4 py-6 overflow-x-hidden'>
          <h6 className='text-lg font-semibold dark:text-text_main'>Allowed User</h6>
          <div className='max-h-[400px] main-notify-dialog overflow-auto'>
            {
              data?.data?.allowed_user_list?.length > 0 ? data.data.allowed_user_list.map((user, index) => (
                <div className='flex first:border-none border-t border-[#34363A] gap-x-5 py-4 items-center' key={index}>
                  <div>
                    <img className='w-[40px] h-[40px] rounded-md' src={user.single_profile} alt="" />
                  </div>
                  <div>
                    <p className='text-white text-lg'>{user.fname} {user.lname}</p>
                  </div>
                </div>
              ))
                :
                <div className='h-[100px] flex  items-center w-full '>
                  <h3 className='text-input_text text-lg'>Users not found</h3>
                </div>
            }
          </div>
        </div>
        <Separator orientation='horizontal' className='h-[1px] dark:bg-[#231E28]' />
        <div className='py-6'>
          <h6 className='text-lg font-semibold dark:text-text_main'>Event Rules</h6>
          {isFetching ? (
            <Skeleton className='w-full h-48 my-2 dark:bg-input_bg' />
          ) : (
            <div className='enable-html-styles my-2 dark:text-input_text'>{parse(data.data.rules)}</div>
          )}
        </div>
        <Separator orientation='horizontal' className='h-[1px] dark:bg-[#231E28]' />
        <div className='py-6'>
          <h6 className='text-lg font-semibold dark:text-text_main'>Proposed offer for Influencers</h6>
          {isFetching ? (
            <Skeleton className='w-full h-48 my-2 dark:bg-input_bg' />
          ) : (
            <div className='enable-html-styles my-2 dark:text-input_text'>{parse(data.data.rules)}</div>
          )}
        </div>
        <Separator orientation='horizontal' className='h-[1px] dark:bg-[#231E28]' />
        <div className='py-6'>
          <h6 className='text-lg font-semibold dark:text-text_main'>5-star review Links</h6>

          <ul className='mt-5 space-y-4'>
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M15.5837 6C15.2503 5.66667 14.7503 5.66667 14.417 6L8.16699 12.25L5.58366 9.66667C5.25033 9.33333 4.75033 9.33333 4.41699 9.66667C4.08366 10 4.08366 10.5 4.41699 10.8333L7.58366 14C7.75033 14.1667 7.91699 14.25 8.16699 14.25C8.41699 14.25 8.58366 14.1667 8.75033 14L15.5837 7.16667C15.917 6.83333 15.917 6.33333 15.5837 6Z'
                  fill='#FF944E'
                />
              </svg>
              <span className='w-full max-w-[125px] dark:text-input_text'>Google Reviews :</span>
              {isFetching ? (
                <Skeleton className='max-w-[320px] h-6 dark:bg-input_bg' />
              ) : (
                <a className='max-w-2xl break-all dark:text-[#00C2FF] border-b border-[#00C2FF]' href={data.data.google_review} target='_new'>
                  {data.data.google_review}
                </a>
              )}
            </li>
            <li className='flex items-center gap-x-2'>
              <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M15.5837 6C15.2503 5.66667 14.7503 5.66667 14.417 6L8.16699 12.25L5.58366 9.66667C5.25033 9.33333 4.75033 9.33333 4.41699 9.66667C4.08366 10 4.08366 10.5 4.41699 10.8333L7.58366 14C7.75033 14.1667 7.91699 14.25 8.16699 14.25C8.41699 14.25 8.58366 14.1667 8.75033 14L15.5837 7.16667C15.917 6.83333 15.917 6.33333 15.5837 6Z'
                  fill='#FF944E'
                />
              </svg>
              <span className='w-full max-w-[125px] dark:text-input_text'>TripAdvisor :</span>
              {isFetching ? (
                <Skeleton className='max-w-[320px] h-6 dark:bg-input_bg' />
              ) : (
                <a className='dark:text-[#00C2FF] border-b border-[#00C2FF]' href={data.data.trip_advisor} target='_new'>
                  {data.data.trip_advisor}
                </a>
              )}
            </li>
          </ul>
        </div>
      </ScrollArea>
    </div>
  );
}
