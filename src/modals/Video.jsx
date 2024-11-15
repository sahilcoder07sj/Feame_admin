import useAxios from '@/axios/useAxios';
import { ADDVIDEO, GETSIGLEVIDEOLIST, GETVIDEOLIST, UPDATEVIDEO } from '@/lib/endpoint';
import { cn, getObjLength, getVideoCover, secondsToMMSS } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toFormData } from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputWithLabel from '../components/common/InputWithLabel';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form, FormLabel } from '../components/ui/form';
import { Separator } from '../components/ui/separator';
import { ADMIN_COOKIE, DIALOG_MODE } from '../lib/constant';
import { video as videoSchema } from '../lib/schema';

const Video = () => {
  const defaultValues = { video: '', thumbnail: '', name: '', time: '', description: '' };

  const queryClient = useQueryClient();

  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);

  const { privateAxios } = useAxios();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const isOpen = useMemo(() => search.mode === DIALOG_MODE.add || search.mode === DIALOG_MODE.edit, [search.mode]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef();

  const videoForm = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues
  });

  const { data, isFetching } = useQuery({
    queryKey: [GETSIGLEVIDEOLIST, search.video_id],
    queryFn: () => privateAxios({ url: GETSIGLEVIDEOLIST, data: { video_id: search.video_id } }),
    select: res => {
      const parsedData = videoSchema.parse(res.data);
      return parsedData;
    },
    enabled: typeof search.video_id === 'number',
    placeholderData: { data: [] }
  });

  useEffect(() => {
    if (!isOpen || !data || isFetching || !search.video_id) return;
    videoForm.reset(data);
    setSelectedVideo(data.video);
  }, [isOpen, isFetching]);

  const setThumbnail = async () => {
    const image = await getVideoCover(selectedVideo);
    const time = secondsToMMSS(videoRef.current.duration);

    videoForm.setValue(
      'thumbnail',
      new File([image], 'thumbnail.jpeg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      }),
      { shouldDirty: true, shouldValidate: true }
    );

    if (time) videoForm.setValue('time', time, { shouldDirty: true, shouldValidate: true });
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: { 'video/mp4': [] },
    onDrop: acceptedFiles => {
      videoForm.setValue('video', acceptedFiles[0], { shouldDirty: true, shouldValidate: true });
      setSelectedVideo(acceptedFiles[0]);
    }
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: [search.mode === DIALOG_MODE.add ? ADDVIDEO : UPDATEVIDEO],
    mutationFn: values => privateAxios({ url: search.mode === DIALOG_MODE.add ? ADDVIDEO : UPDATEVIDEO, data: toFormData(values) })
  });

  useEffect(() => {
    if (!selectedVideo || (!videoRef.current && !(selectedVideo instanceof File))) return;
    setThumbnail(videoRef.current);
  }, [videoRef.current, selectedVideo]);

  const onClose = () => {
    const closeModal = { ...search };
    delete closeModal.mode;
    delete closeModal.video_id;
    navigate({ search: closeModal });
    setSelectedVideo(null);
    videoForm.reset(defaultValues);
  };

  const onSubmit = values => {
    if (!(values.video instanceof File)) {
      delete values.video;
      delete values.time;
    }
    if (!(values.thumbnail instanceof File)) delete values.thumbnail;

    toast.promise(mutateAsync({ ...values, ...(search.mode === DIALOG_MODE.add ? {} : { video_id: search.video_id }), admin_id }), {
      pending: 'Uploading video, please wait...',
      success: {
        render({ data }) {
          queryClient.invalidateQueries({ queryKey: [GETVIDEOLIST] });
          toast.success();
          onClose();
          return data.ResponseMsg;
        }
      },
      error: {
        render({ data }) {
          return data.ResponseMsg;
        }
      }
    });
  };

  const onError = error => {
    toast.error(Object.values(error)[0].message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden'>
        <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
          <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
            {search.mode === DIALOG_MODE.add && 'Add'}
            {search.mode === DIALOG_MODE.edit && 'Update'}
            &nbsp; Video
          </DialogTitle>
          <Separator className='dark:bg-[#34363A]' />
        </DialogHeader>
        <Form {...videoForm}>
          <form noValidate onSubmit={videoForm.handleSubmit(onSubmit, onError)} className='h-full pt-0 px-6 flex flex-col gap-y-4 overflow-hidden'>
            <div className='w-full flex flex-col gap-y-2'>
              <FormLabel htmlFor='eventprofile' className='text-lg dark:text-text_main'>
                Event Video
              </FormLabel>
              <div className='space-y-0.5'>
                <div
                  {...getRootProps()}
                  className={cn(
                    'h-[160px] flex flex-col items-center justify-center rounded-xl dark:bg-input_bg border-2 border-dashed cursor-pointer relative',
                    videoForm.formState.errors.video?.message ? 'dark:border-red-500' : selectedVideo ? 'dark:border-transparent' : 'dark:border-[#2A2A2A]'
                  )}>
                  <input id='eventprofile' {...getInputProps()} />
                  {selectedVideo && (
                    <>
                      <div className='w-full h-full absolute top-0 left-0'>
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          className='w-full h-full object-cover rounded-xl'
                          src={selectedVideo instanceof File ? URL.createObjectURL(selectedVideo) : selectedVideo}
                          alt='uploaded-profile'
                        />
                      </div>
                      <div className='w-full h-full rounded-xl absolute top-0 left-0 -z-10 dark:bg-black/60' />
                    </>
                  )}

                  <div
                    className={cn(
                      'w-full h-full rounded-xl transition-colors absolute top-0 left-0',
                      selectedVideo ? 'dark:bg-black/50' : 'dark:bg-transparent'
                    )}
                  />
                  <div className='w-max space-y-2 z-10'>
                    {selectedVideo ? (
                      <div className='w-max mx-auto p-2.5 rounded-full'>
                        <svg className='size-5 stroke-white' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M9.16699 1.66666H7.50033C3.33366 1.66666 1.66699 3.33332 1.66699 7.49999V12.5C1.66699 16.6667 3.33366 18.3333 7.50033 18.3333H12.5003C16.667 18.3333 18.3337 16.6667 18.3337 12.5V10.8333'
                            strokeWidth='1.4'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M13.3666 2.51666L6.7999 9.08333C6.5499 9.33333 6.2999 9.825 6.2499 10.1833L5.89157 12.6917C5.75823 13.6 6.3999 14.2333 7.30823 14.1083L9.81657 13.75C10.1666 13.7 10.6582 13.45 10.9166 13.2L17.4832 6.63333C18.6166 5.5 19.1499 4.18333 17.4832 2.51666C15.8166 0.849997 14.4999 1.38333 13.3666 2.51666Z'
                            strokeWidth='1.4'
                            strokeMiterlimit='10'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M12.4248 3.45833C12.9831 5.45 14.5415 7.00833 16.5415 7.575'
                            strokeWidth='1.4'
                            strokeMiterlimit='10'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      </div>
                    ) : (
                      <svg className='mx-auto' width='60' height='60' viewBox='0 0 60 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <g clipPath='url(#clip0_2169_3775)'>
                          <path
                            d='M56.3783 60H3.62168C1.62152 60 0 58.3785 0 56.3783V21.7304L1.8109 14.487C1.8109 12.4867 3.43242 12.6761 5.43258 12.6761H56.3782C58.3785 12.6761 58.1891 12.4867 58.1891 14.487L60 21.7304V56.3783C60 58.3785 58.3785 60 56.3783 60Z'
                            fill='#EAF6FF'
                          />
                          <path
                            d='M56.3785 21.7305V56.3784C56.3785 58.3786 54.757 60 52.7568 60H56.3785C58.3787 60 60.0002 58.3785 60.0002 56.3784V21.7305H56.3785Z'
                            fill='#D8ECFE'
                          />
                          <path
                            d='M56.3783 10.8651H3.62168C1.62152 10.8651 0 12.4866 0 14.4869V21.7304H60V14.4869C60 12.4866 58.3785 10.8651 56.3783 10.8651Z'
                            fill='#3D6D93'
                          />
                          <path
                            d='M56.3785 10.8652H52.7568C54.7571 10.8652 56.3785 12.4868 56.3785 14.4869V21.7304H60.0002V14.4869C60.0002 12.4868 58.3787 10.8652 56.3785 10.8652Z'
                            fill='#335E80'
                          />
                          <path
                            d='M5.68957 17.4358C6.1896 17.4358 6.59496 17.0304 6.59496 16.5304C6.59496 16.0304 6.1896 15.625 5.68957 15.625C5.18954 15.625 4.78418 16.0304 4.78418 16.5304C4.78418 17.0304 5.18954 17.4358 5.68957 17.4358Z'
                            fill='#F58A97'
                          />
                          <path
                            d='M11.1222 17.4358C11.6222 17.4358 12.0276 17.0304 12.0276 16.5304C12.0276 16.0304 11.6222 15.625 11.1222 15.625C10.6222 15.625 10.2168 16.0304 10.2168 16.5304C10.2168 17.0304 10.6222 17.4358 11.1222 17.4358Z'
                            fill='#FFE179'
                          />
                          <path
                            d='M16.5548 17.4358C17.0548 17.4358 17.4602 17.0304 17.4602 16.5304C17.4602 16.0304 17.0548 15.625 16.5548 15.625C16.0548 15.625 15.6494 16.0304 15.6494 16.5304C15.6494 17.0304 16.0548 17.4358 16.5548 17.4358Z'
                            fill='#AEE69C'
                          />
                          <path
                            d='M52.6357 54.6278V50.8853C52.6357 50.6612 52.5466 50.4463 52.3882 50.2878C52.2297 50.1293 52.0147 50.0403 51.7906 50.0403H43.5814L41.7705 55.4729H51.7906C52.0147 55.4729 52.2297 55.3838 52.3882 55.2254C52.5466 55.0669 52.6357 54.8519 52.6357 54.6278Z'
                            fill='#AEE69C'
                          />
                          <path
                            d='M51.7906 50.0403H48.1689C48.3931 50.0403 48.608 50.1293 48.7665 50.2878C48.925 50.4463 49.014 50.6612 49.014 50.8853V54.6278C49.014 54.8519 48.925 55.0669 48.7665 55.2254C48.608 55.3838 48.3931 55.4729 48.1689 55.4729H51.7906C52.0147 55.4729 52.2297 55.3838 52.3882 55.2254C52.5466 55.0669 52.6357 54.8519 52.6357 54.6278V50.8853C52.6356 50.6612 52.5466 50.4463 52.3881 50.2878C52.2297 50.1294 52.0147 50.0403 51.7906 50.0403Z'
                            fill='#89DAA4'
                          />
                          <path d='M41.7702 55.4729L43.581 50.0403H34.5267L32.7158 55.4729H41.7702Z' fill='#FFE179' />
                          <path d='M32.7165 55.4729L34.5274 50.0403H25.473L23.6621 55.4729H32.7165Z' fill='#AEE69C' />
                          <path d='M23.6617 55.4729L25.4726 50.0403H16.4183L14.6074 55.4729H23.6617Z' fill='#FFE179' />
                          <path
                            d='M14.6077 55.4729L16.4186 50.0403H8.2093C7.98518 50.0403 7.77024 50.1293 7.61176 50.2878C7.45329 50.4463 7.36426 50.6612 7.36426 50.8853V54.6278C7.36426 54.8519 7.45329 55.0669 7.61176 55.2254C7.77024 55.3838 7.98518 55.4729 8.2093 55.4729H14.6077Z'
                            fill='#AEE69C'
                          />
                          <path
                            d='M39.0216 43.2302H20.9784C19.4678 43.2302 18.2432 42.0056 18.2432 40.4949V29.8984C18.2432 28.3877 19.4678 27.1631 20.9784 27.1631H39.0216C40.5322 27.1631 41.7568 28.3877 41.7568 29.8984V40.4949C41.7568 42.0055 40.5322 43.2302 39.0216 43.2302Z'
                            fill='#F58A97'
                          />
                          <path
                            d='M39.0211 27.163H35.3994C36.9101 27.163 38.1347 28.3876 38.1347 29.8982V40.4948C38.1347 42.0055 36.9101 43.2301 35.3994 43.2301H39.0211C40.5318 43.2301 41.7564 42.0055 41.7564 40.4948V29.8982C41.7564 28.3876 40.5318 27.163 39.0211 27.163Z'
                            fill='#F07281'
                          />
                          <path
                            d='M32.7112 35.658L27.9094 38.8882C27.5404 39.1364 27.0439 38.8718 27.0439 38.4267V31.9665C27.0439 31.5214 27.5404 31.2568 27.9094 31.505L32.7112 34.7352C33.0388 34.9554 33.0388 35.4377 32.7112 35.658Z'
                            fill='white'
                          />
                          <path
                            d='M29.9998 17.9878C34.967 17.9878 38.9937 13.9611 38.9937 8.99391C38.9937 4.02671 34.967 0 29.9998 0C25.0326 0 21.0059 4.02671 21.0059 8.99391C21.0059 13.9611 25.0326 17.9878 29.9998 17.9878Z'
                            fill='#AEE69C'
                          />
                          <path
                            d='M30.0004 0C29.3801 0 28.7745 0.0628125 28.1895 0.182461C32.2887 1.02047 35.3726 4.64707 35.3726 8.99402C35.3726 13.341 32.2888 16.9676 28.1895 17.8056C28.7854 17.9272 29.3921 17.9883 30.0004 17.988C34.9676 17.988 38.9944 13.9614 38.9944 8.99414C38.9944 4.02691 34.9676 0 30.0004 0Z'
                            fill='#89DAA4'
                          />
                          <path
                            d='M33.6064 6.37083L31.238 4.00224C30.5565 3.32021 29.4433 3.3208 28.7623 4.00248L26.394 6.37083C26.31 6.45492 26.2433 6.55474 26.1978 6.6646C26.1523 6.77446 26.1289 6.89221 26.1289 7.01111C26.1289 7.13002 26.1523 7.24776 26.1979 7.35761C26.2434 7.46746 26.3101 7.56727 26.3942 7.65134C26.4783 7.73541 26.5781 7.8021 26.6879 7.84759C26.7978 7.89309 26.9155 7.9165 27.0344 7.91649C27.1534 7.91648 27.2711 7.89304 27.3809 7.84753C27.4908 7.80202 27.5906 7.73531 27.6747 7.65123L29.0949 6.23103V13.9429C29.0949 14.183 29.1903 14.4133 29.3601 14.5831C29.5298 14.7529 29.7601 14.8483 30.0003 14.8483C30.2404 14.8483 30.4707 14.7529 30.6405 14.5831C30.8103 14.4133 30.9057 14.183 30.9057 13.9429V6.23091L32.3258 7.65111C32.4098 7.73534 32.5096 7.80214 32.6195 7.84767C32.7294 7.8932 32.8472 7.91656 32.9662 7.91642C33.1452 7.91642 33.3203 7.86331 33.4692 7.76383C33.618 7.66434 33.7341 7.52294 33.8026 7.35751C33.8711 7.19207 33.8891 7.01003 33.8541 6.8344C33.8192 6.65878 33.733 6.49746 33.6064 6.37083Z'
                            fill='#161616'
                          />
                        </g>
                        <defs>
                          <clipPath id='clip0_2169_3775'>
                            <rect width='60' height='60' fill='white' />
                          </clipPath>
                        </defs>
                      </svg>
                    )}
                    <p className={selectedVideo !== '' ? 'dark:text-white' : 'dark:text-input_text'}>
                      <span className='dark:text-text_main'>Choose</span> a file or drag & drop it here
                    </p>
                  </div>
                </div>
                <p className='ml-3 md:ml-4 dark:text-red-500 text-[12px] font-semibold'>{videoForm.formState.errors.video?.message}</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-x-4'>
              <InputWithLabel label='Event Name' name='name' placeholder='Enter Event Name' />
              <InputWithLabel label='Video Time' name='time' placeholder='HH:MM' disabled />
            </div>
            <InputWithLabel label='Event Description' name='description' placeholder='Enter Event Description' textarea inputStyle='h-[100px] resize-none' />
            <div className='flex flex-col gap-x-4'>
              <Separator className='dark:bg-[#34363A]' />
              <div className='py-4 flex items-center gap-x-4'>
                <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                <Button
                  type='submit'
                  className='w-full py-3 rounded-[10px] text-xl'
                  disabled={
                    search.mode === DIALOG_MODE.add
                      ? getObjLength(videoForm.formState.dirtyFields) !== getObjLength(defaultValues) || isPending
                      : !videoForm.formState.isDirty || isPending
                  }>
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

export default Video;
