import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { USERPROFILESTATUS } from '@/lib/constant';
import { GETUSERSLIST, REFERLIST, UPDATEUSERSTATUS } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Flag, Info, Search } from 'lucide-react';
import Table from '../../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Input } from '../../../components/ui/input';
import { useState } from 'react';

import Referal from '@/modals/Referal';


export const Route = createFileRoute('/_layout/refer/')({
  component: Refer,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Refer() {
  const [referModal, setReferModal] = useState({
    open: false,
    data: null
  })
  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [REFERLIST, USERPROFILESTATUS.pending, page, limit, debouncedSearchQuery],
    queryFn: () => privateAxios({ url: REFERLIST, data: { account_status: USERPROFILESTATUS.pending, page, limit, search: debouncedSearchQuery } })
  });


  const columns = [

    {
      name: 'Name',
      selector: row => `${row.fname} ${row.lname}`
    },
    {
      name: 'Email',
      selector: row =>
        <p className='text-wrap'>{row.email}</p>

    },
    {
      name: 'Phone',
      selector: row =>
        <p className='text-wrap'>{row.phone}</p>

    },
    {
      name: 'Buisness Name',
      selector: row => <p className='text-wrap text-white'> {row.name_of_business} </p>
    },
    {
      name: 'Buisness Type',
      selector: row => <p className='text-wrap text-white'> {row.type_of_business} </p>
    },
    {
      name: 'Relationship',
      selector: row => <p className='text-wrap text-white'> {row.relationship} </p>
    },


    {
      name: 'Refer By',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          {row.user_dtl ? <> <Avatar className="rounded-lg size-10" >
            <AvatarImage src={row.user_dtl?.single_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {row.user_dtl?.fname?.slice(0, 1)} {row.user_dtl?.lname?.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
            <p className='text-base text-wrap dark:text-[#F5F5F5] font-medium truncate'>
              {row.user_dtl?.fname} {row.user_dtl?.lname}
            </p>
          </> : "-"}
        </div>
      )
    },
    {
      name: 'Action',
      selector: row => (
        <div className='space-x-4'>
          <Info className='cursor-pointer' onClick={()=>setReferModal({
            open:true,
            data:row
          })}/>
        </div>
      ),
      center: 'true',
      allowOverflow: true
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

      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching} />
      </div>
      <Referal data={referModal} setData={setReferModal} />
    </>
  );
}
