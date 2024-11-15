import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DELETE_REVIEW, REMOVEUSERFROMREVIEW } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import Loader from '@/components/common/Loader';
import { toast } from 'react-toastify';

const RemoveUser = ({ data, setData, refetch }) => {
  const { privateAxios } = useAxios()
  const onClose = () => {
    setData({
      open: false,
      data: null
    })
  }

  const { mutate, isPending } = useMutation({
    mutationKey: [DELETE_REVIEW],
    mutationFn: data => privateAxios({ url: DELETE_REVIEW, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        onClose()
        toast.success(res.ResponseMsg);
      }
    }
  });
  const removeUserHandler = () => {
    mutate({
      accept_event_id: data.data?.accept_event_id
    })
  }
  return (
    <>
      {isPending && data.open && <Loader />}
      <Dialog open={data.open} onOpenChange={onClose}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-xl p-6 gap-0 overflow-hidden rounded-2xl'>
          <div className='size-[120px] mx-auto my-4 flex justify-center items-center ring-[10px] dark:ring-white/10 rounded-full'>
            {/* <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.4781 27.9994C27.9009 27.9994 30.2693 27.2809 32.2838 25.9349C34.2983 24.5889 35.8684 22.6757 36.7956 20.4373C37.7227 18.1989 37.9653 15.7358 37.4927 13.3595C37.02 10.9833 35.8533 8.80053 34.1401 7.08734C32.4269 5.37414 30.2442 4.20744 27.8679 3.73478C25.4916 3.26211 23.0286 3.5047 20.7902 4.43187C18.5518 5.35904 16.6386 6.92916 15.2925 8.94366C13.9465 10.9582 13.2281 13.3266 13.2281 15.7494C13.2318 18.9972 14.5236 22.1108 16.8201 24.4074C19.1166 26.7039 22.2303 27.9957 25.4781 27.9994ZM25.4781 6.9994C27.2086 6.9994 28.9004 7.51257 30.3393 8.47404C31.7782 9.4355 32.8997 10.8021 33.562 12.4009C34.2243 13.9998 34.3975 15.7591 34.0599 17.4564C33.7223 19.1538 32.8889 20.7129 31.6652 21.9366C30.4415 23.1603 28.8824 23.9936 27.1851 24.3313C25.4878 24.6689 23.7284 24.4956 22.1296 23.8333C20.5307 23.1711 19.1642 22.0496 18.2027 20.6106C17.2412 19.1717 16.7281 17.48 16.7281 15.7494C16.7308 13.4296 17.6536 11.2056 19.2939 9.56528C20.9343 7.92494 23.1583 7.00217 25.4781 6.9994ZM46.2103 43.7494L49.9238 40.0376C50.2426 39.7076 50.419 39.2655 50.415 38.8067C50.411 38.3479 50.2269 37.9089 49.9025 37.5845C49.578 37.26 49.1391 37.076 48.6803 37.072C48.2214 37.068 47.7794 37.2444 47.4493 37.5631L43.7358 41.2749L40.0223 37.5631C39.6922 37.2444 39.2502 37.068 38.7913 37.072C38.3325 37.076 37.8936 37.26 37.5691 37.5845C37.2447 37.9089 37.0606 38.3479 37.0566 38.8067C37.0526 39.2655 37.229 39.7076 37.5478 40.0376L41.2613 43.7494L37.5478 47.4612C37.3807 47.6226 37.2473 47.8157 37.1556 48.0292C37.0639 48.2427 37.0156 48.4723 37.0136 48.7047C37.0116 48.9371 37.0559 49.1675 37.1439 49.3826C37.2319 49.5976 37.3618 49.793 37.5261 49.9573C37.6904 50.1217 37.8858 50.2516 38.1009 50.3396C38.3159 50.4276 38.5464 50.4719 38.7788 50.4698C39.0111 50.4678 39.2407 50.4195 39.4543 50.3278C39.6678 50.2361 39.8609 50.1028 40.0223 49.9356L43.7358 46.2239L47.4493 49.9356C47.7794 50.2544 48.2214 50.4308 48.6803 50.4268C49.1391 50.4228 49.578 50.2388 49.9025 49.9143C50.2269 49.5899 50.411 49.1509 50.415 48.6921C50.419 48.2333 50.2426 47.7912 49.9238 47.4612L46.2103 43.7494ZM33.2358 48.9994H8.7708C8.48444 49.0011 8.20184 48.9341 7.94669 48.8041C7.69153 48.6741 7.47125 48.4848 7.3043 48.2521C7.15016 48.0501 7.04721 47.8137 7.00424 47.5632C6.96128 47.3127 6.97956 47.0555 7.05755 46.8136C7.90528 44.3221 9.24875 42.028 11.007 40.0697C12.7652 38.1114 14.9018 36.5293 17.288 35.419C19.6741 34.3087 22.2604 33.693 24.8908 33.6092C27.5213 33.5254 30.1415 33.975 32.5935 34.9311C33.0254 35.1015 33.5073 35.0933 33.9331 34.9083C34.3589 34.7234 34.6938 34.3769 34.8642 33.945C35.0345 33.5131 35.0263 33.0313 34.8414 32.6055C34.6564 32.1797 34.3099 31.8447 33.878 31.6744C30.9813 30.5433 27.8852 30.0115 24.7771 30.1111C21.6689 30.2108 18.6133 30.9397 15.7949 32.2539C12.9765 33.5682 10.454 35.4404 8.37977 37.7573C6.30558 40.0743 4.72285 42.7878 3.7273 45.7339C3.4788 46.5013 3.4168 47.3169 3.54645 48.1131C3.6761 48.9092 3.99366 49.663 4.4728 50.3119C4.96696 50.9886 5.61362 51.5393 6.36037 51.9193C7.10711 52.2994 7.93291 52.4981 8.7708 52.4994H33.2358C33.6999 52.4994 34.145 52.315 34.4732 51.9868C34.8014 51.6586 34.9858 51.2135 34.9858 50.7494C34.9858 50.2853 34.8014 49.8401 34.4732 49.512C34.145 49.1838 33.6999 48.9994 33.2358 48.9994Z" fill="#FF944E" />
          </svg> */}
            <Trash2 size={55} color='#FF944E' />
          </div>
          <DialogHeader className='my-6 gap-y-1 text-center'>
            <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>Delete Review</DialogTitle>
            <p className='text-center text-lg dark:text-input_text'>Are you sure you want to delete this review?</p>
          </DialogHeader>
          <DialogFooter className='xs:mt-4 gap-y-4 md:gap-x-4'>
            <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-text_main dark:bg-input_bg' onClick={onClose}>
              Cancel
            </DialogClose>
            <Button type='button' className='w-full py-3 rounded-[10px] text-xl font-semibold' onClick={removeUserHandler}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RemoveUser;
