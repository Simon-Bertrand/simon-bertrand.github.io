export default function Pages({children, href} : {children : JSX.Element, href:string}) {
    return (
      <div id={href} className="page" >
        <div className="flex gap-x-3 items-center">
          <h3>{href}</h3>
        </div>
        {children}
      </div>
    )
  }
  