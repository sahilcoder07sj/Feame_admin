import useAxios from '@/axios/useAxios'
import InputWithLabel from '@/components/common/InputWithLabel'
import Loader from '@/components/common/Loader'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { ADMIN_COOKIE } from '@/lib/constant'
import { ADD_UPDATE_SCROREBOARDIMAGE_LATEST, UPDATE_USER_DETAILS } from '@/lib/endpoint'
import { instagramSchema, scoreboardImageSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toFormData } from 'axios'
import Cookies from 'js-cookie'
import { Edit } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const ScoreboardImage = ({ data, setData,refetch , location }) => {

    const { privateAxios } = useAxios();
    const admin = Cookies.get(ADMIN_COOKIE);
    const { admin_id } = JSON.parse(admin);
    const defaultValues = useMemo(() => (
        {
            link: '',
            image: ''
        }
    ), [])
    const scoreboardForm = useForm({
        defaultValues,
        resolver: yupResolver(scoreboardImageSchema)
    })
    const handleClose = () => {
        setData({
            open: false,
            data: null
        })
        scoreboardForm.reset(defaultValues)

    }
    useEffect(() => {
        if (!data.data) return;
        scoreboardForm.reset({
            link: data.data?.link,
            image:data.data?.image
        })
    }, [data.open])

    const { mutate: mutate, isPending: isPending } = useMutation({
        mutationKey: [ADD_UPDATE_SCROREBOARDIMAGE_LATEST],
        mutationFn: data => privateAxios({ url: ADD_UPDATE_SCROREBOARDIMAGE_LATEST, data }),
        onSettled: res => {
            if (res.ResponseCode === 1) {
                
                refetch()
                toast.success(res.ResponseMsg);
                handleClose()
            }
        }
    });

    const imageWatch = scoreboardForm.watch('image')

    const onSubmit = (values) => {
        mutate(toFormData({
            admin_id:admin_id,
            link: values.link,
            location: location,
            ...(data.data?.scoreboard_image_id && {
                scoreboard_image_id: data.data.scoreboard_image_id
            }),
            image:imageWatch
        }))
    }
    return (
        <>
            {(isPending && data.open) && <Loader />}

            <Dialog open={data.open} onOpenChange={handleClose}>
                <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className=' max-w-lg p-0 pb-3 px-5  gap-0 rounded-2xl overflow-hidden'>
                    <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
                        <DialogTitle className='mb-4 text-xl text-center dark:text-white'>
                            Edit Scoreboard Image
                        </DialogTitle>
                        <Separator className='dark:bg-[#34363A]' />
                    </DialogHeader>
                    <div>
                        <Form {...scoreboardForm}>
                            <form className='space-y-7' onSubmit={scoreboardForm.handleSubmit(onSubmit)}>
                                <div>
                                    <div
                                        className='size-[120px] p-2 flex justify-center items-center rounded-full border-2 border-dashed border-[#2A2A2A] dark:bg-input_bg relative'>
                                      
                                        {imageWatch ? typeof imageWatch === "object" ? <img className='w-full h-full object-cover rounded-full' src={URL.createObjectURL(imageWatch)} /> : <img className='w-full h-full object-cover rounded-full' src={imageWatch} /> : <></>}
                                        <input
                                            id={`scoreboardImg`}
                                            type='file'
                                            className='hidden'
                                            onChange={e => {
                                                scoreboardForm.setValue('image', e.target.files[0])
                                            }
                                            }
                                        />
                                        <label
                                            htmlFor='scoreboardImg'
                                            className={cn(buttonVariants(), 'p-1.5 rounded-full absolute top-0 right-0 cursor-pointer')}>
                                            <Edit className='size-5' />
                                        </label>
                                    </div>
                                    {scoreboardForm.formState.errors.image?.message && <span className='text-red-500 text-sm font-medium'>{scoreboardForm.formState.errors.image?.message}</span>}
                                </div>
                                <div className=''>
                                    <InputWithLabel label='Link' name='link' placeholder='Enter link' />
                                </div>
                                <div className='py-4 flex items-center gap-x-4'>
                                    <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                                    <Button
                                        type='submit'
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

export default ScoreboardImage
