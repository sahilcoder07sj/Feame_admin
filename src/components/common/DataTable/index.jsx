import { useSearch } from '@tanstack/react-router';
import PropTypes from 'prop-types';
import DataTable from 'react-data-table-component';
import Loader from './Loader';
import NoDataFound from './NoDataFound';
import Pagination from './Pagination';

const Index = ({ columns, data, loading }) => {
  const { page, limit } = useSearch({ select: state => ({ page: state.page, limit: state.limit, search: state.q, rest: state }) });

  return (
    <div className='h-full flex flex-col overflow-hidden rounded-[20px] dark:bg-black'>
      <DataTable
        className='h-full first:rounded-none [&>div]:h-full'
        customStyles={{
          head: {
            style: {
              padding: '0 20px',
              backgroundColor: 'black',
              zIndex: 20,
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px'
            }
          },
          headRow: {
            style: {
              backgroundColor: 'black',
              padding: '24px 0',
              border: 'none',
              color: '#777E90',
              fontSize: '16px',
              fontWeight: '600'
            }
          },
          headCells: {
            style: {
              padding: '0 16px'
            }
          },
          rows: {
            style: {
              fontSize: '16px',
              backgroundColor: '#141414',
              padding: '8px 20px',
              '&:not(:last-of-type)': {
                borderBottomColor: '#231E28'
              }
            }
          },
          table: {
            style: {
              backgroundColor: '#141414',
              height: loading ? '0px' : '100%'
            }
          },
          cells: {
            style: {
              color: 'white',
              minWidth:'200px !important'
            }
          }
        }}
        columns={columns}
        data={data.data}
        // pagination={true}
        fixedHeader
        fixedHeaderScrollHeight='100%'
        paginationTotalRows={data.total_record}
        paginationPerPage={limit}
        paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
        paginationComponent={() => {
          return <Pagination rowsPerPage={limit} rowCount={data.total_record} currentPage={page} />;
        }}
        progressPending={loading}
        progressComponent={<Loader />}
        noDataComponent={<NoDataFound />}
      />
    </div>
  );
};

Index.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.shape({
    data: PropTypes.array,
    total_record: PropTypes.number
  }),
  loading: PropTypes.bool.isRequired
};

export default Index;
