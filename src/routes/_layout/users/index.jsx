import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { USERPROFILESTATUS } from '@/lib/constant';
import { GETUSERSLIST, UPDATE_USER_DETAILS, UPDATEUSERSTATUS } from '@/lib/endpoint';
import { dataFilterSchema, instagramSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Flag, Pencil, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Table from '../../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button, buttonVariants } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Route as AcceptedRoute } from './accepted';
import { Route as FlagedRoute } from './flaged';
import { useState } from 'react';
import ProfileModal from '@/modals/Profile';
import Loader from '@/components/common/Loader';
import { yupResolver } from '@hookform/resolvers/yup';
import { removeAtSymbol } from '@/lib/helper';
import Select from '@/components/common/Select';
import { useForm } from 'react-hook-form';
import Instagram from '@/modals/Instagram';

export const Route = createFileRoute('/_layout/users/')({
  component: User,
  validateSearch: search => dataFilterSchema.parse(search)
});

function User() {

  const [profileModal, setProfileModal] = useState({
    open: false,
    data: null
  })
  const followerOptions = [
    {
      value: 'less_than_10k',
      label: 'Less than 10k'
    },
    {
      value: '10k_25k',
      label: '10k-25k'
    },
    {
      value: '25k_100k',
      label: '25k-100k'
    },
    {
      value: '100k_plus',
      label: 'More than 100k'
    }
  ]

  const describeOptions = [
    {
      value: 'influencer',
      label: 'Influencer'
    },
    {
      value: 'model',
      label: 'Model'
    },
    {
      value: 'creator',
      label: 'Creator'
    },
    {
      value: 'food creator',
      label: 'Food Creator'
    },
    {
      value: 'other',
      label: 'Other'
    }
  ]
  
  const [instaModal, setInstaModal] = useState({
    open: false,
    data: null
  })

  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const navigate = Route.useNavigate();
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [GETUSERSLIST, USERPROFILESTATUS.pending, page, limit, debouncedSearchQuery],
    queryFn: () => privateAxios({ url: GETUSERSLIST, data: { account_status: USERPROFILESTATUS.pending, page, limit, search: debouncedSearchQuery } })
  });

  const { mutate, isPending } = useMutation({
    mutationKey: [UPDATEUSERSTATUS],
    mutationFn: data => privateAxios({ url: UPDATEUSERSTATUS, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        toast.success(res.ResponseMsg);
      }
    }
  });
  const { mutate: mutate1, isPending: isPending1 } = useMutation({
    mutationKey: [UPDATE_USER_DETAILS],
    mutationFn: data => privateAxios({ url: UPDATE_USER_DETAILS, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        toast.success(res.ResponseMsg);
      }
    }
  });

  const onChnageFollower = (data) => {
    mutate1({
      user_id: data.user_id,
      account_with: data.value
    })
  }
  const onChnageDescribe = (data) => {
    mutate1({
      user_id: data.user_id,
      describe_yourself: data.value
    })
  }
  const columns = [
    {
      name: 'Action',
      selector: row => (
        <div className='space-x-4'>
          <Button
            disable={isPending}
            className='py-1 rounded-[20px] text-base dark:bg-[#51AE46]/10 dark:text-[#51AE46]'
            onClick={() => mutate({ user_id: row.user_id, account_status: USERPROFILESTATUS.approve })}>
            Accept
          </Button>
          <Button
            disable={isPending}
            className='py-1 rounded-[20px] text-base dark:bg-[#DE3A3B]/10 dark:text-[#DE3A3B]'
            onClick={() => mutate({ user_id: row.user_id, account_status: USERPROFILESTATUS.reject })}>
            Reject
          </Button>
        </div>
      ),
      center: 'true',
      allowOverflow: true
    },
    {
      name: 'Users',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          <Avatar className="cursor-pointer rounded-lg size-10" onClick={() => setProfileModal({
            open: true,
            data: row.profile_images
          })} >
            <AvatarImage src={row.single_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {row.fname.slice(0, 1)} {row.lname.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <p className='text-base text-wrap dark:text-[#F5F5F5] font-medium truncate'>
            {row.fname} {row.lname}
          </p>
        </div>
      )
    },

    {
      name: 'Phone Number',
      selector: row => `+${row.ccode} ${row.phone}`
    },
    {
      name: 'Instagram',
      selector: row =>
        <div className='flex items-center gap-2'>
          <p className='flex-1'><a href={`https://www.instagram.com/${removeAtSymbol(row.instagram_username)}`} className='text-wrap underline' target='_blank'>{row.instagram_username}</a></p>
          <button onClick={() => setInstaModal({
            open:true,
            data:row
          })}><Pencil size={18} color='white' /></button>
        </div>
    },
    {
      name: 'TikTok',
      selector: row => <p className='text-wrap'><a target='_blank' className='text-wrap text-white underline' href={`https://www.tiktok.com/@${row.youtube_username}`}>{row.youtube_username}</a> </p>
    },
    {
      name: 'Follower',
      selector: row => <div><Select value={row?.account_with} id={row.user_id} option={followerOptions} setValue={onChnageFollower} /></div>
    },
    // /<p className='text-wrap'><span target='_blank' className='text-wrap text-white capitalize' >{row?.account_with.replace(/_/g, ' ')}</span> </p>
    {
      name: 'Self Describe',
      selector: row => <div><Select value={row?.describe_yourself} id={row.user_id} option={describeOptions} setValue={onChnageDescribe} /></div>
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
      {(isPending || isPending1) && <Loader />}
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
        <div className='flex gap-x-4 items-center'>

          <Link search={{
            page:1,
            limit:50
          }} to={AcceptedRoute.to} className={cn(buttonVariants(), 'py-3 rounded-[10px] gap-x-2 font-medium text-lg')}>
            <svg className='size-6' viewBox='0 0 24 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M10.3021 22.2981L10.3002 22.297L4.36209 18.8681C4.3617 18.8678 4.36131 18.8676 4.36092 18.8674C3.31332 18.2557 2.66016 17.1295 2.66016 15.92V9.07999C2.66016 7.87035 3.31344 6.74401 4.3612 6.1324C4.3615 6.13222 4.36179 6.13205 4.36209 6.13188L10.3002 2.703L10.3021 2.70188C11.3458 2.09307 12.644 2.09202 13.6998 2.70279L13.7001 2.70299L19.6382 6.13188C19.6385 6.13203 19.6388 6.13219 19.639 6.13235C20.6868 6.74395 21.3402 7.87032 21.3402 9.07999V15.92C21.3402 17.1295 20.687 18.2558 19.6393 18.8674C19.639 18.8676 19.6386 18.8679 19.6382 18.8681L13.7001 22.297L13.6982 22.2981C13.1791 22.6009 12.5868 22.75 12.0002 22.75C11.4135 22.75 10.8212 22.6009 10.3021 22.2981ZM10.5534 3.13514L10.5533 3.13513L10.5501 3.13699L4.61013 6.56698L4.60895 6.56766C3.71638 7.08632 3.16016 8.04019 3.16016 9.07999V15.92C3.16016 16.9486 3.71537 17.913 4.60895 18.4323L4.61013 18.433L10.5489 21.8623C10.5492 21.8624 10.5495 21.8626 10.5498 21.8628C11.4446 22.3823 12.5555 22.3824 13.4503 21.8629C13.4507 21.8627 13.451 21.8625 13.4514 21.8623L19.3902 18.433L19.3914 18.4323C20.2839 17.9136 20.8402 16.9598 20.8402 15.92V9.07999C20.8402 8.05134 20.2849 7.0869 19.3914 6.56766L19.3902 6.56698L13.4502 3.13699L13.4502 3.13698L13.447 3.13514C13.0025 2.88289 12.4976 2.74998 12.0002 2.74998C11.5027 2.74998 10.9978 2.88289 10.5534 3.13514Z'
                fill='black'
                stroke='black'
              />
              <path
                d='M11.9999 11.7501C10.5761 11.7501 9.41992 10.5939 9.41992 9.17004C9.41992 7.7462 10.5761 6.59009 11.9999 6.59009C13.4238 6.59009 14.5799 7.7462 14.5799 9.17004C14.5799 10.5939 13.4238 11.7501 11.9999 11.7501ZM11.9999 7.09009C10.8538 7.09009 9.91992 8.02388 9.91992 9.17004C9.91992 10.3162 10.8538 11.2501 11.9999 11.2501C13.1461 11.2501 14.0799 10.3162 14.0799 9.17004C14.0799 8.02388 13.146 7.09009 11.9999 7.09009Z'
                fill='black'
                stroke='black'
              />
              <path
                d='M16 17.4101C15.8661 17.4101 15.75 17.294 15.75 17.1601C15.75 16.2827 15.285 15.5198 14.602 14.992C13.9191 14.4643 12.9971 14.1501 12 14.1501C11.0029 14.1501 10.0809 14.4643 9.39801 14.992C8.71504 15.5198 8.25 16.2827 8.25 17.1601C8.25 17.294 8.13386 17.4101 8 17.4101C7.86614 17.4101 7.75 17.294 7.75 17.1601C7.75 15.3021 9.57358 13.6501 12 13.6501C14.4264 13.6501 16.25 15.3021 16.25 17.1601C16.25 17.294 16.1339 17.4101 16 17.4101Z'
                fill='black'
                stroke='black'
              />
            </svg>
            Accepted Users
          </Link>
          <Link to={FlagedRoute.to} className={cn(buttonVariants(), 'py-3 items-center rounded-[10px] gap-x-2 font-medium text-lg')}>
            <Flag className='w-5' />
            Flagged Users
          </Link>
        </div>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching} />
      </div>
      <ProfileModal data={profileModal} setData={setProfileModal} />
      <Instagram data={instaModal} refetch={refetch} setData={setInstaModal}/>
    </>
  );
}
