
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import Zoom from 'react-medium-image-zoom'
import "react-medium-image-zoom/dist/styles.css";

const Profile = ({ data, setData }) => {

  const onClose = () => {
    setData({
      open: false,
      data: null
    })
  }

  return (
    <Dialog open={data.open} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}

        className='max-w-[800px] main-notify-dialog max-h-[80vh] overflow-auto p-6 gap-0  rounded-2xl'>

        <DialogHeader className='my-6 gap-y-1 text-center'>
          <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>Profile Image</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <div className='flex justify-center  flex-wrap'>
            {
              data.data?.map((item, index) => {
                return (
                  <div className='p-5 flex justify-center' key={index}>
                    <a target='_blank' href={item.profile}>
                      <img className='w-[250px] h-[250px] object-contain' src={item.profile} alt="" />
                    </a>
                  </div>
                )
              })
            }
          </div>
        </div>
        <DialogFooter className='xs:mt-4 gap-y-4 md:gap-x-4'>
          <DialogClose className='w-max py-3 px-5 rounded-[10px] text-xl dark:text-white dark:bg-input_bg'>Close</DialogClose>
          {/* <Button type='submit' className='w-full py-3 rounded-[10px] text-xl font-semibold' onClick={onConfirm}>
            {footer.confirm}
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
