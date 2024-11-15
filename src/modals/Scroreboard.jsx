import useAxios from '@/axios/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { ADD_UPDATE_SCROREBOARDDATA, ADD_UPDATE_SCROREBOARDIMAGE, GETLOCATIONLIST, GETSCOREBOARDDATA, GETSCOREBOARDLIST, GETUSERLIST } from '@/lib/endpoint';
import { cn, getVideoCover } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toFormData } from 'axios';
import Cookies from 'js-cookie';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SelectWithLabel from '../components/common/SelectWithLabel';
import { Button, buttonVariants } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form, FormField, FormLabel } from '../components/ui/form';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { ADMIN_COOKIE, MONTHS } from '../lib/constant';
import { scoreboard, scoreboard as scoreboardSchema } from '../lib/schema';
import ComboBox from '@/components/common/ComboBox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InputWithLabel from '@/components/common/InputWithLabel';
import ScoreboardImage from './ScoreboardImage';
import { useDropzone } from 'react-dropzone';
import Loader from '@/components/common/Loader';

const Scroreboard = () => {
  const [isDeleteVideo, setIsDeleteVideo] = useState(false)
  const [scoreBoardImage, setScoreboardImage] = useState({
    open: false,
    data: null
  })
  const defaultValues = {
    month: MONTHS.find((_, index) => moment().month() === index).value,
    year: moment().year(),
    reel_of_month: '',
    tenk_plus_viral: [],
    video: '',
    thumbnail: ''
    // tenk_minus_viral: []
  };
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef();

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: { 'video/mp4': [] },
    onDrop: acceptedFiles => {
      scoreboardForm.setValue('video', acceptedFiles[0], { shouldDirty: true, shouldValidate: true });
      setSelectedVideo(acceptedFiles[0]);
    }
  });

  const queryClient = useQueryClient();
  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);

  const { privateAxios } = useAxios();
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const isOpen = useMemo(() => search.open, [search.open]);

  const scoreboardForm = useForm({
    resolver: zodResolver(scoreboardSchema),
    defaultValues
  });
  const locationWatch = scoreboardForm.watch('location')
  const scroreBoard = useQuery({
    queryKey: [GETSCOREBOARDDATA, MONTHS.find(mnth => mnth.value === scoreboardForm.watch('month')).valueNumb, scoreboardForm.watch('year'), isOpen, locationWatch],
    queryFn: () =>
      privateAxios({
        url: GETSCOREBOARDDATA,
        data: { month: MONTHS.find(mnth => mnth.value === scoreboardForm.watch('month')).valueNumb, year: scoreboardForm.watch('year'), location: locationWatch }
      }),
    enabled: !!(scoreboardForm.watch('month') && scoreboardForm.watch('year') && isOpen === true)
  });
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
  const users = useQuery({
    queryKey: [GETUSERLIST, MONTHS.find(mnth => mnth.value === scoreboardForm.watch('month')).valueNumb, scoreboardForm.watch('year')],
    queryFn: () =>
      privateAxios({
        url: GETUSERLIST,
        data: { month: MONTHS.find(mnth => mnth.value === scoreboardForm.watch('month')).valueNumb, year: scoreboardForm.watch('year') }
      }),
    select: res => res.data.map(user => ({
      value: user.user_id, label: {
        name: `${user.fname} ${user.lname}`,
        instagram_username: user.instagram_username
      }
    })),
    enabled: scoreboardForm.watch('month') && scoreboardForm.watch('year') && isOpen,
    placeholderData: { data: [] }
  });

  const scroreBoardImage = useMutation({
    mutationKey: [ADD_UPDATE_SCROREBOARDIMAGE],
    mutationFn: data => privateAxios({ url: ADD_UPDATE_SCROREBOARDIMAGE, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        scroreBoard.refetch();
        toast.success(res.ResponseMsg);
      }
    }
  });

  useEffect(() => {
    if (!selectedVideo || (!videoRef.current && !(selectedVideo instanceof File))) return;
    setThumbnail(videoRef.current);
  }, [videoRef.current, selectedVideo]);

  const setThumbnail = async () => {

    const image = await getVideoCover(selectedVideo);

    scoreboardForm.setValue(
      'thumbnail',
      new File([image], 'thumbnail.jpeg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      }),
      { shouldDirty: true, shouldValidate: true }

    );
    setIsDeleteVideo(false)


  };

  useEffect(() => {
    if (scroreBoard.isFetching || !search.open) return;

    scoreboardForm.reset({
      month: scoreboardForm.getValues('month'),
      year: scoreboardForm.getValues('year'),
      location: scoreboardForm.getValues('location') ? scoreboardForm.getValues('location') : scroreBoard.data.data.scoreboard_data.location,
      reel_of_month: scroreBoard.data.data.scoreboard_data.reel_of_month_user ? scroreBoard.data.data.scoreboard_data.reel_of_month_user.user_id : undefined,
      tenk_plus_viral: scroreBoard.data.data.scoreboard_data.tenk_plus_viral
        ? scroreBoard.data.data.scoreboard_data.tenk_plus_viral.split(',').map(value => ({ value }))
        : [...new Array(3)].map(() => ({ value: '' })),
      video: scroreBoard?.data?.data?.scoreboard_data?.video,
      thumbnail: scroreBoard?.data?.data?.scoreboard_data?.thumbnail
      // tenk_minus_viral: scroreBoard.data.data.scoreboard_data.tenk_minus_viral
      //   ? scroreBoard.data.data.scoreboard_data.tenk_minus_viral.split(',').map(value => ({ value }))
      //   : [...new Array(3)].map(() => ({ value: '' }))

    });

    setSelectedVideo(scroreBoard?.data?.data?.scoreboard_data?.video)
    // return () => {
    //   scoreboardForm.reset(defaultValues);
    // };
  }, [search.open, scroreBoard.isFetching]);

  const pluse_10k_most_viral = useFieldArray({
    control: scoreboardForm.control,
    name: 'tenk_plus_viral'
  });

  // const minus_10k_most_viral = useFieldArray({
  //   control: scoreboardForm.control,
  //   name: 'tenk_minus_viral'
  // });

  const { mutate, isPending } = useMutation({
    mutationKey: [ADD_UPDATE_SCROREBOARDDATA],
    mutationFn: data => privateAxios({ url: ADD_UPDATE_SCROREBOARDDATA, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        queryClient.invalidateQueries({ queryKey: [GETSCOREBOARDLIST] });
        toast.success(res.ResponseMsg);
        onClose();
      } else {
        toast.error(res.ResponseMsg);
      }
    }
  });

  const onClose = () => {
    delete search.open;
    navigate({ search });
    setSelectedVideo(null);
    setIsDeleteVideo(false)
    scoreboardForm.reset(defaultValues);
  };

  const onSubmit = values => {
    values.month = MONTHS.find(mnth => mnth.value === values.month).valueNumb;
    values.tenk_plus_viral = values?.tenk_plus_viral?.filter(user => user.value)?.map(user => user.value).join(',');
    // values.tenk_minus_viral = values?.tenk_minus_viral?.map(user => user.value).join(',');
    values.location = locationWatch;
    if (!(values.video instanceof File)) {
      delete values.video
    }
    if (!(values.thumbnail instanceof File)) {
      delete values.thumbnail
    }
    mutate(toFormData({
      ...values,
      ...(isDeleteVideo && {
        is_delete_video: isDeleteVideo ? '1' : '0',
      }),
      admin_id
    }));
  };

  if (!scroreBoard.isFetched) return;

  return (
    <>
      {isPending && isOpen && <Loader />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='h-full max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden'>
          <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
            <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>Scoreboard</DialogTitle>
            <Separator className='dark:bg-[#34363A]' />
          </DialogHeader>
          <Form {...scoreboardForm}>
            <form noValidate onSubmit={scoreboardForm.handleSubmit(onSubmit)} className='h-full pt-0 flex flex-col gap-y-4 overflow-hidden'>
              <ScrollArea className='h-full px-5'>
                <div className='p-1 space-y-4'>
                  <div className='w-full flex flex-col gap-y-2'>
                    <FormLabel className='text-lg dark:text-text_main'>Brands for Commercial Purpose</FormLabel>
                    <div className='flex mt-2 items-center gap-x-4'>
                      {scroreBoard.isFetching || scroreBoardImage.isPending
                        ? [...new Array(3)].map((_, index) => {
                          return (
                            <div
                              key={index}
                              className='size-[120px] flex justify-center items-center rounded-full border-2 border-dashed border-[#2A2A2A] dark:bg-input_bg'>
                              <Skeleton className='size-[100px] rounded-full dark:bg-input_bg' />
                            </div>
                          );
                        })
                        :
                        <>
                          {
                            scroreBoard?.data?.data?.scoreboard_img?.map((scoreboardImg, index) => {
                              return (
                                <div className='space-y-2' key={scoreboardImg.scoreboard_image_id}>
                                  <div
                                    className='size-[120px] flex justify-center items-center rounded-full border-2 border-dashed border-[#2A2A2A] dark:bg-input_bg relative'>
                                    <img className='size-[90px] rounded-full' src={scoreboardImg.image} alt={`scoreboard-${scoreboardImg.scoreboard_image_id}`} />

                                    <label
                                      onClick={
                                        () => {
                                          if (locationWatch) {
                                            setScoreboardImage({
                                              open: true,
                                              data: scoreboardImg
                                            })
                                          } else {

                                          }
                                        }
                                      }
                                      className={cn(buttonVariants(), 'p-1.5 rounded-full absolute top-0 right-0 cursor-pointer')}>
                                      <Edit className='size-5' />
                                    </label>
                                  </div>
                                  <div className='flex justify-center'>
                                    <a className='text-white  underline text-center' target='_blank' href={scoreboardImg.link}>Link</a>
                                  </div>
                                </div>
                              );

                            })
                          }
                          {
                            Array.from({ length: (scroreBoard?.data?.data?.scoreboard_img?.length || scroreBoard?.data?.data?.scoreboard_img?.length == 0) ? 3 - scroreBoard?.data?.data?.scoreboard_img?.length : 0 }).map((_, index) => (
                              <div
                                key={index}
                                className='size-[120px] flex justify-center items-center rounded-full border-2 border-dashed border-[#2A2A2A] dark:bg-input_bg relative'>


                                <label
                                  onClick={() => {
                                    if (locationWatch) {
                                      setScoreboardImage({
                                        open: true,
                                        data: null
                                      })
                                    } else {
                                      toast.error('Please Select Location First')
                                    }

                                  }}
                                  className={cn(buttonVariants(), 'p-1.5 rounded-full absolute top-0 right-0 cursor-pointer')}>
                                  <Edit className='size-5' />
                                </label>
                              </div>
                            ))
                          }
                        </>
                      }
                    </div>
                  </div>
                  {/* <div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-white font-medium px-2 text-xl">Edit Links</AccordionTrigger>
                        <AccordionContent>
                          <div className='px-2 pt-3 space-y-4'>
                            <InputWithLabel label='Link1' name='link_1' placeholder='Link 1' />
                            <InputWithLabel label='Link2' name='link_2' placeholder='Link 2' />
                            <InputWithLabel label='Link3' name='link_3' placeholder='Link 3' />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div> */}
                  <div className='grid grid-cols-2 gap-x-4'>
                    <SelectWithLabel name='month' label='Month' placeholder='Choose Month' option={MONTHS} />

                    <SelectWithLabel
                      name='year'
                      label='Year'
                      placeholder='Choose Year'
                      option={[...new Array(20)].map((_, index) => ({
                        label: moment().year() - 10 + index,
                        value: moment().year() - 10 + index
                      }))}
                    />
                  </div>
                  <SelectWithLabel label='Location' name='location' placeholder='Select Location' option={eventLocation.data} />
                  <div className='w-full flex flex-col gap-y-2'>
                    <div className='flex items-center gap-3'>
                      <FormLabel htmlFor='eventprofile' className='text-lg flex items-center gap-2 dark:text-text_main'>
                        Sponser Video
                      </FormLabel>
                      <Trash2 className='cursor-pointer' onClick={() => {
                        scoreboardForm.setValue('video', '', {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                        setSelectedVideo(null)
                        setIsDeleteVideo(true)
                      }} size={19} color='white' />
                    </div>
                    <div className='space-y-0.5'>
                      <div
                        {...getRootProps()}
                        className={cn(
                          'h-[160px] flex flex-col items-center justify-center rounded-xl dark:bg-input_bg border-2 border-dashed cursor-pointer relative',
                          scoreboardForm.formState.errors.video?.message ? 'dark:border-red-500' : selectedVideo ? 'dark:border-transparent' : 'dark:border-[#2A2A2A]'
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
                      <p className='ml-3 md:ml-4 dark:text-red-500 text-[12px] font-semibold'>{scoreboardForm.formState.errors.video?.message}</p>
                    </div>
                  </div>

                  {scroreBoard.isFetched ? (
                    <ComboBox name='reel_of_month' label='Reel of The Month' placeholder='Choose User' option={users.data} />
                  ) : (
                    <Skeleton className='h-[54px] rounded-xl dark:bg-input_bg' />
                  )}
                  <div className='w-full flex flex-col gap-y-2'>
                    <p className='text-lg dark:text-text_main'>Most Viral Reels</p>
                    <div className='space-y-2'>
                      {pluse_10k_most_viral.fields && pluse_10k_most_viral.fields.length
                        ?
                        <>
                          {
                            pluse_10k_most_viral.fields.map((field, index) => {
                              return (
                                <FormField
                                  key={field.id}
                                  control={scoreboardForm.control}
                                  name={`tenk_plus_viral.${index}.value`}
                                  render={({ field, formState }) => {
                                    return (
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger
                                          icon={false}
                                          className={cn(
                                            'h-auto py-3.5 text-sm md:text-base rounded-[10px] dark:bg-input_bg focus:ring-0 focus:ring-offset-0 font-normal gap-x-3',
                                            formState.errors?.pluse_10k_most_viral?.[index]
                                              ? 'dark:placeholder:text-red-400 dark:caret-red-400 dark:border-red-400 dark:text-red-400'
                                              : 'dark:border-[#17171F0A] dark:text-input_text'
                                          )}>
                                          <div className='w-full flex justify-between dark:text-input_text'>
                                            <SelectValue placeholder='Choose User' />
                                            <ChevronDown className='dark:text-text_main' />
                                          </div>
                                        </SelectTrigger>
                                        <SelectContent className="dark:bg-input_bg">
                                          {users.data.map((option, index) => {
                                            return (
                                              <SelectItem
                                                key={index}
                                                value={option.value}
                                              // disabled={[...scoreboardForm.watch('tenk_plus_viral')].some(
                                              //   selectedUser => selectedUser.value === option.value
                                              // )}
                                              >
                                                {option.label.name} <span className='underline'>({option.label.instagram_username})</span>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    );
                                  }}
                                />
                              );
                            })
                          }
                          {
                            Array.from({ length: 3 - pluse_10k_most_viral.fields.length }).map((_, index) => (
                              <FormField
                                control={scoreboardForm.control}
                                name={`tenk_plus_viral.${index + pluse_10k_most_viral.fields.length}.value`}
                                render={({ field, formState }) => {
                                  return (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <SelectTrigger
                                        icon={false}
                                        className={cn(
                                          'h-auto py-3.5 text-sm md:text-base rounded-[10px] dark:bg-input_bg focus:ring-0 focus:ring-offset-0 font-normal gap-x-3',
                                          formState.errors?.pluse_10k_most_viral?.[index + pluse_10k_most_viral.fields.length]
                                            ? 'dark:placeholder:text-red-400 dark:caret-red-400 dark:border-red-400 dark:text-red-400'
                                            : 'dark:border-[#17171F0A] dark:text-input_text'
                                        )}>
                                        <div className='w-full flex justify-between dark:text-input_text'>
                                          <SelectValue placeholder='Choose User' />
                                          <ChevronDown className='dark:text-text_main' />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className="dark:bg-input_bg">
                                        {users.data.map((option, index) => {
                                          return (
                                            <SelectItem
                                              key={index}
                                              value={option.value}
                                            // disabled={[...scoreboardForm.watch('tenk_plus_viral')].some(
                                            //   selectedUser => selectedUser.value === option.value
                                            // )}
                                            >
                                              {option.label.name} <span className='underline'>({option.label.instagram_username})</span>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  );
                                }}
                              />
                            ))
                          }
                        </>
                        : [...new Array(3)].map((_, index) => <Skeleton key={index} className='h-[54px] rounded-xl dark:bg-input_bg' />)}
                    </div>
                  </div>
                  {/* <div className='w-full flex flex-col gap-y-2'>
                  <p className='text-lg dark:text-text_main'>10k- Most Viral</p>
                  <div className='space-y-2'>
                    {minus_10k_most_viral.fields && minus_10k_most_viral.fields.length
                      ? minus_10k_most_viral.fields.map((field, index) => {
                        return (
                          <FormField
                            key={field.id}
                            control={scoreboardForm.control}
                            name={`tenk_minus_viral.${index}.value`}
                            render={({ field, formState }) => {
                              return (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger
                                    icon={false}
                                    className={cn(
                                      'h-auto py-3.5 text-sm md:text-base rounded-[10px] dark:bg-input_bg focus:ring-0 focus:ring-offset-0 font-normal gap-x-3',
                                      formState.errors?.minus_10k_most_viral?.[index]
                                        ? 'dark:placeholder:text-red-400 dark:caret-red-400 dark:border-red-400 dark:text-red-400'
                                        : 'dark:border-[#17171F0A] dark:text-input_text'
                                    )}>
                                    <div className='w-full flex justify-between dark:text-input_text'>
                                      <SelectValue placeholder='Choose User' />
                                      <ChevronDown className='dark:text-text_main' />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {users.data.map((option, index) => {
                                      return (
                                        <SelectItem
                                          key={index}
                                          value={option.value}
                                          disabled={[...scoreboardForm.watch('tenk_plus_viral'), ...scoreboardForm.watch('tenk_minus_viral')].some(
                                            selectedUser => selectedUser.value === option.value
                                          )}>
                                          {option.label.name} <span className='underline'>({option.label.instagram_username})</span>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              );
                            }}
                          />
                        );
                      })
                      : [...new Array(3)].map((_, index) => <Skeleton key={index} className='h-[54px] rounded-xl dark:bg-input_bg' />)}
                  </div>
                </div> */}
                </div>
              </ScrollArea>
              <div className='px-6 flex flex-col gap-x-4'>
                <Separator className='dark:bg-[#34363A]' />
                <div className='py-4 flex items-center gap-x-4'>
                  <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                  <Button type='submit' className='w-full py-3 rounded-[10px] text-xl'>
                    Update
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ScoreboardImage location={locationWatch} refetch={scroreBoard.refetch} data={scoreBoardImage} setData={setScoreboardImage} />
    </>
  );
};

export default Scroreboard;
