import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { USERPROFILESTATUS } from '@/lib/constant';
import { FLAG_USER, GETLOCATIONLIST, GETREVIEWLIST, GETUSERSLIST, REVIEW_DONE, UPDATEUSERSTATUS } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Flag, RotateCcw, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Table from '../../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useState } from 'react';
import ReviewModal from '@/modals/Review'
import RemoveUser from '@/modals/RemoveUser';
import ReviewNotification from '@/modals/ReviewNotification';
import { removeAtSymbol } from '@/lib/helper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Filter from '@/components/common/Filter';
import { Icon } from '@iconify/react';

export const Route = createFileRoute('/_layout/review/')({
  component: Review,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Review() {
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState("")
  const [order, setOrder] = useState('')
  const [reviewModal, setReviewModal] = useState({
    open: false,
    data: null
  })
  const [deleteReviewModal, setDeleteReviewModal] = useState({
    open: false,
    data: null
  })
  const [notificationModal, setNotificationModal] = useState({
    open: false,
    data: null
  })
  const [loading, setLoading] = useState(false)
  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETREVIEWLIST, page, limit, debouncedSearchQuery, order, statusFilter, locationFilter],
    queryFn: () => privateAxios({
      url: GETREVIEWLIST, data: {
        page, limit, search: debouncedSearchQuery,
        ...(order && {
          order_by_event_date: order
        }),
        ...(statusFilter && {
          review_status: statusFilter
        }),
        ...(locationFilter && {
          location: locationFilter
        })
      }
    }),

  });

  const { mutate, isPending } = useMutation({
    mutationKey: [REVIEW_DONE],
    mutationFn: data => privateAxios({ url: REVIEW_DONE, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        toast.success(res.ResponseMsg);
      }
    }
  });

  const { data: eventLocation, isFetching: isFetching1 } = useQuery({
    queryKey: [GETLOCATIONLIST],
    queryFn: () => privateAxios({ url: GETLOCATIONLIST }),
    select: res => {

      return res.data.map(item => ({
        label: item,
        value: item
      }));
    },
    placeholderData: { data: [] }
  });

  const flagUser = async (values) => {
    try {
      setLoading(true)
      const data = await privateAxios({
        url: FLAG_USER,
        data: values
      })
      toast.success(data.ResponseMsg)
      setLoading(false)
      refetch();
    } catch (error) {
      setLoading(false)
    }
  }

  const flagUserHandler = (id) => {
    flagUser({
      user_id: id,
      flagged: 'Yes'
    })
  }

  const columns = [
    {
      name: 'Event Name',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          <Avatar className="cursor-pointer rounded-lg size-10">
            <AvatarImage src={row?.event_dtl?.event_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {row?.event_dtl?.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <p className='text-base dark:text-[#F5F5F5] font-medium truncate'>
            {row.event_dtl.name}
          </p>
        </div>
      )
    },
    {
      name: 'Date',
      selector: row => row?.event_dtl?.event_date
    },
    {
      name: 'Users',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          <Avatar className="cursor-pointer relative rounded-lg size-10">
            {row?.user_dtl?.is_flagged == "Yes" && <div className='bg-red-500 absolute rounded-full  right-0 size-3'>

            </div>}
            <AvatarImage src={row?.user_dtl?.single_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {row?.user_dtl?.fname?.slice(0, 1)} {row?.user_dtl?.lname?.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <p className='text-base dark:text-[#F5F5F5] font-medium truncate'>
            {row?.user_dtl?.fname} {row?.user_dtl?.lname}
          </p>
        </div>
      )
    },
    {
      name: 'Instagram',
      selector: row => (
        <p><a href={`https://www.instagram.com/${removeAtSymbol(row?.user_dtl?.instagram_username)}`} className='text-wrap underline' target='_blank'>{row?.user_dtl?.instagram_username}</a></p>
      )
    },
    // {
    //   name: 'Phone',
    //   selector: row => (
    //     <p className='text-wrap'>+{row.user_dtl?.ccode} {row.user_dtl?.phone}</p>
    //   )
    // },
    {
      name: 'status',
      selector: row => (
        <p>
          {row?.is_review_done == "1" ? "Submit" : "Pending"}
        </p>
      )
    },
    {
      name: 'Action',
      selector: row => (
        <div className='flex gap-3 flex-nowrap'>
          <button onClick={() => mutate({
            accept_event_id: row.accept_event_id
          })} disabled={row?.is_read == "1"} type='button' >
            <Icon className={cn('  text-xl', row?.is_read == "0" ? 'text-[#888888]' : 'text-[#34BF78]')} icon="teenyicons:tick-circle-solid" />
          </button>
          <Button
            disabled={row.is_review_done == '0'}
            className='p-1 dark:bg-transparent group: dark:hover:bg-transparent'
            onClick={() => {
              if (row.is_review_done == '1') {
                setReviewModal({
                  open: true,
                  data: row
                })
              }
            }}>
            <svg className='stroke-[#888888]' width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.0004 14.5109C9.06271 14.5109 7.48958 12.9378 7.48958 11.0001C7.48958 9.06235 9.06271 7.48922 11.0004 7.48922C12.9381 7.48922 14.5113 9.06235 14.5113 11.0001C14.5113 12.9378 12.9381 14.5109 11.0004 14.5109ZM11.0004 7.94755C9.31729 7.94755 7.94792 9.31692 7.94792 11.0001C7.94792 12.6832 9.31729 14.0526 11.0004 14.0526C12.6835 14.0526 14.0529 12.6832 14.0529 11.0001C14.0529 9.31692 12.6835 7.94755 11.0004 7.94755Z" stroke-width="0.916667" />
              <path d="M2.449 13.5033L2.44835 13.5023C2.02022 12.8359 1.79232 11.9324 1.79232 11.0035C1.79232 10.0748 2.02008 9.16869 2.44874 8.49715C4.63129 5.09433 7.75427 3.19002 11.0002 3.19002C14.2463 3.19002 17.3691 5.09447 19.5423 8.49675L19.543 8.49775C19.9711 9.16417 20.199 10.0676 20.199 10.9966C20.199 11.9254 19.9711 12.8318 19.5423 13.5034C17.3691 16.9056 14.2463 18.81 11.0002 18.81C7.74474 18.81 4.62204 16.9054 2.449 13.5033ZM11.0002 3.64836C7.84391 3.64836 4.88147 5.54314 2.8407 8.74571C2.43722 9.37543 2.25294 10.2037 2.25294 11C2.25294 11.7961 2.43712 12.6242 2.84036 13.2538C4.88114 16.4567 7.84374 18.3517 11.0002 18.3517C14.1566 18.3517 17.119 16.4569 19.1598 13.2543C19.5632 12.6246 19.7475 11.7963 19.7475 11C19.7475 10.204 19.5633 9.3759 19.1601 8.74623C17.1193 5.54335 14.1567 3.64836 11.0002 3.64836Z" stroke-width="0.916667" />
            </svg>

          </Button>
          <Button
            //disabled={row.is_review_done == '1'}
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => {
              // if (row.is_review_done == '0') {
              setDeleteReviewModal({
                open: true,
                data: row
              })
              // }
            }}>
            <Trash2 size={21} color='#888888' />

          </Button>
          <Button
            onClick={() => setNotificationModal({
              open: true,
              data: row
            })}
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.0185 18.8193C8.88271 18.8193 6.74687 18.4801 4.72104 17.8018C3.95104 17.5359 3.36437 16.9951 3.10771 16.2893C2.84187 15.5834 2.93354 14.8043 3.35521 14.1076L4.40937 12.3568C4.62937 11.9901 4.83104 11.2568 4.83104 10.8259V8.17676C4.83104 4.76676 7.60854 1.98926 11.0185 1.98926C14.4285 1.98926 17.206 4.76676 17.206 8.17676V10.8259C17.206 11.2476 17.4077 11.9901 17.6277 12.3659L18.6727 14.1076C19.0669 14.7676 19.1402 15.5651 18.8744 16.2893C18.6085 17.0134 18.031 17.5634 17.3069 17.8018C15.2902 18.4801 13.1544 18.8193 11.0185 18.8193ZM11.0185 3.36426C8.36937 3.36426 6.20604 5.51843 6.20604 8.17676V10.8259C6.20604 11.4951 5.93104 12.4851 5.59187 13.0626L4.53771 14.8134C4.33604 15.1526 4.28104 15.5101 4.40021 15.8126C4.51021 16.1243 4.78521 16.3626 5.16104 16.4909C8.96375 17.7742 13.0825 17.7742 16.8852 16.4909C17.2152 16.3809 17.4719 16.1334 17.591 15.8034C17.7102 15.4734 17.6827 15.1159 17.4994 14.8134L16.4452 13.0626C16.0969 12.4668 15.831 11.4859 15.831 10.8168V8.17676C15.831 5.51843 13.6769 3.36426 11.0185 3.36426Z" fill="#888888" />
              <path d="M12.7236 3.61154C12.6594 3.61154 12.5952 3.60238 12.5311 3.58404C12.2652 3.51071 12.0086 3.45571 11.7611 3.41904C10.9819 3.31821 10.2302 3.37321 9.52439 3.58404C9.26772 3.66654 8.99272 3.58404 8.81855 3.39154C8.64439 3.19904 8.58939 2.92404 8.69022 2.67654C9.06605 1.71404 9.98272 1.08154 11.0277 1.08154C12.0727 1.08154 12.9894 1.70488 13.3652 2.67654C13.4569 2.92404 13.4111 3.19904 13.2369 3.39154C13.0994 3.53821 12.9069 3.61154 12.7236 3.61154ZM11.0186 20.909C10.1111 20.909 9.23105 20.5424 8.58939 19.9007C7.94772 19.259 7.58105 18.379 7.58105 17.4715H8.95605C8.95605 18.0124 9.17605 18.544 9.56105 18.929C9.94605 19.314 10.4777 19.534 11.0186 19.534C12.1552 19.534 13.0811 18.6082 13.0811 17.4715H14.4561C14.4561 19.369 12.9161 20.909 11.0186 20.909Z" fill="#888888" />
            </svg>

          </Button>
          <Button onClick={() => flagUserHandler(row.user_dtl.user_id)} className='p-1 dark:bg-transparent dark:hover:bg-transparent'>
            <Flag className='stroke-[#888888] size-5' />
          </Button>
        </div>
      ),
      center: 'true',
      allowOverflow: true
    }
  ];
  const sortingOption = [
    {
      label: 'Latest',
      value: 'desc'
    },
    {
      label: 'Oldest',
      value: 'asc'
    }
  ]
  const option = [
    {
      label: 'Submit',
      value: 'Submit'
    },
    {
      label: 'Pending',
      value: 'Pending'
    }
  ]
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
        <div>
          <Popover>
            <PopoverTrigger><Button className="!bg-transparent">
              <SlidersHorizontal color='#888888' />
            </Button></PopoverTrigger>
            <PopoverContent align="start" side="left" className="dark:bg-[#26282c] px-2 pt-2 pb-4">
              <div className='flex flex-col gap-0'>
                <div className='flex-1 p-2 space-y-2'>
                  <p className='text-white'>Status</p>
                  <Filter placeholder="Select Status" value={statusFilter} setValue={setStatusFilter} option={option} />
                </div>
                <div className='flex-1 p-2 space-y-2'>
                  <p className='text-white'>Event Date Order by</p>
                  <Filter placeholder="Select Order" value={order} setValue={setOrder} option={sortingOption} />
                </div>
                <div className='flex-1 p-2 space-y-2'>
                  <p className='text-white'>Location</p>
                  <Filter placeholder="Select Location" value={locationFilter} setValue={setLocationFilter} option={eventLocation} />
                </div>
                <Button className='flex gap-2 mt-2 items-center mx-2' onClick={() => { setStatusFilter(''); setOrder(''); setLocationFilter('') }} type='button'><span className='text-lg'>Reset</span><RotateCcw size={18} color='black' /></Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching} />
      </div>
      <ReviewModal data={reviewModal} setData={setReviewModal} />
      <RemoveUser refetch={refetch} data={deleteReviewModal} setData={setDeleteReviewModal} />
      <ReviewNotification data={notificationModal} setData={setNotificationModal} />
    </>
  );
}
