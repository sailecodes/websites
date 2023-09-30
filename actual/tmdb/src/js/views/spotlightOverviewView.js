import { SPOTLIGHT_OVERVIEW_TITLE_MAX_WIDTH } from "../config.js";

/**
 * Handles the view of the spotlight overview
 */
class SpotlightOverviewView {
  #spotlightOverview;
  #spotlightOverviewTitleClip;
  #spotlightOverviewTitle;
  #spotlightOverviewRating;
  #spotlightOverviewReleaseDate;
  #spotlightOverviewGenres;
  #spotlightOverviewDesc;

  #ceClippedTitleDoneAnim;
  #clippedTitleAnimId;

  /**
   * Initializes class fields
   */
  initVars() {
    this.#spotlightOverview = document.querySelector(".content-spotlight--overview");
    this.#spotlightOverviewTitleClip = document.querySelector(".content-spotlight--overview-title-clip");
    this.#spotlightOverviewTitle = this.#spotlightOverview.querySelector(".content-spotlight--overview-title");
    this.#spotlightOverviewRating = this.#spotlightOverview.querySelector(".content-spotlight--overview-rating");
    this.#spotlightOverviewReleaseDate = this.#spotlightOverview.querySelector(".content-spotlight--overview-date");
    this.#spotlightOverviewGenres = this.#spotlightOverview.querySelector(".content-spotlight--overview-genres");
    this.#spotlightOverviewDesc = this.#spotlightOverview.querySelector(".content-spotlight--overview-description");
    this.#ceClippedTitleDoneAnim = new Event("clippedTitleDoneAnim");
  }

  /**
   * Inserts the default overview layout with initial content into the DOM
   *
   * @param {*} initialContent Contains the initial content
   */
  initDefaultState(initialContent) {
    document.querySelector(".content-spotlight--slider").insertAdjacentHTML(
      "afterend",
      `
        <div class="content-spotlight--overview">
          <div>
            <div class="content-spotlight--overview-title-clip">
              <p class="content-spotlight--overview-title">${initialContent.title}</p>
            </div>
            <p class="content-spotlight--overview-rating" style="background-color: ${this.#getNewRatingColor(
              initialContent.rating
            )};">${initialContent.rating}</p>
          </div>
          <button class="content-spotlight--overview-back-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="content-spotlight--overview-back-btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>
          </button>
          <p class="content-spotlight--overview-date">Release Date: ${initialContent.releaseDate}</p>
          <div class="content-spotlight--overview-genres">
            <p>Genres: &nbsp;</p>
            ${initialContent.genres
              .map((genre, index) => {
                return index === initialContent.genres.length - 1
                  ? `<p class="content-spotlight--overview-genre">${genre}</p>`
                  : `<p class="content-spotlight--overview-genre">${genre}, &nbsp;</p>`;
              })
              .join("")}
          </div>
          <p class="content-spotlight--overview-description">${initialContent.description}</p>
        </div>
      `
    );
  }

