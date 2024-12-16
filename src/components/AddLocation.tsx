// src/components/AddLocation.tsx

import { Plus } from 'lucide-react';
import React, { useState } from 'react';

interface Location {
  districtName: string;
  blockName: string;
  facilityName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  quantity: number;
}

interface AddLocationProps {
  onAdd: (location: Location) => void;
}

export const AddLocation: React.FC<AddLocationProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState<Location>({
    districtName: '',
    blockName: '',
    facilityName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    quantity: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.districtName && location.blockName && location.facilityName && location.quantity > 0) {
      onAdd(location);
      setLocation({
        districtName: '',
        blockName: '',
        facilityName: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        quantity: 1
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Location
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-6">
          <div className="space-y-6">
            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">District Name</label>
                  <input
                    type="text"
                    value={location.districtName}
                    onChange={(e) => setLocation(prev => ({ ...prev, districtName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Block Name</label>
                  <input
                    type="text"
                    value={location.blockName}
                    onChange={(e) => setLocation(prev => ({ ...prev, blockName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Name</label>
                  <input
                    type="text"
                    value={location.facilityName}
                    onChange={(e) => setLocation(prev => ({ ...prev, facilityName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    value={location.contactName}
                    onChange={(e) => setLocation(prev => ({ ...prev, contactName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={location.contactPhone}
                    onChange={(e) => setLocation(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={location.contactEmail}
                    onChange={(e) => setLocation(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={location.quantity}
                    onChange={(e) => setLocation(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
};