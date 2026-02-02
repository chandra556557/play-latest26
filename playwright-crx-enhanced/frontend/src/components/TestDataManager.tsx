import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Download, Trash2, FileText, Table } from 'lucide-react';
import './Dashboard.css';
import './ImportScriptModal.css';

interface TestDataItem {
  id: string;
  fileName: string;
  fileType: 'csv' | 'json';
  environment: string;
  recordCount: number;
  uploadedAt: string;
  data: Record<string, any>[];
}

const API_URL = 'http://localhost:3001/api';

const TestDataManager = () => {
  const [testDataFiles, setTestDataFiles] = useState<TestDataItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<TestDataItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importEnvironment, setImportEnvironment] = useState('dev');
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadTestDataFiles();
  }, []);

  const loadTestDataFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/testdata/files`, { headers });
      setTestDataFiles(res.data?.data || []);
    } catch (error: any) {
      console.error('Failed to load test data files:', error?.message || error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.endsWith('.csv') ? 'csv' : 'json';
      if (!['csv', 'json'].some(ext => file.name.endsWith(`.${ext}`))) {
        alert('Please upload only CSV or JSON files');
        return;
      }
      setImportFile(file);
      parseFilePreview(file, fileType);
    }
  };

  const parseFilePreview = async (file: File, fileType: string) => {
    const text = await file.text();
    try {
      if (fileType === 'json') {
        const json = JSON.parse(text);
        const data = Array.isArray(json) ? json : [json];
        setPreviewData(data.slice(0, 5)); // Show first 5 records
      } else if (fileType === 'csv') {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          setPreviewData([]);
          return;
        }
        const headers = lines[0].split(',').map(h => h.trim());
        const records = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          const record: any = {};
          headers.forEach((header, idx) => {
            record[header] = values[idx] || '';
          });
          return record;
        });
        setPreviewData(records);
      }
    } catch (err) {
      console.error('Failed to parse file:', err);
      setPreviewData([]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImporting(true);
    try {
      const text = await importFile.text();
      const fileType = importFile.name.endsWith('.csv') ? 'csv' : 'json';
      let parsedData: any[] = [];

      if (fileType === 'json') {
        const json = JSON.parse(text);
        parsedData = Array.isArray(json) ? json : [json];
      } else if (fileType === 'csv') {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const record: any = {};
            headers.forEach((header, idx) => {
              record[header] = values[idx] || '';
            });
            return record;
          });
        }
      }

      const payload = {
        fileName: importFile.name,
        fileType,
        environment: importEnvironment,
        data: parsedData
      };

      const res = await axios.post(`${API_URL}/testdata/import`, payload, { headers });
      
      if (res.data?.success) {
        alert(`✅ Successfully imported ${parsedData.length} records!`);
        setShowImportModal(false);
        setImportFile(null);
        setPreviewData([]);
        loadTestDataFiles();
      }
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to import test data');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test data file?')) return;
    
    try {
      await axios.delete(`${API_URL}/testdata/files/${id}`, { headers });
      setTestDataFiles(testDataFiles.filter(f => f.id !== id));
      if (selectedFile?.id === id) setSelectedFile(null);
      alert('✅ Test data file deleted successfully');
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to delete test data file');
    }
  };

  const handleDownload = (file: TestDataItem) => {
    const dataStr = file.fileType === 'json' 
      ? JSON.stringify(file.data, null, 2)
      : convertToCSV(file.data);
    
    const blob = new Blob([dataStr], { type: file.fileType === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };

  return (
    <div className="test-data-manager" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="header" style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>📊 Test Data Manager</h1>
        <p style={{ color: '#666', margin: 0 }}>Import and manage Playwright test data files (CSV/JSON)</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Upload size={20} />
          Import Test Data File
        </button>
      </div>

      {testDataFiles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <FileText size={64} style={{ marginBottom: '20px', opacity: 0.3 }} />
          <h3>No test data files imported yet</h3>
          <p>Click "Import Test Data File" to upload CSV or JSON files</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {testDataFiles.map(file => (
            <div
              key={file.id}
              style={{
                background: 'white',
                border: selectedFile?.id === file.id ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setSelectedFile(file)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {file.fileType === 'csv' ? <Table size={20} /> : <FileText size={20} />}
                    {file.fileName}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '14px' }}>
                    <span>📁 Type: {file.fileType.toUpperCase()}</span>
                    <span>🌍 Environment: {file.environment}</span>
                    <span>📊 Records: {file.recordCount}</span>
                    <span>📅 Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                    style={{
                      padding: '8px 12px',
                      background: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                    style={{
                      padding: '8px 12px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {selectedFile?.id === file.id && file.data.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
                  <h4 style={{ margin: '0 0 15px 0' }}>📋 Data Preview (First 5 records)</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f5f5f5' }}>
                          {Object.keys(file.data[0]).map(key => (
                            <th key={key} style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {file.data.slice(0, 5).map((record, idx) => (
                          <tr key={idx}>
                            {Object.values(record).map((value: any, i) => (
                              <td key={i} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px 0' }}>📤 Import Test Data File</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Select File (CSV or JSON):
              </label>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Environment:
              </label>
              <select
                value={importEnvironment}
                onChange={(e) => setImportEnvironment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              >
                <option value="dev">Development</option>
                <option value="qa">QA</option>
                <option value="staging">Staging</option>
                <option value="prod">Production</option>
              </select>
            </div>

            {previewData.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>📋 Preview (First 5 records):</h4>
                <div style={{ overflowX: 'auto', maxHeight: '300px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((record, idx) => (
                        <tr key={idx}>
                          {Object.values(record).map((value: any, i) => (
                            <td key={i} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setPreviewData([]);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                style={{
                  padding: '10px 20px',
                  background: importing ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: importing ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                {importing ? '⏳ Importing...' : '✅ Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDataManager;
