import React from 'react';

function Toast({ message, type = 'default' }) {
  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {message}
      </div>
    </div>
  );
}

export default Toast;
