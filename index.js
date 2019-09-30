(function() {
  'use strict';
  const GET_DATA_URL = 'https://restcountries.eu/rest/v2/all';
  let appData = {
    data: {},
    loading: false,
    config: {
      columnKeys: [
        { key: 'name', isSortable: true, header: 'Country Name' },
        { key: 'capital', isSortable: true, header: 'Capital' },
        { key: 'population', isSortable: true, header: 'Population' },
        { key: 'region', isSortable: true, header: 'Region' },
        { key: 'area', isSortable: true, header: 'Area' }
      ],
      isHeaderFixed: false,
      isPaginated: true,
      noOfEntriesPerPage: 10
    },
    currentPage: 1,
    sortOrder: false
  };
  const debounce = (func, delay) => { 
    let debounceTimer 
    return function() { 
        const context = this
        const args = arguments 
            clearTimeout(debounceTimer) 
                debounceTimer 
            = setTimeout(() => func.apply(context, args), delay) 
    } 
}  
  const getRowHTML = rowData => {
    const row = document.createElement('tr');
    appData.config.columnKeys.forEach(col => {
      const td = document.createElement('td');
      const textNode = document.createTextNode(rowData[col.key]);
      td.appendChild(textNode);
      row.appendChild(td);
    });
    return row;
  };
  const getHeader = () => {
    const headerRow = document.createElement('tr');
    headerRow.setAttribute('id', 'header-row');
    appData.config.columnKeys.forEach((col, index) => {
      const td = document.createElement('th');
      td.setAttribute('id', `col-${index}`);
      if(appData.activeSortedCol === index){
        td.setAttribute('class', `active ${appData.sortOrder}`);
      }
      const textNode = document.createTextNode(col.header);
      td.appendChild(textNode);
      headerRow.appendChild(td);
    });
    return headerRow;
  };
  const paginate = (array, pageSize, pageNumber) => {
    return array.length > pageSize ? array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize): array;
  };
  const showFooterPaginate = () => {
    let noOfPages = 0;
    if (appData.config.isPaginated) {
      if (appData.config.noOfEntriesPerPage) {
        const checkIfFilterValue = appData.searchValue ? true : false;
        const filteredData = checkIfFilterValue ? appData.data.filter(data => {
            return data[appData.config.columnKeys[0].key].toLowerCase().indexOf(appData.searchValue.toLowerCase()) >=0;
        }) : appData.data;
        noOfPages = Math.ceil(filteredData.length / appData.config.noOfEntriesPerPage);
      }
      const paginationRow = document.createElement('div');
      paginationRow.setAttribute('class', 'page-wrapper');
      for (let i = 1; i < noOfPages; i++) {
        const pageElement = document.createElement('div');
        pageElement.setAttribute('class', 'page-item');
        pageElement.setAttribute('id', `page_${i}`);
        if (i === appData.currentPage) {
          pageElement.setAttribute('class', 'page-item active');
        }
        pageElement.appendChild(document.createTextNode(i));
        paginationRow.appendChild(pageElement);
      }
      document.getElementById('root').appendChild(paginationRow);

      // Event Delegation
      paginationRow.addEventListener('click', function(e) {
        if (Number(e.target.id.split('_')[1])) {
          appData.currentPage = Number(e.target.id.split('_')[1]);
          renderTable();
        }
      });
    }
  };

  const renderTable = () => {
    document.getElementById('root').innerHTML = '';
    const Table = document.createElement('table');
    if (appData.config.isHeaderFixed) {
      Table.setAttribute('class', 'fixed-headers');
    }
    const tableHead = document.createElement('thead');
    tableHead.appendChild(getHeader());
    Table.appendChild(tableHead);
    const tableBody = document.createElement('tbody');
    const checkIfFilterValue = appData.searchValue ? true : false;
    const filteredData = checkIfFilterValue ? appData.data.filter(data => {
        return data[appData.config.columnKeys[0].key].toLowerCase().indexOf(appData.searchValue.toLowerCase()) >=0;
    }) : appData.data;
    // For pagination
    const dataToShow = appData.config.isPaginated
      ? paginate(
          filteredData,
          appData.config.noOfEntriesPerPage,
          appData.currentPage
        )
      : appData.data;
    
    dataToShow.forEach(row => {
      tableBody.appendChild(getRowHTML(row));
    });
    Table.appendChild(tableBody);
    document.getElementById('root').appendChild(Table);
    showFooterPaginate();
    document
      .querySelector('#header-row')
      .addEventListener('click', function(e) {
        if (Number(e.target.id.split('-')[1]) >= 0) {
          appData.data.sort((a, b) => {
              let obj  = appData.config.columnKeys[Number(e.target.id.split('-')[1])];
              const key = obj.key;
            if (appData.sortOrder) {
              if (a[key] > b[key]) {
                return 1;
              }
              if (a[key] < b[key]) {
                return -1;
              }
              return 0;
            } else {
              if (a[key] < b[key]) {
                return 1;
              }
              if (a[key] > b[key]) {
                return -1;
              }
              return 0;
            }
          });
          appData.sortOrder = !appData.sortOrder;
          appData.activeSortedCol = Number(e.target.id.split('-')[1]);
        }
        renderTable();
      });
  };
  const changeAppState = newData => {
    const newAppState = { ...appData, ...newData };
    appData = newAppState;
    if (!appData.loading) {
      document.getElementById('root').innerHTML = '';
      renderTable();
    } else {
      document.getElementById('root').innerHTML = 'Loading...';
    }
  };

  const fetchData = () => {
    changeAppState({ loading: true });
    fetch(GET_DATA_URL)
      .then(res => res.json())
      .then(data => changeAppState({ data, loading: false }))
      .catch(err => console.log(err.message));
  };
  document.getElementById('search').addEventListener('keydown', debounce(function(e){
    appData.searchValue = e.target.value;
    renderTable();
  }, 500));
  fetchData();
})();
