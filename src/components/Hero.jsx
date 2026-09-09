function Hero() {
  function handleSearch(event) {
    event.preventDefault()
  }

  return (
    <section className="hero reveal" id="home">
      <p className="eyebrow">YOUR DSA JOURNEY, VISUALIZED</p>
      <h1>Turn every problem into <span>progress.</span></h1>

      <p className="hero-copy">
        Track your LeetCode practice, build streaks, and learn one pattern at a time.
      </p>

      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search a LeetCode problem"
          aria-label="Search a LeetCode problem"
        />
        <button type="submit">Search</button>
      </form>

      <div className="hero-notes">
        <span><i className="dot green" /> Build consistency</span>
        <span><i className="dot blue" /> Learn patterns</span>
        <span><i className="dot purple" /> Track growth</span>
      </div>
    </section>
  )
}

export default Hero