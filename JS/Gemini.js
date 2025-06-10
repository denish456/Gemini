const openBtn = document.getElementById('openBtn');
const mainContent = document.getElementById('main-content');
const search_icon = document.getElementById('search-icon');

openBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  mainContent.classList.toggle('pinned');
});

search_icon.addEventListener('click', () => {
    search_icon.classList.toggle('search-grey');
});