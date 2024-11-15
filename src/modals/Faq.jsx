import useAxios from '@/axios/useAxios';
import { ADDEVENTLIST, ADDFAQ, GETEVENTLIST, GETFAQLIST, GETSINGLEEVENTLIST, GETSINGLEFAQ, UPDATEEVENTLIST, UPDATEFAQ } from '@/lib/endpoint';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import  { toFormData } from 'axios';
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
import { faq as faqSchema } from '../lib/schema';
import Cookies from 'js-cookie';

const Faq = () => {
  const defaultValues = {
    title: '',
    description: ''
  };

  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);

  const queryClient = useQueryClient();
  const { privateAxios } = useAxios();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const isOpen = useMemo(() => search.mode === DIALOG_MODE.add || search.mode === DIALOG_MODE.edit, [search.mode]);



  const faqForm = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues
  });



  const { data, isFetching } = useQuery({
    queryKey: [GETSINGLEFAQ, search.faq_id],
    queryFn: () => privateAxios({ url: GETSINGLEFAQ, data: { faq_id: search.faq_id } }),
    select: res => {
      const parsedData = faqSchema.parse(res.data);
      return parsedData;
    },
    enabled: typeof search.faq_id === 'number',
    placeholderData: { data: [] }
  });

  useEffect(() => {
    if (!isOpen || !data || isFetching || !search.faq_id) return;
    faqForm.reset(data);

  }, [isOpen, isFetching]);





  const { mutate, isPending } = useMutation({
    mutationKey: [search.mode === DIALOG_MODE.add ? ADDFAQ : UPDATEFAQ],
    mutationFn: values => privateAxios({ url: search.mode === DIALOG_MODE.add ? ADDFAQ : UPDATEFAQ, data: toFormData(values) }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        queryClient.invalidateQueries({ queryKey: [GETFAQLIST] });
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
    delete closeModal.faq_id;
    navigate({ search: closeModal });
    faqForm.reset(defaultValues);
  };

  const onSubmit = values => {
    mutate({ ...values, ...(search.mode === DIALOG_MODE.add ? {} : { faq_id: search.faq_id }), admin_id });
  };

  // const onError = error => {
  //   if (error.city && faqForm.getValues('city') === null) {
  //     const lat = faqForm.getValues('lat');
  //     const lng = faqForm.getValues('lng');

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
  //             faqForm.setValue('city', cityName.long_name, { shouldDirty: true, shouldValidate: true });
  //             break;
  //           } else {
  //             faqForm.setValue('city', 'Not Found', { shouldDirty: true, shouldValidate: true });
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
            &nbsp; Faq
          </DialogTitle>
          <Separator className='dark:bg-[#34363A]' />
        </DialogHeader>
        <Form {...faqForm}>
          <form noValidate onSubmit={faqForm.handleSubmit(onSubmit)} className='h-full pt-0 flex flex-col gap-y-4 overflow-hidden'>
            <ScrollArea className='h-full px-5'>
              <div className='p-1 space-y-6'>

                <InputWithLabel label='Title' name='title' placeholder='Enter Title' />
                <InputWithLabel
                  label='Description'
                  name='description'
                  placeholder='Enter Description'
                  textarea
                  inputStyle='h-[100px] resize-none'
                />



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

export default Faq;
