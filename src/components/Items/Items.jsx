import { useState } from "react";
import { useParams } from "react-router";
import { useCard } from "../../Context/CardContext";

import ProfileBanner from "./Pofilebanner";
import BasicDataSec from "./BasicDataSec";
import AddressSec from "./AddressSec";
import SocialSec from "./SocialSec";
import MetaDataSec from "./MetaDataSec";
import CategorySec from "./CategorySec";
import BrochuresSec from "./BrochuresSec";
import VideoSec from "./VideoSec";

import UpdateFieldModal from "./Modal/BasicModal";
import AddressModal from "./Modal/AddressModal";
import UpdateSocialModal from "./Modal/SocialModal";
import UpdateMetaModal from "./Modal/MetaModal";
import UpdateCategoryModal from "./Modal/CategoryModal";
import UploadBrochureModal from "./Modal/UploadBrochureModal";
import UploadPhotoModal from "./Modal/PhotoModal";
import UploadLogoModal from "./Modal/LogoModal";
import GallerySec from "./GallerySec";
import UploadGalleryModal from "./Modal/UploadGalleryModal";
import UpdateVideoModal from "./Modal/VideoModal"; // Add this import
import UpdateSlugSec from "./UpdateSlugSec";

function Items() {
  const { 
    cardData,
    setCardData,
  } = useCard();

  console.log(cardData);
  
  
  const { cardId } = useParams();
  const role = "user"; // Add this line - you might want to get this from context or props

  // State for modals
  const [modalField, setModalField] = useState(null);
  const [modalSocialField, setModalSocialField] = useState(null);
  const [addressModal, setAddressModal] = useState(false);
  const [metaField, setMetaField] = useState(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [brochureModal, setBrochureModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false); // Add this state

  // Handlers
  const handleOpenModal = (field, label) => setModalField({ field, label });
  const handleOpenSocialModal = (field, label) =>
    setModalSocialField({ field, label });
  const handleOpenMetaModal = (field, label) =>
    setMetaField({ field, label });
  const handleOpenVideoModal = () => setVideoModal(true); // Add this handler

  const handleCloseModal = () => {
    setModalField(null);
    setModalSocialField(null);
    setMetaField(null);
  };

  // Submit updates to context
  const onSubmit = (updated) => {
    setCardData((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const onSocialSubmit = (updated) => {
    setCardData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        ...updated,
      },
    }));
  };

  return (
    <div className="relative my-10 max-w-screen-lg mx-auto">
      {/* Banner + Logo */}
      <ProfileBanner
        logo={cardData?.logo}
        photo={cardData?.photo}
        onOpenLogoModal={() => setShowLogoModal(true)}
        onOpenPhotoModal={() => {
          console.log("clicked");
          setShowPhotoModal(true);
        }}
      />

      

      {/* Sections */}
      <BasicDataSec cardData={cardData} openModal={handleOpenModal} />
      <CategorySec cardData={cardData} openModal={() => setCategoryModal(true)} />
      <AddressSec cardData={cardData} openModal={() => setAddressModal(true)} />
      <SocialSec cardData={cardData} openModal={handleOpenSocialModal} />
      <MetaDataSec cardData={cardData} openModal={handleOpenMetaModal} />
      <BrochuresSec cardData={cardData} openModal={() => setBrochureModal(true)} />
      <GallerySec cardData={cardData} openModal={() => setShowGalleryModal(true)} />
      <VideoSec cardData={cardData} openModal={handleOpenVideoModal} />
      {/* <UpdateSlugSec cardData={cardData} openModal={handleOpenModal} /> */}

      {/* Modals */}
      {modalField && (
        <UpdateFieldModal
          field={modalField.field}
          label={modalField.label}
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={handleCloseModal}
          onSubmit={onSubmit}
        />
      )}

      {addressModal && (
        <AddressModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setAddressModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {modalSocialField && (
        <UpdateSocialModal
          field={modalSocialField.field}
          label={modalSocialField.label}
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={handleCloseModal}
          onSubmit={onSocialSubmit}
        />
      )}

      {metaField && (
        <UpdateMetaModal
          field={metaField.field}
          label={metaField.label}
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={handleCloseModal}
          onSubmit={onSubmit}
        />
      )}

      {categoryModal && (
        <UpdateCategoryModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setCategoryModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {brochureModal && (
        <UploadBrochureModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setBrochureModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {showLogoModal && (
        <UploadLogoModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setShowLogoModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {showPhotoModal && (
        <UploadPhotoModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setShowPhotoModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {showGalleryModal && (
        <UploadGalleryModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setShowGalleryModal(false)}
          onSubmit={onSubmit}
        />
      )}

      {videoModal && (
        <UpdateVideoModal
          cardData={cardData}
          cardId={cardId}
          role={role}
          onClose={() => setVideoModal(false)}
          onSubmit={onSubmit}
        />
      )}
    </div>
  );
}

export default Items;