
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form } from '../components/ui/form';
import { Separator } from '../components/ui/separator';
import { SENDNOTIFYFROMREVIEW } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import InputWithLabel from '@/components/common/InputWithLabel';
import { notify as notifySchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { toFormData } from 'axios';
import Cookies from 'js-cookie';
import { ADMIN_COOKIE } from '@/lib/constant';
import ButtonLoading from '@/components/common/ButtonLoading';

const UserNotification = ({ data: modalData, setData }) => {
  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);
  const { privateAxios } = useAxios();



  const defaultValues = useMemo(() => ({
    title: '',
    message: ''
  }), [])
  const notifyForm = useForm({
    defaultValues,
    resolver: zodResolver(notifySchema),
  });

  const onClose = () => {
    setData({
      data: null,
      open: false
    })
  };

  const sendNotify = async (values) => {
    try {

      const data = await privateAxios({
        url: SENDNOTIFYFROMREVIEW,
        data: values
      })
      toast.success(data.ResponseMsg)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }
  const onSubmit1 = values => {
    sendNotify({
      ...values,
      admin_id,
      user_id: modalData.data?.user_id
    })


  };

  return (
    <Dialog open={modalData.open} onOpenChange={onClose}>

      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-2xl max-h-[90vh] main-notify-dialog overflow-auto p-0 pb-5 gap-0 rounded-2xl '>
        <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
          <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
            Notification
          </DialogTitle>
          <Separator className='dark:bg-[#34363A]' />
        </DialogHeader>

        <Form {...notifyForm}>
          <form noValidate className='px-5 mt-5' onSubmit={notifyForm.handleSubmit(onSubmit1)} action="">
            <div className='space-y-4'>
              {/* <div>
                <div className='flex justify-between items-center'>
                  <p className='text-white text-xl'>Notification Detail</p>
                </div>
              </div> */}
              <InputWithLabel label='Notification Title' name='title' placeholder='Enter title' />
              <InputWithLabel
                label='Notification Message'
                name='message'
                placeholder='Enter message'
                textarea
                inputStyle='h-[100px] resize-none'
              />
              <div className='flex flex-col gap-x-4'>
                <Separator className='dark:bg-[#34363A]' />
                <div className='py-4 flex items-center gap-x-4'>
                  <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                  <Button
                    type='submit'
                    className='w-full py-3 rounded-[10px] text-xl'

                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>

          </form>
        </Form>
      </DialogContent>

    </Dialog>
  );
};

export default UserNotification;
