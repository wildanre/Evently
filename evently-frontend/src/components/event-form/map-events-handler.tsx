"use client";

import { useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent, LeafletEvent } from 'leaflet';

interface MapEventsHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
  onMapMove: (lat: number, lng: number) => void;
}

const MapEventsHandler = ({ onMapClick, onMapMove }: MapEventsHandlerProps) => {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
    moveend: (e: LeafletEvent) => {
      const center = (e.target as any).getCenter();
      onMapMove(center.lat, center.lng);
    }
  });

  return null;
};

export default MapEventsHandler;
