import { cn } from '@/lib/utils';
import { TagInput } from 'emblor';
import PropType from 'prop-types';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const InputTag = ({ name, label, suffix, placeholder, setRemovedTagIds }) => {
  const form = useFormContext();
  const [activeTagIndex, setActiveTagIndex] = useState(null);

  return (
    <div>
      <FormField
        control={form.control}
        name={name}
        render={({ field, formState }) => (
          <div className='space-y-0.5'>
            <FormItem className='w-full flex flex-col gap-y-1.5'>
              <FormLabel className='text-lg dark:text-text_main'>{label}</FormLabel>
              <FormControl className='w-full'>
                <div className='relative space-y-0.5'>
                  <TagInput
                    {...field}
                    styleClasses={{
                      tag: {
                        body: 'border-0 h-auto py-0.5 px-2 gap-x-2 bg-bg_main rounded-full',
                        closeButton: 'p-0'
                      },
                      inlineTagsContainer: cn(
                        'min-h-[54px] px-4 rounded-xl border flex-wrap',
                        formState.errors[name] ? 'dark:bg-input_bg dark:border-red-500' : 'dark:bg-input_bg dark:border-border_input'
                      ),
                      input: cn(
                        'px-0 text-sm md:text-base font-normal dark:placeholder:text-input_text dark:text-input_text placeholder:font-normal',
                        formState.errors[name] ? 'dark:placeholder:text-red-500 dark:caret-red-500' : ' '
                      )
                    }}
                    inputProps={{
                      className: 'py-3'
                    }}
                    placeholder={placeholder}
                    tags={field.value}
                    setTags={newTags => form.setValue(name, newTags, { shouldDirty: true, shouldTouch: true })}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    animation='fadeIn'
                    onTagRemove={tag => {
                      const removedTag = field.value.find(prevTag => prevTag.text === tag);
                      if (removedTag) {
                        setRemovedTagIds(prevState => [...prevState, removedTag.id]);
                      }
                    }}
                  />
                  {suffix && <div className='flex justify-center items-center aspect-square absolute right-0 top-0'>{suffix}</div>}
                  <FormMessage className='ml-3 md:ml-4 text-[12px] font-semibold' />
                </div>
              </FormControl>
            </FormItem>
          </div>
        )}
      />
    </div>
  );
};

InputTag.propTypes = {
  name: PropType.string.isRequired,
  label: PropType.string,
  suffix: PropType.element,
  placeholder: PropType.string.isRequired,
  setRemovedTagIds: PropType.func.isRequired
};

export default InputTag;
