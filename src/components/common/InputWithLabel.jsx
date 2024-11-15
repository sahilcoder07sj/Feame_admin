import { cn } from '@/lib/utils';
import PropType from 'prop-types';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input as InputComponent } from '../ui/input';
import { Textarea } from '../ui/textarea';

const InputWithLabel = ({ name, label, type, suffix, placeholder, inputStyle, textarea, disabled }) => {
  const form = useFormContext();

  const handleNumberOnly = e => {
    if (type === 'number') {
      if (e.key.toLowerCase() === 'e' || e.key === '+' || e.key === '-') {
        e.preventDefault();
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, formState }) => {
        return (
          <div className='space-y-0.5'>
            <FormItem className='w-full flex flex-col gap-y-1.5'>
           { label &&  <FormLabel className='text-lg pb-2 dark:text-text_main'>{label}</FormLabel>}
              <FormControl>
                <div className='relative'>
                  {textarea ? (
                    <Textarea
                      {...field}
                      disabled={disabled}
                      placeholder={placeholder}
                      className={cn(
                        'py-2.5 px-4 text-sm md:text-base rounded-xl font-normal focus-visible:ring-1 focus-visible:ring-offset-1 dark:placeholder:text-input_text dark:text-input_text placeholder:font-normal dark:bg-input_bg border dark:!border-border_input',
                        suffix && 'pe-10 md:pe-12',
                        formState.errors[name]
                          ? 'dark:placeholder:text-red-500 dark:caret-red-500 dark:!border-red-500'
                          : 'dark:bg-input_bg dark:border-border_input',
                        inputStyle
                      )}
                    />
                  ) : (
                    <InputComponent
                      {...field}
                      onKeyDown={handleNumberOnly}
                      disabled={disabled}
                      type={type ?? 'text'}
                      placeholder={placeholder}
                      className={cn(
                        'py-3.5 px-4 text-sm md:text-base rounded-xl font-normal dark:placeholder:text-input_text dark:text-input_text dark:placeholder:font-normal dark:bg-input_bg border dark:!border-border_input',
                        suffix && 'pe-10 md:pe-12',
                        formState.errors[name]
                          ? 'dark:placeholder:text-red-500 dark:caret-red-500 dark:!border-red-500'
                          : 'dark:bg-input_bg dark:border-text_secondary/5',
                        inputStyle
                      )}
                    />
                  )}
                  {suffix && (
                    <div className={cn('flex justify-center items-center aspect-square absolute right-0 top-0', textarea ? 'size-12' : 'h-full')}>{suffix}</div>
                  )}
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

InputWithLabel.propTypes = {
  name: PropType.string.isRequired,
  type: PropType.string,
  prefix: PropType.element,
  suffix: PropType.element,
  placeholder: PropType.string.isRequired,
  label: PropType.string,
  inputStyle: PropType.string,
  textarea: PropType.bool,
  disabled: PropType.bool
};

export default InputWithLabel;
