
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import "react-medium-image-zoom/dist/styles.css";

const Referal = ({ data, setData }) => {

  const onClose = () => {
    setData({
      open: false,
      data: null
    })
  }
 
  return (
    <Dialog open={data.open} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}

        className='max-w-[700px] main-notify-dialog max-h-[80vh] overflow-auto p-6 gap-0  rounded-2xl'>

        <DialogHeader className='my-6 gap-y-1 text-center'>
          <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>Refer Details</DialogTitle>
        </DialogHeader>
        <div className='py-4 space-y-3 flex flex-wrap'>
            <div className='w-1/2 flex items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Name : </p>
              <p className='text-wrap text-lg text-white'>{data.data?.fname} {data.data?.lname}</p>
            </div>
            <div className='w-1/2 flex items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Refer By : </p>
              <p className='text-wrap text-lg text-white'>{data.data?.user_dtl?.fname} {data.data?.user_dtl?.lname}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Phone : </p>
              <p className='text-wrap text-lg text-white'>{data.data?.phone}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Email : </p>
              <p className='text-wrap text-lg text-white'>{data.data?.email}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Buisness Name: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.name_of_business}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Buisness Type: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.type_of_business}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Buisness Location: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.business_location}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Contact Name: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.contact_name}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Contact Email: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.contact_email}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Contact Number: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.contact_number}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Contact Number: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.contact_number}</p>
            </div>
            <div className='flex w-1/2 items-center gap-x-3'>
              <p className='text-wrap text-lg text-white'>Additional Info: </p>
              <p className='text-wrap text-lg text-white'>{data.data?.additiona_info}</p>
            </div>
            
        </div>
        <DialogFooter className='pt-4 gap-y-4 md:gap-x-4'>
          <DialogClose className='w-max py-2 px-5 rounded-[10px] text-lg dark:text-white dark:bg-input_bg'>Close</DialogClose>
         
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Referal;
