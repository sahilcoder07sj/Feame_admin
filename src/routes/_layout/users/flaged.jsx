import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { USERPROFILESTATUS } from '@/lib/constant';
import { FLAG_USER, GETUSERSLIST } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Flag, FlagOff, Search, Send } from 'lucide-react';
import Table from '../../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import DeleteUser from '@/modals/DeleteUser';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import UserNotification from '@/modals/UserNotification';
import { Icon } from '@iconify/react';
import AllUserNotification from '@/modals/AllUserNotification';
import { cn } from '@/lib/utils';
import { removeAtSymbol } from '@/lib/helper';

export const Route = createFileRoute('/_layout/users/flaged')({
  component: Flaged,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Flaged() {
  const [allUserIds, setAllUserIds] = useState([])
  const [allSelected, setAllSelected] = useState(false)
  const [notificationModal, setNotificationModal] = useState({
    open: false,
    data: null
  })
  const [allUsernotificationModal, setAllUserNotificationModal] = useState({
    open: false,
    data: null
  })
  const [loading, setLoading] = useState(false)

  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const [deleteUserModal, setDeleteUserModal] = useState({
    open: false,
    data: null
  })
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETUSERSLIST, USERPROFILESTATUS.flag, page, limit, debouncedSearchQuery],
    queryFn: () => privateAxios({ url: GETUSERSLIST, data: { account_status: USERPROFILESTATUS.flag, page, limit, search: debouncedSearchQuery } })
  });

  useEffect(() => {
    if (data?.data?.length) {
      setAllUserIds(data.data.map((item) => item.user_id))
    }
  }, [data?.data?.length])



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
      flagged: 'No'
    })
  }


  const columns = [
    {
      name: 'Action',
      selector: row => (
        <div className='space-x-1 gap-x-2  flex justify-center'>

          <Button
            className='p-1 dark:bg-transparent dark:hover:bg-transparent'
            onClick={() => setDeleteUserModal({ open: true, data: row })}
          >
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
          <Button onClick={() => flagUserHandler(row.user_id)} className='p-1 dark:bg-transparent dark:hover:bg-transparent'>
            <FlagOff className='stroke-[#888888] size-5' />
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
        </div>
      ),
      // button: true
    },
    {
      name: 'Users',
      selector: row => (
        <div className='flex items-center gap-x-4'>

          <Avatar className='rounded-lg relative size-10'>
            {row.is_flagged == "Yes" && <div className='bg-red-500 absolute rounded-full  right-0 size-3'>

            </div>}
            <AvatarImage src={row.single_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {row.fname.slice(0, 1)} {row.lname.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <p className='text-base dark:text-[#F5F5F5] font-medium truncate'>
            {row.fname} {row.lname}
          </p>
        </div>
      )
    },
   
    {
      name: 'Instagram',
      selector: row =>
        <p><a href={`https://www.instagram.com/${removeAtSymbol(row.instagram_username)}`} className='text-wrap underline' target='_blank'>{row.instagram_username}</a></p>

    },
    {
      name: 'TikTok',
      selector: row => <p className='text-wrap'><a target='_blank' className='text-wrap text-white underline' href={`https://www.tiktok.com/`}>{row.youtube_username}</a> </p>
    },
    {
      name: 'Follower',
      selector: row => <p className='text-wrap'><span target='_blank' className='text-wrap text-white capitalize' >{row?.account_with.replace(/_/g, ' ')}</span> </p>
    },
    {
      name: 'Self Describe',
      selector: row => <p className='text-wrap'><span target='_blank' className='text-wrap text-white capitalize'>{row?.describe_yourself}</span> </p>
    },
    {
      name: 'Phone Number',
      selector: row => `+${row.ccode} ${row.phone}`
    },
    {
      name: 'Nationality',
      selector: row => row.nationality
    },
    {
      name: 'City',
      selector: row => <p className='whitespace-normal px-2'>{row.city_of_residence}</p>
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
        <div className='flex items-center gap-x-5'>
        
          <Button onClick={() => {
           
           setAllUserNotificationModal({
             open: true,
             data: allUserIds
           })
         
       }} className={cn(buttonVariants(), 'py-3 items-center rounded-[10px] gap-x-2 font-medium text-lg')}>
         <Send className='w-5' />
         Send to All
       </Button>
        </div>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching} />
      </div>
      <DeleteUser refetch={refetch} data={deleteUserModal} setData={setDeleteUserModal} />
      <UserNotification data={notificationModal} setData={setNotificationModal} />
      <AllUserNotification data={allUsernotificationModal} setData={setAllUserNotificationModal} />
    </>
  );
}
