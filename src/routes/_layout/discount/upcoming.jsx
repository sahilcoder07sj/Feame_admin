import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { DELETEDISCOUNTLIST, GETDISCOUNTLIST } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Clock, Info, Search } from 'lucide-react';
import { useState } from 'react';
import Table from '../../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button, buttonVariants } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { DIALOG_MODE, EVENTCATEGORY } from '../../../lib/constant';
import Delete from '../../../modals/Delete';

import { toast } from 'react-toastify';

import { Route as DiscountDetails } from './$discount_id';
import { Route as LiveEvent } from './index';
import Notification from '@/modals/Notification';
import EventUserModal from '@/modals/EventUser';
import UpcomingEvent from '@/modals/UpcomingEvent';


export const Route = createFileRoute('/_layout/discount/upcoming')({
  component: Discount,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Discount() {
  const [notification, setNotification] = useState({
    open: false,
    data: null
  })
  const [eventUserModal, setEventUserModal] = useState({
    open: false,
    data: null
  })
  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const [eventModal, setEventModal] = useState({ open: false, data: null, mode: null });

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETDISCOUNTLIST, page, limit, EVENTCATEGORY.UPCOMING,debouncedSearchQuery],
    queryFn: () => privateAxios({ url: GETDISCOUNTLIST, data: { page, limit, search: debouncedSearchQuery, type: EVENTCATEGORY.UPCOMING } })
  });

  const { mutate, isPending } = useMutation({
    mutationKey: [DELETEDISCOUNTLIST],
    mutationFn: data => privateAxios({ url: DELETEDISCOUNTLIST, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        setEventModal({ open: false, mode: null, data: null });
        toast.success(res.ResponseMsg);
      }
    }
  });

  const columns = [
    {
      name: 'Users',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          <Avatar className='rounded-lg size-10'>
            <AvatarImage src={row.event_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>{row.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <p className='text-base dark:text-[#F5F5F5] font-medium truncate'>{row.name}</p>
        </div>
      )
    },
    {
      name: 'Subtitle',
      selector: row => row.subtitle
    },
 
    {
      name: 'Action',
      selector: row => (
        <div className='space-x-1  flex justify-end'>
          {/* <Button onClick={() => setNotification({
            open: true,
            data: row
          })} className='p-1 dark:bg-transparent dark:hover:bg-transparent'>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.0185 18.8193C8.88271 18.8193 6.74687 18.4801 4.72104 17.8018C3.95104 17.5359 3.36437 16.9951 3.10771 16.2893C2.84187 15.5834 2.93354 14.8043 3.35521 14.1076L4.40937 12.3568C4.62937 11.9901 4.83104 11.2568 4.83104 10.8259V8.17676C4.83104 4.76676 7.60854 1.98926 11.0185 1.98926C14.4285 1.98926 17.206 4.76676 17.206 8.17676V10.8259C17.206 11.2476 17.4077 11.9901 17.6277 12.3659L18.6727 14.1076C19.0669 14.7676 19.1402 15.5651 18.8744 16.2893C18.6085 17.0134 18.031 17.5634 17.3069 17.8018C15.2902 18.4801 13.1544 18.8193 11.0185 18.8193ZM11.0185 3.36426C8.36937 3.36426 6.20604 5.51843 6.20604 8.17676V10.8259C6.20604 11.4951 5.93104 12.4851 5.59187 13.0626L4.53771 14.8134C4.33604 15.1526 4.28104 15.5101 4.40021 15.8126C4.51021 16.1243 4.78521 16.3626 5.16104 16.4909C8.96375 17.7742 13.0825 17.7742 16.8852 16.4909C17.2152 16.3809 17.4719 16.1334 17.591 15.8034C17.7102 15.4734 17.6827 15.1159 17.4994 14.8134L16.4452 13.0626C16.0969 12.4668 15.831 11.4859 15.831 10.8168V8.17676C15.831 5.51843 13.6769 3.36426 11.0185 3.36426Z" fill="#888888" />
              <path d="M12.7236 3.61154C12.6594 3.61154 12.5952 3.60238 12.5311 3.58404C12.2652 3.51071 12.0086 3.45571 11.7611 3.41904C10.9819 3.31821 10.2302 3.37321 9.52439 3.58404C9.26772 3.66654 8.99272 3.58404 8.81855 3.39154C8.64439 3.19904 8.58939 2.92404 8.69022 2.67654C9.06605 1.71404 9.98272 1.08154 11.0277 1.08154C12.0727 1.08154 12.9894 1.70488 13.3652 2.67654C13.4569 2.92404 13.4111 3.19904 13.2369 3.39154C13.0994 3.53821 12.9069 3.61154 12.7236 3.61154ZM11.0186 20.909C10.1111 20.909 9.23105 20.5424 8.58939 19.9007C7.94772 19.259 7.58105 18.379 7.58105 17.4715H8.95605C8.95605 18.0124 9.17605 18.544 9.56105 18.929C9.94605 19.314 10.4777 19.534 11.0186 19.534C12.1552 19.534 13.0811 18.6082 13.0811 17.4715H14.4561C14.4561 19.369 12.9161 20.909 11.0186 20.909Z" fill="#888888" />
            </svg>

          </Button> */}
          {/* <Link
            to={EventDetails.to}
            params={{ event_id: row.event_id }}
            search={{ name: row.name }}
            className={cn(buttonVariants(), 'p-1 dark:bg-transparent dark:hover:bg-transparent')}>
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M10.9999 14.5109C9.06223 14.5109 7.4891 12.9378 7.4891 11.0001C7.4891 9.06235 9.06223 7.48922 10.9999 7.48922C12.9376 7.48922 14.5108 9.06235 14.5108 11.0001C14.5108 12.9378 12.9376 14.5109 10.9999 14.5109ZM10.9999 7.94755C9.3168 7.94755 7.94743 9.31692 7.94743 11.0001C7.94743 12.6832 9.3168 14.0526 10.9999 14.0526C12.6831 14.0526 14.0524 12.6832 14.0524 11.0001C14.0524 9.31692 12.6831 7.94755 10.9999 7.94755Z'
                fill='#888888'
                stroke='#888888'
                strokeWidth='0.916667'
              />
              <path
                d='M2.449 13.5033L2.44835 13.5023C2.02022 12.8359 1.79232 11.9324 1.79232 11.0035C1.79232 10.0748 2.02008 9.16869 2.44874 8.49715C4.63129 5.09433 7.75427 3.19002 11.0002 3.19002C14.2463 3.19002 17.3691 5.09447 19.5423 8.49675L19.543 8.49775C19.9711 9.16417 20.199 10.0676 20.199 10.9966C20.199 11.9254 19.9711 12.8318 19.5423 13.5034C17.3691 16.9056 14.2463 18.81 11.0002 18.81C7.74474 18.81 4.62204 16.9054 2.449 13.5033ZM11.0002 3.64836C7.84391 3.64836 4.88147 5.54314 2.8407 8.74571C2.43722 9.37543 2.25294 10.2037 2.25294 11C2.25294 11.7961 2.43712 12.6242 2.84036 13.2538C4.88114 16.4567 7.84374 18.3517 11.0002 18.3517C14.1566 18.3517 17.119 16.4569 19.1598 13.2543C19.5632 12.6246 19.7475 11.7963 19.7475 11C19.7475 10.204 19.5633 9.3759 19.1601 8.74623C17.1193 5.54335 14.1567 3.64836 11.0002 3.64836Z'
                fill='#888888'
                stroke='#888888'
                strokeWidth='0.916667'
              />
            </svg>
          </Link> */}

          <Button
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => navigate({ search: { page, limit, search, mode: DIALOG_MODE.edit, event_id: Number(row.event_id) } })}>
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M12.3856 3.4888C13.3693 2.50361 14.9648 2.50301 15.9493 3.48745L18.2335 5.77165C19.2095 6.7477 19.2197 8.32782 18.2562 9.31632L9.7925 18.0001C9.14577 18.6637 8.25875 19.0379 7.33251 19.0378L4.80971 19.0377C3.63707 19.0377 2.70059 18.0601 2.74991 16.8876L2.85822 14.3127C2.89442 13.4519 3.25218 12.6361 3.8607 12.0267L12.3856 3.4888ZM14.9777 4.46046C14.5303 4.01298 13.805 4.01326 13.3579 4.46107L11.8334 5.98788L15.7565 9.91102L17.2723 8.35587C17.7102 7.90655 17.7056 7.18832 17.2619 6.74466L14.9777 4.46046ZM4.83297 12.9989L10.8619 6.96088L14.7968 10.8958L8.80857 17.0397C8.42053 17.4378 7.88831 17.6623 7.33257 17.6623L4.80977 17.6622C4.41889 17.6622 4.10673 17.3363 4.12317 16.9455L4.23148 14.3706C4.2532 13.8541 4.46786 13.3646 4.83297 12.9989ZM18.8047 18.9705C19.1842 18.9705 19.4919 18.6626 19.4919 18.2828C19.4919 17.9029 19.1842 17.595 18.8047 17.595H13.1931C12.8136 17.595 12.5059 17.9029 12.5059 18.2828C12.5059 18.6626 12.8136 18.9705 13.1931 18.9705H18.8047Z'
                fill='#888888'
              />
            </svg>
          </Button>
          <Button
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => setEventModal({ open: true, data: row, mode: DIALOG_MODE.delete })}>
            <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M4.62975 8.00633C3.85525 6.97366 4.59208 5.5 5.88291 5.5H16.1171C17.4079 5.5 18.1448 6.97366 17.3703 8.00633V8.00633C16.8054 8.75952 16.5 9.6756 16.5 10.6171V16.5C16.5 18.525 14.8584 20.1667 12.8333 20.1667H9.16667C7.14162 20.1667 5.5 18.525 5.5 16.5V10.6171C5.5 9.6756 5.19464 8.75952 4.62975 8.00633V8.00633Z'
                stroke='#888888'
                strokeWidth='1.375'
              />
              <path d='M12.8335 15.5834L12.8335 10.0834' stroke='#888888' strokeWidth='1.375' strokeLinecap='round' strokeLinejoin='round' />
              <path d='M9.1665 15.5834L9.1665 10.0834' stroke='#888888' strokeWidth='1.375' strokeLinecap='round' strokeLinejoin='round' />
              <path
                d='M14.6668 5.5L14.168 4.00358C13.9185 3.25496 13.2179 2.75 12.4288 2.75H9.57155C8.78243 2.75 8.08184 3.25495 7.8323 4.00358L7.3335 5.5'
                stroke='#888888'
                strokeWidth='1.375'
                strokeLinecap='round'
              />
            </svg>
          </Button>
        </div>
      ),
      // button: true
    }
  ];

  return (
    <>
      <div className='py-4 px-6 flex justify-between items-center gap-x-4'>
        <div className='w-full max-w-[460px] relative'>
          <Search className='size-6 mx-4 absolute top-[48%] -translate-y-1/2 dark:text-input_text text-xl' />
          <Input
            type='text'
            className='w-full p-4 ps-12 border-none dark:bg-[#141414] rounded-xl dark:text-input_text text-base font-normal dark:placeholder:text-input_text placeholder:text-base placeholder:font-normal'
            placeholder='Search'
            value={search ?? ''}
            onChange={e => navigate({ search: { ...(e.target.value ? { page, limit, q: e.target.value } : { page, limit }) }, replace: true })}
          />
        </div>
        <div className='flex items-center gap-4'>
          <Link to={LiveEvent.to} className={cn(buttonVariants(), 'py-3 rounded-[10px] gap-x-2 font-medium text-lg')}>
            <Clock size={22} />
            Live Event
          </Link>
          <Button
            className='py-3 rounded-[10px] gap-x-2 font-medium text-lg'
            onClick={() => navigate({ search: { page, limit, search, mode: DIALOG_MODE.add } })}>
            <svg className='size-6' viewBox='0 0 24 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M7 2.25C7.19891 2.25 7.38968 2.32902 7.53033 2.46967C7.67098 2.61032 7.75 2.80109 7.75 3V3.763C8.412 3.75 9.141 3.75 9.944 3.75H14.056C14.859 3.75 15.588 3.75 16.25 3.763V3C16.25 2.80109 16.329 2.61032 16.4697 2.46967C16.6103 2.32902 16.8011 2.25 17 2.25C17.1989 2.25 17.3897 2.32902 17.5303 2.46967C17.671 2.61032 17.75 2.80109 17.75 3V3.827C18.01 3.847 18.256 3.872 18.489 3.903C19.661 4.061 20.61 4.393 21.359 5.141C22.107 5.89 22.439 6.839 22.597 8.011C22.647 8.386 22.681 8.795 22.704 9.241C22.7586 9.38851 22.7653 9.54949 22.723 9.701C22.75 10.502 22.75 11.413 22.75 12.444V14.556C22.75 16.394 22.75 17.85 22.597 18.989C22.439 20.161 22.107 21.11 21.359 21.859C20.61 22.607 19.661 22.939 18.489 23.097C17.349 23.25 15.894 23.25 14.056 23.25H9.944C8.106 23.25 6.65 23.25 5.511 23.097C4.339 22.939 3.39 22.607 2.641 21.859C1.893 21.11 1.561 20.161 1.403 18.989C1.25 17.849 1.25 16.394 1.25 14.556V12.444C1.25 11.413 1.25 10.502 1.277 9.7C1.23527 9.54836 1.24227 9.38744 1.297 9.24C1.319 8.795 1.353 8.386 1.403 8.011C1.561 6.839 1.893 5.89 2.641 5.141C3.39 4.393 4.339 4.061 5.511 3.903C5.744 3.872 5.991 3.847 6.25 3.827V3C6.25 2.80109 6.32902 2.61032 6.46967 2.46967C6.61032 2.32902 6.80109 2.25 7 2.25ZM2.763 10.25C2.75 10.903 2.75 11.646 2.75 12.5V14.5C2.75 16.407 2.752 17.761 2.89 18.79C3.025 19.795 3.279 20.375 3.702 20.798C4.125 21.221 4.705 21.475 5.711 21.61C6.739 21.748 8.093 21.75 10 21.75H14C15.907 21.75 17.261 21.748 18.29 21.61C19.295 21.475 19.875 21.221 20.298 20.798C20.721 20.375 20.975 19.795 21.11 18.789C21.248 17.761 21.25 16.407 21.25 14.5V12.5C21.25 11.646 21.25 10.903 21.237 10.25H2.763ZM21.168 8.75H2.832C2.848 8.56 2.867 8.381 2.89 8.21C3.025 7.205 3.279 6.625 3.702 6.202C4.125 5.779 4.705 5.525 5.711 5.39C6.739 5.252 8.093 5.25 10 5.25H14C15.907 5.25 17.262 5.252 18.29 5.39C19.295 5.525 19.875 5.779 20.298 6.202C20.721 6.625 20.975 7.205 21.11 8.211C21.133 8.381 21.152 8.561 21.168 8.75ZM16 13.75C16.1989 13.75 16.3897 13.829 16.5303 13.9697C16.671 14.1103 16.75 14.3011 16.75 14.5V15.75H18C18.1989 15.75 18.3897 15.829 18.5303 15.9697C18.671 16.1103 18.75 16.3011 18.75 16.5C18.75 16.6989 18.671 16.8897 18.5303 17.0303C18.3897 17.171 18.1989 17.25 18 17.25H16.75V18.5C16.75 18.6989 16.671 18.8897 16.5303 19.0303C16.3897 19.171 16.1989 19.25 16 19.25C15.8011 19.25 15.6103 19.171 15.4697 19.0303C15.329 18.8897 15.25 18.6989 15.25 18.5V17.25H14C13.8011 17.25 13.6103 17.171 13.4697 17.0303C13.329 16.8897 13.25 16.6989 13.25 16.5C13.25 16.3011 13.329 16.1103 13.4697 15.9697C13.6103 15.829 13.8011 15.75 14 15.75H15.25V14.5C15.25 14.3011 15.329 14.1103 15.4697 13.9697C15.6103 13.829 15.8011 13.75 16 13.75Z'
                fill='black'
              />
            </svg>
            Add Event
          </Button>
        </div>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching || isPending} />
      </div>
      <Notification data={notification} setData={setNotification} />
      <UpcomingEvent />
      <EventUserModal data={eventUserModal} setData={setEventUserModal} />
      <Delete
        open={eventModal.mode === DIALOG_MODE.delete && eventModal.open}
        title='Delete'
        message='Are you sure you want to delete this event?'
        footer={{ confirm: 'Yes', close: 'Cancel' }}
        onClose={() => setEventModal({ open: false, mode: null, data: null })}
        onConfirm={() => mutate({ event_id: eventModal.data.event_id })}
      />
    </>
  );
}
