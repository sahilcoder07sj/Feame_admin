import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect, useState } from 'react';


const Filter = ({ placeholder, option, value, setValue }) => {
  return (
    <div className='space-y-0.5'>
      <div className='w-full flex flex-col gap-y-1.5'>
        <div className='relative'>
          <Select value={value} onValueChange={(e) => {
            setValue(e)
          }}>
            <SelectTrigger
              icon={false}
              className={cn(
                'h-auto py-3.5 text-sm md:text-base rounded-[10px] dark:bg-input_bg focus:ring-0 focus:ring-offset-0 font-normal gap-x-3',
                'dark:border-[#17171F0A] dark:text-input_text'
              )}>
              <div className={cn('w-full flex justify-between', 'dark:text-white')}>
                <SelectValue placeholder={placeholder} />
                <ChevronDown className='dark:text-text_main' />
              </div>
            </SelectTrigger>
            <SelectContent className='dark:bg-input_bg'>
              {option.map((option, index) => {
                return (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  )

};


export default Filter;
