function getPaginationData(page, limit, totalItems) {
  const currentPage = parseInt(page, 10) || 1;
  const itemsPerPage = parseInt(limit, 10) || 10;
  const skip = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    itemsPerPage,
    skip,
    totalPages,
  };
}

module.exports = getPaginationData;
