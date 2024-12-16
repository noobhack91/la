import { AlertCircle, Calendar, CheckCircle, Clock, Download, FileCheck, FileText, Truck, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as api from '../api/index';

// ================ INTERFACES ================
interface TenderDetails {
  id: string;
  tenderNumber: string;
  authorityType: string;
  leadTimeToDeliver: number;
  leadTimeToInstall: number;
  equipmentName: string;
  equipmentQuantity: number;
  status: 'Completed' | 'Partially Completed' | 'Pending' | 'Closed' | 'Draft';
  hasAccessories: boolean;
  hasConsumables: boolean;
  selectedConsumables: string[];
  tenderStartDate: string;
  tenderEndDate: string;
  consignees: {
    id: string;
    srNo: string;
    districtName: string;
    blockName: string;
    facilityName: string;
    accessoriesPending: {
      count: number;
      items: string[];
      status: boolean;
    };
  }[];
}
interface TenderHeaderProps {
  tender: TenderDetails;
}

interface LOADetails {
  loaNumber: string;
  loaDate: string;
  loaDocument: File | null;
}

interface PODetails {
  poNumber: string;
  poDate: string;
  poDocument: File | null;
}

// ================ STYLES ================
const styles = `
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// ================ MAIN COMPONENT ================
export const TenderHeader: React.FC<TenderHeaderProps> = ({ tender }) => {
  // ================ STATE MANAGEMENT ================
  const [loaDetails, setLoaDetails] = useState<LOADetails>({
    loaNumber: '',
    loaDate: '',
    loaDocument: null,
  });

  const [poDetails, setPoDetails] = useState<PODetails>({
    poNumber: '',
    poDate: '',
    poDocument: null,
  });

  const [showLoaModal, setShowLoaModal] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedLoas, setFetchedLoas] = useState<any[]>([]);
  const [fetchedPos, setFetchedPos] = useState<any[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [loaDocumentPreview, setLoaDocumentPreview] = useState<string | null>(null);
  const [poDocumentPreview, setPoDocumentPreview] = useState<string | null>(null);

  // ================ UTILITY FUNCTIONS ================
  const calculateDaysLeft = () => {
    return tender.leadTimeToDeliver;
  };

  // ================ API CALLS ================
  const fetchDocuments = async () => {
    try {
      const response = await api.getTenderDocuments(tender.id);
      const loas = response.data.loas;
      const purchaseOrders = response.data.purchaseOrders;

      setFetchedLoas(loas.map((loa: any) => ({
        loaNumber: loa.loaNumber,
        loaDate: loa.loaDate,
        loaDocumentUrl: loa.documentPath,
      })));

      setFetchedPos(purchaseOrders.map((po: any) => ({
        poNumber: po.poNumber,
        poDate: new Date(po.poDate).toLocaleDateString(),
        poDocumentUrl: po.documentPath,
      })));
    } catch (error) {
      console.error('Error fetching documents:', error);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [tender.id]);

  // ================ EVENT HANDLERS ================
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'LOA' | 'PO') => {
    const file = event.target.files ? event.target.files[0] : null;
    if (type === 'LOA') {
      setLoaDetails(prevState => ({ ...prevState, loaDocument: file }));
    } else {
      setPoDetails(prevState => ({ ...prevState, poDocument: file }));
    }
  };

  const handleSubmitLOA = async () => {
    if (!loaDetails.loaNumber || !loaDetails.loaDate || !loaDetails.loaDocument) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('loaNumber', loaDetails.loaNumber);
    formData.append('loaDate', loaDetails.loaDate);
    formData.append('document', loaDetails.loaDocument);
    formData.append('tenderId', tender.id);

    try {
      setLoading(true);
      await api.uploadLOA(formData);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setShowLoaModal(false);
      fetchDocuments();

      setLoaDetails({
        loaNumber: '',
        loaDate: '',
        loaDocument: null,
      });
    } catch (error) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPO = async () => {
    if (!poDetails.poNumber || !poDetails.poDate || !poDetails.poDocument) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('poNumber', poDetails.poNumber);
    formData.append('poDate', poDetails.poDate);
    formData.append('document', poDetails.poDocument);
    formData.append('tenderId', tender.id);

    try {
      setLoading(true);
      await api.uploadPO(formData);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setShowPoModal(false);
      fetchDocuments();

      setPoDetails({
        poNumber: '',
        poDate: '',
        poDocument: null,
      });
    } catch (error) {
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };
  // ================ RENDER SECTION ================
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg p-8 mb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Tender Management
          </h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Reference: {tender.tenderNumber}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowLoaModal(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="w-5 h-5 mr-2" />
            Create LOA
          </button>
          <button
            onClick={() => setShowPoModal(true)}
            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="w-5 h-5 mr-2" />
            Create PO
          </button>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            {/* <span className={`px-4 py-1 rounded-full text-sm font-semibold ${tender.status === 'Completed' ? 'bg-green-100 text-green-700' :
              tender.status === 'Partially Completed' ? 'bg-yellow-100 text-yellow-700' :
                tender.status === 'Closed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
              }`}>
              {tender.status}
            </span> */}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Tender Status</h3>
          <span className={`px-4 py-1 rounded-full text-sm font-semibold ${tender.status === 'Completed' ? 'bg-green-100 text-green-700' :
            tender.status === 'Partially Completed' ? 'bg-yellow-100 text-yellow-700' :
              tender.status === 'Closed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
            }`}>
            {tender.status}
          </span>
        </div>

        {/* Delivery Timeline Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${calculateDaysLeft() < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
              {calculateDaysLeft()} days left
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Delivery Timeline</h3>
          <p className="text-gray-600">{tender.leadTimeToDeliver} days total</p>
        </div>

        {/* Authority Type Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Authority Type</h3>
          <p className="text-gray-600">{tender.authorityType}</p>
        </div>

        {/* Installation Time Card */}
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Installation Time</h3>
          <p className="text-gray-600">{tender.leadTimeToInstall} days</p>
        </div>
      </div>
      {/* New Pending Items Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Pending Accessories */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            Pending Accessories
            {tender.hasAccessories && (
              <span className="ml-2 px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-full">
                Required
              </span>
            )}
          </h3>
          <div className="space-y-4">
            {tender.consignees && tender.consignees.map((consignee, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                {/* <div className="mb-2">
                  <h4 className="font-semibold text-gray-700">Consignee {consignee.srNo}</h4>
                  <p className="text-sm text-gray-600">
                    {consignee.facilityName}, {consignee.blockName}, {consignee.districtName}
                  </p>
                </div> */}
                {consignee.accessoriesPending?.items && consignee.accessoriesPending.items.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Pending Items ({consignee.accessoriesPending.count}):
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {consignee.accessoriesPending.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-700 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No pending accessories</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Consumables */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            Pending Consumables
            {tender.hasConsumables && (
              <span className="ml-2 px-3 py-1 text-sm bg-amber-100 text-amber-700 rounded-full">
                Required
              </span>
            )}
          </h3>
          <div className="space-y-4">
            {tender.selectedConsumables && tender.selectedConsumables.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2">
                  {tender.selectedConsumables.map((consumable, index) => (
                    <li key={index} className="text-gray-700">
                      {consumable}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No pending consumables</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Summary Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          Equipment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Equipment Name</p>
            <p className="text-lg font-semibold text-gray-800">{tender.equipmentName}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Quantity</p>
            <p className="text-lg font-semibold text-gray-800">{tender.equipmentQuantity} units</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Tender Period</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(tender.tenderStartDate).toLocaleDateString()} - {new Date(tender.tenderEndDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LOA Documents */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            LOA Documents
          </h3>
          <div className="space-y-4">
            {fetchedLoas.length > 0 ? (
              fetchedLoas.map((loa, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{loa.loaNumber}</p>
                      <p className="text-sm text-gray-600">Date: {loa.loaDate}</p>
                    </div>
                    <a
                      href={loa.loaDocumentUrl}
                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No LOA documents available</p>
              </div>
            )}
          </div>
        </div>

        {/* PO Documents */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileCheck className="w-5 h-5 text-emerald-600 mr-2" />
            PO Documents
          </h3>
          <div className="space-y-4">
            {fetchedPos.length > 0 ? (
              fetchedPos.map((po, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{po.poNumber}</p>
                      <p className="text-sm text-gray-600">Date: {po.poDate}</p>
                    </div>
                    <a
                      href={po.poDocumentUrl}
                      className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No PO documents available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLoaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Create LOA</h3>
              <button
                onClick={() => setShowLoaModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LOA Number</label>
                <input
                  type="text"
                  value={loaDetails.loaNumber}
                  onChange={(e) => setLoaDetails({ ...loaDetails, loaNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter LOA number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LOA Date</label>
                <input
                  type="date"
                  value={loaDetails.loaDate}
                  onChange={(e) => setLoaDetails({ ...loaDetails, loaDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'LOA')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowLoaModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLOA}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload LOA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Create PO</h3>
              <button
                onClick={() => setShowPoModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={poDetails.poNumber}
                  onChange={(e) => setPoDetails({ ...poDetails, poNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter PO number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                <input
                  type="date"
                  value={poDetails.poDate}
                  onChange={(e) => setPoDetails({ ...poDetails, poDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'PO')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPoModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPO}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload PO'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center mb-4 animate-fade-in-up">
            <CheckCircle className="w-6 h-6 mr-2" />
            <span>Document uploaded successfully!</span>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-4 hover:bg-green-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Toast */}
        {showErrorToast && (
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center mb-4 animate-fade-in-up">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>Error uploading document. Please try again.</span>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-4 hover:bg-red-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium text-gray-700">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default TenderHeader;