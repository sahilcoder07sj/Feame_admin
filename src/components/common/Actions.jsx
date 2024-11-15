import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const Actions = ({ children, onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className='p-2 px-4 rounded-xl dark:bg-input_bg'>
        <DropdownMenuItem className='text-base text-text_gray font-semibold justify-center rounded-lg focus:bg-background_main' onClick={onEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-base text-text_gray font-semibold justify-center rounded-lg focus:bg-background_main' onClick={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
