
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form } from '../components/ui/form';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { default as ReactSelect, components } from "react-select";
import { Icon } from '@iconify/react';
import { GETUSERCITYLIST, GETUSERFORNOTIFY, SENDNOTIFYTOUSER } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import InputWithLabel from '@/components/common/InputWithLabel';
import FilterBox from '@/components/common/FilterBox';
import { AGE_ICON, CITY_ICON, FOLLOWER_ICON, GENDER_ICON } from '@/lib/images';
import { getValidKeysString, removeNull, toNumArray } from '@/lib/helper';
import { notify as notifySchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { toFormData } from 'axios';
import Cookies from 'js-cookie';
import { ADMIN_COOKIE } from '@/lib/constant';
import ButtonLoading from '@/components/common/ButtonLoading';

const Notification = ({ data: modalData, setData }) => {
  const [tmp,setTmp]=useState(false)
  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);
  const { privateAxios } = useAxios();
  const [userCityList, setUserCityList] = useState([])
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState([])
  const [allSelected, setAllSelected] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const handleCheckboxChange = (event, userId) => {
    if (event.target.checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };
  const filterForm = useForm({

  });
  useEffect(() => {
    setSelectedUserIds([])
  }, [modalData.open])
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

  const ageOptions = [
    { value: '18-29', label: '18-29' },
    { value: '30-39', label: '30-39' },
    { value: '40-49', label: '40-49' },
    { value: '50-120', label: '50 or more' },
  ];
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];
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
  const ageWatch = filterForm.watch('age')
  const genderWatch = filterForm.watch('gender')
  const followerWatch = filterForm.watch('followers')
  const cityWatch = filterForm.watch('city_of_residence')
  useEffect(() => {
    if (allSelected) {
      setSelectedUserIds(userData.map(user => user.user_id));
    } else {
      setSelectedUserIds([]);
    }
  }, [allSelected, userData]);
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
  useEffect(() => {
    if (ageWatch || genderWatch || followerWatch || cityWatch) {
      getUserList({
        age: getValidKeysString(removeNull(ageWatch)),
        city_of_residence: getValidKeysString(removeNull(cityWatch)),
        followers: getValidKeysString(removeNull(followerWatch)),
        gender: getValidKeysString(removeNull(genderWatch))
      })
    }
  }, [
    JSON.stringify(ageWatch),
    JSON.stringify(genderWatch),
    JSON.stringify(followerWatch),
    JSON.stringify(cityWatch)
  ])
  useEffect(() => {
    getUserList({})
  }, [])

  const onSubmit = values => {

  };
  const getCity = async () => {
    try {
      const data = await privateAxios({
        url: GETUSERCITYLIST,
        data: {

        }

      })
      setUserCityList(data.data.map((item, index) => ({
        value: item,
        label: item
      })))
    } catch (error) {

    }
  }
  const sendNotify = async (values) => {
   
    try {

      const data = await privateAxios({
        url: SENDNOTIFYTOUSER,
        data: toFormData({ ...values })
      })
      toast.success(data.ResponseMsg)

    } catch (error) {

    }
  }
  const onSubmit1 = values => {
    if (selectedUserIds?.length > 0) {
      sendNotify({
        ...values,
        notify_user_ids: JSON.stringify(toNumArray(selectedUserIds)),
        admin_id,
        event_id: modalData.data?.event_id
      })
      onClose()
    } else {
      toast.error('Select minimum one user')
    }
  };
  useEffect(() => {
    getCity()
  }, [])
  return (
    <Dialog open={modalData.open} onOpenChange={onClose}>

      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-2xl max-h-[90vh] main-notify-dialog overflow-auto p-0 pb-5 gap-0 rounded-2xl '>
        <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
          <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
            Notification
          </DialogTitle>
          <Separator className='dark:bg-[#34363A]' />
        </DialogHeader>
        <div>
          <Form {...filterForm}>
            <form noValidate onSubmit={filterForm.handleSubmit(onSubmit)} className='h-full pt-0 flex flex-col gap-y-4 overflow-hidden'>

              <div className='px-5'>
                <div className='p-1 space-y-7'>
                  <div className='flex gap-x-6 items-center'>
                    <FilterBox
                      icon={<img className='w-4' src={AGE_ICON} />}
                      name="age"
                      label="Age"
                      options={ageOptions}
                    />
                    <FilterBox
                      icon={<img className='w-4' src={GENDER_ICON} />}
                      name="gender"
                      label="Gender"
                      options={genderOptions}
                    />
                    <FilterBox
                      icon={<img className='w-4' src={CITY_ICON} />}
                      name="city_of_residence"
                      label="Nationality"
                      options={userCityList}
                    />
                    <FilterBox
                      icon={<img className='w-4' src={FOLLOWER_ICON} />}
                      name="followers"
                      label="Follower"
                      options={followerOptions}
                      className="min-w-[300px]"
                    />
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='text-white text-xl'>User Detail</p>
                    <div>
                      <div className='flex gap-x-4 items-center'>
                        <div>
                          <input value={allSelected} onChange={(e) => setAllSelected(e.target.checked)} id='all_selected' className='hidden' type="checkbox" />
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

            </form>
          </Form>
        </div>
        <Form {...notifyForm}>
          <form noValidate className='px-5 mt-5' onSubmit={notifyForm.handleSubmit(onSubmit1)} action="">
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between items-center'>
                  <p className='text-white text-xl'>Notification Detail</p>
                </div>
              </div>
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

export default Notification;
