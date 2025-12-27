import React from 'react';
import { useParams } from 'react-router-dom';
import { CardProvider } from '../../Context/CardContext';
import Items from './Items';

const ItemsWrapper = ({role}) => {
  const { cardId } = useParams();

  return (
    <CardProvider cardId={cardId} role={role}>
      <Items role={role}/>
    </CardProvider>
  );
};

export default ItemsWrapper;