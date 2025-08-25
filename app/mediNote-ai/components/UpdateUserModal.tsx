import React from 'react';
import { PatientCreationTypes } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PatientCreationTypes;
  onSave: (updatedUser: PatientCreationTypes) => Promise<void>; // Ensure this is async
}

export const UpdateUserModal: React.FC<ModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const getInitialFormData = (userData: PatientCreationTypes): PatientCreationTypes => ({
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    ssn_last4: userData?.ssn_last4 || '',
    address: userData?.address || '',
    ...userData,
  });

  const [formData, setFormData] = React.useState<PatientCreationTypes>(() => getInitialFormData(user));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);

  // Reset form data when user prop changes
  React.useEffect(() => {
    setFormData(getInitialFormData(user));
    setShowSuccessPopup(false);
  }, [user]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setShowSuccessPopup(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData); // Await async parent handler
      setShowSuccessPopup(true); // Show success popup only if save is successful
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccessPopup(false);
    onClose(); // Close modal after user confirms success
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Update Modal */}
      {!showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Update Patient</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {[
                { id: 'first_name', label: 'First Name' },
                { id: 'last_name', label: 'Last Name' },
                { id: 'email', label: 'Email', type: 'email' },
                { id: 'phone', label: 'Phone', type: 'tel' },
                { id: 'ssn_last4', label: 'SSN Last 4', maxLength: 4 },
                { id: 'address', label: 'Address' },
              ].map(({ id, label, type = 'text', maxLength }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={(formData as any)[id] || ''}
                    onChange={handleChange}
                    maxLength={maxLength}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <svg className="w-12 h-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Success!
              </h3>
              <p className="text-gray-600 mb-6">
                Patient details updated successfully!
              </p>
              <button
                onClick={handleSuccessContinue}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
