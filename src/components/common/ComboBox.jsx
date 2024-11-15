import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import PropType from 'prop-types';

const ComboBox = ({ name, label, prefix, placeholder, option }) => {
  const form = useFormContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = option.filter((opt) =>
    opt.label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, formState }) => {
        return (
          <div className='space-y-0.5'>
            <FormItem className='w-full flex flex-col gap-y-1.5'>
              <FormLabel className='text-lg dark:text-text_main'>{label}</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      icon={false}
                      className={cn(
                        'h-auto py-3.5 text-sm md:text-base rounded-[10px] dark:bg-input_bg focus:ring-0 focus:ring-offset-0 font-normal gap-x-3',
                        formState.errors[name]
                          ? 'dark:placeholder:text-red-500 dark:caret-red-500 dark:border-red-500 dark:text-red-500'
                          : 'dark:border-[#17171F0A] dark:text-input_text'
                      )}>
                      {prefix}
                      <div className={cn('w-full flex justify-between', formState.errors[name] ? 'dark:text-red-500' : 'dark:text-input_text')}>
                        <SelectValue placeholder={placeholder} />
                        <ChevronDown className='dark:text-text_main' />
                      </div>
                    </SelectTrigger>
                    <SelectContent className='dark:bg-input_bg'>
                      <div className='p-2'>
                        <input
                          type='text'
                          placeholder='Search...'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className='w-full p-2 rounded-md border dark:bg-input_bg dark:text-input_text dark:border-[#17171F0A]'
                        />
                      </div>
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                          return (
                            <SelectItem key={index} value={option.value}>
                              {option.label.name}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <div className='p-2 text-center text-gray-500 dark:text-gray-400'>
                          No options available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
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

ComboBox.propTypes = {
  name: PropType.string.isRequired,
  prefix: PropType.element,
  placeholder: PropType.string.isRequired,
  label: PropType.string,
  option: PropType.arrayOf(
    PropType.shape({
      label: PropType.string.isRequired,
      value: PropType.string.isRequired
    })
  ).isRequired
};

export default ComboBox;

