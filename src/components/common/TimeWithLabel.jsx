import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const TimeWithLabel = ({ name, label, prefix, suffix, placeholder }) => {
  const form = useFormContext();
  const [inputType, setInputType] = useState(0);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, formState }) => {
        return (
          <div className='space-y-0.5'>
            <FormItem className='w-full flex flex-col gap-y-2'>
              <FormLabel className='text-lg dark:text-text_main'>{label}</FormLabel>
              <FormControl className='flex'>
                <div
                  className={cn(
                    'h-[54px] px-4 rounded-xl flex items-center justify-between gap-x-3 dark:placeholder:text-input_text dark:text-input_text placeholder:font-normal dark:bg-input_bg border dark:border-border_input',
                    formState.errors[name]
                      ? 'dark:placeholder:text-red-500 dark:caret-red-500 dark:!border-red-500'
                      : 'dark:bg-input_bg dark:border-border_input'
                  )}>
                  {prefix && <div className='size-6 flex justify-center items-center'>{prefix}</div>}
                  <input
                    {...field}
                    type={field.value ? 'time' : inputType ? 'time' : 'text'}
                    className={cn(
                      'timpicker w-full bg-transparent outline-none dark:placeholder:text-input_text',
                      formState.errors[name] ? 'dark:placeholder:text-red-500 dark:caret-red-500' : 'placeholder:text-text_placeholder'
                    )}
                    placeholder={placeholder}
                    onFocus={() => setInputType(1)}
                    onBlur={e => setInputType(e.target.value ? 1 : 0)}
                  />

                  {suffix && <div className='size-6 flex items-center'>{suffix}</div>}
                </div>
              </FormControl>
            </FormItem>
            <FormMessage className='ml-3 md:ml-4 text-[12px] font-semibold' />
          </div>
        );
      }}
    />
  );
};

export default TimeWithLabel;
