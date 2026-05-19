export default function Pages({children, href} : {children : JSX.Element, href:string}) {
    return (
      <section id={href} className="page">
        {children}
      </section>
    )
  }
  
