import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { ATTENDED_USER, SENDNOTIFYFROMREVIEW } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { ADMIN_COOKIE } from '@/lib/constant';
import { useEffect, useMemo, useState } from 'react';
import { faker } from '@faker-js/faker';
import ButtonLoading from '@/components/common/ButtonLoading';
import { Trash2 } from 'lucide-react';
import RemoveUserFromEvent from './RemoveUserFromEvent';

const EventUser = ({ data: modalData, setData }) => {
  const [loading, setLoading] = useState(false)
  const [removeUserModal, setRemoveUserModal] = useState({
    open: false,
    data: null
  })
  const admin = Cookies.get(ADMIN_COOKIE);
  const { admin_id } = JSON.parse(admin);
  const { privateAxios } = useAxios();
  // const userData = useMemo(() => (
  //   [
  //     ...Array.from({ length: 5 }).map(() => (
  //       {
  //         fname: faker.person.firstName(),
  //         lname: faker.person.lastName(),
  //         profile: faker.image.avatar()

  //       }
  //     ))
  //   ]
  // ), [modalData.open])
  const [userData, setUserData] = useState([])
  const onClose = () => {
    setData({
      data: null,
      open: false
    })
  };

  useEffect(() => {
    if (modalData.data) {
      getUserList()
    }
  }, [modalData.open])

  const getUserList = async (values) => {
    try {
      setLoading(true)
      const data = await privateAxios({
        url: ATTENDED_USER,
        data: {
          admin_id: admin_id,
          event_id: modalData.data,
          page:1,
          limit:10000
        }
      })
      setUserData(data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }


  return (
    <>
      <Dialog open={modalData.open} onOpenChange={onClose}>

        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-xl max-h-[90vh] main-notify-dialog overflow-auto pt-0 px-4 pb-0 gap-0 rounded-2xl '>
          <DialogHeader className='p-6 pb-0 mb-4 space-y-0 relative'>
            <DialogTitle className='mb-4 text-2xl text-center dark:text-white'>
              Joined User
            </DialogTitle>
            <Separator className='dark:bg-[#34363A]' />
          </DialogHeader>
          <div className='space-y-4'>
            <div className='max-h-[400px] main-notify-dialog overflow-auto'>
              {
                userData?.length > 0 && !loading ? userData.map((user, index) => (
                  <div className='flex justify-between border-t border-[#34363A] gap-x-5 py-5 items-center' key={index}>

                    <div className='flex gap-5 items-center'>
                      <div>
                        <img className='w-[50px] h-[50px] rounded' src={user.single_profile} alt="" />
                      </div>
                      <div>
                        <p className='text-white text-lg'>{user.fname} {user.lname} -  <a target='_blank' href={`https://www.instagram.com/${user?.instagram_username}`} className='underline ml-2'>{user?.instagram_username}</a></p>
                      </div>
                    </div>
                    <button className='mr-4' type='button' onClick={() => {
                      setRemoveUserModal({
                        open: true,
                        data: {
                          user_id: user.user_id,
                          event_id: modalData.data
                        }
                      })
                    }}>
                      <Trash2 size={18} color='white' />
                    </button>
                  </div>
                ))
                  : loading ?
                    <div className='h-[100px] items-center z-0 flex justify-center'>
                      <h3 className='text-white text-xl'><ButtonLoading /></h3>
                    </div> :
                    <div className='h-[100px] flex justify-center items-center w-full '>
                      <h3 className='text-white text-xl'>No one join this event</h3>
                    </div>
              }
            </div>
            <div className='flex flex-col gap-x-4'>
              <Separator className='dark:bg-[#34363A]' />
              <div className='py-4 flex justify-end items-center gap-x-4'>
                <DialogClose className='w-max py-3 px-5 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Close</DialogClose>

              </div>
            </div>
          </div>
        </DialogContent>

      </Dialog>
      <RemoveUserFromEvent refetch={getUserList} data={removeUserModal} setData={setRemoveUserModal} />
    </>
  );
};

export default EventUser;
