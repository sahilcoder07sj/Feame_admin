import { createContext, useEffect, useMemo, useReducer } from 'react'
import { PAGINATION_DISPATCH_TYPES } from '../lib/constant'
import PropTypes from 'prop-types'

export const PaginationContext = createContext()

const Pagination = ({ children }) => {
  const defaultValue = useMemo(() => ({ page: 1, totalRecord: null, limit: 10 }), [])

  const [state, dispatch] = useReducer(reducer, defaultValue)

  function reducer(state, action) {
    switch (action.type) {
      case PAGINATION_DISPATCH_TYPES.next_page:
        return { ...state, page: state.page + 1 }
      case PAGINATION_DISPATCH_TYPES.prev_page:
        return { ...state, page: state.page - 1 }
      case PAGINATION_DISPATCH_TYPES.set_page:
        return { ...state, page: action.payload }
      case PAGINATION_DISPATCH_TYPES.set_totalRecord:
        return { ...state, totalRecord: action.payload }
      case PAGINATION_DISPATCH_TYPES.reset:
        return { ...state, page: 1, totalRecord: null, limit: 10 }
      default:
        return state
    }
  }

  useEffect(() => {
    dispatch({ type: PAGINATION_DISPATCH_TYPES.reset })
  }, [])

  return <PaginationContext.Provider value={{ state, dispatch }}>{children}</PaginationContext.Provider>
}

Pagination.propTypes = {
  children: PropTypes.node.isRequired
}

export default Pagination
