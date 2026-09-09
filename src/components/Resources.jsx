import resources from '../data/resources.js'

function Resources() {
  return (
    <section className="resources-section reveal" id="resources">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LEARNING LIBRARY</p>
          <h2>Explore by pattern</h2>
        </div>
      </div>

      <div className="resource-grid">
        {resources.map((resource) => (
          <article className="resource-card" key={resource.title}>
            <span className="resource-icon">{resource.icon}</span>
            <h3>{resource.title}</h3>
            <p>{resource.description}</p>
            <button type="button">
              Explore <span>→</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Resources