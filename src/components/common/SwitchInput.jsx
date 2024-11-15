import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Switch } from '../ui/switch'
import { FormLabel } from '../ui/form'

const SwitchInput = ({ name, label = "" }) => {
    const { control } = useFormContext()
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div className='flex items-center gap-4'>
                    <Switch onCheckedChange={(value) => field.onChange(value ? "1" : "0")} checked={field.value == "1"} />
                    <FormLabel className='text-lg dark:text-text_main'>{label}</FormLabel>
                </div>
            )}
        />
    )
}

export default SwitchInput
