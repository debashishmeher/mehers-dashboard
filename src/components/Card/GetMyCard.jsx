import { useCard } from "../../Context/CardContext";
import CardDetails from "./cardDetails";
import NoCard from "./NoCard";
import Loading from "../Common/Loading";
import Error from "../Common/Error";
import CreateCard from "./CreateCard";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function GetMyCard() {
  const { 
    allCards, 
    loading, 
    error, 
    createCard,
    refresh 
  } = useCard();

  console.log(allCards);
  

  const [isCreateCardForm, setIsCreateCardForm] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const currentCard = allCards[currentCardIndex] || null;
  const cardUrl = currentCard?.slug ? `https://thryvoo.com/b/${currentCard.slug}` : "";

  const handleCreateCard = async (cardData) => {
    try {
      await createCard(cardData);
      refresh();
      setIsCreateCardForm(false);
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % allCards.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + allCards.length) % allCards.length);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen  dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Cards
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {allCards.length} card{allCards.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateCardForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            New Card
          </button>
        </div>

        {/* Main Content */}
        {allCards.length > 0 ? ( 
          <div className="space-y-6">
            {/* Navigation */}
            {allCards.length > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevCard}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentCard?.name}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Card {currentCardIndex + 1} of {allCards.length}
                    </p>
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Card Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <CardDetails 
                card={currentCard} 
                cardUrl={cardUrl} 
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsCreateCardForm(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Add Another Card
              </button>
              <Link
                to={`/card/${currentCard?._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit This Card
              </Link>
            </div>
          </div>
        ) : (
          <NoCard onCreateCard={() => setIsCreateCardForm(true)} />
        )}

        {/* Create Card Form */}
        {isCreateCardForm && (
          <CreateCard
            onClose={() => setIsCreateCardForm(false)}
            onSubmit={handleCreateCard}
          />
        )}
      </div>
    </div>
  );
}

export default GetMyCard;