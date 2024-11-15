import { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DUPLICATE_EVENT, REMOVEUSERFROMREVIEW } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dateSchema } from '@/lib/schema';
import DatePicker from '@/components/common/DatePicker';
import { Form } from '@/components/ui/form';
import Loader from '@/components/common/Loader';
import { toast } from 'react-toastify';
import { convertLocalTimeToUTC, convertUTCToLocalTime } from '@/lib/helper';

const DuplicateEvent = ({ data, setData, refetch }) => {
  const [loading, setLoading] = useState(false)
  const { privateAxios } = useAxios()
  const defaultValues = useMemo(() => ({
    event_date: ''
  }), [])

  const duplicateEvent = async (values) => {
    try {
      setLoading(true)
      const data = await privateAxios({
        url: REMOVEUSERFROMREVIEW,
        data: values
      })
      setLoading(false)
      toast.success(data.ResponseMsg)
      onClose()
      refetch();
    } catch (error) {
      toast.error(data.response.data.ResponseMsg)
      setLoading(false)

    }
  }
  const removeUserHandler = () => {
    duplicateEvent({
      user_id: data?.data?.user_id
    })
  }
  const { mutate, isPending } = useMutation({
    mutationKey: [DUPLICATE_EVENT],
    mutationFn: data => privateAxios({ url: DUPLICATE_EVENT, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        onClose()
        toast.success(res.ResponseMsg);
      }
    }
  });

  const eventForm = useForm({
    resolver: zodResolver(dateSchema),
    defaultValues
  });
  const onSubmit = (values) => {
    const { start_time, utc_start_date, utc_end_date, end_time } = data.data;
    const { localDate, localTime } = convertUTCToLocalTime(start_time, utc_start_date,data.data?.event_timezone)
    const { utcDate, utcTime } = convertLocalTimeToUTC(localTime, values.event_date,data.data?.event_timezone)
    if (end_time) {
      const { localDate: elocalDate, localTime: elocalTime } = convertUTCToLocalTime(end_time, utc_end_date,data.data?.event_timezone)
      const { utcDate: eutcDate, utcTime: eutcTime } = convertLocalTimeToUTC(elocalTime, values.event_date,data.data?.event_timezone)
      mutate({
        event_date: values.event_date,
        start_time: utcTime,
        utc_start_date: utcDate,
        utc_end_date: eutcDate,
        end_time: eutcTime,
        event_id: data.data?.event_id
      })
    } else {
      mutate({
        event_date: values.event_date,
        start_time: utcTime,
        utc_start_date: utcDate,
        event_id: data.data?.event_id
      })
    }
    // console.log(start_time, utc_start_date, utc_end_date, end_time, data.data)

  }
  const onClose = () => {
    setData({
      open: false,
      data: null
    })
    eventForm.reset(defaultValues)

  }
  return (
    <>
      {isPending && data.open && <Loader />}
      <Dialog open={data.open} onOpenChange={onClose}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-xl p-6 pt-0 gap-0 overflow-hidden rounded-2xl'>
          <Form {...eventForm}>
            <form onSubmit={eventForm.handleSubmit(onSubmit)}>
              <DialogHeader className='my-6 gap-y-1 text-center'>
                <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>Duplicate Event</DialogTitle>
              </DialogHeader>


              <div className='pb-10'>
                <DatePicker
                  name='event_date'
                  label='Date'
                  placeholder='Select Date'
                  suffix={
                    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M8 2V5' stroke='#F5F5F5' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M16 2V5' stroke='#F5F5F5' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M3.5 9.08997H20.5' stroke='#F5F5F5' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
                      <path
                        d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
                        stroke='#F5F5F5'
                        strokeWidth='1.5'
                        strokeMiterlimit='10'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path d='M15.6947 13.7H15.7037' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M15.6947 16.7H15.7037' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M11.9955 13.7H12.0045' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M11.9955 16.7H12.0045' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M8.29431 13.7H8.30329' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                      <path d='M8.29431 16.7H8.30329' stroke='#F5F5F5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  }
                />
              </div>


              <DialogFooter className='xs:mt-4 gap-y-4 md:gap-x-4'>
                <DialogClose type='button' className='w-full py-3 rounded-[10px] text-xl dark:text-text_main dark:bg-input_bg' onClick={onClose}>
                  Cancel
                </DialogClose>
                <Button type='submit' className='w-full py-3 rounded-[10px] text-xl font-semibold' >
                  Yes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DuplicateEvent;