  /**
   * Resets the position of the overview title after animation
   */
  addResetClippedTitleHandler() {
    this.#spotlightOverviewTitle.addEventListener("clippedTitleDoneAnim", function () {
      this.style.left = "";
    });
  }

  /**
   * Makes the title and the text in the spotlight invisible and moves the overview into the window upon clicking
   * the 'read description' container, and animates the overview title if clipped
   */
  addOnReadBtnClickedHandler() {
    document.querySelectorAll(".content-spotlight--more-container").forEach((container) => {
      container.addEventListener("click", () => {
        this.#toggleBackgroundText(true);

        this.#spotlightOverview.style.transform = "translateX(0%)";

        // Animates the overview title if clipped and dispatches a custom event after the animation to trigger the
        // event handler defined above
        this.#animateClippedTitle();
      });
    });
  }

  #animateClippedTitle() {
    if (this.#spotlightOverviewTitleClip.offsetWidth >= this.#spotlightOverviewTitleClip.scrollWidth) return;

    const textWidth = this.#calcTitleWidth();
    const leftOver = ((textWidth - SPOTLIGHT_OVERVIEW_TITLE_MAX_WIDTH) / SPOTLIGHT_OVERVIEW_TITLE_MAX_WIDTH) * 100;

    this.#spotlightOverviewTitle.style.left = `-${leftOver}%`;

    this.#clippedTitleAnimId = setTimeout(
      () => this.#spotlightOverviewTitle.dispatchEvent(this.#ceClippedTitleDoneAnim),
      6000
    );
  }

  #calcTitleWidth() {
    this.#spotlightOverviewTitle.style.minWidth = "max-content";
    const width = this.#spotlightOverviewTitle.offsetWidth;
    this.#spotlightOverviewTitle.style.minWidth = "";

    return width;
  }

  /**
   * Makes the spotlight title and text visible, moves the overview out of the window upon clicking the back button
   * in the overview, and resets the position of the title (for the case of clipped title animation)
   */
  addOnOverviewBackBtnClickedHandler() {
    document.querySelector(".content-spotlight--overview-back-btn").addEventListener("click", () => {
      this.#toggleBackgroundText(false);
      this.#spotlightOverview.style.transform = "translateX(-100%)";

      clearTimeout(this.#clippedTitleAnimId);

      setTimeout(() => {
        this.#spotlightOverviewTitle.style.transition = "0s";
        this.#spotlightOverviewTitle.style.left = "";

        setTimeout(() => {
          this.#spotlightOverviewTitle.style.transition = "left 4s cubic-bezier(1, 1, 1, 1) 1.5s";
        }, 100);
      }, 300);
    });
  }

  /**
   * Makes the title and text in the spotlight visible, moves the overview out of the window, and changes the
   * overview content upon clicking any spotlight transition button
   *
   * FIXME: Buggy --> TODO: Background title doesn't appear during transition
   *
   * TODO: --> Add the same functionality from the spotlight btns to arrow keys and markers
   *
   * @param {*} spotlightInfo Contains information about the spotlight content
   */
  addOnSpotlightBtnClickedHandler(spotlightInfo) {
    document.querySelectorAll(".content-spotlight--btn").forEach((button) => {
      button.addEventListener("click", () => {
        this.#toggleBackgroundText(false);

        this.#spotlightOverview.style.transform = "translateX(-100%)";

        // Changes overview content after 0.5 seconds to avoid visible changes during transition
        // Note: Must be < ~1 second to avoid not triggering the animation for clipped titles since the overview
        //       since the trigger is dependent on the new slide content
        setTimeout(() => {
          this.#changeOverview(spotlightInfo);
        }, 500);
      });
    });
  }

  #toggleBackgroundText(toggleFlag) {
    const mainContent = document.querySelector(`.content-spotlight--main-content[style="transform: translateX(0%);"]`);

    mainContent.querySelector(".content-spotlight--title").style.opacity = toggleFlag ? "0" : "";
    mainContent.querySelector(".content-spotlight--more-container").style.opacity = toggleFlag ? "0" : "";
  }

  #changeOverview(spotlightInfo) {
    let currentSlide = this.#getCurrentSlide();
    const currentContent = spotlightInfo[currentSlide];

    this.#changeOverviewElements(currentContent);
    this.#spotlightOverviewRating.style.backgroundColor = this.#getNewRatingColor(
      Number(this.#spotlightOverviewRating.textContent)
    );
  }

  #getNewRatingColor(rating) {
    if (rating >= 9.0) return "var(--c-rating-best)";
    else if (rating >= 8.0) return "var(--c-rating-good)";
    else if (rating >= 7.0) return "var(--c-rating-okay)";
    else if (rating >= 6.0) return "var(--c-rating-bad)";
    else return "var(--c-rating-worst)";
  }

  #getCurrentSlide() {
    let ret = 0;

    // Finds which marker is active and determines the current slide based on data-slide
    document.querySelectorAll(".content-spotlight--marker").forEach((marker) => {
      if (marker.classList.contains("content-spotlight--marker-active")) ret = marker.dataset.slide;
    });

    return ret;
  }

  #changeOverviewElements(currentContent) {
    this.#spotlightOverviewTitle.textContent = currentContent.title;
    this.#spotlightOverviewRating.textContent = currentContent.rating;
    this.#spotlightOverviewReleaseDate.textContent = currentContent.date;
    this.#spotlightOverviewGenres.innerHTML = "";
    this.#spotlightOverviewGenres.innerHTML = `
      <p>Genres: &nbsp;</p>
      ${currentContent.genres
        .map((genre, index) => {
          return index === currentContent.genres.length - 1
            ? `<p class="content-spotlight--overview-genre">${genre}</p>`
            : `<p class="content-spotlight--overview-genre">${genre}, &nbsp;</p>`;
        })
        .join("")}
    `;
    this.#spotlightOverviewDesc.textContent = currentContent.description;
  }
}

export default new SpotlightOverviewView();