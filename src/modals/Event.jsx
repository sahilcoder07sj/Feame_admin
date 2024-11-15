import useAxios from '@/axios/useAxios';
import InputTag from '@/components/common/InputTag';
import SelectWithLabel from '@/components/common/SelectWithLabel';
import { Label } from '@/components/ui/label';
import { ADDEVENTLIST, GETEVENTLIST, GETEVENTTYPELIST, GETSINGLEEVENTLIST, GETUSERFORNOTIFY, UPDATEEVENTLIST } from '@/lib/endpoint';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import axios, { toFormData } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import DatePicker from '../components/common/DatePicker';
import InputWithLabel from '../components/common/InputWithLabel';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form, FormLabel } from '../components/ui/form';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { ADMIN_COOKIE, DIALOG_MODE } from '../lib/constant';
import { event as eventSchema } from '../lib/schema';
import Cookies from 'js-cookie';
import moment from 'moment';
import TimeWithLabel from '@/components/common/TimeWithLabel';
import FilterBox from '@/components/common/FilterBox';
import { FOLLOWER_ICON, GENDER_ICON } from '@/lib/images';
import { Icon } from '@iconify/react';
import { convertArrayToString, convertLocalTimeToUTC, convertToArray, convertToCommaSeparatedString, convertUTCToLocalTime, extractUserIds, getValidKeysString, removeNull } from '@/lib/helper';
import ButtonLoading from '@/components/common/ButtonLoading';
import { Eye, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import SwitchInput from '@/components/common/SwitchInput';
import Loader from '@/components/common/Loader';

const Event = () => {
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [tmpData, setTmpData] = useState({})
  const [eventImages, setEventImages] = useState([])
  const [removeUploadIds, setRemoveUploadIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [allSelected, setAllSelected] = useState(false)
  const [userData, setUserData] = useState([])
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];
  const eventCategoryOptions = [
    { value: 'live', label: 'Live' }
  ];
  const [eventTimeZone, setEventTimeZone] = useState('')
  const followerOptions = [
    {
      label: 'Less than 10k followers',
      value: 'less_than_10k'
    },
    {
      label: '10k-25k followers',
      value: '10k_25k'
    },
    {
      label: '25k-100k followers',
      value: '25k_100k'
    },
    {
      label: '100k+ followers',
      value: '100k_plus'
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
  const handleCheckboxChange = (event, userId) => {
    if (event.target.checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };
  useEffect(() => {
    if (allSelected) {
      setSelectedUserIds(userData.map(user => user.user_id));
    } else {
      // setSelectedUserIds((prev) => {
      //   return userData.filter((user) => prev.includes(user.user_id)).map(user => user.user_id)
      // });
      // setSelectedUserIds([])
      // setAllSelected(false)
    }
  }, [allSelected, userData]);

  const defaultValues = {
    name: '',
    event_profile: '',
    click_img: '',
    organized_by: '',
    event_date: '',
    start_time: '',
    end_time: '',
    total_seat: '',
    location: '',
    city: '',
    lat: '',
    lng: '',
    event_address: '',
    event_lat: '',
    event_lng: '',
    event_type_id: '',
    type: '',
    description: '',
    dress_code: '',
    rules: '',
    offer_for_influencers: '',
    google_review: '',
    trip_advisor: '',
    trip_advisor_title:'Tripadvisor / Yelp',
    google_review_title:'Google Reviews',
    where_tag: [],
    keywords: [],
    tags: [],
    email: [],
    event_timezone: '',
    is_top: '0',
    event_images: []
  };

  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);
  const getUserList = async (values) => {
    try {
      setLoading(true)
      const data = await privateAxios({
        url: GETUSERFORNOTIFY,
        data: values

      })
      setLoading(false)
      setUserData(data.data)
    } catch (error) {
      setLoading(false)
    }
  }
  const queryClient = useQueryClient();
  const { privateAxios } = useAxios();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const isOpen = useMemo(() => search.mode === DIALOG_MODE.add || search.mode === DIALOG_MODE.edit, [search.mode]);

  const [searchPlaces, setSearchPlaces] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [removedTagIds, setRemovedTagIds] = useState([]);
  const [removedKewordsIds, setRemovedKewordsIds] = useState([]);
  const [removedTagsIds, setRemovedTagsIds] = useState([]);
  const eventForm = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues
  });


  const genderWatch = eventForm.watch('gender')
  const followerWatch = eventForm.watch('followers')
  const describeWatch = eventForm.watch('describe_yourself')

  useEffect(() => {
    getUserList({})
  }, [])
  useEffect(() => {
    if (search.mode == "add") {
      setAllSelected(true)
    } else {
      if ((selectedUserIds.length == userData.length) && isOpen) {

        setAllSelected(true)
      } else {
        setAllSelected(false)
      }
    }
  }, [isOpen])
  useEffect(() => {
    if (genderWatch || followerWatch || describeWatch) {
      getUserList({
        followers: getValidKeysString(removeNull(followerWatch)),
        gender: getValidKeysString(removeNull(genderWatch)),
        describe_yourself: getValidKeysString(removeNull(describeWatch))
      })
    }
  }, [

    JSON.stringify(genderWatch),
    JSON.stringify(followerWatch),
    JSON.stringify(describeWatch)
  ])
  const eventTypes = useQuery({
    queryKey: [GETEVENTTYPELIST],
    queryFn: () => privateAxios({ url: GETEVENTTYPELIST }),
    select: res => {
      return res.data.map(type => ({
        label: type.type,
        value: type.event_type_id
      }));
    },
    placeholderData: { data: [] }
  });

  const deleteImageHandler = (data) => {
    if (data.upload_type == "old") {
      setRemoveUploadIds((prev) => [...prev, data.event_img_id])
    }
    setEventImages((prev) => prev.filter((item) => data.event_img_id != item.event_img_id))
  }

  const { data, isFetching } = useQuery({
    queryKey: [GETSINGLEEVENTLIST, search.event_id],
    queryFn: () => privateAxios({ url: GETSINGLEEVENTLIST, data: { event_id: search.event_id } }),
    select: res => {
      res.data.where_tag = res.data.where_dtl.map(tag => ({ id: tag.event_where_id, text: tag.where_tag }));
      res.data.keywords = res.data.keyword_dtl.map(tag => ({ id: tag.event_keyword_id, text: tag.keyword }));
      res.data.tags = res.data.tag_dtl.map(tag => ({ id: tag.event_tag_id, text: tag.tag }));
      const parsedData = res.data;

      return parsedData;
    },
    enabled: typeof search.event_id === 'number',
    placeholderData: { data: [] }
  });

  useEffect(() => {
    if (!isOpen || !data || isFetching || !search.event_id) return;
    const { email, ...fillterData } = data
    if (data.end_time && data.end_time != null) {
      eventForm.reset({ ...eventSchema.parse(fillterData), start_time: convertUTCToLocalTime(data.start_time, data.utc_start_date, data.event_timezone).localTime, end_time: convertUTCToLocalTime(data.end_time, data.utc_end_date, data.event_timezone).localTime });
    } else {
      eventForm.reset({ ...eventSchema.parse(fillterData), start_time: convertUTCToLocalTime(data.start_time, data.utc_start_date, data.event_timezone).localTime });
    }
    eventForm.setValue('email', convertToArray(email))
    setEventTimeZone(data.event_timezone)
    setEventImages(data.event_images.map((item) => Object.assign(item, {
      upload_type: 'old'
    })))
    setSelectedUserIds(extractUserIds(data?.allowed_user_list))

    setSearchPlaces(data.location);

    setSearchAddress(data.event_address)
  }, [isOpen, isFetching]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    onDrop: acceptedFiles => {
      eventForm.setValue('event_profile', acceptedFiles[0], { shouldDirty: true, shouldValidate: true });
    }
  });
  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    onDrop: acceptedFiles => {
      eventForm.setValue('click_img', acceptedFiles[0], { shouldDirty: true, shouldValidate: true });
    }
  });
  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
    multiple: true,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    onDrop: acceptedFiles => {
      setEventImages((prev) => [...prev, ...acceptedFiles.map((item, index) => Object.assign(item, {
        event_img_id: Date.now() + index,
        media: URL.createObjectURL(item),
        upload_type: 'new'
      }))]);
    }
  });

  const placesOption = useCallback(inputValue => {
    return new Promise((resolve, reject) => {
      if (inputValue === '') {
        reject([]);
      }

      queryClient
        .fetchQuery({
          queryKey: [inputValue],
          queryFn: async () => {
            const { data } = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(inputValue)}&key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}`
            );
            return data;
          }
        })
        .then(places => {

          const options = places.results.map(address => {
            const { lat, lng } = address.geometry.location;
            const city = address.address_components.find((address) => {
              if (address.types.includes('administrative_area_level_3')) {
                return true
              } else if (address.types.includes('administrative_area_level_2')) {
                return true
              }
              else if (address.types.includes('administrative_area_level_1')) {
                return true
              }
              else {
                return false
              }
            });

            return {
              value: { lat, lng, city: city?.long_name ?? null },
              label: address.formatted_address
            };

          });

          resolve(options);
        });
    });
  }, []);

  const addressOption = useCallback(inputValue => {
    return new Promise((resolve, reject) => {
      if (inputValue === '') {
        reject([]);
      }

      queryClient
        .fetchQuery({
          queryKey: [inputValue],
          queryFn: async () => {
            const { data } = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(inputValue)}&key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}`
            );
            return data;
          }
        })
        .then(async (places) => {

          // const options = places.results.map(address => {
          //   const { lat, lng } = address.geometry.location;
          //   return {
          //     value: { lat, lng, address: address.formatted_address },
          //     label: address.formatted_address
          //   };

          // });

          // resolve(options);
          const options = await Promise.all(
            places.results.map(async address => {
              const { lat, lng } = address.geometry.location;

              // Fetch timezone information for the lat, lng
              const { data: timezoneData } = await axios.get(
                `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}`
              );
              setEventTimeZone(timezoneData.timeZoneId)
              return {
                value: { lat, lng, address: address.formatted_address },
                label: address.formatted_address
              };
            })
          );
          resolve(options);

        });
    });
  }, []);


  const { mutate, isPending } = useMutation({
    mutationKey: [search.mode === DIALOG_MODE.add ? ADDEVENTLIST : UPDATEEVENTLIST],
    mutationFn: values => privateAxios({ url: search.mode === DIALOG_MODE.add ? ADDEVENTLIST : UPDATEEVENTLIST, data: toFormData(values) }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        queryClient.invalidateQueries({ queryKey: [GETEVENTLIST] });
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
    delete closeModal.event_id;
    setEventImages([])
    setRemoveUploadIds([])
    eventForm.reset(defaultValues);
    navigate({ search: closeModal });
    setRemovedTagIds([]);
    setRemovedKewordsIds([])
    setRemovedTagsIds([])
  };

  const onSubmit = values => {
    console.log("values",values);
    if (values.email.length == 0) {
      toast.error('Email is required')
      return 0
    }
    if (values.email.length > 3) {
      toast.error('Only 3 email allowed')
      return 0
    }
  
    if (!values.event_address || !values.event_lat || !values.event_lng) {
      toast.error('Event address is required')
      return false
    }
    if (!values.lat || !values.lng || !values.city) {
      toast.error('Event Location is required')
      return false
    }
    const [startHour, startMin] = values.start_time.split(':');
    const [endHour, endMin] = values.end_time.split(':');

    if (values.end_time) {
      if (moment().set('hour', startHour).set('minute', startMin).isSameOrAfter(moment().set('hour', endHour).set('minute', endMin))) {
        return toast.error('End time shound greater than start time');
      }
    }

    if (!values.end_time && values.end_time != "") {
      delete values.end_time;
    }
    let where_tag = [];
    let keywords = []
    let tags = []
    if (search.mode === DIALOG_MODE.edit) {
      if (removedTagIds.length) {
        values.delete_event_where_ids = removedTagIds.join(',');
      }

      where_tag = values.where_tag.map(tag => {
        const isOld = data.where_tag.some(prev => prev.id === tag.id);
        if (isOld) {
          return { event_where_id: tag.id, where_tag: tag.text };
        } else {
          return { event_where_id: 0, where_tag: tag.text };
        }
      });
    } else {
      where_tag = values.where_tag.map(tag => ({ event_where_id: 0, where_tag: tag.text }));
    }
    if (search.mode === DIALOG_MODE.edit) {
      if (removedKewordsIds.length) {
        values.delete_keyword_ids = removedKewordsIds.join(',');
      }

      keywords = values.keywords.map(tag => {
        const isOld = data.keywords.some(prev => prev.id === tag.id);
        if (isOld) {
          return { event_keyword_id: tag.id, keyword: tag.text };
        } else {
          return { event_keyword_id: 0, keyword: tag.text };
        }
      });
    } else {
      keywords = values.keywords.map(tag => ({ event_keyword_id: 0, keyword: tag.text }));
    }

    if (search.mode === DIALOG_MODE.edit) {
      if (removedTagsIds.length) {
        values.delete_tag_ids = removedTagsIds.join(',');
      }

      tags = values.tags.map(tag => {
        const isOld = data.tags.some(prev => prev.id === tag.id);
        if (isOld) {
          return { event_tag_id: tag.id, tag: tag.text };
        } else {
          return { event_tag_id: 0, tag: tag.text };
        }
      });

    } else {
      tags = values.tags.map(tag => ({ event_tag_id: 0, tag: tag.text }));
    }
    const updatedWhereTag = { where_tag: JSON.stringify(where_tag) };
    const updatedKeywords = { keywords: JSON.stringify(keywords) }
    const updatedTags = { tags: JSON.stringify(tags) }

    const { start_time, end_time, email, allowed_user_list, ...updateValues } = values;

    const filterImages = eventImages.filter((item) => item.upload_type == "new");

    const updatedEmail = convertToCommaSeparatedString(email)
    // console.log({ ...updateValues, event_timezone: eventTimeZone, ...updatedWhereTag, ...updatedTags, ...updatedKeywords, email: updatedEmail, ...(search.mode === DIALOG_MODE.add ? {} : { event_id: search.event_id }), allow_user_ids: convertArrayToString(selectedUserIds), admin_id, start_time: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcTime, end_time: convertLocalTimeToUTC(values.end_time, values.event_date, eventTimeZone).utcTime, utc_start_date: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcDate, utc_end_date: convertLocalTimeToUTC(values.end_time, values.event_date, eventTimeZone).utcDate, ...(filterImages.length > 0 ? { event_images: filterImages } : {}), delete_event_images: search.mode == DIALOG_MODE.add ? "" : removeUploadIds.join(',') })
    // return;

    if (values.end_time) {
      mutate({ ...updateValues, event_timezone: eventTimeZone, ...updatedWhereTag, ...updatedTags, ...updatedKeywords, email: updatedEmail, ...(search.mode === DIALOG_MODE.add ? {} : { event_id: search.event_id }), allow_user_ids: convertArrayToString(selectedUserIds), admin_id, start_time: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcTime, end_time: convertLocalTimeToUTC(values.end_time, values.event_date, eventTimeZone).utcTime, utc_start_date: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcDate, utc_end_date: convertLocalTimeToUTC(values.end_time, values.event_date, eventTimeZone).utcDate, ...(filterImages.length > 0 ? { event_images: filterImages } : {}), delete_event_images: search.mode == DIALOG_MODE.add ? "" : removeUploadIds.join(',') });
    } else {
      mutate({ ...updateValues, event_timezone: eventTimeZone, ...updatedWhereTag, ...updatedTags, ...updatedKeywords, email: updatedEmail, ...(search.mode === DIALOG_MODE.add ? {} : { event_id: search.event_id }), allow_user_ids: convertArrayToString(selectedUserIds), admin_id, start_time: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcTime, utc_start_date: convertLocalTimeToUTC(values.start_time, values.event_date, eventTimeZone).utcDate, ...(filterImages.length > 0 ? { event_images: filterImages } : {}), delete_event_images: search.mode == DIALOG_MODE.add ? "" : removeUploadIds.join(',') });
    }

  };

  const onError = error => {
    if (error.city && eventForm.getValues('city') === null) {
      const lat = eventForm.getValues('lat');
      const lng = eventForm.getValues('lng');

      queryClient
        .fetchQuery({
          queryKey: [lat, lng],
          queryFn: async () => {
            const { data } = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_PLACES_KEY}`
            );
            return data;
          }
          
        })
        .then(res => {
          for (let i = 0; i < res.results.length; i++) {
            const cityName = res.results[i].address_components.find(address => address.types.includes('administrative_area_level_3'));
            if (cityName) {
              eventForm.setValue('city', cityName.long_name, { shouldDirty: true, shouldValidate: true });
              break;
            } else {
              eventForm.setValue('city', 'Not Found', { shouldDirty: true, shouldValidate: true });
            }
          }
        });
    }
  };


  return (
    <>
      {isOpen && isPending && <Loader />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='h-full max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden'>
          <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
            <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
              {search.mode === DIALOG_MODE.add && 'Add'}
              {search.mode === DIALOG_MODE.edit && 'Update'}
              &nbsp; Event
            </DialogTitle>
            <Separator className='dark:bg-[#34363A]' />
          </DialogHeader>
          <Form {...eventForm}>
            <form noValidate onSubmit={eventForm.handleSubmit(onSubmit, onError)} className='h-full pt-0 flex flex-col gap-y-4 overflow-hidden'>
              <ScrollArea className='h-full px-5'>
                <div className='p-1 space-y-4'>
                  <div className='w-full flex flex-col gap-y-2'>
                    <FormLabel htmlFor='eventprofile' className='text-lg dark:text-text_main'>
                      Event profile
                    </FormLabel>
                    <div className='space-y-0.5'>
                      <div
                        {...getRootProps()}
                        className={cn(
                          'h-[160px] flex flex-col items-center justify-center rounded-xl dark:bg-input_bg border-2 border-dashed cursor-pointer relative',
                          eventForm.formState.errors.event_profile
                            ? 'dark:border-red-500'
                            : eventForm.watch('event_profile')
                              ? 'dark:border-transparent'
                              : 'dark:border-[#2A2A2A]'
                        )}>
                        <input id='eventprofile' {...getInputProps()} />
                        {eventForm.watch('event_profile') !== '' && (
                          <>
                            <div className='w-full h-full absolute top-0 left-0'>
                              <img
                                className='w-full h-full object-cover rounded-xl'
                                src={
                                  eventForm.watch('event_profile') instanceof File
                                    ? URL.createObjectURL(eventForm.watch('event_profile'))
                                    : eventForm.watch('event_profile')
                                }
                                alt='uploaded-profile'
                              />
                            </div>
                            <div className='w-full h-full rounded-xl absolute top-0 left-0 -z-10 dark:bg-black/60' />
                          </>
                        )}

                        <div
                          className={cn(
                            'w-full h-full rounded-xl transition-colors absolute top-0 left-0',
                            eventForm.watch('event_profile') !== '' ? 'dark:bg-black/50' : 'dark:bg-transparent'
                          )}
                        />
                        <div className='w-max space-y-2 z-10'>
                          {eventForm.watch('event_profile') !== '' ? (
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
                            <svg className='mx-auto' width='72' height='60' viewBox='0 0 72 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
                              <path
                                d='M60.8724 25.6611C59.3416 26.2377 57.6804 26.5536 55.9444 26.5536C48.3107 26.5536 42.1225 20.4468 42.1225 12.9136H14.6447C11.8315 12.9136 9.55078 15.1631 9.55078 17.9379V45.2198C9.55078 47.9945 11.8315 50.2441 14.6447 50.2441H55.7785C58.5917 50.2441 60.8724 47.9945 60.8724 45.2198V25.6611Z'
                                fill='#F0F4FF'
                              />
                              <path d='M43.2392 7.53308L31.6152 10.4125H42.354C42.5423 9.41003 42.8417 8.44573 43.2392 7.53308Z' fill='#F0F4FF' />
                              <path
                                d='M42.1227 12.9014H21.5698L10.0611 15.7523C9.7403 16.4109 9.56055 17.1492 9.56055 17.9289V45.2291C9.56055 48.0057 11.8403 50.2567 14.6526 50.2567H48.7633L60.3746 47.3802C60.6876 46.7281 60.8629 45.9986 60.8629 45.2291V25.6648C59.3348 26.2392 57.6768 26.5536 55.9445 26.5536C48.3108 26.5536 42.1227 20.4469 42.1227 12.9136C42.1227 12.9097 42.1227 12.9055 42.1227 12.9014Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M63.3828 24.4118V45.2291C63.3828 45.7217 63.3347 46.2031 63.2432 46.6693L63.3241 46.6494C66.4485 45.8752 68.3453 42.7484 67.561 39.6654L63.6388 24.2462C63.5541 24.3023 63.4687 24.3576 63.3828 24.4118Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M7.09346 16.4876C3.9692 17.2615 2.07229 20.3883 2.8566 23.4715L7.03972 39.9157V17.9289C7.03972 17.428 7.08923 16.9387 7.18404 16.4651L7.09346 16.4876Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M14.6519 52.7452H38.7167L17.6443 57.9657C14.52 58.7396 11.3515 56.8676 10.5673 53.7845L9.88086 51.0864C11.1861 52.1241 12.8456 52.7452 14.6519 52.7452Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M60.8683 38.9178L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H55.7751C58.588 50.2515 60.8683 48.0013 60.8683 45.2256V38.9178Z'
                                fill='#4EAC92'
                              />
                              <path
                                d='M54.1451 32.2831L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H35.9375L54.1451 32.2831Z'
                                fill='white'
                                fillOpacity='0.4'
                              />
                              <path
                                d='M42.1198 50.2515L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H42.1198Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M18.3131 50.2515L30.2168 38.5051L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H18.3131Z'
                                fill='white'
                                fillOpacity='0.4'
                              />
                              <path
                                d='M26.3057 24.2958C26.3057 27.0775 24.0205 29.3326 21.2017 29.3326C18.3828 29.3326 16.0977 27.0775 16.0977 24.2958C16.0977 21.514 18.3828 19.2589 21.2017 19.2589C24.0205 19.2589 26.3057 21.514 26.3057 24.2958Z'
                                fill='#FFD03A'
                              />
                              <path
                                d='M24.7385 20.5004L17.5204 27.6235C16.5817 26.71 16 25.4404 16 24.0368C16 21.2551 18.2852 19 21.104 19C22.5263 19 23.8128 19.5741 24.7385 20.5004Z'
                                fill='#FFDF76'
                              />
                              <path
                                d='M56.1556 13.122C56.1556 19.2482 56.1556 19.9154 56.1556 24.2147C49.9477 24.2147 44.915 19.2482 44.915 13.122C44.915 6.99586 49.9477 2.02942 56.1556 2.02942C56.1556 6.19691 56.1556 6.99586 56.1556 13.122Z'
                                fill='#95CDBE'
                              />
                              <path
                                d='M56.1553 13.122C56.1553 19.2482 56.1553 19.9154 56.1553 24.2147C62.3631 24.2147 67.3958 19.2482 67.3958 13.122C67.3958 6.99586 62.3631 2.02942 56.1553 2.02942C56.1553 6.19691 56.1553 6.99586 56.1553 13.122Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M56.1558 13.1223C56.1558 17.7983 56.1558 18.3076 56.1558 21.5888C51.4174 21.5888 47.5762 17.7983 47.5762 13.1223C47.5762 8.44625 51.4174 4.65576 56.1558 4.65576C56.1558 7.83673 56.1558 8.44625 56.1558 13.1223Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M56.1553 13.1223C56.1553 17.7983 56.1553 18.3076 56.1553 21.5888C60.8937 21.5888 64.7347 17.7983 64.7347 13.1223C64.7347 8.44625 60.8937 4.65576 56.1553 4.65576C56.1553 7.83673 56.1553 8.44625 56.1553 13.1223Z'
                                fill='#4EAC92'
                              />
                              <path
                                d='M55.1452 10.3549L52.2156 13.1105C52.0305 13.2846 51.7946 13.3717 51.5083 13.3717C51.2223 13.3717 50.9864 13.2846 50.8013 13.1105C50.6161 12.9363 50.5234 12.7145 50.5234 12.4454C50.5234 12.1761 50.6161 11.9544 50.8013 11.7803L55.4484 7.40925C55.6504 7.21912 55.886 7.12417 56.1554 7.12417C56.4248 7.12417 56.6604 7.21912 56.8625 7.40925L61.5096 11.7803C61.6947 11.9544 61.7874 12.1761 61.7874 12.4454C61.7874 12.7145 61.6947 12.9363 61.5096 13.1105C61.3244 13.2846 61.0886 13.3717 60.8025 13.3717C60.5162 13.3717 60.2804 13.2846 60.0953 13.1105L57.1657 10.3549V18.1466C57.1657 18.4157 57.0688 18.6415 56.8752 18.8235C56.6816 19.0058 56.4417 19.0968 56.1554 19.0968C55.8691 19.0968 55.6293 19.0058 55.4357 18.8235C55.2421 18.6415 55.1452 18.4157 55.1452 18.1466V10.3549Z'
                                fill='white'
                              />
                            </svg>
                          )}
                          <p className={eventForm.watch('event_profile') !== '' ? 'dark:text-white' : 'dark:text-input_text'}>Upload profile</p>
                        </div>
                      </div>
                      <p className='ml-3 md:ml-4 dark:text-red-500 text-[12px] font-semibold'>{eventForm.formState.errors.event_profile?.message}</p>
                    </div>
                  </div>
                  <div className='w-full flex flex-col gap-y-2'>
                    <FormLabel htmlFor='eventprofile' className='text-lg dark:text-text_main'>
                      Event images
                    </FormLabel>
                    <div className='space-y-0.5'>
                      <div
                        {...getRootProps1()}
                        className={cn(
                          'h-[160px] flex flex-col items-center justify-center rounded-xl dark:bg-input_bg border-2 border-dashed cursor-pointer relative',
                          eventForm.formState.errors.event_images
                            ? 'dark:border-red-500'
                            : eventForm.watch('event_images')
                              ? 'dark:border-transparent'
                              : 'dark:border-[#2A2A2A]'
                        )}>
                        <input  {...getInputProps1()} />

                        <div
                          className={cn(
                            'w-full h-full rounded-xl transition-colors absolute top-0 left-0',
                            'dark:bg-transparent'
                          )}
                        />
                        <div className='w-max space-y-2 z-10'>

                          <svg className='mx-auto' width='72' height='60' viewBox='0 0 72 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                              d='M60.8724 25.6611C59.3416 26.2377 57.6804 26.5536 55.9444 26.5536C48.3107 26.5536 42.1225 20.4468 42.1225 12.9136H14.6447C11.8315 12.9136 9.55078 15.1631 9.55078 17.9379V45.2198C9.55078 47.9945 11.8315 50.2441 14.6447 50.2441H55.7785C58.5917 50.2441 60.8724 47.9945 60.8724 45.2198V25.6611Z'
                              fill='#F0F4FF'
                            />
                            <path d='M43.2392 7.53308L31.6152 10.4125H42.354C42.5423 9.41003 42.8417 8.44573 43.2392 7.53308Z' fill='#F0F4FF' />
                            <path
                              d='M42.1227 12.9014H21.5698L10.0611 15.7523C9.7403 16.4109 9.56055 17.1492 9.56055 17.9289V45.2291C9.56055 48.0057 11.8403 50.2567 14.6526 50.2567H48.7633L60.3746 47.3802C60.6876 46.7281 60.8629 45.9986 60.8629 45.2291V25.6648C59.3348 26.2392 57.6768 26.5536 55.9445 26.5536C48.3108 26.5536 42.1227 20.4469 42.1227 12.9136C42.1227 12.9097 42.1227 12.9055 42.1227 12.9014Z'
                              fill='#F0F4FF'
                            />
                            <path
                              d='M63.3828 24.4118V45.2291C63.3828 45.7217 63.3347 46.2031 63.2432 46.6693L63.3241 46.6494C66.4485 45.8752 68.3453 42.7484 67.561 39.6654L63.6388 24.2462C63.5541 24.3023 63.4687 24.3576 63.3828 24.4118Z'
                              fill='#F0F4FF'
                            />
                            <path
                              d='M7.09346 16.4876C3.9692 17.2615 2.07229 20.3883 2.8566 23.4715L7.03972 39.9157V17.9289C7.03972 17.428 7.08923 16.9387 7.18404 16.4651L7.09346 16.4876Z'
                              fill='#F0F4FF'
                            />
                            <path
                              d='M14.6519 52.7452H38.7167L17.6443 57.9657C14.52 58.7396 11.3515 56.8676 10.5673 53.7845L9.88086 51.0864C11.1861 52.1241 12.8456 52.7452 14.6519 52.7452Z'
                              fill='#F0F4FF'
                            />
                            <path
                              d='M60.8683 38.9178L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H55.7751C58.588 50.2515 60.8683 48.0013 60.8683 45.2256V38.9178Z'
                              fill='#4EAC92'
                            />
                            <path
                              d='M54.1451 32.2831L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H35.9375L54.1451 32.2831Z'
                              fill='white'
                              fillOpacity='0.4'
                            />
                            <path
                              d='M42.1198 50.2515L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H42.1198Z'
                              fill='#71BDA8'
                            />
                            <path
                              d='M18.3131 50.2515L30.2168 38.5051L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H18.3131Z'
                              fill='white'
                              fillOpacity='0.4'
                            />
                            <path
                              d='M26.3057 24.2958C26.3057 27.0775 24.0205 29.3326 21.2017 29.3326C18.3828 29.3326 16.0977 27.0775 16.0977 24.2958C16.0977 21.514 18.3828 19.2589 21.2017 19.2589C24.0205 19.2589 26.3057 21.514 26.3057 24.2958Z'
                              fill='#FFD03A'
                            />
                            <path
                              d='M24.7385 20.5004L17.5204 27.6235C16.5817 26.71 16 25.4404 16 24.0368C16 21.2551 18.2852 19 21.104 19C22.5263 19 23.8128 19.5741 24.7385 20.5004Z'
                              fill='#FFDF76'
                            />
                            <path
                              d='M56.1556 13.122C56.1556 19.2482 56.1556 19.9154 56.1556 24.2147C49.9477 24.2147 44.915 19.2482 44.915 13.122C44.915 6.99586 49.9477 2.02942 56.1556 2.02942C56.1556 6.19691 56.1556 6.99586 56.1556 13.122Z'
                              fill='#95CDBE'
                            />
                            <path
                              d='M56.1553 13.122C56.1553 19.2482 56.1553 19.9154 56.1553 24.2147C62.3631 24.2147 67.3958 19.2482 67.3958 13.122C67.3958 6.99586 62.3631 2.02942 56.1553 2.02942C56.1553 6.19691 56.1553 6.99586 56.1553 13.122Z'
                              fill='#71BDA8'
                            />
                            <path
                              d='M56.1558 13.1223C56.1558 17.7983 56.1558 18.3076 56.1558 21.5888C51.4174 21.5888 47.5762 17.7983 47.5762 13.1223C47.5762 8.44625 51.4174 4.65576 56.1558 4.65576C56.1558 7.83673 56.1558 8.44625 56.1558 13.1223Z'
                              fill='#71BDA8'
                            />
                            <path
                              d='M56.1553 13.1223C56.1553 17.7983 56.1553 18.3076 56.1553 21.5888C60.8937 21.5888 64.7347 17.7983 64.7347 13.1223C64.7347 8.44625 60.8937 4.65576 56.1553 4.65576C56.1553 7.83673 56.1553 8.44625 56.1553 13.1223Z'
                              fill='#4EAC92'
                            />
                            <path
                              d='M55.1452 10.3549L52.2156 13.1105C52.0305 13.2846 51.7946 13.3717 51.5083 13.3717C51.2223 13.3717 50.9864 13.2846 50.8013 13.1105C50.6161 12.9363 50.5234 12.7145 50.5234 12.4454C50.5234 12.1761 50.6161 11.9544 50.8013 11.7803L55.4484 7.40925C55.6504 7.21912 55.886 7.12417 56.1554 7.12417C56.4248 7.12417 56.6604 7.21912 56.8625 7.40925L61.5096 11.7803C61.6947 11.9544 61.7874 12.1761 61.7874 12.4454C61.7874 12.7145 61.6947 12.9363 61.5096 13.1105C61.3244 13.2846 61.0886 13.3717 60.8025 13.3717C60.5162 13.3717 60.2804 13.2846 60.0953 13.1105L57.1657 10.3549V18.1466C57.1657 18.4157 57.0688 18.6415 56.8752 18.8235C56.6816 19.0058 56.4417 19.0968 56.1554 19.0968C55.8691 19.0968 55.6293 19.0058 55.4357 18.8235C55.2421 18.6415 55.1452 18.4157 55.1452 18.1466V10.3549Z'
                              fill='white'
                            />
                          </svg>

                          <p className={'dark:text-input_text'}>Upload images</p>
                        </div>
                      </div>
                      <p className='ml-3 md:ml-4 dark:text-red-500 text-[12px] font-semibold'>{eventForm.formState.errors.event_images?.message}</p>
                    </div>
                    <div className='mt-4'>
                      {
                        eventImages?.length > 0 ?
                          <div className='flex flex-wrap gap-5 items-center'>
                            {
                              eventImages.map((item) => (
                                <div className='relative group'>
                                  <div className='absolute transition-all justify-center items-center gap-x-2 group-hover:flex hidden z-[100] w-full h-full bg-black/50'>
                                    <button onClick={() => deleteImageHandler(item)} type='button'><Trash2 className=' stroke-white' /></button>
                                    <div>
                                      <a target='_blank' href={item.media}><Eye className=' stroke-white' /></a>
                                    </div>
                                  </div>
                                  <img className='w-[150px] rounded-md  min-h-[100px] object-cover' src={item.media} alt="" />
                                </div>
                              ))
                            }
                          </div> : null
                      }
                    </div>
                  </div>
                  <div className='w-full flex flex-col gap-y-2'>
                    <FormLabel htmlFor='eventbanner' className='text-lg dark:text-text_main'>
                      Event Banner
                    </FormLabel>
                    <div className='space-y-0.5'>
                      <div
                        {...getRootProps2()}
                        className={cn(
                          'h-[160px] flex flex-col items-center justify-center rounded-xl dark:bg-input_bg border-2 border-dashed cursor-pointer relative',
                          eventForm.formState.errors.event_profile
                            ? 'dark:border-red-500'
                            : eventForm.watch('click_img')
                              ? 'dark:border-transparent'
                              : 'dark:border-[#2A2A2A]'
                        )}>
                        <input id='eventbanner' {...getInputProps2()} />
                        {eventForm.watch('click_img') !== '' && (
                          <>
                            <div className='w-full h-full absolute top-0 left-0'>
                              <img
                                className='w-full h-full object-cover rounded-xl'
                                src={
                                  eventForm.watch('click_img') instanceof File
                                    ? URL.createObjectURL(eventForm.watch('click_img'))
                                    : eventForm.watch('click_img')
                                }
                                alt='uploaded-profile'
                              />
                            </div>
                            <div className='w-full h-full rounded-xl absolute top-0 left-0 -z-10 dark:bg-black/60' />
                          </>
                        )}

                        <div
                          className={cn(
                            'w-full h-full rounded-xl transition-colors absolute top-0 left-0',
                            eventForm.watch('click_img') !== '' ? 'dark:bg-black/50' : 'dark:bg-transparent'
                          )}
                        />
                        <div className='w-max space-y-2 z-10'>
                          {eventForm.watch('click_img') !== '' ? (
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
                            <svg className='mx-auto' width='72' height='60' viewBox='0 0 72 60' fill='none' xmlns='http://www.w3.org/2000/svg'>
                              <path
                                d='M60.8724 25.6611C59.3416 26.2377 57.6804 26.5536 55.9444 26.5536C48.3107 26.5536 42.1225 20.4468 42.1225 12.9136H14.6447C11.8315 12.9136 9.55078 15.1631 9.55078 17.9379V45.2198C9.55078 47.9945 11.8315 50.2441 14.6447 50.2441H55.7785C58.5917 50.2441 60.8724 47.9945 60.8724 45.2198V25.6611Z'
                                fill='#F0F4FF'
                              />
                              <path d='M43.2392 7.53308L31.6152 10.4125H42.354C42.5423 9.41003 42.8417 8.44573 43.2392 7.53308Z' fill='#F0F4FF' />
                              <path
                                d='M42.1227 12.9014H21.5698L10.0611 15.7523C9.7403 16.4109 9.56055 17.1492 9.56055 17.9289V45.2291C9.56055 48.0057 11.8403 50.2567 14.6526 50.2567H48.7633L60.3746 47.3802C60.6876 46.7281 60.8629 45.9986 60.8629 45.2291V25.6648C59.3348 26.2392 57.6768 26.5536 55.9445 26.5536C48.3108 26.5536 42.1227 20.4469 42.1227 12.9136C42.1227 12.9097 42.1227 12.9055 42.1227 12.9014Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M63.3828 24.4118V45.2291C63.3828 45.7217 63.3347 46.2031 63.2432 46.6693L63.3241 46.6494C66.4485 45.8752 68.3453 42.7484 67.561 39.6654L63.6388 24.2462C63.5541 24.3023 63.4687 24.3576 63.3828 24.4118Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M7.09346 16.4876C3.9692 17.2615 2.07229 20.3883 2.8566 23.4715L7.03972 39.9157V17.9289C7.03972 17.428 7.08923 16.9387 7.18404 16.4651L7.09346 16.4876Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M14.6519 52.7452H38.7167L17.6443 57.9657C14.52 58.7396 11.3515 56.8676 10.5673 53.7845L9.88086 51.0864C11.1861 52.1241 12.8456 52.7452 14.6519 52.7452Z'
                                fill='#F0F4FF'
                              />
                              <path
                                d='M60.8683 38.9178L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H55.7751C58.588 50.2515 60.8683 48.0013 60.8683 45.2256V38.9178Z'
                                fill='#4EAC92'
                              />
                              <path
                                d='M54.1451 32.2831L48.4347 26.6478C46.6942 24.9302 43.8726 24.9302 42.1323 26.6478L18.2139 50.2515H35.9375L54.1451 32.2831Z'
                                fill='white'
                                fillOpacity='0.4'
                              />
                              <path
                                d='M42.1198 50.2515L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H42.1198Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M18.3131 50.2515L30.2168 38.5051L28.182 36.4971C26.5409 34.8779 23.8805 34.8779 22.2397 36.4971L10.4717 48.1103C11.393 49.4053 12.9176 50.2515 14.6426 50.2515H18.3131Z'
                                fill='white'
                                fillOpacity='0.4'
                              />
                              <path
                                d='M26.3057 24.2958C26.3057 27.0775 24.0205 29.3326 21.2017 29.3326C18.3828 29.3326 16.0977 27.0775 16.0977 24.2958C16.0977 21.514 18.3828 19.2589 21.2017 19.2589C24.0205 19.2589 26.3057 21.514 26.3057 24.2958Z'
                                fill='#FFD03A'
                              />
                              <path
                                d='M24.7385 20.5004L17.5204 27.6235C16.5817 26.71 16 25.4404 16 24.0368C16 21.2551 18.2852 19 21.104 19C22.5263 19 23.8128 19.5741 24.7385 20.5004Z'
                                fill='#FFDF76'
                              />
                              <path
                                d='M56.1556 13.122C56.1556 19.2482 56.1556 19.9154 56.1556 24.2147C49.9477 24.2147 44.915 19.2482 44.915 13.122C44.915 6.99586 49.9477 2.02942 56.1556 2.02942C56.1556 6.19691 56.1556 6.99586 56.1556 13.122Z'
                                fill='#95CDBE'
                              />
                              <path
                                d='M56.1553 13.122C56.1553 19.2482 56.1553 19.9154 56.1553 24.2147C62.3631 24.2147 67.3958 19.2482 67.3958 13.122C67.3958 6.99586 62.3631 2.02942 56.1553 2.02942C56.1553 6.19691 56.1553 6.99586 56.1553 13.122Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M56.1558 13.1223C56.1558 17.7983 56.1558 18.3076 56.1558 21.5888C51.4174 21.5888 47.5762 17.7983 47.5762 13.1223C47.5762 8.44625 51.4174 4.65576 56.1558 4.65576C56.1558 7.83673 56.1558 8.44625 56.1558 13.1223Z'
                                fill='#71BDA8'
                              />
                              <path
                                d='M56.1553 13.1223C56.1553 17.7983 56.1553 18.3076 56.1553 21.5888C60.8937 21.5888 64.7347 17.7983 64.7347 13.1223C64.7347 8.44625 60.8937 4.65576 56.1553 4.65576C56.1553 7.83673 56.1553 8.44625 56.1553 13.1223Z'
                                fill='#4EAC92'
                              />
                              <path
                                d='M55.1452 10.3549L52.2156 13.1105C52.0305 13.2846 51.7946 13.3717 51.5083 13.3717C51.2223 13.3717 50.9864 13.2846 50.8013 13.1105C50.6161 12.9363 50.5234 12.7145 50.5234 12.4454C50.5234 12.1761 50.6161 11.9544 50.8013 11.7803L55.4484 7.40925C55.6504 7.21912 55.886 7.12417 56.1554 7.12417C56.4248 7.12417 56.6604 7.21912 56.8625 7.40925L61.5096 11.7803C61.6947 11.9544 61.7874 12.1761 61.7874 12.4454C61.7874 12.7145 61.6947 12.9363 61.5096 13.1105C61.3244 13.2846 61.0886 13.3717 60.8025 13.3717C60.5162 13.3717 60.2804 13.2846 60.0953 13.1105L57.1657 10.3549V18.1466C57.1657 18.4157 57.0688 18.6415 56.8752 18.8235C56.6816 19.0058 56.4417 19.0968 56.1554 19.0968C55.8691 19.0968 55.6293 19.0058 55.4357 18.8235C55.2421 18.6415 55.1452 18.4157 55.1452 18.1466V10.3549Z'
                                fill='white'
                              />
                            </svg>
                          )}
                          <p className={eventForm.watch('click_img') !== '' ? 'dark:text-white' : 'dark:text-input_text'}>Upload Banner</p>
                        </div>
                      </div>
                      <p className='ml-3 md:ml-4 dark:text-red-500 text-[12px] font-semibold'>{eventForm.formState.errors.click_img?.message}</p>
                    </div>
                  </div>
                  <InputWithLabel label='Event Name' name='name' placeholder='Enter Event Name' />
                  {/* <InputWithLabel label='Email' name='email' placeholder='Enter Email Name' /> */}
                  <SwitchInput label="Top Event" name="is_top" />
                  <InputTag label='Email' name='email' placeholder='Enter email' setRemovedTagIds={setRemovedTagIds} />
                  <InputWithLabel label='Organized By' name='organized_by' placeholder='Organized By' />
                  <InputWithLabel
                    label='Event Description'
                    name='description'
                    placeholder='Enter Event Description'
                    textarea
                    inputStyle='h-[100px] resize-none'
                  />
                  <div className='py-3'>
                    <div className='space-y-4'>
                      <label className='text-lg pb-2 dark:text-text_main'>Users</label>
                      <div className='flex gap-x-6 items-center'>
                        <FilterBox
                          icon={<img className='w-4' src={GENDER_ICON} />}
                          name="gender"
                          label="Gender"
                          options={genderOptions}
                        />
                        <FilterBox
                          icon={<img className='w-4' src={FOLLOWER_ICON} />}
                          name="followers"
                          label="Follower"
                          options={followerOptions}
                          className="min-w-[300px]"
                        />
                        <FilterBox
                          icon={<img className='w-4' src={FOLLOWER_ICON} />}
                          name="describe_yourself"
                          label="Type"
                          options={describeOptions}
                          className="min-w-[300px]"
                        />
                        <div>
                          <div className='flex gap-x-4 items-center'>
                            <div>
                              <input checked={allSelected} value={allSelected} onChange={(e) => setAllSelected(e.target.checked)} id='all_selected' className='hidden' type="checkbox" />
                              <label htmlFor="all_selected">
                                <div className='w-[25px] cursor-pointer justify-center items-center flex border border-[#FF944E] rounded h-[25px]'>
                                  {allSelected && <Icon className='text-white' icon="uil:check" />}
                                </div>
                              </label>
                            </div>
                            <p className='text-[#FF944E] text-xl'>Select All</p>
                          </div>
                        </div>
                      </div>
                      <div className='max-h-[400px] main-notify-dialog overflow-auto'>
                        {
                          userData?.length > 0 && !loading ? userData.map((user, index) => (
                            <div className='flex border-t border-[#34363A] gap-x-5 py-5 items-center' key={index}>
                              <div>
                                <input
                                  type="checkbox"
                                  id={`checkbox-${user.user_id}`}
                                  checked={selectedUserIds.includes(user.user_id)}
                                  onChange={(e) => handleCheckboxChange(e, user.user_id)}
                                  className="hidden"
                                />
                                <label htmlFor={`checkbox-${user.user_id}`}>
                                  <div className={`w-[25px] cursor-pointer justify-center items-center flex ${selectedUserIds.includes(user.user_id) ? "border-[#FF944E] bg-[#FF944E]" : "border-[#35373B]"}  border  rounded h-[25px]`}>
                                    {selectedUserIds.includes(user.user_id) && <Icon className='text-black' icon="uil:check" />}
                                  </div>
                                </label>
                              </div>
                              <div>
                                <img className='w-[50px] h-[50px] rounded' src={user.single_profile} alt="" />
                              </div>
                              <div>
                                <p className='text-white text-lg'>{user.fname} {user.lname}</p>
                              </div>
                            </div>
                          ))
                            : loading ?
                              <div className='h-[100px] items-center z-0 flex justify-center'>
                                <h3 className='text-white text-xl'><ButtonLoading /></h3>
                              </div> :
                              <div className='h-[100px] flex justify-center items-center w-full '>
                                <h3 className='text-white text-xl'>No Result</h3>
                              </div>
                        }
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
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
                    <SelectWithLabel label='Type of Event' name='event_type_id' placeholder='Enter Type of Event' option={eventTypes.data} />
                    <TimeWithLabel
                      name='start_time'
                      label='Start Time'
                      placeholder='Select Start Time'
                      suffix={
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z'
                            stroke='#F5F5F5'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                          <path
                            d='M15.7099 15.18L12.6099 13.33C12.0699 13.01 11.6299 12.24 11.6299 11.61V7.51001'
                            stroke='#F5F5F5'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                      }
                    />
                    <div>
                      <TimeWithLabel
                        name='end_time'
                        label='End Time'
                        placeholder='Select End Time'
                        suffix={
                          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                              d='M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z'
                              stroke='#F5F5F5'
                              strokeWidth='1.5'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                            <path
                              d='M15.7099 15.18L12.6099 13.33C12.0699 13.01 11.6299 12.24 11.6299 11.61V7.51001'
                              stroke='#F5F5F5'
                              strokeWidth='1.5'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        }
                      />
                      <div className='flex justify-end px-3 pt-2'>
                        <button onClick={() => {
                          eventForm.setValue('end_time', '')
                        }} type='button' className='text-[#F5F5F5] uppercase text-sm'>clear</button>
                      </div>
                    </div>
                    <InputWithLabel label='Dress Code' name='dress_code' placeholder='Enter Dress Code' />
                    <InputWithLabel label='Total Seat' name='total_seat' placeholder='Enter Total Seat' />
                  </div>
                  <div>
                    <SelectWithLabel label='Event Category' name='type' placeholder='Event Category' option={eventCategoryOptions} />
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-medium text-lg dark:text-text_main'>Location</Label>
                    <AsyncSelect
                      cacheOptions
                      styles={{
                        control: baseStyle => ({
                          ...baseStyle,
                          ':hover': { borderColor: 'white', boxShadow: '0 0 0 1px white' },
                          boxShadow: '0 0 0 1px transparent',
                          padding: '9px 6px',
                          borderRadius: '12px',
                          background: '#161616',
                          border: 'transparent'
                        }),
                        input: baseStyle => ({ ...baseStyle, color: '#888', overflowX: 'hidden' }),
                        menu: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' }),
                        singleValue: baseStyle => ({ ...baseStyle, color: '#888' }),
                        noOptionsMessage: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#888' }),
                        option: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' })
                      }}
                      defaultOptions={
                        DIALOG_MODE.edit === search.mode
                          ? [
                            {
                              label: data?.location,
                              value: { lat: data?.lat, lng: data?.lng }
                            }
                          ]
                          : []
                      }
                      loadOptions={placesOption}
                      placeholder='Search location'
                      inputValue={searchPlaces}
                      onInputChange={e => setSearchPlaces(e)}
                      onChange={e => {
                        const {
                          label,
                          value: { lat, lng, city }
                        } = e;
                        eventForm.setValue('location', label, { shouldDirty: true, shouldValidate: true });
                        eventForm.setValue('city', city, { shouldDirty: true, shouldValidate: true });
                        eventForm.setValue('lat', lat, { shouldDirty: true, shouldValidate: true });
                        eventForm.setValue('lng', lng, { shouldDirty: true, shouldValidate: true });
                      }}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-medium text-lg dark:text-text_main'>Event Address</Label>
                    <AsyncSelect
                      cacheOptions
                      styles={{
                        control: baseStyle => ({
                          ...baseStyle,
                          ':hover': { borderColor: 'white', boxShadow: '0 0 0 1px white' },
                          boxShadow: '0 0 0 1px transparent',
                          padding: '9px 6px',
                          borderRadius: '12px',
                          background: '#161616',
                          border: 'transparent'
                        }),
                        input: baseStyle => ({ ...baseStyle, color: '#888', overflowX: 'hidden' }),
                        menu: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' }),
                        singleValue: baseStyle => ({ ...baseStyle, color: '#888' }),
                        noOptionsMessage: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#888' }),
                        option: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' })
                      }}
                      defaultOptions={
                        DIALOG_MODE.edit === search.mode
                          ? [
                            {
                              label: data?.event_address,
                              value: { lat: data?.event_lat, lng: data?.event_lng }
                            }
                          ]
                          : []
                      }
                      loadOptions={addressOption}
                      placeholder='Search address'
                      inputValue={searchAddress}
                      onInputChange={e => setSearchAddress(e)}
                      onChange={e => {
                        const {
                          label,
                          value: { lat, lng, address }
                        } = e;

                        eventForm.setValue('event_address', address, { shouldDirty: true, shouldValidate: true });
                        eventForm.setValue('event_lat', lat, { shouldDirty: true, shouldValidate: true });
                        eventForm.setValue('event_lng', lng, { shouldDirty: true, shouldValidate: true });
                      }}
                    />
                  </div>
                  <InputTag label='Where' name='where_tag' placeholder='Enter Where Tag' setRemovedTagIds={setRemovedTagIds} />

                  <InputTag name="keywords" label="Event Keywords" placeholder='Enter Keywords' setRemovedTagIds={setRemovedKewordsIds} />
                  <InputTag name="tags" label="Event Tags" placeholder='Enter Tags' setRemovedTagIds={setRemovedTagsIds} />

                  <div className='space-y-0.5'>
                    <ReactQuill
                      theme='snow'
                      className={cn('dark:text-white', eventForm.formState.errors.rules?.message ? 'border-red-500 dark:text-red-500' : '')}
                      value={eventForm.watch('rules')}
                      onChange={e => eventForm.setValue('rules', e, { shouldDirty: true, shouldValidate: true })}
                      placeholder='Enter Event Rules'
                    />
                    {eventForm.formState.errors.rules && (
                      <p className='text-red-500 dark:text-red-600 ml-3 md:ml-4 text-[12px] font-semibold'>{eventForm.formState.errors.rules.message}</p>
                    )}
                  </div>
                  <div className='space-y-0.5'>
                    <ReactQuill
                      theme='snow'
                      className={cn('dark:text-white', eventForm.formState.errors.offer_for_influencers?.message ? 'border-red-500 dark:text-red-500' : '')}
                      value={eventForm.watch('offer_for_influencers')}
                      onChange={e => eventForm.setValue('offer_for_influencers', e, { shouldDirty: true, shouldValidate: true })}
                      placeholder='Enter Offer for Influencers'
                    />
                    {eventForm.formState.errors.offer_for_influencers && (
                      <p className='text-red-500 dark:text-red-600 ml-3 md:ml-4 text-[12px] font-semibold'>
                        {eventForm.formState.errors.offer_for_influencers.message}
                      </p>
                    )}
                  </div>
                  <div className='grid grid-cols-2 gap-x-4'>
                    <div className='space-y-6'>
                      <InputWithLabel
                        name='google_review_title'
                        label='Label(Google Reviews)'
                        placeholder='Enter Label'
                      />
                      <InputWithLabel
                        name='google_review'
                        placeholder='Enter Link'
                        suffix={
                          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                              d='M17.47 11.293C17.3745 11.3852 17.2983 11.4956 17.2459 11.6176C17.1935 11.7396 17.1659 11.8708 17.1647 12.0036C17.1636 12.1364 17.1889 12.268 17.2392 12.3909C17.2894 12.5138 17.3637 12.6255 17.4576 12.7194C17.5515 12.8133 17.6631 12.8875 17.786 12.9378C17.9089 12.9881 18.0406 13.0134 18.1734 13.0122C18.3062 13.0111 18.4374 12.9835 18.5594 12.9311C18.6814 12.8787 18.7917 12.8025 18.884 12.707L20.428 11.163C21.4156 10.1524 21.965 8.79322 21.9569 7.38021C21.9488 5.96721 21.3839 4.61438 20.3847 3.61522C19.3856 2.61606 18.0327 2.05115 16.6197 2.04306C15.2067 2.03496 13.8475 2.58433 12.837 3.57197L11.293 5.11597C11.1975 5.20822 11.1213 5.31857 11.0689 5.44057C11.0165 5.56257 10.9889 5.69379 10.9877 5.82657C10.9866 5.95935 11.0119 6.09103 11.0622 6.21393C11.1124 6.33682 11.1867 6.44848 11.2806 6.54237C11.3745 6.63626 11.4861 6.71052 11.609 6.7608C11.7319 6.81108 11.8636 6.83638 11.9964 6.83523C12.1292 6.83407 12.2604 6.80649 12.3824 6.75408C12.5044 6.70167 12.6147 6.62548 12.707 6.52997L14.251 4.98597C14.5631 4.67042 14.9345 4.41967 15.3439 4.24813C15.7532 4.0766 16.1924 3.98767 16.6363 3.98646C17.0801 3.98524 17.5198 4.07177 17.9301 4.24106C18.3404 4.41035 18.7132 4.65907 19.027 4.97291C19.3409 5.28675 19.5896 5.65954 19.7589 6.06983C19.9282 6.48011 20.0147 6.91982 20.0135 7.36366C20.0123 7.8075 19.9233 8.24672 19.7518 8.65608C19.5803 9.06544 19.3295 9.43685 19.014 9.74897L17.47 11.293ZM6.52997 12.707C6.62548 12.6147 6.70167 12.5044 6.75408 12.3824C6.80649 12.2604 6.83407 12.1292 6.83523 11.9964C6.83638 11.8636 6.81108 11.7319 6.7608 11.609C6.71052 11.4861 6.63626 11.3745 6.54237 11.2806C6.44848 11.1867 6.33682 11.1124 6.21393 11.0622C6.09103 11.0119 5.95935 10.9866 5.82657 10.9877C5.69379 10.9889 5.56257 11.0165 5.44057 11.0689C5.31857 11.1213 5.20822 11.1975 5.11597 11.293L3.57197 12.837C2.58433 13.8475 2.03496 15.2067 2.04306 16.6197C2.05115 18.0327 2.61606 19.3856 3.61522 20.3847C4.61438 21.3839 5.96721 21.9488 7.38021 21.9569C8.79322 21.965 10.1524 21.4156 11.163 20.428L12.707 18.884C12.8891 18.6954 12.9899 18.4428 12.9876 18.1806C12.9854 17.9184 12.8802 17.6676 12.6948 17.4822C12.5094 17.2967 12.2586 17.1916 11.9964 17.1893C11.7342 17.187 11.4816 17.2878 11.293 17.47L9.74897 19.014C9.11618 19.6399 8.26134 19.9899 7.37129 19.9874C6.48124 19.985 5.62833 19.6303 4.99897 19.001C4.3696 18.3716 4.01495 17.5187 4.01252 16.6287C4.01008 15.7386 4.36006 14.8838 4.98597 14.251L6.52997 12.707Z'
                              fill='#F5F5F5'
                            />
                            <path
                              d='M8.20545 15.7999C8.39298 15.9874 8.64729 16.0927 8.91245 16.0927C9.17761 16.0927 9.43192 15.9874 9.61945 15.7999L15.8005 9.61895C15.896 9.5267 15.9721 9.41635 16.0246 9.29435C16.077 9.17235 16.1045 9.04113 16.1057 8.90835C16.1069 8.77557 16.0816 8.64389 16.0313 8.52099C15.981 8.3981 15.9067 8.28644 15.8128 8.19255C15.719 8.09866 15.6073 8.02441 15.4844 7.97412C15.3615 7.92384 15.2298 7.89854 15.097 7.8997C14.9643 7.90085 14.833 7.92844 14.711 7.98084C14.589 8.03325 14.4787 8.10944 14.3865 8.20495L8.20545 14.3809C8.11187 14.4739 8.03761 14.5844 7.98693 14.7062C7.93625 14.828 7.91016 14.9586 7.91016 15.0904C7.91016 15.2223 7.93625 15.3529 7.98693 15.4747C8.03761 15.5965 8.11187 15.707 8.20545 15.7999Z'
                              fill='#F5F5F5'
                            />
                          </svg>
                        }
                      />
                    </div>

                    <div className='space-y-6'>
                      <InputWithLabel
                        name='trip_advisor_title'
                        label='Label(Tripadvisor / Yelp)'
                        placeholder='Enter Label'
                      />
                      <InputWithLabel
                        name='trip_advisor'
                        placeholder='Enter Link'
                        suffix={
                          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                              d='M17.47 11.293C17.3745 11.3852 17.2983 11.4956 17.2459 11.6176C17.1935 11.7396 17.1659 11.8708 17.1647 12.0036C17.1636 12.1364 17.1889 12.268 17.2392 12.3909C17.2894 12.5138 17.3637 12.6255 17.4576 12.7194C17.5515 12.8133 17.6631 12.8875 17.786 12.9378C17.9089 12.9881 18.0406 13.0134 18.1734 13.0122C18.3062 13.0111 18.4374 12.9835 18.5594 12.9311C18.6814 12.8787 18.7917 12.8025 18.884 12.707L20.428 11.163C21.4156 10.1524 21.965 8.79322 21.9569 7.38021C21.9488 5.96721 21.3839 4.61438 20.3847 3.61522C19.3856 2.61606 18.0327 2.05115 16.6197 2.04306C15.2067 2.03496 13.8475 2.58433 12.837 3.57197L11.293 5.11597C11.1975 5.20822 11.1213 5.31857 11.0689 5.44057C11.0165 5.56257 10.9889 5.69379 10.9877 5.82657C10.9866 5.95935 11.0119 6.09103 11.0622 6.21393C11.1124 6.33682 11.1867 6.44848 11.2806 6.54237C11.3745 6.63626 11.4861 6.71052 11.609 6.7608C11.7319 6.81108 11.8636 6.83638 11.9964 6.83523C12.1292 6.83407 12.2604 6.80649 12.3824 6.75408C12.5044 6.70167 12.6147 6.62548 12.707 6.52997L14.251 4.98597C14.5631 4.67042 14.9345 4.41967 15.3439 4.24813C15.7532 4.0766 16.1924 3.98767 16.6363 3.98646C17.0801 3.98524 17.5198 4.07177 17.9301 4.24106C18.3404 4.41035 18.7132 4.65907 19.027 4.97291C19.3409 5.28675 19.5896 5.65954 19.7589 6.06983C19.9282 6.48011 20.0147 6.91982 20.0135 7.36366C20.0123 7.8075 19.9233 8.24672 19.7518 8.65608C19.5803 9.06544 19.3295 9.43685 19.014 9.74897L17.47 11.293ZM6.52997 12.707C6.62548 12.6147 6.70167 12.5044 6.75408 12.3824C6.80649 12.2604 6.83407 12.1292 6.83523 11.9964C6.83638 11.8636 6.81108 11.7319 6.7608 11.609C6.71052 11.4861 6.63626 11.3745 6.54237 11.2806C6.44848 11.1867 6.33682 11.1124 6.21393 11.0622C6.09103 11.0119 5.95935 10.9866 5.82657 10.9877C5.69379 10.9889 5.56257 11.0165 5.44057 11.0689C5.31857 11.1213 5.20822 11.1975 5.11597 11.293L3.57197 12.837C2.58433 13.8475 2.03496 15.2067 2.04306 16.6197C2.05115 18.0327 2.61606 19.3856 3.61522 20.3847C4.61438 21.3839 5.96721 21.9488 7.38021 21.9569C8.79322 21.965 10.1524 21.4156 11.163 20.428L12.707 18.884C12.8891 18.6954 12.9899 18.4428 12.9876 18.1806C12.9854 17.9184 12.8802 17.6676 12.6948 17.4822C12.5094 17.2967 12.2586 17.1916 11.9964 17.1893C11.7342 17.187 11.4816 17.2878 11.293 17.47L9.74897 19.014C9.11618 19.6399 8.26134 19.9899 7.37129 19.9874C6.48124 19.985 5.62833 19.6303 4.99897 19.001C4.3696 18.3716 4.01495 17.5187 4.01252 16.6287C4.01008 15.7386 4.36006 14.8838 4.98597 14.251L6.52997 12.707Z'
                              fill='#F5F5F5'
                            />
                            <path
                              d='M8.20545 15.7999C8.39298 15.9874 8.64729 16.0927 8.91245 16.0927C9.17761 16.0927 9.43192 15.9874 9.61945 15.7999L15.8005 9.61895C15.896 9.5267 15.9721 9.41635 16.0246 9.29435C16.077 9.17235 16.1045 9.04113 16.1057 8.90835C16.1069 8.77557 16.0816 8.64389 16.0313 8.52099C15.981 8.3981 15.9067 8.28644 15.8128 8.19255C15.719 8.09866 15.6073 8.02441 15.4844 7.97412C15.3615 7.92384 15.2298 7.89854 15.097 7.8997C14.9643 7.90085 14.833 7.92844 14.711 7.98084C14.589 8.03325 14.4787 8.10944 14.3865 8.20495L8.20545 14.3809C8.11187 14.4739 8.03761 14.5844 7.98693 14.7062C7.93625 14.828 7.91016 14.9586 7.91016 15.0904C7.91016 15.2223 7.93625 15.3529 7.98693 15.4747C8.03761 15.5965 8.11187 15.707 8.20545 15.7999Z'
                              fill='#F5F5F5'
                            />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className='px-6 flex flex-col gap-x-4'>
                <Separator className='dark:bg-[#34363A]' />
                <div className='py-4 flex items-center gap-x-4'>
                  <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Cancel</DialogClose>
                  <Button
                    type='submit'
                    className='w-full py-3 rounded-[10px] text-xl'
          
                  // disabled={
                  //   search.mode === DIALOG_MODE.add
                  //     ? getObjLength(eventForm.formState.dirtyFields) !== getObjLength(defaultValues) || isPending
                  //     : !eventForm.formState.isDirty || isPending
                  // }
                  >
                    {search.mode === DIALOG_MODE.add ? 'Add' : 'Update'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Event;
