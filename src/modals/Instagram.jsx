import useAxios from '@/axios/useAxios'
import InputWithLabel from '@/components/common/InputWithLabel'
import Loader from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { UPDATE_USER_DETAILS } from '@/lib/endpoint'
import { instagramSchema } from '@/lib/schema'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const Instagram = ({ data, setData, refetch }) => {
    const { privateAxios } = useAxios();
    const defaultValues = useMemo(() => (
        {
            instagram_username: ''
        }
    ), [])
    const instagramForm = useForm({
        defaultValues,
        resolver: yupResolver(instagramSchema)
    })
    const handleClose = () => {
        setData({
            open: false,
            data: null
        })
        reset(defaultValues)

    }
    useEffect(() => {
        if (!data.data) return;
        instagramForm.reset({
            instagram_username: data.data.instagram_username
        })
    }, [data.open])

    const { mutate: mutate, isPending: isPending } = useMutation({
        mutationKey: [UPDATE_USER_DETAILS],
        mutationFn: data => privateAxios({ url: UPDATE_USER_DETAILS, data }),
        onSettled: res => {
            if (res.ResponseCode === 1) {
                refetch();
                handleClose()
                toast.success(res.ResponseMsg);
            }
        }
    });

    const onSubmit = (values) => {
        mutate({
            user_id:data.data?.user_id,
            instagram_username:values.instagram_username
        })
    }
    return (
        <>
            {(isPending && data.open) && <Loader />}

            <Dialog open={data.open} onOpenChange={handleClose}>
                <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className=' max-w-lg p-0 pb-3 px-5  gap-0 rounded-2xl overflow-hidden'>
                    <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
                        <DialogTitle className='mb-4 text-xl text-center dark:text-white'>
                            Edit Instagram Username
                        </DialogTitle>
                        <Separator className='dark:bg-[#34363A]' />
                    </DialogHeader>
                    <div>
                        <Form {...instagramForm}>
                            <form className='space-y-7' onSubmit={instagramForm.handleSubmit(onSubmit)}>
                                <div className=''>
                                    <InputWithLabel label='Instagram Username' name='instagram_username' placeholder='Enter username' />
                                </div>
                                <div className='py-4 flex items-center gap-x-4'>
                                    <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                                    <Button
                                        type='submit'
                                        disabled={!Object.keys(instagramForm.formState.dirtyFields).length}
                                        className='w-full py-3 rounded-[10px] text-xl'
                                    >
                                        Update
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default Instagram
