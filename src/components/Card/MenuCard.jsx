
import { Link } from "react-router"
    import { Eye, Pencil } from 'lucide-react';


function MenuCard({id,title, logo, img,slug}) {
console.log(logo, img);

  
  return (


<div
  className="group relative rounded-[10px] overflow-hidden shadow-lg transition duration-300"
>
  <img src={img} alt="food" className="object-cover w-full h-64" />

  {/* Gradient overlay */}
  <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-600 to-purple-600/90 flex flex-col items-center justify-end p-4">
    <img
      src={logo}
      alt="logo"
      className="rounded-full h-[100px] w-[100px] border-4 border-white shadow-md -translate-y-12"
    />
    <h2 className="text-white text-xl font-semibold mt-2 text-center">{title}</h2>

    {/* Buttons */}
    <div className="flex gap-4 mt-4">
      <a
        href={`https://thryvoo.com/b/${slug}`}
        className="flex items-center gap-1.5 text-sm bg-white text-blue-600 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <Eye className="w-4 h-4" />
        View
      </a>
      <Link
        to={`/card/${id}`}
        className="flex items-center gap-1.5 text-sm bg-white text-[#2563EB] font-medium px-3 py-1.5 rounded-md hover:bg-purple-50 transition"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil className="w-4 h-4" />
        Edit
      </Link>
    </div>
  </div>
</div>

  )
}

export default MenuCard;