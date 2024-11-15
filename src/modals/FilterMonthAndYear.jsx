import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { MONTHS } from '@/lib/constant';
import { YEARS } from '../lib/constant';

const FilterMonthAndYear = ({ filterValue, setFilterValue }) => {
  return (
    <Popover modal>
      <PopoverTrigger className='px-4 lg:px-5 py-3 text-base lg:text-lg flex items-center gap-x-2 font-medium focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-border_main focus-visible:outline-none dark:bg-[#141414] dark:text-input_text rounded-[10px]'>
        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M8 2V5' stroke='#888888' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M16 2V5' stroke='#888888' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M3.5 9.08997H20.5' stroke='#888888' strokeWidth='1.5' strokeMiterlimit='10' strokeLinecap='round' strokeLinejoin='round' />
          <path
            d='M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
            stroke='#888888'
            strokeWidth='1.5'
            strokeMiterlimit='10'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path d='M15.6937 13.7H15.7027' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M15.6937 16.7H15.7027' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M11.9945 13.7H12.0035' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M11.9945 16.7H12.0035' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M8.29529 13.7H8.30427' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M8.29529 16.7H8.30427' stroke='#888888' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
        {filterValue.month.slice(0, 3)}
        &nbsp;
        {filterValue.year}
        <ChevronDown className='text-text_placeholder' />
      </PopoverTrigger>
      <PopoverContent onOpenAutoFocus={e => e.preventDefault()} className='p-0 flex items-center rounded-2xl'>
        <Select value={filterValue.month} onValueChange={month => setFilterValue(prevState => ({ ...prevState, month }))}>
          <SelectTrigger
            className='max-w-[118px] px-0 m-3 justify-center gap-x-2 text-text_secondary font-medium text-lg border-transparent focus:ring-1 focus:ring-offset-1 focus:ring-border_main'
            icon={<ChevronDown className='stroke-[1px]' />}>
            <SelectValue className='text-lg' placeholder='Month' />
          </SelectTrigger>
          <SelectContent className='max-h-[240px]' sideOffset={15}>
            {MONTHS.map(month => {
              return (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  className='cursor-pointer text-[#8E8C8A] text-base font-medium data-[state=checked]:text-text_main data-[state=checked]:font-semibold focus:font-semibold focus:bg-transparent focus:text-text_main'>
                  {month.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Separator orientation='vertical' className='w-[2px] h-8 rounded-sm bg-[#D8D8D8]' />
        <Select value={filterValue.year} onValueChange={year => setFilterValue(prevState => ({ ...prevState, year }))}>
          <SelectTrigger
            className='max-w-[118px] px-0 m-3 justify-center gap-x-2 text-text_secondary font-medium text-lg border-transparent focus:ring-1 focus:ring-offset-1 focus:ring-border_main'
            icon={<ChevronDown className='stroke-[1px]' />}>
            <SelectValue className='text-lg' placeholder='Year' />
          </SelectTrigger>
          <SelectContent className='max-h-[240px]' sideOffset={15}>
            {YEARS.map(month => {
              return (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  className='cursor-pointer text-[#8E8C8A] text-base font-medium data-[state=checked]:text-text_main data-[state=checked]:font-semibold focus:font-semibold focus:bg-transparent focus:text-text_main'>
                  {month.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
};

export default FilterMonthAndYear;
