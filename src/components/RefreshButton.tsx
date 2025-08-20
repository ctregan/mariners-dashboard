import React, { useState } from 'react';
import './RefreshButton.css';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="floating-actions">
      <button 
        onClick={handleRefresh}
        className={`floating-btn refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
        disabled={isRefreshing}
      >
        🔄
      </button>
    </div>
  );
};

export default RefreshButton;