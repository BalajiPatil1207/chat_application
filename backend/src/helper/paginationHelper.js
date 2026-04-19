/**
 * Calculates limit and offset for queries
 * @param {number} page - Current page number (starts from 1)
 * @param {number} size - Number of items per page
 * @returns {object} - { limit, offset }
 */
export const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;

  return { limit, offset };
};

/**
 * Formats data into a standardized paginated response
 * @param {object} data - Data returned from query ({ total, docs })
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} - Formatted paginated data
 */
export const getPagingData = (data, page, limit) => {
  const { total: totalItems, docs: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, items, totalPages, currentPage };
};
