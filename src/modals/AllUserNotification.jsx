
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Form } from '../components/ui/form';
import { Separator } from '../components/ui/separator';
import { GETUSERCITYLIST, SEND_ALL_NOTIFICATION, SENDNOTIFYFROMREVIEW } from '@/lib/endpoint';
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
import Loader from '@/components/common/Loader';
import SelectWithLabel from '@/components/common/SelectWithLabel';
import ReactSelect from 'react-select';
import { Label } from '@/components/ui/label';

const AllUserNotification = ({ data: modalData, setData }) => {
  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);
  const { privateAxios } = useAxios();
  const [userCityList, setUserCityList] = useState([])
  const [loading, setLoading] = useState(false)
  const [cityFilter, setCityFilter] = useState([])
  const [followerFilter, setFollwerFilter] = useState([])
  const defaultValues = useMemo(() => ({
    title: '',
    message: ''
  }), [])
  const notifyForm = useForm({
    defaultValues,
    resolver: zodResolver(notifySchema),
  });
  const followerOptions = [
    
    {
      value: 'less_than_10k',
      label: 'Less than 10k'
    },
    {
      value: '10k_25k',
      label: '10k-25k'
    },
    {
      value: '25k_100k',
      label: '25k-100k'
    },
    {
      value: '100k_plus',
      label: 'More than 100k'
    }
  ]
  const onClose = () => {

    setData({
      data: null,
      open: false
    })
    setCityFilter([])
    setFollwerFilter([])
    notifyForm.reset(defaultValues)

  };

  const sendNotify = async (values) => {
    try {
      setLoading(true)
      const data = await privateAxios({
        url: SEND_ALL_NOTIFICATION,
        data: values
      })
      toast.success(data.ResponseMsg)
      setLoading(false)
      onClose()
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }
  const getCity = async () => {
    try {
      const data = await privateAxios({
        url: GETUSERCITYLIST,
        data: {

        }

      })
      setUserCityList(
        [
          ...data.data.map((item, index) => ({
            value: item,
            label: item
          }))
        ]
      )
    } catch (error) {
      setUserCityList([])
    }
  }

  useEffect(() => {
    getCity()
  }, [])
  const onSubmit1 = values => {
    const { ...updatedValues } = values;

    sendNotify({
      ...updatedValues,
      admin_id,
      ...(cityFilter?.length  > 0 && {
        city_of_residence: cityFilter.map(item => item.value).join(',')
      }),
      ...(followerFilter?.length > 0 && {
        account_with: followerFilter.map(item => item.value).join(',')
      })
      //user_ids: modalData.data.join(',')

    })
  };

  return (
    <>
      {loading && <Loader />}
      <Dialog open={modalData.open} onOpenChange={onClose}>

        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-2xl max-h-[90vh] main-notify-dialog overflow-auto p-0 pb-5 gap-0 rounded-2xl '>
          <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
            <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
              Send Notification to All user
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
                {/* <SelectWithLabel label='User Location' name='city_of_residence' placeholder='Select city' option={userCityList} /> */}
                <div className='space-y-3'>
                  <Label className='font-medium text-[17px] dark:text-text_main'>User City</Label>
                  <ReactSelect
                    styles={{
                      control: baseStyle => ({
                        ...baseStyle,
                        ':hover': { borderColor: 'transparent', boxShadow: 'none' },
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
                      option: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' }),
                      multiValue: (provided) => ({
                        ...provided,
                        background: '#26282c',
                        color: 'white',
                        borderRadius: '4px',
                        columnGap: '2px'

                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: 'white',
                        paddingLeft: '10px'
                        // fontWeight: 'bold',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        // color: '#3B82F6',
                        paddingRight: '5px',
                        ':hover': {
                          backgroundColor: 'transparent',
                          color: 'white',
                        },
                      }),
                    }}
                    isMulti
                    options={userCityList}
                    placeholder='Select City'
                    onChange={(e) => {
                      setCityFilter(e)
                    }}
                  />
                </div>
                <div className='space-y-3'>
                  <Label className='font-medium text-[17px] dark:text-text_main'>Follower</Label>
                  <ReactSelect
                    styles={{
                      control: baseStyle => ({
                        ...baseStyle,
                        ':hover': { borderColor: 'transparent', boxShadow: 'none' },
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
                      option: baseStyle => ({ ...baseStyle, backgroundColor: '#2D2D2B', color: '#fff' }),
                      multiValue: (provided) => ({
                        ...provided,
                        background: '#26282c',
                        color: 'white',
                        borderRadius: '4px',
                        columnGap: '2px'

                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: 'white',
                        paddingLeft: '10px'
                        // fontWeight: 'bold',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        // color: '#3B82F6',
                        paddingRight: '5px',
                        ':hover': {
                          backgroundColor: 'transparent',
                          color: 'white',
                        },
                      }),
                    }}
                    isMulti
                    options={followerOptions}
                    placeholder='Select Follower'
                    onChange={(e) => {
                      setFollwerFilter(e)
                    }}
                  />
                </div>
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

    </>
  );
};

export default AllUserNotification;
