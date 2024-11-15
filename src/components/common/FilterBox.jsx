// src/FilterBox.js
import React, { useState, useRef, useEffect } from 'react';
import { usePopper } from 'react-popper';
import SimpleBar from 'simplebar-react';

import { Controller, useFormContext } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

const FilterBox = ({ name, label, options, icon, className }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const buttonRef = useRef(null);

    const popupRef = useRef(null);
    const [popupElement, setPopupElement] = useState(null);
    const { styles, attributes } = usePopper(buttonRef.current, popupElement, {
        placement: 'bottom-start',
    });

    const { control, setValue, watch } = useFormContext();
    const filters = watch(name);
    // useEffect(() => {
    //   setValue(name, filters, { shouldValidate: true });
    // }, [filters, name, setValue]);

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target) &&
            buttonRef.current && !buttonRef.current.contains(event.target)) {
            setIsPopupOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="text-center">

            <button
                ref={buttonRef}
                type="button"
                className="bg-[#FFFFFF12] border border-[#FFFFFF33] text-white px-4 py-2 rounded"
                onClick={() => setIsPopupOpen(!isPopupOpen)}
            >
                <div className='flex items-center gap-x-2'>
                    {icon}
                    {label}
                </div>
            </button>
            {isPopupOpen && (
                <div
                    ref={(node) => {
                        setPopupElement(node);
                        popupRef.current = node;
                    }}
                    style={styles.popper}
                    {...attributes.popper}
                    className={cn("bg-[#161616] min-w-[210px] mt-5 p-6 rounded-[12px] z-[10000] shadow-lg relative", className)}
                >
                    {/* <span
            className="absolute top-2 right-2 text-xl cursor-pointer"
            onClick={() => setIsPopupOpen(false)}
          >
            &times;
          </span> */}
                    {/* <input
                        type="text"
                        placeholder={`Search ${label.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-4 border border-gray-300 rounded"
                    /> */}
                    <SimpleBar style={{ maxHeight: 200, backgroundColor: "#161616" }}>
                        <div className="flex  flex-col gap-y-4">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <Controller
                                        key={index}
                                        name={`${name}.${option.value}`}
                                        control={control}
                                        render={({ field: { onChange, onBlur, value, name } }) => (
                                            <div className='w-full flex gap-x-4'>
                                                <div className='flex items-center '>
                                                    <input
                                                        type="checkbox"
                                                        name={name}
                                                        checked={value || false}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                            setValue(name, e.target.checked, { shouldValidate: true })

                                                        }}
                                                        onBlur={onBlur}
                                                        id={`check-${index}`}
                                                        className="mr-2 hidden"
                                                    />
                                                    <label htmlFor={`check-${index}`}>
                                                        <div className='w-[25px] cursor-pointer justify-center items-center flex border border-[#FF944E] rounded h-[25px]'>
                                                            {value && <Icon className='text-white' icon="uil:check" />}
                                                        </div>
                                                    </label>
                                                </div>
                                                <div>
                                                    <span className='text-nowrap text-[#F5F5F5C7]'> {option.label}</span>
                                                </div>
                                            </div>
                                        )}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-gray-500">No options available</div>
                            )}
                        </div>
                    </SimpleBar>
                </div>
            )}
        </div>
    );
};

export default FilterBox;
