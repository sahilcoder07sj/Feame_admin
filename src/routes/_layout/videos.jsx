import useAxios from '@/axios/useAxios';
import { Skeleton } from '@/components/ui/skeleton';
import { DELETEVIDEO, GETVIDEOLIST } from '@/lib/endpoint';
import { dataFilterSchema } from '@/lib/schema';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { EllipsisVertical, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import ReactPlayer from 'react-player';
import Actions from '../../components/common/Actions';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { DIALOG_MODE } from '../../lib/constant';
import Delete from '../../modals/Delete';
import VideoModal from '../../modals/Video';
import { toast } from 'react-toastify';
import useDebounce from '@/hooks/use-debounce';

export const Route = createFileRoute('/_layout/videos')({
  component: Videos,
  validateSearch: search => dataFilterSchema.parse(search)
});

function Videos() {
  const { privateAxios } = useAxios();
  const { ref, inView } = useInView();
  const navigate = Route.useNavigate();

  const { page, limit, search } = Route.useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });
  const [videoModal, setVideoModal] = useState({ open: false, data: null, mode: null });
  const debouncedSearchQuery = useDebounce(search, 350);

  const { data, isFetched, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: [GETVIDEOLIST, page, limit, debouncedSearchQuery],
    queryFn: ({ pageParam = 1 }) => privateAxios({ url: GETVIDEOLIST, data: { limit: limit, page: pageParam, search: debouncedSearchQuery } }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.data.length === limit ? allPages.length + 1 : undefined;
      return nextPage;
    },
    enabled: !!(page && limit)
  });

  const { mutate } = useMutation({
    mutationKey: [DELETEVIDEO],
    mutationFn: data => privateAxios({ url: DELETEVIDEO, data }),
    onSettled: res => {
      if (res.ResponseCode === 1) {
        refetch();
        setVideoModal({ open: false, mode: null, data: null });
        toast.success(res.ResponseMsg);
      }
    }
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  return (
    <>
      <div className='py-4 px-6 flex justify-between items-center gap-x-4'>
        <div className='w-full max-w-[460px] relative'>
          <Search className='size-6 mx-4 absolute top-[48%] -translate-y-1/2 dark:text-input_text text-xl' />
          <Input
            type='text'
            className='w-full p-4 ps-12 border-none dark:bg-[#141414] rounded-xl dark:text-input_text text-base font-normal dark:placeholder:text-input_text placeholder:text-base placeholder:font-normal'
            placeholder='Search'
            value={search ?? ''}
            onChange={e => navigate({ search: { ...(e.target.value ? { page, limit, q: e.target.value } : { page, limit }) }, replace: true })}
          />
        </div>
        <Button
          className='py-3 rounded-[10px] gap-x-2 font-medium text-lg'
          onClick={() => navigate({ search: { page, limit, q: search, mode: DIALOG_MODE.add } })}>
          <svg className='size-6' viewBox='0 0 24 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              fillRule='evenodd'
              clipRule='evenodd'
              d='M12 3.25C10.6985 3.25086 9.41184 3.52636 8.22411 4.05849C7.03637 4.59063 5.9743 5.36742 5.1073 6.3381C4.24031 7.30877 3.58792 8.45148 3.19276 9.69154C2.79761 10.9316 2.66858 12.2411 2.81413 13.5344C2.95967 14.8277 3.3765 16.0758 4.03738 17.197C4.69826 18.3182 5.58831 19.2874 6.64936 20.0411C7.7104 20.7948 8.91856 21.3161 10.1949 21.5709C11.4712 21.8258 12.7869 21.8084 14.056 21.52C14.1521 21.4982 14.2516 21.4955 14.3488 21.5122C14.4459 21.5288 14.5388 21.5645 14.6222 21.617C14.7056 21.6696 14.7778 21.738 14.8348 21.8185C14.8917 21.899 14.9322 21.9899 14.954 22.086C14.9758 22.1821 14.9785 22.2816 14.9618 22.3788C14.9452 22.4759 14.9095 22.5688 14.857 22.6522C14.8044 22.7356 14.736 22.8078 14.6555 22.8648C14.575 22.9217 14.4841 22.9622 14.388 22.984C13.6044 23.1614 12.8034 23.2506 12 23.25C6.063 23.25 1.25 18.437 1.25 12.5C1.25 6.563 6.063 1.75 12 1.75C17.937 1.75 22.75 6.563 22.75 12.5C22.75 13.32 22.658 14.12 22.484 14.888C22.4622 14.9841 22.4217 15.0749 22.3648 15.1553C22.3079 15.2357 22.2357 15.3041 22.1524 15.3566C22.069 15.4091 21.9762 15.4447 21.8791 15.4613C21.782 15.478 21.6826 15.4753 21.5865 15.4535C21.4904 15.4317 21.3996 15.3912 21.3192 15.3343C21.2388 15.2774 21.1704 15.2052 21.1179 15.1219C21.0654 15.0385 21.0298 14.9457 21.0132 14.8486C20.9965 14.7515 20.9992 14.6521 21.021 14.556C21.3299 13.2011 21.3295 11.7941 21.0199 10.4394C20.7104 9.08465 20.0995 7.81709 19.2328 6.73086C18.3661 5.64462 17.2658 4.76762 16.0137 4.165C14.7615 3.56239 13.3896 3.24964 12 3.25ZM8.25 10.927C8.25 9.254 10.01 8.167 11.506 8.915L14.652 10.488C16.311 11.317 16.311 13.683 14.652 14.513L11.506 16.085C10.01 16.833 8.25 15.745 8.25 14.073V10.927ZM10.835 10.257C10.7207 10.2 10.5938 10.173 10.4662 10.1788C10.3386 10.1845 10.2146 10.2228 10.1059 10.2899C9.99727 10.357 9.90754 10.4507 9.84525 10.5622C9.78296 10.6737 9.75017 10.7993 9.75 10.927V14.073C9.75017 14.2007 9.78296 14.3263 9.84525 14.4378C9.90754 14.5493 9.99727 14.643 10.1059 14.7101C10.2146 14.7772 10.3386 14.8155 10.4662 14.8212C10.5938 14.827 10.7207 14.8 10.835 14.743L13.981 13.171C14.1057 13.1087 14.2105 13.013 14.2838 12.8945C14.3571 12.7759 14.3959 12.6394 14.3959 12.5C14.3959 12.3606 14.3571 12.2241 14.2838 12.1055C14.2105 11.987 14.1057 11.8913 13.981 11.829L10.835 10.257ZM19 15.75C19.1989 15.75 19.3897 15.829 19.5303 15.9697C19.671 16.1103 19.75 16.3011 19.75 16.5V18.75H22C22.1989 18.75 22.3897 18.829 22.5303 18.9697C22.671 19.1103 22.75 19.3011 22.75 19.5C22.75 19.6989 22.671 19.8897 22.5303 20.0303C22.3897 20.171 22.1989 20.25 22 20.25H19.75V22.5C19.75 22.6989 19.671 22.8897 19.5303 23.0303C19.3897 23.171 19.1989 23.25 19 23.25C18.8011 23.25 18.6103 23.171 18.4697 23.0303C18.329 22.8897 18.25 22.6989 18.25 22.5V20.25H16C15.8011 20.25 15.6103 20.171 15.4697 20.0303C15.329 19.8897 15.25 19.6989 15.25 19.5C15.25 19.3011 15.329 19.1103 15.4697 18.9697C15.6103 18.829 15.8011 18.75 16 18.75H18.25V16.5C18.25 16.3011 18.329 16.1103 18.4697 15.9697C18.6103 15.829 18.8011 15.75 19 15.75Z'
              fill='black'
            />
          </svg>
          Add Video
        </Button>
      </div>
      <div className='h-full flex flex-col overflow-hidden'>
        <ScrollArea className='px-6 mb-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lap:grid-cols-3 xl:grid-cols-4 gap-6'>
            {isFetched
              ? data.pages.map(pages => {
                  return pages.data.map(data => {
                    return (
                      <Card key={data.video_id} ref={ref} className='flex flex-col border-none dark:bg-transparent relative'>
                        <Actions
                          onEdit={() => navigate({ search: { page, limit, q: search, mode: DIALOG_MODE.edit, video_id: Number(data.video_id) } })}
                          onDelete={() => setVideoModal({ open: true, data, mode: DIALOG_MODE.delete })}>
                          <Button className='p-1 bg-transparent absolute right-2 top-2 dark:hover:bg-bg_main dark:bg-white/10 border dark:border-white/20 rounded-full z-10'>
                            <EllipsisVertical className='dark:text-text_main' />
                          </Button>
                        </Actions>
                        <div className='w-full mx-auto relative'>
                          <ReactPlayer
                            playing
                            muted
                            className='!w-full h-full rounded-t-2xl object-cover'
                            url={data.video}
                            controls
                            light={<img className='w-full h-full rounded-t-2xl object-cover' src={data.thumbnail} alt={`${data.thumbnail}-thumbnail`} />}
                          />
                          <div className='px-3 py-0.5 rounded-2xl absolute right-2 bottom-2 bg-black/70'>
                            <span className='text-sm dark:text-text_main'>{data.time}</span>
                          </div>
                        </div>
                        <CardContent className='h-full p-4 rounded-b-2xl dark:bg-input_bg'>
                          <h6 className='text-2xl dark:text-text_main'>{data.name}</h6>
                          <p className='dark:text-input_text'>{data.description}</p>
                        </CardContent>
                      </Card>
                    );
                  });
                })
              : [...new Array(limit)].map((_, index) => <Skeleton key={index} className='w-full h-full aspect-[410/448] rounded-2xl dark:bg-input_bg' />)}
          </div>
        </ScrollArea>
      </div>

      <VideoModal data={videoModal} setData={setVideoModal} />
      <Delete
        open={videoModal.mode === DIALOG_MODE.delete && videoModal.open}
        title='Delete'
        message='Are you sure you want to delete this video?'
        footer={{ confirm: 'Yes', close: 'Cancel' }}
        onClose={() => setVideoModal({ open: false, mode: null, data: null })}
        onConfirm={() => mutate({ video_id: videoModal.data.video_id })}
      />
    </>
  );
}
