import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDayPicker, useNavigation } from 'react-day-picker';
import { useFormContext } from 'react-hook-form';
import { MONTHS, WEEK_NAME, YEARS } from '../../lib/constant';
import { Calendar } from '../ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const DatePicker = ({ name, label, placeholder, prefix, suffix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, formState }) => {
        return (
          <div className='space-y-0.5'>
            <FormItem className='w-full flex flex-col gap-y-2'>
              <FormLabel className='text-lg dark:text-text_main'>{label}</FormLabel>
              <FormControl>
                <Popover open={isOpen} onOpenChange={e => setIsOpen(e)}>
                  <PopoverTrigger
                    className={cn(
                      'px-4 py-3.5 rounded-xl flex items-center justify-between gap-x-3 dark:text-input_text placeholder:font-normal dark:bg-input_bg border dark:border-border_input',
                      formState.errors[name]
                        ? 'dark:placeholder:text-red-500 dark:caret-red-500 dark:border-red-500'
                        : 'dark:bg-input_bg dark:border-border_input'
                    )}>
                    <div className='flex items-center gap-x-3'>
                      {prefix}
                      <div className='p-0 text-base bg-transparent justify-start text-left font-normal'>
                        <span className={cn('font-hellix', formState.errors[name] ? 'text-red-500' : 'text-input_text')}>
                          {field.value ? moment(field.value).format('MMM D, YYYY') : placeholder}
                        </span>
                      </div>
                    </div>
                    {suffix}
                  </PopoverTrigger>
                  <PopoverContent className='w-max p-0' onOpenAutoFocus={e => e.preventDefault()} align='start'>
                    <Calendar
                      mode='single'
                      fixedWeeks
                      selected={field.value}
                      onSelect={e => {
                        setIsOpen(false);
                        field.onChange(moment(e).format('YYYY-MM-DD'));
                      }}
                      formatters={{
                        formatWeekdayName: date => WEEK_NAME[moment(date).day()].substring(0, 3)
                      }}
                      className='dark:bg-input_bg'
                      classNames={{
                        month: 'space-y-3',
                        head_row: 'flex justify-between',
                        head_cell: 'w-[50px] py-2 text-sm flex-1 text-text_secondary font-medium',
                        row: 'flex justify-between',
                        cell: 'size-[50px] flex justify-center items-center',
                        day: 'size-10 text-base text-text_secondary font-medium rounded-full',
                        day_selected: 'dark:bg-bg_main dark:text-black'
                      }}
                      components={{ Caption }}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
            <FormMessage className='ml-3 md:ml-4 text-[12px] font-semibold' />
          </div>
        );
      }}
    />
  );
};

function Caption() {
  const { goToDate } = useNavigation();
  const { selected } = useDayPicker();

  const [date, setDate] = useState(selected ? selected : new Date());

  useEffect(() => {
    if (!selected) return;
    goToDate(selected);
  }, [moment(selected ? selected : new Date()).toString()]);

  const handelChangeDate = e => {
    setDate(e);
    goToDate(e);
  };

  return (
    <div className='pb-3 flex items-center justify-center gap-x-4 border-b'>
      <Select value={moment(date).format('MMMM')} onValueChange={e => handelChangeDate(moment(date).set('M', e).toString())}>
        <SelectTrigger
          className='w-full px-2 justify-center gap-x-2 text-text_secondary font-medium text-lg border-transparent focus:ring-1 focus:ring-offset-1 focus:ring-border_main dark:bg-input_bg'
          icon={<ChevronDown className='stroke-[1px]' />}>
          <SelectValue className='text-lg' placeholder='Month' />
        </SelectTrigger>
        <SelectContent className='max-h-[240px] dark:bg-input_bg'>
          {MONTHS.map(month => {
            return (
              <SelectItem
                key={month.value}
                value={month.value}
                className='text-[#8E8C8A] text-base font-medium data-[state=checked]:text-text_main data-[state=checked]:font-semibold focus:font-semibold focus:bg-transparent focus:text-text_main'>
                {month.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Select value={moment(date).year()} onValueChange={e => handelChangeDate(moment(date).set('Y', e).toString())}>
        <SelectTrigger
          className='w-full px-2 justify-center gap-x-2 text-text_secondary font-medium text-lg border-transparent focus:ring-1 focus:ring-offset-1 focus:ring-border_main dark:bg-input_bg'
          icon={<ChevronDown className='stroke-[1px]' />}>
          <SelectValue className='text-lg' placeholder='Year' />
        </SelectTrigger>
        <SelectContent className='max-h-[240px] dark:bg-input_bg'>
          {YEARS.map(month => {
            return (
              <SelectItem
                key={month.value}
                value={month.value}
                className='text-[#8E8C8A] text-base font-medium data-[state=checked]:text-text_main data-[state=checked]:font-semibold focus:font-semibold focus:bg-transparent focus:text-text_main'>
                {month.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default DatePicker;
