import { useEffect, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { GETSINGLEREVIEW } from '@/lib/endpoint';
import useAxios from '@/axios/useAxios';
import "react-medium-image-zoom/dist/styles.css";
import Zoom from 'react-medium-image-zoom'
import Loader from '@/components/common/Loading';
import ImageWithShimmer from '@/components/common/Shimmer';

const Review = ({ data, setData }) => {
  const { privateAxios } = useAxios()
  const [loading, setLoading] = useState(false)
  const [reviewData, setReviewData] = useState({})

  const onClose = () => {
    setData({
      open: false,
      data: null
    })
  }
  const getSingleReview = async (values) => {

    try {
      setLoading(true)
      const data = await privateAxios({
        url: GETSINGLEREVIEW,
        data: values
      })
      setLoading(false)
      setReviewData(data.data)
    } catch (error) {
      setLoading(false)

      setReviewData({})
    }
  }
  useEffect(() => {
    if (data?.data?.user_id && data?.data?.event_id) {
      getSingleReview({
        user_id: data?.data?.user_id,
        event_id: data?.data?.event_id
      })
    }
  }, [data.open])

  return (
    <Dialog open={data.open} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-[800px] main-notify-dialog max-h-[80vh] overflow-auto p-6 gap-0  rounded-2xl'>

        <DialogHeader className='my-6 gap-y-1 text-center'>
          <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>Review</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          {reviewData && typeof reviewData == "object" && Object.keys(reviewData).length > 0 && !loading ?
            <div className='space-y-6'>
              <div className='space-y-2'>
                <p className='text-xl text-white'>Instagram Reel / YouTube Short Link</p>
                <a className='text-[#888888] underline text-lg' href="">{reviewData?.link}</a>
              </div>
              <div className='space-y-4'>
                <p className='text-xl text-white'>Instagram Story Post</p>
                <div className='grid grid-cols-3 gap-3'>
                  {
                    reviewData?.review_post?.filter((item) => item.type == "story").map((item) => (
                      <div className='w-full'>
                        <a className='w-full' target='_blank' href={item?.post}>
                          {/* <img className='w-[300px]' src={item?.post} alt="" /> */}
                          <ImageWithShimmer className='w-full' src={item?.post} alt="" />
                        </a>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className='space-y-4'>
                <p className='text-xl text-white'>Review on Google or TripAdvisor</p>
                <div className='flex gap-x-3'>
                  {
                    reviewData?.review_post?.filter((item) => item.type == "trip_advisor").map((item) => (
                      <div>
                        <a target='_blank' href={item?.post}>
                          <img className='w-[300px]' src={item?.post} alt="" />
                        </a>
                      </div>
                    ))
                  }

                </div>
              </div>
            </div> : loading ? <div className='min-h-[200px] flex justify-center items-center'>
              <Loader />
            </div> :
              <></>}
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

export default Review;
