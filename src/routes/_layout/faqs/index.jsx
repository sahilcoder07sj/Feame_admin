import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { DELETEEVENTLIST, DELETEFAQ, GETEVENTLIST, GETFAQLIST } from '@/lib/endpoint';
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
import FaqModal from '../../../modals/Faq';
import { toast } from 'react-toastify';


export const Route = createFileRoute('/_layout/faqs/')({
  component: Faq,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Faq() {
  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const [faqModal, setfaqModal] = useState({ open: false, data: null, mode: null });

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETFAQLIST, page, limit, debouncedSearchQuery],
    queryFn: () => privateAxios({ url: GETFAQLIST, data: { page, limit, search: debouncedSearchQuery } })
  });

  const { mutate, isPending } = useMutation({
    mutationKey: [DELETEFAQ],
    mutationFn: data => privateAxios({ url: DELETEFAQ, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        setfaqModal({ open: false, mode: null, data: null });
        toast.success(res.ResponseMsg);
      }
    }
  });

  const columns = [
    {
      name: 'FAQ',
      selector: row => row.title
    },
    {
      name: 'Desciption',
      selector: row => (
        <div>
          <p>{row.description.slice(0, 50)} {row.description?.length > 50 && '...'}</p>
        </div>
      )
    },
    {
      name: 'Action',
      selector: row => (
        <div className='space-x-1'>

          <Button
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => navigate({ search: { page, limit, search, mode: DIALOG_MODE.edit, faq_id: Number(row.faq_id) } })}>
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
            onClick={() => setfaqModal({ open: true, data: row, mode: DIALOG_MODE.delete })}>
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

          <svg className='size-6' width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6824 16.0041C11.0942 16.0041 10.618 16.4943 10.618 17.0825C10.618 17.6567 11.0802 18.1609 11.6824 18.1609C12.2846 18.1609 12.7608 17.6567 12.7608 17.0825C12.7608 16.4943 12.2706 16.0041 11.6824 16.0041ZM11.8645 7.83911C9.97377 7.83911 9.10547 8.95949 9.10547 9.71577C9.10547 10.262 9.5676 10.5141 9.94576 10.5141C10.702 10.5141 10.3939 9.43569 11.8224 9.43569C12.5227 9.43569 13.0829 9.74382 13.0829 10.388C13.0829 11.1444 12.2986 11.5785 11.8364 11.9706C11.4303 12.3207 10.8981 12.895 10.8981 14.0994C10.8981 14.8277 11.0941 15.0377 11.6684 15.0377C12.3546 15.0377 12.4947 14.7297 12.4947 14.4636C12.4947 13.7353 12.5087 13.3151 13.279 12.7129C13.6571 12.4188 14.8475 11.4665 14.8475 10.15C14.8475 8.83349 13.6571 7.83911 11.8645 7.83911Z" fill="black" />
            <path d="M11.9986 2.21423C6.31398 2.21423 1.71289 6.81456 1.71289 12.4999V21.9821C1.71289 22.4259 2.07265 22.7857 2.51646 22.7857H11.9986C17.6832 22.7857 22.2843 18.1853 22.2843 12.4999C22.2843 6.81532 17.684 2.21423 11.9986 2.21423ZM11.9986 21.1785H3.32003V12.4999C3.32003 7.70355 7.20156 3.82138 11.9986 3.82138C16.795 3.82138 20.6772 7.70291 20.6772 12.4999C20.6772 17.2963 16.7956 21.1785 11.9986 21.1785Z" fill="black" />
          </svg>

          Add FAQ
        </Button>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching || isPending} />
      </div>

      <FaqModal />
      <Delete
        open={faqModal.mode === DIALOG_MODE.delete && faqModal.open}
        title='Delete'
        message='Are you sure you want to delete this faq?'
        footer={{ confirm: 'Yes', close: 'Cancel' }}
        onClose={() => setfaqModal({ open: false, mode: null, data: null })}
        onConfirm={() => mutate({ faq_id: faqModal.data.faq_id })}
      />
    </>
  );
}
