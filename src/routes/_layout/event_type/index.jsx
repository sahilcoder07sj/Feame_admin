import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { DELETEEVENTTYPE, GETEVENTTYPE } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useState } from 'react';
import Table from '../../../components/common/DataTable';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { DIALOG_MODE } from '../../../lib/constant';
import Delete from '../../../modals/Delete';
import EventTypeModal from '../../../modals/EventType';
import { toast } from 'react-toastify';


export const Route = createFileRoute('/_layout/faqs copy/')({
  component: EventType,
  validateSearch: search => dataFilterSchema.parse(search)
});

function EventType() {
  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
 
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const [eventTypeModal, setEventTypeModal] = useState({ open: false, data: null, mode: null });

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETEVENTTYPE, page, limit, debouncedSearchQuery],
    queryFn: () => privateAxios({ url: GETEVENTTYPE, data: { page, limit, search: debouncedSearchQuery } })
  });

  const { mutate, isPending } = useMutation({
    mutationKey: [DELETEEVENTTYPE],
    mutationFn: data => privateAxios({ url: DELETEEVENTTYPE, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        setEventTypeModal({ open: false, mode: null, data: null });
        toast.success(res.ResponseMsg);
      }
    }
  });

  const columns = [
    {
      name: 'Event Type',
      selector: row => row.type
    },

    {
      name: 'Action',
      selector: row => (
        <div className='space-x-1'>

          <Button
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => navigate({ search: { page, limit, search, mode: DIALOG_MODE.edit, event_type_id: Number(row.event_type_id) } })}>
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
            onClick={() => setEventTypeModal({ open: true, data: row, mode: DIALOG_MODE.delete })}>
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
      button: true
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

          Add Event Type
        </Button>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching || isPending} />
      </div>

      <EventTypeModal />
      <Delete
        open={eventTypeModal.mode === DIALOG_MODE.delete && eventTypeModal.open}
        title='Delete'
        message='Are you sure you want to delete this event type?'
        footer={{ confirm: 'Yes', close: 'Cancel' }}
        onClose={() => setEventTypeModal({ open: false, mode: null, data: null })}
        onConfirm={() => mutate({ event_type_id: eventTypeModal.data.event_type_id })}
      />
    </>
  );
}
