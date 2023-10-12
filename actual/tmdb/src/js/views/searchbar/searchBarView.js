class SearchBarView {
  #searchContainer;
  #searchBar;
  #searchBarBtn;

  initVars() {
    this.#searchContainer = document.querySelector(".nav-bar--search-form");
    this.#searchBar = document.querySelector(".nav-bar--search-bar");
    this.#searchBarBtn = document.querySelector(".nav-bar--search-bar-btn");
  }

  initHandlers() {
    this.#addSearchHandler();
    this.#addSearchBarHandler();
  }

  // TODO: Use input for search functionality
  #addSearchHandler() {
    this.#searchContainer.addEventListener("submit", (e) => {
      e.preventDefault();

      console.log(this.#searchBar.value);

      if (this.#searchBar.value === "") return;

      this.#searchBar.value = "";
    });
  }

  #addSearchBarHandler() {
    this.#searchBarBtn.addEventListener("mouseenter", () => {
      this.#toggleSearchBar(true);
      this.#searchContainer.addEventListener("mouseleave", (e) => {
        this.#toggleSearchBar(false);
      });
    });
  }

  #toggleSearchBar(flag) {
    this.#searchBar.style.width = flag ? "36rem" : "0rem";
    this.#searchBar.style.padding = flag ? "0 1rem 0 1rem" : "0rem";
  }
}

export default new SearchBarView();
