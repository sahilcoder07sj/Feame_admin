import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { useNavigate, useSearch } from '@tanstack/react-router';
import PropTypes from 'prop-types';

const Pagination = ({ rowsPerPage, rowCount, currentPage }) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const totalPages = Math.ceil(rowCount / rowsPerPage);

  const changePage = page => navigate({ search: { ...search, page }, replace: true });

  return (
    <div className='py-4 pb-2 px-4 flex justify-between items-center dark:bg-[#141414] rounded-b-[20px]'>
      <div className='flex items-center gap-x-3'>
        <p className='dark:text-input_text'>
          Showing {Math.min(currentPage * rowsPerPage, rowCount)} out of {rowCount} results
        </p>
      </div>
      <div className='flex items-center gap-3'>
        <Button
          className='size-11 p-0 rounded-full border border-transparent dark:text-white dark:bg-transparent hover:dark:bg-white hover:dark:text-black'
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}>
          <ChevronLeft className='text-xl disabled:dark:text-[#4F4F4F]' />
        </Button>
        {[...Array(totalPages).keys()].map(pageNumber => {
          return (
            <Button
              className={cn(
                'px-4 py-2 size-11 rounded-full text-lg font-semibold border dark:bg-transparent',
                currentPage === pageNumber + 1
                  ? 'dark:border-bg_main dark:bg-bg_main hover:dark:bg-bg_main'
                  : 'dark:border-text_main/10 dark:text-input_text hover:dark:text-black'
              )}
              key={pageNumber}
              onClick={() => changePage(pageNumber + 1)}>
              {pageNumber + 1}
            </Button>
          );
        })}
        <Button
          className='size-11 p-0 rounded-full border border-transparent dark:text-white dark:bg-transparent hover:dark:bg-white hover:dark:text-black'
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}>
          <ChevronRight className='text-xl disabled:dark:text-[#4F4F4F]' />
        </Button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  rowsPerPage: PropTypes.number,
  rowCount: PropTypes.number,
  currentPage: PropTypes.number
};

export default Pagination;
