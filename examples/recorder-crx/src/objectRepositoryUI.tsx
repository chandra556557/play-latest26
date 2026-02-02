/**
 * Object Repository UI Component for Chrome Extension
 * Allows users to save recorded elements to Object Repository
 */

import * as React from 'react';
import { objectRepositoryService, type RecordedAction } from './objectRepositoryService';
import './form.css';

interface ObjectRepositoryUIProps {
  actions: RecordedAction[];
  projectId?: string;
  onSaved?: () => void;
}

export const ObjectRepositoryUI: React.FC<ObjectRepositoryUIProps> = ({
  actions,
  projectId,
  onSaved
}) => {
  const [saving, setSaving] = React.useState(false);
  const [saveResult, setSaveResult] = React.useState<{
    saved: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [error, setError] = React.useState<string>('');
  const [sessionStats, setSessionStats] = React.useState<any>(null);

  // Update session stats when actions change
  React.useEffect(() => {
    const stats = objectRepositoryService.getSessionStats();
    setSessionStats(stats);
  }, [actions]);

  const handleSaveToRepository = async () => {
    setSaving(true);
    setError('');
    setSaveResult(null);

    try {
      const result = await objectRepositoryService.saveActionsToRepository(
        actions,
        projectId ? parseInt(projectId) : undefined
      );
      
      setSaveResult(result);
      
      // Show success message
      if (result.saved > 0) {
        setTimeout(() => {
          if (onSaved) onSaved();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to repository');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSession = () => {
    objectRepositoryService.clearSession();
    setSaveResult(null);
    setSessionStats(objectRepositoryService.getSessionStats());
  };

  return (
    <div className="object-repository-panel" style={{
      padding: '15px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginTop: '10px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
        🗃️ Object Repository
      </h3>

      {/* Session Stats */}
      {sessionStats && (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
            <strong>Current Page:</strong> {sessionStats.currentPage}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            <strong>Recorded Elements:</strong> {sessionStats.recordedElements}
          </div>
        </div>
      )}

      {/* Actions Summary */}
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '15px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
          <strong>Recorded Actions:</strong> {actions.length}
        </div>
        
        {actions.length > 0 && (
          <div style={{
            maxHeight: '150px',
            overflowY: 'auto',
            fontSize: '12px',
            color: '#888'
          }}>
            {actions.slice(0, 10).map((action, index) => (
              <div key={index} style={{
                padding: '4px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {action.name}
                </span>
                {' '}
                {action.locator && (
                  <span style={{ color: '#666' }}>
                    → {action.locator.substring(0, 50)}
                    {action.locator.length > 50 ? '...' : ''}
                  </span>
                )}
              </div>
            ))}
            {actions.length > 10 && (
              <div style={{ padding: '4px 0', color: '#999', fontStyle: 'italic' }}>
                ... and {actions.length - 10} more actions
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveToRepository}
        disabled={saving || actions.length === 0}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: actions.length === 0 ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: actions.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => {
          if (actions.length > 0) {
            e.currentTarget.style.backgroundColor = '#45a049';
          }
        }}
        onMouseLeave={(e) => {
          if (actions.length > 0) {
            e.currentTarget.style.backgroundColor = '#4CAF50';
          }
        }}
      >
        {saving ? '💾 Saving to Repository...' : '💾 Save to Object Repository'}
      </button>

      {/* Clear Session Button */}
      {sessionStats && sessionStats.recordedElements > 0 && (
        <button
          onClick={handleClearSession}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            marginBottom: '10px'
          }}
        >
          🗑️ Clear Session
        </button>
      )}

      {/* Save Result */}
      {saveResult && (
        <div style={{
          backgroundColor: saveResult.errors > 0 ? '#fff3cd' : '#d4edda',
          border: `1px solid ${saveResult.errors > 0 ? '#ffc107' : '#28a745'}`,
          color: saveResult.errors > 0 ? '#856404' : '#155724',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '13px',
          marginTop: '10px'
        }}>
          <div><strong>✅ Saved:</strong> {saveResult.saved}</div>
          <div><strong>⏭️ Skipped:</strong> {saveResult.skipped}</div>
          {saveResult.errors > 0 && (
            <div><strong>❌ Errors:</strong> {saveResult.errors}</div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '13px',
          marginTop: '10px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Info */}
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '15px',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ marginBottom: '4px' }}>
          💡 <strong>Tip:</strong> Elements are automatically organized by page URL
        </div>
        <div>
          🔍 View and manage saved elements in Dashboard → Object Repository
        </div>
      </div>
    </div>
  );
};
