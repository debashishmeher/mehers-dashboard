import "./Container.css"
import Card from "./Card"
function Container() {
  return (
    <div className="containers bg-emerald-50">
        <nav className="content-nev">Home | menu</nav>
        <div className="container-head">
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
        <div className="filter">
          <ul>
            <li>aaa</li>
            <li>bbb</li>
            <li>ccc</li>
            <li>ddd</li>
            <li>eee</li>
          </ul>
        </div>
        
    </div>
  )
}

export default Container