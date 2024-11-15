import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem } from '../ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'

const OtpInput = ({ name }) => {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormControl>
              <InputOTP maxLength={4} value={field.value} onChange={field.onChange}>
                <InputOTPGroup className='gap-x-3 md:gap-x-6'>
                  <InputOTPSlot index={0} className='w-[74px] h-14 text-xl text-text_main dark:ring-bg_main font-semibold border-none rounded-xl !rounded-l-xl dark:bg-input_bg' />
                  <InputOTPSlot index={1} className='w-[74px] h-14 text-xl text-text_main dark:ring-bg_main font-semibold border-none rounded-xl dark:bg-input_bg' />
                  <InputOTPSlot index={2} className='w-[74px] h-14 text-xl text-text_main dark:ring-bg_main font-semibold border-none rounded-xl dark:bg-input_bg' />
                  <InputOTPSlot index={3} className='w-[74px] h-14 text-xl text-text_main dark:ring-bg_main font-semibold border-none rounded-xl !rounded-r-xl dark:bg-input_bg' />
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
          </FormItem>
        )
      }}
    />
  )
}

export default OtpInput
