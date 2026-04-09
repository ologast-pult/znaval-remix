import React from 'react';

export const formatPrice = (price: number, currency: string = 'Kč') => {
  const parts = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ").split(" ");
  
  return (
    <span className="font-black tracking-tighter">
      <span className="text-[#7a1b1b]">{parts[0]}</span>
      {parts.length > 1 && (
        <span> {parts.slice(1).join(" ")}</span>
      )}
      <span className="ml-1">{currency}</span>
    </span>
  );
};
