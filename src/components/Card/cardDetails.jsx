import { ExternalLink, Pencil, Calendar, User, Building2 } from "lucide-react";
import QRCodeGenerator from "./QRCodeGenerator";
import Active from "./Active";
import { Link } from "react-router-dom";

function CardDetails({ card, cardUrl }) {
  const {
    name,
    logo,
    photo,
    createdAt,
    company,
    designation
  } = card;

  // Capitalize the name
  const capitalizedName = name
    ? name.replace(/\b\w/g, char => char.toUpperCase())
    : '';

  return (
    <div className="space-y-6">
      {/* Header Section with Logo/Photo */}
      <div className="flex flex-col items-center space-y-4">
        {/* Logo or Photo */}
        <div className="relative">
          {logo ? (
            <img 
              src={logo} 
              alt={`${name} logo`}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : photo ? (
            <img 
              src={photo} 
              alt={`${name} photo`}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Name and Info */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {capitalizedName}
          </h1>
          
          {(company || designation) && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {company}
                </span>
              )}
              {company && designation && <span>•</span>}
              {designation && <span>{designation}</span>}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Created {new Date(createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <a
          href={cardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <ExternalLink className="w-5 h-5" />
          Visit Business Profile
        </a>

        {/* <Link
          to={`/card/${card._id}`}
          className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit Business Card
        </Link> */}
      </div>

      {/* QR Code Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Share Your Card
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scan QR code to quickly share your business profile
          </p>
        </div>
        <QRCodeGenerator url={cardUrl} />
      </div>  
    </div>
  );
}

export default CardDetails;