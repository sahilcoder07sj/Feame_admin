import { Button } from '../components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';

const Delete = ({ open, title, message, footer, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()} className='max-w-xl p-6 gap-0 overflow-hidden rounded-2xl'>
        <div className='size-[120px] mx-auto my-4 flex justify-center items-center ring-[10px] dark:ring-white/10 rounded-full'>
          <svg width='56' height='56' viewBox='0 0 56 56' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M11.7848 20.3797C9.81336 17.7511 11.6889 14 14.9747 14H41.0253C44.3111 14 46.1866 17.7511 44.2152 20.3797V20.3797C42.7773 22.297 42 24.6288 42 27.0253V42C42 47.1547 37.8213 51.3333 32.6667 51.3333H23.3333C18.1787 51.3333 14 47.1547 14 42V27.0253C14 24.6288 13.2227 22.297 11.7848 20.3797V20.3797Z'
              stroke='#FF944E'
              strokeWidth='3.5'
            />
            <path d='M32.667 39.6666L32.667 25.6666' stroke='#FF944E' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M23.333 39.6666L23.333 25.6666' stroke='#FF944E' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
            <path
              d='M37.3337 14L36.064 10.1909C35.4288 8.28534 33.6455 7 31.6368 7H24.3639C22.3552 7 20.5719 8.28534 19.9367 10.1909L18.667 14'
              stroke='#FF944E'
              strokeWidth='3.5'
              strokeLinecap='round'
            />
          </svg>
        </div>
        <DialogHeader className='my-6 gap-y-1 text-center'>
          <DialogTitle className='text-center text-2xl font-semibold dark:text-text_main'>{title}</DialogTitle>
          <p className='text-center text-lg dark:text-input_text'>{message}</p>
        </DialogHeader>
        <DialogFooter className='xs:mt-4 gap-y-4 md:gap-x-4'>
          <DialogClose className='w-full py-3 rounded-[10px] text-xl dark:text-text_main dark:bg-input_bg' onClick={onClose}>
            {footer.close}
          </DialogClose>
          <Button type='submit' className='w-full py-3 rounded-[10px] text-xl font-semibold' onClick={onConfirm}>
            {footer.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Delete;
