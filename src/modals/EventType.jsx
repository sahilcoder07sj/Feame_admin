import useAxios from '@/axios/useAxios';
import {  ADDEVENTTYPE,  GETEVENTTYPE,   GETSINGLEEVENTTYPE,  UPDATEEVENTTYPE,  } from '@/lib/endpoint';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import axios, { toFormData } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import InputWithLabel from '../components/common/InputWithLabel';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form, FormLabel } from '../components/ui/form';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { ADMIN_COOKIE, DIALOG_MODE } from '../lib/constant';
import { eventType as eventTypeSchema } from '../lib/schema';
import Cookies from 'js-cookie';

const EventType = () => {
  const defaultValues = {
    type:''
  };

  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);

  const queryClient = useQueryClient();
  const { privateAxios } = useAxios();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const isOpen = useMemo(() => search.mode === DIALOG_MODE.add || search.mode === DIALOG_MODE.edit, [search.mode]);



  const eventTypeForm = useForm({
    resolver: zodResolver(eventTypeSchema),
    defaultValues
  });



  const { data, isFetching } = useQuery({
    queryKey: [GETSINGLEEVENTTYPE, search.event_type_id],
    queryFn: () => privateAxios({ url: GETSINGLEEVENTTYPE, data: { event_type_id: search.event_type_id } }),
    select: res => {
      const parsedData = eventTypeSchema.parse(res.data);
      return parsedData;
    },
    enabled: typeof search.event_type_id === 'number',
    placeholderData: { data: [] }
  });

  useEffect(() => {
    if (!isOpen || !data || isFetching || !search.event_type_id) return;
    eventTypeForm.reset(data);
   

  }, [isOpen, isFetching]);





  const { mutate, isPending } = useMutation({
    mutationKey: [search.mode === DIALOG_MODE.add ? ADDEVENTTYPE : UPDATEEVENTTYPE],
    mutationFn: values => privateAxios({ url: search.mode === DIALOG_MODE.add ? ADDEVENTTYPE : UPDATEEVENTTYPE, data: toFormData(values) }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        queryClient.invalidateQueries({ queryKey: [GETEVENTTYPE] });
        toast.success(res.ResponseMsg);
        onClose();
      } else {
        toast.error(res.ResponseMsg);
      }
    }
  });

  const onClose = () => {
    const closeModal = { ...search };
    delete closeModal.mode;
    delete closeModal.event_type_id;
    navigate({ search: closeModal });
    eventTypeForm.reset(defaultValues);
  };

  const onSubmit = values => {
    mutate({ ...values, ...(search.mode === DIALOG_MODE.add ? {} : { event_type_id: search.event_type_id }), admin_id });
  };

  // const onError = error => {
  //   if (error.city && eventTypeForm.getValues('city') === null) {
  //     const lat = eventTypeForm.getValues('lat');
  //     const lng = eventTypeForm.getValues('lng');

  //     queryClient
  //       .fetchQuery({
  //         queryKey: [lat, lng],
  //         queryFn: async () => {
  //           const { data } = await axios.get(
  //             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}`
  //           );
  //           return data;
  //         }
  //       })
  //       .then(res => {
  //         for (let i = 0; i < res.results.length; i++) {
  //           const cityName = res.results[i].address_components.find(address => address.types.includes('administrative_area_level_3'));
  //           if (cityName) {
  //             eventTypeForm.setValue('city', cityName.long_name, { shouldDirty: true, shouldValidate: true });
  //             break;
  //           } else {
  //             eventTypeForm.setValue('city', 'Not Found', { shouldDirty: true, shouldValidate: true });
  //           }
  //         }
  //       });
  //   }
  // };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className=' max-w-2xl p-0 pb-5 px-1 gap-0 rounded-2xl overflow-hidden'>
        <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
          <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
            {search.mode === DIALOG_MODE.add && 'Add'}
            {search.mode === DIALOG_MODE.edit && 'Update'}
            &nbsp; Event Type
          </DialogTitle>
          <Separator className='dark:bg-[#34363A]' />
        </DialogHeader>
        <Form {...eventTypeForm}>
          <form noValidate onSubmit={eventTypeForm.handleSubmit(onSubmit)} className='h-full pt-0 flex flex-col gap-y-4 overflow-hidden'>
            <ScrollArea className='h-full px-5'>
              <div className='p-1 space-y-6'>

                <InputWithLabel label='Type' name='type' placeholder='Enter type' />
              



              </div>
            </ScrollArea>
            <div className='px-6 flex flex-col gap-x-4'>
              <Separator className='dark:bg-[#34363A]' />
              <div className='py-4 flex items-center gap-x-4'>
                <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                <Button
                  type='submit'
                  className='w-full py-3 rounded-[10px] text-xl'
                >
                  {search.mode === DIALOG_MODE.add ? 'Add' : 'Update'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventType
