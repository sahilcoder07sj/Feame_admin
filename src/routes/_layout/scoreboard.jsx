import useAxios from '@/axios/useAxios';
import useDebounce from '@/hooks/use-debounce';
import { GETLOCATIONLIST, GETSCOREBOARDLIST } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import Table from '../../components/common/DataTable';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MONTHS } from '../../lib/constant';
import FilterMonthAndYear from '../../modals/FilterMonthAndYear';
import ScroreboardModal from '../../modals/Scroreboard';
import SelectWithLabel from '@/components/common/SelectWithLabel';
import { FormProvider as Form, useForm } from 'react-hook-form';
import { formatDateTime } from '@/lib/helper';
export const Route = createFileRoute('/_layout/scoreboard')({
  component: Scoreboard,
  validateSearch: search => {
    if (search.open !== true) delete search.open;

    return dataFilterSchema.parse(search);
  }
});

function Scoreboard() {
  const { page, limit, search } = Route.useSearch({
    select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state, month: state.month, year: state.year })
  });
  const eventLocationForm = useForm({

  })
  const eventLocationValue = eventLocationForm.watch('event_location')
  const { privateAxios } = useAxios();
  const debouncedSearchQuery = useDebounce(search, 350);
  const navigate = Route.useNavigate();

  const [filterValue, setFilterValue] = useState({ month: MONTHS.find((_, index) => index === moment().month()).value, year: moment().year() });
  const [scroreboardModal, setScroreboardModal] = useState({ open: false, data: null, mode: null });

  const eventLocation = useQuery({
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

  const onSubmit = () => {

  }
  const { data, isFetching } = useQuery({
    queryKey: [GETSCOREBOARDLIST, page, limit, debouncedSearchQuery, MONTHS.find(month => filterValue.month === month.label).valueNumb, filterValue.year, eventLocationValue],
    queryFn: () =>
      privateAxios({
        url: GETSCOREBOARDLIST,
        data: { page, limit, search: debouncedSearchQuery, month: MONTHS.find(month => filterValue.month === month.label).valueNumb, year: filterValue.year, ...(eventLocationValue && { location: eventLocationValue }) }
      })
  });

  const columns = [
    {
      name: 'Users',
      selector: row => (
        <div className='flex items-center gap-x-2'>
          <Avatar className='rounded-lg size-10'>
            <AvatarImage src={row.user_dtl.single_profile} />
            <AvatarFallback className='uppercase rounded-[10px] font-semibold bg-text_main/5'>
              {`${row.user_dtl.fname.at(0)}${row.user_dtl.lname.at(0)}`}
            </AvatarFallback>
          </Avatar>
          <p className='text-base dark:text-[#F5F5F5] font-medium'>{`${row.user_dtl.fname} ${row.user_dtl.lname}`}</p>
        </div>
      )
    },

    {
      name: 'Location',
      selector: row => (
        <p className='text-base dark:text-[#F5F5F5] font-medium'>{row?.location ??  "-"}</p>
      )
    },
    {
      name: 'Create Date',
      selector: row => (
        <p className='text-base dark:text-[#F5F5F5] font-medium'>{formatDateTime(row?.created_at)}</p>
      )
    },
    {
      name: 'Link',
      selector: row => (
        <Link to={row.reels_link} target='_blank' className='dark:text-text_main underline'>
          {row.reels_link}
        </Link>
      )
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
            placeholder='Search '
            value={search ?? ''}
            onChange={e => navigate({ search: { ...(e.target.value ? { page, limit, q: e.target.value } : { page, limit }) }, replace: true })}
          />
        </div>
        <div className='flex items-center gap-x-4'>
          <Form {...eventLocationForm}>
            <form onSubmit={eventLocationForm.handleSubmit(onSubmit)}>
              <SelectWithLabel name='event_location' placeholder='Select Location' option={eventLocation.data} />
            </form>
          </Form>
          <FilterMonthAndYear filterValue={filterValue} setFilterValue={setFilterValue} />
          <Button className='py-3 rounded-[10px] gap-x-2 font-medium text-lg' onClick={() => navigate({ search: { page, limit, q: search, open: true } })}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <g clipPath='url(#clip0_2183_5275)'>
                <path
                  d='M22.5874 17.6471H16.2345V14.1176C16.2345 13.6941 15.9521 13.4118 15.5286 13.4118H8.46978C8.04625 13.4118 7.7639 13.6941 7.7639 14.1176V16.7294H1.41096C0.987431 16.7294 0.705078 17.0118 0.705078 17.4353V22.5882C0.705078 23.0118 0.987431 23.2941 1.41096 23.2941H22.5874C23.011 23.2941 23.2933 23.0118 23.2933 22.5882V18.3529C23.2933 17.9294 23.011 17.6471 22.5874 17.6471ZM2.11684 18.1412H7.7639V21.8824H2.11684V18.1412ZM9.17567 17.4353V14.8235H14.8227V21.8824H9.17567V17.4353ZM21.8815 21.8824H16.2345V19.0588H21.8815V21.8824ZM17.858 4.94117C17.7874 4.65882 17.5757 4.51764 17.2933 4.44706L14.0463 3.95294L12.6345 1.05882C12.4227 0.564703 11.5757 0.564703 11.3639 1.05882L9.95214 3.95294L6.70508 4.44706C6.42272 4.51764 6.21096 4.72941 6.14037 4.94117C6.06978 5.22353 6.14037 5.50588 6.35214 5.64706L8.68155 7.90588L8.11684 11.1529C8.04625 11.4353 8.18743 11.7176 8.3992 11.8588C8.61096 12 8.89331 12.0706 9.17567 11.9294L12.0698 10.4471L14.9639 11.9294C15.1757 12.0706 15.458 12 15.7404 11.8588C15.9521 11.7176 16.0933 11.4353 16.0227 11.1529L15.458 7.90588L17.7168 5.64706C17.858 5.50588 17.9286 5.22353 17.858 4.94117ZM14.1168 7.2C13.9757 7.34117 13.9051 7.62353 13.9051 7.83529L14.258 10.0235L12.2815 8.9647C12.211 8.89411 12.0698 8.89412 11.9286 8.89412C11.7874 8.89412 11.7168 8.89411 11.5757 8.9647L9.5992 9.95294L9.95214 7.7647C10.0227 7.55294 9.88155 7.27059 9.74037 7.12941L8.32861 5.64706L10.5168 5.3647C10.7286 5.3647 10.9404 5.15294 11.0815 5.01176L11.9992 2.9647L12.9874 4.94117C13.058 5.15294 13.2698 5.29412 13.5521 5.29412L15.6698 5.64706L14.1168 7.2Z'
                  fill='black'
                />
              </g>
              <defs>
                <clipPath id='clip0_2183_5275'>
                  <rect width='24' height='24' fill='white' />
                </clipPath>
              </defs>
            </svg>
            Scoreboard
          </Button>
        </div>
      </div>
      <div className='h-full p-6 flex flex-col dark:bg-[#0A0A0A] overflow-y-hidden'>
        <Table data={data} columns={columns} loading={isFetching} />
      </div>
      <ScroreboardModal data={scroreboardModal} setData={setScroreboardModal} />
    </>
  );
}
