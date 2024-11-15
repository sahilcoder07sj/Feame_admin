import { Link } from '@tanstack/react-router';
import React from 'react';

const SidebarItem = ({ link, search, icon, name, onClick }) => {
  // Check if link is provided or not
  const isLinkAvailable = link && link.trim() !== ''; 

  return (
    <Link
      to={isLinkAvailable ? link : '#'} // If link is available, use it, else fallback to '#'
      search={search}
      className={`pl-4 py-2 md:py-3 flex font-medium gap-x-3 items-center dark:data-[status=active]:bg-bg_main dark:bg-transparent rounded-lg 
        ${isLinkAvailable ? 'dark:hover:text-black dark:hover:bg-bg_main' : 'cursor-default'} group transition-colors`}
      activeProps={{ className: 'dark:bg-bg_main dark:text-black' }}
      activeOptions={{ includeSearch: false }}
      onClick={onClick}
    >
      {icon}
      <span className='text-lg dark:text-input_text dark:group-data-[status=active]:text-black dark:group-hover:text-black transition-colors'>
        {name}
      </span>
    </Link>
  );
};

export default SidebarItem;
