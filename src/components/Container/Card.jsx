import { FaDollarSign } from "react-icons/fa6";
import "./Card.css";
function Card() {
  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">earning</h3>
        <FaDollarSign className="card-icon"/>
      </div>
      <div className="card-body">
      <FaDollarSign />
        <p className="card-text">200</p>
    </div>
    </div>
  )
}

export default Card